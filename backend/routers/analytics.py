from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List, Optional, Dict, Any

try:
    from backend.database import get_db
    from backend.services.analytics_service import AnalyticsService
    from backend.schemas import (
        OverviewMetrics,
        MonthlyRevenueItem,
        RegionalRevenueItem,
        TopProductItem,
        MonthComparison
    )
    from backend.models import Sale
except ImportError:
    from database import get_db
    from services.analytics_service import AnalyticsService
    from schemas import (
        OverviewMetrics,
        MonthlyRevenueItem,
        RegionalRevenueItem,
        TopProductItem,
        MonthComparison
    )
    from models import Sale

router = APIRouter(prefix="/api/analytics", tags=["Analytics"])

@router.get("/overview", response_model=OverviewMetrics)
def get_overview(db: Session = Depends(get_db)):
    """
    Returns high-level business KPIs: Gross & Net Revenue, AOV, Order Counts.
    """
    try:
        return AnalyticsService.get_overview(db)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to calculate overview metrics: {str(e)}")

@router.get("/monthly-revenue", response_model=List[MonthlyRevenueItem])
def get_monthly_revenue(db: Session = Depends(get_db)):
    """
    Returns monthly revenue aggregation for trend charting.
    """
    try:
        return AnalyticsService.get_monthly_revenue(db)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch monthly revenue: {str(e)}")

@router.get("/region-revenue", response_model=List[RegionalRevenueItem])
def get_region_revenue(db: Session = Depends(get_db)):
    """
    Returns regional revenue distribution and percentage market share.
    """
    try:
        return AnalyticsService.get_regional_revenue(db)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch regional revenue: {str(e)}")

@router.get("/top-products", response_model=List[TopProductItem])
def get_top_products(
    limit: int = Query(default=10, ge=1, le=50, description="Max products to return"),
    db: Session = Depends(get_db)
):
    """
    Returns products ranked by net revenue contribution.
    """
    try:
        return AnalyticsService.get_top_products(db, limit=limit)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch top products: {str(e)}")

@router.get("/compare-months", response_model=MonthComparison)
def compare_months(
    month1: str = Query(..., description="First month (e.g., '2026-04' or 'April')"),
    month2: str = Query(..., description="Second month (e.g., '2026-05' or 'May')"),
    db: Session = Depends(get_db)
):
    """
    Calculates absolute and percentage change between two months.
    """
    try:
        return AnalyticsService.compare_months(db, month1, month2)
    except ValueError as ve:
        raise HTTPException(status_code=400, detail=str(ve))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to compare months: {str(e)}")

@router.get("/categories")
def get_category_breakdown(db: Session = Depends(get_db)):
    """
    Returns category level breakdown.
    """
    try:
        return AnalyticsService.get_category_breakdown(db)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch category breakdown: {str(e)}")

@router.get("/sales")
def get_sales_records(
    status: Optional[str] = Query(None, description="Filter by status (Completed, Returned)"),
    region: Optional[str] = Query(None, description="Filter by region"),
    category: Optional[str] = Query(None, description="Filter by category"),
    limit: int = Query(default=100, ge=1, le=500),
    db: Session = Depends(get_db)
):
    """
    Retrieves sales records with optional filtering.
    """
    try:
        query = db.query(Sale)
        if status:
            query = query.filter(Sale.status == status)
        if region:
            query = query.filter(Sale.region == region)
        if category:
            query = query.filter(Sale.category == category)
        
        records = query.order_by(Sale.order_date.desc()).limit(limit).all()
        return [r.to_dict() for r in records]
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch sales records: {str(e)}")
