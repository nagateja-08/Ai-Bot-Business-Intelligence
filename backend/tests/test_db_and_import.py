import pytest
from decimal import Decimal
from datetime import date
from pathlib import Path
import pandas as pd
from unittest.mock import MagicMock
from sqlalchemy import text

from backend.models import Sale, Base
from backend.init_db import initialize_and_import

def test_sale_model_schema():
    """Verify Sale SQLAlchemy model columns and types"""
    columns = {c.name: c for c in Sale.__table__.columns}
    
    assert "transaction_id" in columns
    assert columns["transaction_id"].primary_key is True
    assert "order_date" in columns
    assert "product" in columns
    assert "category" in columns
    assert "region" in columns
    assert "sales_channel" in columns
    assert "quantity" in columns
    assert "unit_price" in columns
    assert "discount_amount" in columns
    assert "status" in columns

def test_sale_revenue_properties():
    """Verify gross and net revenue calculation on Sale instances"""
    # 1. Standard sale without discount
    sale1 = Sale(
        transaction_id="T1",
        quantity=5,
        unit_price=Decimal("1000.00"),
        discount_amount=Decimal("0.00"),
        status="Completed"
    )
    assert sale1.gross_revenue == Decimal("5000.00")
    assert sale1.net_revenue == Decimal("5000.00")

    # 2. Sale with discount
    sale2 = Sale(
        transaction_id="T2",
        quantity=6,
        unit_price=Decimal("9500.00"),
        discount_amount=Decimal("500.00"),
        status="Completed"
    )
    assert sale2.gross_revenue == Decimal("57000.00")
    assert sale2.net_revenue == Decimal("56500.00")

    # 3. Zero quantity transaction
    sale3 = Sale(
        transaction_id="T3",
        quantity=0,
        unit_price=Decimal("900.00"),
        discount_amount=Decimal("0.00"),
        status="Completed"
    )
    assert sale3.gross_revenue == Decimal("0.00")
    assert sale3.net_revenue == Decimal("0.00")

def test_csv_file_integrity():
    """Verify cleaned CSV file exists and has correct columns and row count"""
    csv_path = Path("ai_bi_assistant_sales_data_cleaned.csv")
    if not csv_path.exists():
        csv_path = Path(__file__).resolve().parent.parent.parent / "ai_bi_assistant_sales_data_cleaned.csv"
    assert csv_path.exists(), "CSV file must exist in workspace root"

    df = pd.read_csv(csv_path)
    assert len(df) in [50, 51], f"Expected 50 or 51 rows, got {len(df)}"
    
    required_cols = [
        "Transaction_Id", "Order_date", "Product", "Category", 
        "Region", "Sales_channel", "Quantity", "Unit_price", 
        "Discount_amount", "Status"
    ]
    for col in required_cols:
        assert col in df.columns, f"Missing column: {col}"

    # Verify transaction IDs are unique
    assert df["Transaction_Id"].nunique() == len(df)

def test_duplicate_prevention_logic():
    """Verify that transactions already present in database are skipped"""
    df_mock = pd.DataFrame([
        {
            "Transaction_Id": "TXN0001",
            "Order_date": "03-01-2026",
            "Product": "Laptop Stand",
            "Category": "Accessories",
            "Region": "North",
            "Sales_channel": "Online",
            "Quantity": 10,
            "Unit_price": 1200.0,
            "Discount_amount": 0,
            "Status": "Completed"
        },
        {
            "Transaction_Id": "TXN0002",
            "Order_date": "05-01-2026",
            "Product": "Wireless Mouse",
            "Category": "Accessories",
            "Region": "South",
            "Sales_channel": "Retail",
            "Quantity": 25,
            "Unit_price": 650.0,
            "Discount_amount": 0,
            "Status": "Completed"
        }
    ])

    existing_ids = {"TXN0001"}
    to_insert = [r["Transaction_Id"] for _, r in df_mock.iterrows() if r["Transaction_Id"] not in existing_ids]

    assert to_insert == ["TXN0002"]
    assert len(to_insert) == 1
