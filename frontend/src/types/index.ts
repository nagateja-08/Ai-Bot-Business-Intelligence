export interface HealthResponse {
  status: string;
  database_connected: boolean;
  database_message: string;
  groq_configured: boolean;
  groq_model: string;
  version: string;
}

export interface OverviewMetrics {
  total_net_revenue: number;
  total_gross_revenue: number;
  total_discounts: number;
  returned_revenue: number;
  total_transactions: number;
  completed_transactions: number;
  returned_transactions: number;
  unique_products: number;
  unique_regions: number;
  average_order_value: number;
}

export interface MonthlyRevenueItem {
  month: string;
  month_name: string;
  gross_revenue: number;
  net_revenue: number;
  discounts: number;
  transaction_count: number;
}

export interface RegionalRevenueItem {
  region: string;
  net_revenue: number;
  gross_revenue: number;
  transaction_count: number;
  revenue_percentage: number;
}

export interface TopProductItem {
  product: string;
  category: string;
  units_sold: number;
  net_revenue: number;
  gross_revenue: number;
  average_unit_price: number;
}

export interface MonthComparison {
  month1: string;
  month1_name: string;
  month1_revenue: number;
  month2: string;
  month2_name: string;
  month2_revenue: number;
  absolute_difference: number;
  percentage_change: number;
  direction: 'increase' | 'decrease';
}

export interface SaleRecord {
  transaction_id: string;
  order_date: string;
  product: string;
  category: string;
  region: string;
  sales_channel: string;
  quantity: number;
  unit_price: number;
  discount_amount: number;
  status: string;
  gross_revenue: number;
  net_revenue: number;
}

export interface CategoryBreakdownItem {
  category: string;
  net_revenue: number;
  units_sold: number;
  order_count: number;
  share_percentage: number;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  intent?: string;
  visualType?: 'metric' | 'bar_chart' | 'line_chart' | 'table' | 'comparison' | 'none';
  data?: any;
  source?: 'groq_ai' | 'deterministic_engine';
  executionTimeMs?: number;
  isError?: boolean;
}

export interface ChatResponse {
  question: string;
  intent: string;
  answer: string;
  data?: any;
  visual_type?: string;
  execution_time_ms: number;
  source: string;
  confidence: number;
}

export interface SuggestionList {
  suggestions: string[];
}
