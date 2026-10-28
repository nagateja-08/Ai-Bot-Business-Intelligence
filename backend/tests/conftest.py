import pytest
from decimal import Decimal
from datetime import date
from typing import List
from unittest.mock import MagicMock
from sqlalchemy.orm import Session

from backend.models import Sale
from backend.main import app
from backend.database import get_db

@pytest.fixture
def sample_sales_data() -> List[Sale]:
    """
    Provides a standardized fixture of Sale model instances matching the dataset schema,
    including completed orders, discounts, and the returned transaction.
    """
    records = [
        Sale(
            transaction_id="TXN0001",
            order_date=date(2026, 1, 3),
            product="Laptop Stand",
            category="Accessories",
            region="North",
            sales_channel="Online",
            quantity=10,
            unit_price=Decimal("1200.00"),
            discount_amount=Decimal("0.00"),
            status="Completed"
        ),
        Sale(
            transaction_id="TXN0002",
            order_date=date(2026, 1, 5),
            product="Wireless Mouse",
            category="Accessories",
            region="South",
            sales_channel="Retail",
            quantity=25,
            unit_price=Decimal("650.00"),
            discount_amount=Decimal("0.00"),
            status="Completed"
        ),
        Sale(
            transaction_id="TXN0004",
            order_date=date(2026, 1, 12),
            product="Monitor",
            category="Electronics",
            region="East",
            sales_channel="Retail",
            quantity=6,
            unit_price=Decimal("9500.00"),
            discount_amount=Decimal("500.00"),
            status="Completed"
        ),
        Sale(
            transaction_id="TXN0014",
            order_date=date(2026, 2, 17),
            product="Desk",
            category="Furniture",
            region="West",
            sales_channel="Retail",
            quantity=2,
            unit_price=Decimal("12500.00"),
            discount_amount=Decimal("0.00"),
            status="Completed"
        ),
        Sale(
            transaction_id="TXN0022",
            order_date=date(2026, 3, 16),
            product="Desk",
            category="Furniture",
            region="East",
            sales_channel="Online",
            quantity=4,
            unit_price=Decimal("12500.00"),
            discount_amount=Decimal("2500.00"),
            status="Completed"
        ),
        Sale(
            transaction_id="TXN0033",
            order_date=date(2026, 4, 26),
            product="Monitor",
            category="Electronics",
            region="West",
            sales_channel="Retail",
            quantity=2,
            unit_price=Decimal("9500.00"),
            discount_amount=Decimal("0.00"),
            status="Returned"
        ),
        Sale(
            transaction_id="TXN0034",
            order_date=date(2026, 4, 28),
            product="Keyboard",
            category="Accessories",
            region="East",
            sales_channel="Online",
            quantity=0,
            unit_price=Decimal("900.00"),
            discount_amount=Decimal("0.00"),
            status="Completed"
        ),
    ]
    return records

@pytest.fixture
def mock_db_session(sample_sales_data):
    """
    Mock SQLAlchemy session that returns our test dataset for query simulations.
    Ensures tests run in complete isolation without requiring an active MySQL instance.
    """
    session = MagicMock(spec=Session)

    def mock_query(model):
        query_mock = MagicMock()
        
        # When .all() is called
        query_mock.all.return_value = sample_sales_data
        
        # When .filter(...) is chained
        def mock_filter(*args, **kwargs):
            filtered_mock = MagicMock()
            
            # Helper to check if filtering for Completed or Returned
            filter_str = str(args[0]) if args else ""
            if "status = 'Completed'" in filter_str or "sales.status = :status_1" in filter_str or "Completed" in filter_str:
                filtered_records = [s for s in sample_sales_data if s.status == "Completed"]
            elif "Returned" in filter_str:
                filtered_records = [s for s in sample_sales_data if s.status == "Returned"]
            else:
                filtered_records = sample_sales_data
                
            filtered_mock.all.return_value = filtered_records
            filtered_mock.count.return_value = len(filtered_records)
            filtered_mock.order_by.return_value = filtered_mock
            filtered_mock.limit.return_value = filtered_mock
            return filtered_mock

        query_mock.filter = mock_filter
        query_mock.filter_by = mock_filter
        query_mock.order_by.return_value = query_mock
        query_mock.count.return_value = len(sample_sales_data)
        query_mock.limit.return_value = query_mock
        return query_mock

    session.query.side_effect = mock_query
    return session

@pytest.fixture
def client(mock_db_session):
    """
    FastAPI TestClient with overridden get_db dependency.
    """
    from fastapi.testclient import TestClient

    def override_get_db():
        yield mock_db_session

    app.dependency_overrides[get_db] = override_get_db
    test_client = TestClient(app)
    yield test_client
    app.dependency_overrides.clear()
