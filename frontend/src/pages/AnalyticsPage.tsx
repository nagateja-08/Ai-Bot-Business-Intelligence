import React, { useState, useEffect } from 'react';
import {
  Search,
  Filter,
  Download,
  Package,
  Layers,
  ArrowUpDown,
  CheckCircle,
  AlertOctagon
} from 'lucide-react';
import { api } from '../services/api';
import { SaleRecord, CategoryBreakdownItem } from '../types';

export const AnalyticsPage: React.FC = () => {
  const [sales, setSales] = useState<SaleRecord[]>([]);
  const [categories, setCategories] = useState<CategoryBreakdownItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [search, setSearch] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [regionFilter, setRegionFilter] = useState<string>('ALL');
  const [categoryFilter, setCategoryFilter] = useState<string>('ALL');

  useEffect(() => {
    fetchData();
  }, [statusFilter, regionFilter, categoryFilter]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const params: any = {};
      if (statusFilter !== 'ALL') params.status = statusFilter;
      if (regionFilter !== 'ALL') params.region = regionFilter;
      if (categoryFilter !== 'ALL') params.category = categoryFilter;

      const [salesData, catData] = await Promise.all([
        api.getSales(params),
        api.getCategoryBreakdown()
      ]);

      setSales(salesData);
      setCategories(catData);
    } catch (err) {
      console.error('Error fetching analytics data', err);
    } finally {
      setLoading(false);
    }
  };

  const filteredSales = sales.filter((item) => {
    const matchesSearch =
      item.transaction_id.toLowerCase().includes(search.toLowerCase()) ||
      item.product.toLowerCase().includes(search.toLowerCase()) ||
      item.region.toLowerCase().includes(search.toLowerCase());
    return matchesSearch;
  });

  const exportCSV = () => {
    if (!filteredSales.length) return;
    const headers = ["Transaction_Id", "Order_date", "Product", "Category", "Region", "Sales_channel", "Quantity", "Unit_price", "Discount_amount", "Status", "Net_Revenue"];
    const rows = filteredSales.map(s => [
      s.transaction_id,
      s.order_date,
      `"${s.product}"`,
      s.category,
      s.region,
      s.sales_channel,
      s.quantity,
      s.unit_price,
      s.discount_amount,
      s.status,
      s.net_revenue
    ]);

    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `salesiq_export_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Category Breakdown Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {categories.map((cat) => (
          <div key={cat.category} className="p-5 rounded-2xl glass-panel border border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold px-2 py-0.5 rounded bg-slate-800 text-slate-300">
                {cat.category}
              </span>
              <span className="text-xs font-bold text-emerald-400">
                {cat.share_percentage}% share
              </span>
            </div>
            <div>
              <p className="text-xs text-slate-400">Net Sales Contribution</p>
              <h3 className="text-xl font-bold text-white mt-0.5">
                ₹{cat.net_revenue.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
              </h3>
            </div>
            <div className="pt-2 border-t border-slate-800/80 flex justify-between text-xs text-slate-400">
              <span>{cat.units_sold} units sold</span>
              <span>{cat.order_count} transactions</span>
            </div>
          </div>
        ))}
      </div>

      {/* Transactions Explorer */}
      <div className="p-5 rounded-2xl glass-panel border border-slate-800 space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div>
            <h4 className="font-bold text-white text-base">Sales Transaction Explorer</h4>
            <p className="text-xs text-slate-400">Search and filter individual line items in MySQL</p>
          </div>

          <button
            onClick={exportCSV}
            className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium transition border border-slate-700 flex items-center space-x-1.5 self-start md:self-auto"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export View to CSV</span>
          </button>
        </div>

        {/* Filter Controls */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-2">
          {/* Search */}
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by ID, Product, Region..."
              className="w-full bg-slate-850 border border-slate-700/80 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
            />
          </div>

          {/* Region Filter */}
          <select
            value={regionFilter}
            onChange={(e) => setRegionFilter(e.target.value)}
            className="bg-slate-850 border border-slate-700/80 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:ring-1 focus:ring-brand-500"
          >
            <option value="ALL">All Regions</option>
            <option value="North">North Region</option>
            <option value="South">South Region</option>
            <option value="East">East Region</option>
            <option value="West">West Region</option>
          </select>

          {/* Category Filter */}
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="bg-slate-850 border border-slate-700/80 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:ring-1 focus:ring-brand-500"
          >
            <option value="ALL">All Categories</option>
            <option value="Accessories">Accessories</option>
            <option value="Electronics">Electronics</option>
            <option value="Furniture">Furniture</option>
          </select>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-slate-850 border border-slate-700/80 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:ring-1 focus:ring-brand-500"
          >
            <option value="ALL">All Statuses</option>
            <option value="Completed">Completed Only</option>
            <option value="Returned">Returned Only</option>
          </select>
        </div>

        {/* Transactions Table */}
        <div className="overflow-x-auto pt-2">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 font-medium">
                <th className="pb-3 pl-2">ID</th>
                <th className="pb-3">Date</th>
                <th className="pb-3">Product</th>
                <th className="pb-3">Region</th>
                <th className="pb-3">Channel</th>
                <th className="pb-3 text-right">Qty</th>
                <th className="pb-3 text-right">Unit Price</th>
                <th className="pb-3 text-right">Discount</th>
                <th className="pb-3 text-right">Net Revenue</th>
                <th className="pb-3 text-center pr-2">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-slate-300">
              {filteredSales.map((s) => (
                <tr key={s.transaction_id} className="hover:bg-slate-800/30 transition">
                  <td className="py-2.5 pl-2 font-mono font-medium text-slate-400">
                    {s.transaction_id}
                  </td>
                  <td className="py-2.5 text-slate-300 whitespace-nowrap">
                    {s.order_date}
                  </td>
                  <td className="py-2.5 font-semibold text-white">
                    {s.product}
                  </td>
                  <td className="py-2.5 text-slate-300">
                    {s.region}
                  </td>
                  <td className="py-2.5 text-slate-400">
                    {s.sales_channel}
                  </td>
                  <td className="py-2.5 text-right font-medium">
                    {s.quantity}
                  </td>
                  <td className="py-2.5 text-right font-mono text-slate-400">
                    ₹{s.unit_price.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                  </td>
                  <td className="py-2.5 text-right font-mono text-amber-400">
                    {s.discount_amount > 0 ? `-₹${s.discount_amount.toLocaleString('en-IN')}` : '—'}
                  </td>
                  <td className="py-2.5 text-right font-mono font-bold text-emerald-400">
                    ₹{s.net_revenue.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                  </td>
                  <td className="py-2.5 text-center pr-2">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold ${
                      s.status === 'Completed'
                        ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/20'
                        : 'bg-rose-500/15 text-rose-400 border border-rose-500/20'
                    }`}>
                      {s.status === 'Completed' ? (
                        <CheckCircle className="w-3 h-3 mr-1" />
                      ) : (
                        <AlertOctagon className="w-3 h-3 mr-1" />
                      )}
                      {s.status}
                    </span>
                  </td>
                </tr>
              ))}
              {filteredSales.length === 0 && !loading && (
                <tr>
                  <td colSpan={10} className="py-8 text-center text-slate-500">
                    No matching sales records found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
