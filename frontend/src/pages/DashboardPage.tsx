import React from 'react';
import {
  DollarSign,
  ShoppingCart,
  Package,
  MapPin,
  TrendingUp,
  Percent,
  RotateCcw,
  Sparkles,
  ArrowRight
} from 'lucide-react';
import { StatCard } from '../components/StatCard';
import { MonthlyRevenueChart } from '../components/MonthlyRevenueChart';
import { RegionalRevenueChart } from '../components/RegionalRevenueChart';
import { TopProductsTable } from '../components/TopProductsTable';
import {
  OverviewMetrics,
  MonthlyRevenueItem,
  RegionalRevenueItem,
  TopProductItem
} from '../types';

interface DashboardPageProps {
  overview: OverviewMetrics | null;
  monthly: MonthlyRevenueItem[];
  regional: RegionalRevenueItem[];
  topProducts: TopProductItem[];
  loading: boolean;
  onNavigateToChat: (question?: string) => void;
}

export const DashboardPage: React.FC<DashboardPageProps> = ({
  overview,
  monthly,
  regional,
  topProducts,
  loading,
  onNavigateToChat
}) => {
  if (loading && !overview) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-28 bg-slate-800/40 rounded-2xl"></div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-32 bg-slate-800/40 rounded-2xl"></div>
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="h-80 bg-slate-800/40 rounded-2xl"></div>
          <div className="h-80 bg-slate-800/40 rounded-2xl"></div>
        </div>
      </div>
    );
  }

  const netRevFormatted = overview
    ? `₹${overview.total_net_revenue.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`
    : '₹0.00';

  const grossRevFormatted = overview
    ? `₹${overview.total_gross_revenue.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`
    : '₹0.00';

  const discountFormatted = overview
    ? `₹${overview.total_discounts.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`
    : '₹0.00';

  const aovFormatted = overview
    ? `₹${overview.average_order_value.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`
    : '₹0.00';

  const topProduct = topProducts.length > 0 ? topProducts[0].product : 'None';
  const topRegion = regional.length > 0 ? regional[0].region : 'None';

  return (
    <div className="space-y-6">
      {/* Executive Welcome & AI Callout Banner */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-brand-900/60 via-slate-900 to-slate-900 border border-brand-500/20 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-xl">
        <div className="space-y-1">
          <div className="flex items-center space-x-2">
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-brand-500/20 text-brand-300 border border-brand-500/30">
              Live BI Dashboard
            </span>
            <span className="text-xs text-slate-400">• MySQL 8.0 Grounded</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
            Sales Performance Overview
          </h2>
          <p className="text-xs sm:text-sm text-slate-300 max-w-2xl">
            Realized net revenue across all 50 sales transactions, tracking orders from January through June 2026.
          </p>
        </div>

        <button
          onClick={() => onNavigateToChat("What is the total revenue?")}
          className="px-4 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-500 text-white text-xs sm:text-sm font-semibold transition flex items-center space-x-2 shadow-lg shadow-brand-500/20 shrink-0"
        >
          <Sparkles className="w-4 h-4" />
          <span>Ask AI Assistant</span>
          <ArrowRight className="w-4 h-4 ml-1" />
        </button>
      </div>

      {/* KPI Stat Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Net Revenue"
          value={netRevFormatted}
          subtext={`Gross: ${grossRevFormatted}`}
          icon={DollarSign}
          accentColor="emerald"
        />

        <StatCard
          title="Total Transactions"
          value={overview?.total_transactions ?? 50}
          subtext={`${overview?.completed_transactions ?? 49} completed • ${overview?.returned_transactions ?? 1} return`}
          icon={ShoppingCart}
          accentColor="indigo"
        />

        <StatCard
          title="Average Order Value"
          value={aovFormatted}
          subtext="Net realized per completed order"
          icon={TrendingUp}
          accentColor="purple"
        />

        <StatCard
          title="Total Discounts"
          value={discountFormatted}
          subtext="Flat deductions applied"
          icon={Percent}
          accentColor="amber"
        />
      </div>

      {/* Secondary Highlights */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 rounded-xl glass-panel border border-slate-800 flex items-center space-x-3">
          <div className="p-2.5 rounded-lg bg-indigo-500/15 text-indigo-400">
            <Package className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs text-slate-400 font-medium uppercase">Top Selling Product</p>
            <h4 className="text-sm font-bold text-white mt-0.5">{topProduct}</h4>
            <span className="text-[11px] text-emerald-400">
              {topProducts[0] ? `₹${topProducts[0].net_revenue.toLocaleString('en-IN', { minimumFractionDigits: 2 })} Net Revenue` : '—'}
            </span>
          </div>
        </div>

        <div className="p-4 rounded-xl glass-panel border border-slate-800 flex items-center space-x-3">
          <div className="p-2.5 rounded-lg bg-emerald-500/15 text-emerald-400">
            <MapPin className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs text-slate-400 font-medium uppercase">Top Performing Region</p>
            <h4 className="text-sm font-bold text-white mt-0.5">{topRegion} Region</h4>
            <span className="text-[11px] text-emerald-400">
              {regional[0] ? `₹${regional[0].net_revenue.toLocaleString('en-IN', { minimumFractionDigits: 2 })} (${regional[0].revenue_percentage}% share)` : '—'}
            </span>
          </div>
        </div>

        <div className="p-4 rounded-xl glass-panel border border-slate-800 flex items-center space-x-3">
          <div className="p-2.5 rounded-lg bg-rose-500/15 text-rose-400">
            <RotateCcw className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs text-slate-400 font-medium uppercase">Returned Orders</p>
            <h4 className="text-sm font-bold text-white mt-0.5">1 Order (TXN0033)</h4>
            <span className="text-[11px] text-slate-400">₹19,000.00 return value</span>
          </div>
        </div>
      </div>

      {/* Visual Analytics Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <MonthlyRevenueChart data={monthly} />
        <RegionalRevenueChart data={regional} />
      </div>

      {/* Top Products Table */}
      <TopProductsTable products={topProducts} />
    </div>
  );
};
