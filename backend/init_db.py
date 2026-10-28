#!/usr/bin/env python3
"""
Database Initialization & CSV Import Script for SalesIQ.
Creates the database schema if not present and idempotently imports sales data.
"""

import sys
import os
from pathlib import Path
from decimal import Decimal
import pandas as pd
from sqlalchemy import create_engine, text
from sqlalchemy.orm import Session
from urllib.parse import urlparse, urlunparse

# Ensure backend directory is in python path
current_dir = Path(__file__).resolve().parent
parent_dir = current_dir.parent
if str(parent_dir) not in sys.path:
    sys.path.insert(0, str(parent_dir))

from backend.config import settings
from backend.models import Base, Sale
from backend.database import engine, SessionLocal

def ensure_database_exists(db_url: str):
    """
    Connects to MySQL server root/default to create target database if it doesn't exist.
    """
    if "mysql" not in db_url:
        return

    parsed = urlparse(db_url)
    db_name = parsed.path.lstrip("/")
    if not db_name:
        return

    # Connection URL without database name
    server_url = urlunparse((
        parsed.scheme,
        parsed.netloc,
        "",
        "",
        parsed.query,
        ""
    ))

    try:
        tmp_engine = create_engine(server_url, isolation_level="AUTOCOMMIT")
        with tmp_engine.connect() as conn:
            conn.execute(text(f"CREATE DATABASE IF NOT EXISTS `{db_name}` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"))
            print(f"[OK] Verified database '{db_name}' exists.")
        tmp_engine.dispose()
    except Exception as e:
        print(f"[NOTICE] Could not automatically ensure database exists on server: {e}")
        print(f"Please ensure database '{db_name}' is created in MySQL before running tables creation.")

def initialize_and_import(csv_file_path: str = None) -> int:
    """
    Initializes tables and imports CSV transaction records idempotently.
    """
    csv_path = Path(csv_file_path or settings.csv_path)
    if not csv_path.exists():
        # Fallback to root or current dir
        if (parent_dir / csv_path.name).exists():
            csv_path = parent_dir / csv_path.name
        elif (current_dir / csv_path.name).exists():
            csv_path = current_dir / csv_path.name
        else:
            print(f"[ERROR] Cleaned sales CSV file not found at: {csv_path}")
            print(f"Please place 'ai_bi_assistant_sales_data_cleaned.csv' in the project root: {parent_dir}")
            return 1

    print(f"\n==========================================")
    print(f"   SalesIQ Database Initialization")
    print(f"==========================================")
    print(f"Target Database URL: {settings.database_url.split('@')[-1] if '@' in settings.database_url else settings.database_url}")
    print(f"Reading CSV dataset: {csv_path}")

    # 1. Ensure database exists
    ensure_database_exists(settings.database_url)

    # 2. Create tables
    try:
        Base.metadata.create_all(bind=engine)
        print("[OK] Schema verified / table 'sales' created successfully.")
    except Exception as e:
        print(f"[ERROR] Failed to connect to MySQL database or create table:")
        print(f"  Details: {e}")
        print("\nTroubleshooting tips:")
        print("  1. Ensure your MySQL server is running (Windows Service: MySQL80).")
        print("  2. Check your credentials in backend/.env (DATABASE_URL=mysql+pymysql://USER:PASSWORD@127.0.0.1:3306/salesiq_db).")
        print("  3. Create the database in MySQL Workbench: CREATE DATABASE salesiq_db;")
        return 1

    # 3. Read and validate CSV dataset
    try:
        df = pd.read_csv(csv_path)
        required_cols = [
            "Transaction_Id", "Order_date", "Product", "Category", 
            "Region", "Sales_channel", "Quantity", "Unit_price", 
            "Discount_amount", "Status"
        ]
        missing_cols = [c for c in required_cols if c not in df.columns]
        if missing_cols:
            print(f"[ERROR] CSV is missing expected columns: {missing_cols}")
            return 1
    except Exception as e:
        print(f"[ERROR] Failed to read CSV: {e}")
        return 1

    # Format dates
    df["Order_date_parsed"] = pd.to_datetime(df["Order_date"], format="%d-%m-%Y").dt.date

    # 4. Check existing records to prevent duplicate imports
    session: Session = SessionLocal()
    try:
        existing_txn_ids = set(
            row[0] for row in session.execute(text("SELECT transaction_id FROM sales")).fetchall()
        )
        print(f"[INFO] Existing transactions in database: {len(existing_txn_ids)}")

        new_sales = []
        skipped = 0

        for _, row in df.iterrows():
            txn_id = str(row["Transaction_Id"]).strip()
            if txn_id in existing_txn_ids:
                skipped += 1
                continue

            sale = Sale(
                transaction_id=txn_id,
                order_date=row["Order_date_parsed"],
                product=str(row["Product"]).strip(),
                category=str(row["Category"]).strip(),
                region=str(row["Region"]).strip(),
                sales_channel=str(row["Sales_channel"]).strip(),
                quantity=int(row["Quantity"]),
                unit_price=Decimal(str(row["Unit_price"])),
                discount_amount=Decimal(str(row["Discount_amount"])),
                status=str(row["Status"]).strip()
            )
            new_sales.append(sale)

        if new_sales:
            session.add_all(new_sales)
            session.commit()
            print(f"[SUCCESS] Successfully imported {len(new_sales)} new sales records.")
        else:
            print(f"[INFO] No new records to import (all {skipped} CSV records already exist in database).")

        # 5. Verification & Summary Metrics
        total_in_db = session.query(Sale).count()
        completed_in_db = session.query(Sale).filter(Sale.status == "Completed").count()
        returned_in_db = session.query(Sale).filter(Sale.status == "Returned").count()

        # Deterministic revenue calculation check
        all_records = session.query(Sale).all()
        completed_net_revenue = sum(
            (s.quantity * s.unit_price) - s.discount_amount 
            for s in all_records if s.status == "Completed"
        )

        print("\n--- Import Verification Summary ---")
        print(f"Total rows in CSV:               {len(df)}")
        print(f"Total records in MySQL 'sales':  {total_in_db}")
        print(f"  - Completed orders:            {completed_in_db}")
        print(f"  - Returned orders:             {returned_in_db}")
        print(f"Verified Net Revenue:            {completed_net_revenue:,.2f}")
        print("-----------------------------------")
        print("[OK] Database initialization and data verification complete!\n")

    except Exception as e:
        session.rollback()
        print(f"[ERROR] Error during database transaction: {e}")
        return 1
    finally:
        session.close()

    return 0

if __name__ == "__main__":
    csv_arg = sys.argv[1] if len(sys.argv) > 1 else None
    exit_code = initialize_and_import(csv_arg)
    sys.exit(exit_code)
