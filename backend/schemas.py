from pydantic import BaseModel, Field
from typing import List, Optional, Any, Dict
from enum import Enum

class IntentEnum(str, Enum):
    TOTAL_REVENUE = "total_revenue"
    TOP_PRODUCTS = "top_products"
    MONTHLY_TREND = "monthly_trend"
    REGION_REVENUE = "region_revenue"
    MONTH_COMPARISON = "month_comparison"
    CATEGORY_BREAKDOWN = "category_breakdown"
    STATUS_BREAKDOWN = "status_breakdown"
    CHANNEL_BREAKDOWN = "channel_breakdown"
    TOTAL_ORDERS = "total_orders"
    GENERAL_QUERY = "general_query"
    UNSUPPORTED = "unsupported"

class HealthResponse(BaseModel):
    status: str
    database_connected: bool
    database_message: str
    groq_configured: bool
    groq_model: str
    version: str = "1.0.0"

class OverviewMetrics(BaseModel):
    total_net_revenue: float
    total_gross_revenue: float
    total_discounts: float
    returned_revenue: float
    total_transactions: int
    completed_transactions: int
    returned_transactions: int
    unique_products: int
    unique_regions: int
    average_order_value: float

class MonthlyRevenueItem(BaseModel):
    month: str
    month_name: str
    gross_revenue: float
    net_revenue: float
    discounts: float
    transaction_count: int

class RegionalRevenueItem(BaseModel):
    region: str
    net_revenue: float
    gross_revenue: float
    transaction_count: int
    revenue_percentage: float

class TopProductItem(BaseModel):
    product: str
    category: str
    units_sold: int
    net_revenue: float
    gross_revenue: float
    average_unit_price: float

class MonthComparison(BaseModel):
    month1: str
    month1_name: str
    month1_revenue: float
    month2: str
    month2_name: str
    month2_revenue: float
    absolute_difference: float
    percentage_change: float
    direction: str

class SaleRecordItem(BaseModel):
    transaction_id: str
    order_date: str
    product: str
    category: str
    region: str
    sales_channel: str
    quantity: int
    unit_price: float
    discount_amount: float
    status: str
    net_revenue: float

class ChatMessage(BaseModel):
    role: str
    content: str

class ChatRequest(BaseModel):
    question: str = Field(..., min_length=1, max_length=500, description="Natural language question")
    history: Optional[List[ChatMessage]] = Field(default=[], description="Previous conversation messages")

class ChatResponse(BaseModel):
    question: str
    intent: IntentEnum
    answer: str
    data: Optional[Any] = None
    visual_type: Optional[str] = None  # "metric", "bar_chart", "line_chart", "table", "comparison", "none"
    execution_time_ms: float
    source: str  # "groq_ai" or "deterministic_engine"
    confidence: float = 1.0

class SuggestionList(BaseModel):
    suggestions: List[str]
