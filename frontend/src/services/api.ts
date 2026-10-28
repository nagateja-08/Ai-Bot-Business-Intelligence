import axios from 'axios';
import {
  HealthResponse,
  OverviewMetrics,
  MonthlyRevenueItem,
  RegionalRevenueItem,
  TopProductItem,
  MonthComparison,
  SaleRecord,
  CategoryBreakdownItem,
  ChatResponse,
  SuggestionList
} from '../types';

const getBaseUrl = (): string => {
  // 1. Explicit build/env variable
  const envUrl = import.meta.env.VITE_API_BASE_URL;
  if (envUrl && envUrl.trim() !== '' && envUrl !== 'http://localhost:8000') {
    return envUrl.trim().replace(/\/+$/, '');
  }
  // 2. Auto-detect if running on Render (salesiq-frontend.onrender.com -> salesiq-backend.onrender.com)
  if (typeof window !== 'undefined' && window.location.hostname.includes('onrender.com')) {
    const backendHost = window.location.hostname.replace('-frontend', '-backend');
    return `https://${backendHost}`;
  }
  // 3. Fallback for local development
  return 'http://localhost:8000';
};

export const API_BASE_URL = getBaseUrl();

const client = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 25000,
});

export const api = {
  // System Health
  async getHealth(): Promise<HealthResponse> {
    const res = await client.get<HealthResponse>('/api/health');
    return res.data;
  },

  // Analytics
  async getOverview(): Promise<OverviewMetrics> {
    const res = await client.get<OverviewMetrics>('/api/analytics/overview');
    return res.data;
  },

  async getMonthlyRevenue(): Promise<MonthlyRevenueItem[]> {
    const res = await client.get<MonthlyRevenueItem[]>('/api/analytics/monthly-revenue');
    return res.data;
  },

  async getRegionalRevenue(): Promise<RegionalRevenueItem[]> {
    const res = await client.get<RegionalRevenueItem[]>('/api/analytics/region-revenue');
    return res.data;
  },

  async getTopProducts(limit: number = 10): Promise<TopProductItem[]> {
    const res = await client.get<TopProductItem[]>(`/api/analytics/top-products?limit=${limit}`);
    return res.data;
  },

  async compareMonths(month1: string, month2: string): Promise<MonthComparison> {
    const res = await client.get<MonthComparison>(`/api/analytics/compare-months?month1=${encodeURIComponent(month1)}&month2=${encodeURIComponent(month2)}`);
    return res.data;
  },

  async getCategoryBreakdown(): Promise<CategoryBreakdownItem[]> {
    const res = await client.get<CategoryBreakdownItem[]>('/api/analytics/categories');
    return res.data;
  },

  async getSales(params?: { status?: string; region?: string; category?: string; limit?: number }): Promise<SaleRecord[]> {
    const res = await client.get<SaleRecord[]>('/api/analytics/sales', { params });
    return res.data;
  },

  // AI Chat & Suggestions
  async sendChatMessage(question: string, history: Array<{ role: string; content: string }> = []): Promise<ChatResponse> {
    const res = await client.post<ChatResponse>('/api/chat', { question, history });
    return res.data;
  },

  async getSuggestions(): Promise<string[]> {
    const res = await client.get<SuggestionList>('/api/suggestions');
    return res.data.suggestions;
  }
};
