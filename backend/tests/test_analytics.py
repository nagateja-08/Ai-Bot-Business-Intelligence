import pytest
from decimal import Decimal
from backend.services.analytics_service import AnalyticsService
from backend.models import Sale

def test_overview_metrics_calculation(mock_db_session):
    """
    Test overview metrics calculation using mock session.
    Verifies that:
    - Gross revenue matches completed sum
    - Discounts are deducted in net revenue
    - Returned orders are separated
    """
    overview = AnalyticsService.get_overview(mock_db_session)
    
    # In sample_sales_data:
    # TXN0001: 10 * 1200 = 12000, disc 0 -> net 12000
    # TXN0002: 25 * 650 = 16250, disc 0 -> net 16250
    # TXN0004: 6 * 9500 = 57000, disc 500 -> net 56500
    # TXN0014: 2 * 12500 = 25000, disc 0 -> net 25000
    # TXN0022: 4 * 12500 = 50000, disc 2500 -> net 47500
    # TXN0034: 0 * 900 = 0, disc 0 -> net 0
    # Total completed gross = 12000 + 16250 + 57000 + 25000 + 50000 + 0 = 160,250
    # Total discounts = 500 + 2500 = 3000
    # Total completed net = 160,250 - 3000 = 157,250
    # Returned: TXN0033: 2 * 9500 = 19,000

    assert overview.total_gross_revenue == 160250.0
    assert overview.total_discounts == 3000.0
    assert overview.total_net_revenue == 138250.0
    assert overview.returned_revenue == 19000.0
    assert overview.completed_transactions == 6
    assert overview.returned_transactions == 1
    assert overview.total_transactions == 7

def test_monthly_revenue_aggregation(mock_db_session):
    """Verify monthly aggregation groups by YYYY-MM correctly"""
    monthly = AnalyticsService.get_monthly_revenue(mock_db_session)
    months = [m.month for m in monthly]

    # Sample data has 2026-01, 2026-02, 2026-03, 2026-04
    assert "2026-01" in months
    assert "2026-02" in months
    assert "2026-03" in months

    jan = next(m for m in monthly if m.month == "2026-01")
    # Jan sales: TXN0001 (12000), TXN0002 (16250), TXN0004 (56500 net) -> total net = 84750
    assert jan.net_revenue == 84750.0
    assert jan.discounts == 500.0
    assert jan.transaction_count == 3

def test_regional_revenue_ranking(mock_db_session):
    """Verify regional revenue grouping and percentage distribution"""
    regions = AnalyticsService.get_regional_revenue(mock_db_session)
    reg_names = [r.region for r in regions]

    assert "North" in reg_names
    assert "South" in reg_names
    assert "East" in reg_names
    assert "West" in reg_names

    # Check percentages sum to approx 100%
    total_pct = sum(r.revenue_percentage for r in regions)
    assert 99.0 <= total_pct <= 101.0

def test_top_products_ranking(mock_db_session):
    """Verify top products ranked descending by net revenue"""
    top_products = AnalyticsService.get_top_products(mock_db_session, limit=5)
    
    assert len(top_products) > 0
    # Highest in sample is Desk (25000 + 47500 = 72500) or Monitor (56500)
    assert top_products[0].net_revenue >= top_products[1].net_revenue

def test_compare_months(mock_db_session):
    """Verify month comparison percentage and direction calculation"""
    comp = AnalyticsService.compare_months(mock_db_session, "2026-01", "2026-02")
    
    assert comp.month1 == "2026-01"
    assert comp.month2 == "2026-02"
    assert comp.month1_revenue == 84750.0
    assert comp.month2_revenue == 25000.0
    assert comp.direction == "decrease"
    assert comp.absolute_difference == -59750.0
