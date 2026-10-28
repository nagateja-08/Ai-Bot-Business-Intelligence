import React from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend
} from 'recharts';
import { MonthlyRevenueItem } from '../types';

interface MonthlyRevenueChartProps {
  data: MonthlyRevenueItem[];
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    const item = payload[0].payload as MonthlyRevenueItem;
    return (
      <div className="p-3.5 bg-slate-900/95 border border-slate-700/80 rounded-xl shadow-xl backdrop-blur-md text-xs space-y-1.5 min-w-[190px]">
        <p className="font-semibold text-slate-200 border-b border-slate-800 pb-1">{item.month_name}</p>
        <div className="flex justify-between items-center text-emerald-400">
          <span>Net Revenue:</span>
          <span className="font-bold">₹{item.net_revenue.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
        </div>
        <div className="flex justify-between items-center text-slate-400">
          <span>Gross Revenue:</span>
          <span>₹{item.gross_revenue.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
        </div>
        {item.discounts > 0 && (
          <div className="flex justify-between items-center text-amber-400">
            <span>Discounts:</span>
            <span>-₹{item.discounts.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
          </div>
        )}
        <div className="flex justify-between items-center text-indigo-300 pt-1 border-t border-slate-800/80">
          <span>Orders:</span>
          <span className="font-semibold">{item.transaction_count}</span>
        </div>
      </div>
    );
  }
  return null;
};

export const MonthlyRevenueChart: React.FC<MonthlyRevenueChartProps> = ({ data }) => {
  return (
    <div className="p-5 rounded-2xl glass-panel border border-slate-800 space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <h4 className="font-bold text-white text-base">Monthly Revenue Trend</h4>
          <p className="text-xs text-slate-400">Month-over-month realized net sales (Jan - Jun 2026)</p>
        </div>
        <div className="flex items-center space-x-4 text-xs">
          <div className="flex items-center space-x-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-indigo-500"></span>
            <span className="text-slate-300">Net Revenue</span>
          </div>
          <div className="flex items-center space-x-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-purple-400"></span>
            <span className="text-slate-400">Gross Sales</span>
          </div>
        </div>
      </div>

      <div className="h-[280px] w-full pt-2">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
            <defs>
              <linearGradient id="netRevGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#6366f1" stopOpacity={0.4} />
                <stop offset="95%" stopColor="#6366f1" stopOpacity={0.0} />
              </linearGradient>
              <linearGradient id="grossRevGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#c084fc" stopOpacity={0.25} />
                <stop offset="95%" stopColor="#c084fc" stopOpacity={0.0} />
              </linearGradient>
            </defs>

            <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.4} vertical={false} />

            <XAxis
              dataKey="month_name"
              stroke="#94a3b8"
              fontSize={11}
              tickLine={false}
              axisLine={{ stroke: '#334155' }}
              tickFormatter={(val) => val.split(' ')[0]}
            />

            <YAxis
              stroke="#94a3b8"
              fontSize={11}
              tickLine={false}
              axisLine={false}
              tickFormatter={(val) => `₹${(val / 1000).toFixed(0)}k`}
            />

            <Tooltip content={<CustomTooltip />} />

            <Area
              type="monotone"
              dataKey="gross_revenue"
              stroke="#c084fc"
              strokeWidth={1.5}
              strokeDasharray="4 4"
              fillOpacity={1}
              fill="url(#grossRevGradient)"
              name="Gross Revenue"
            />

            <Area
              type="monotone"
              dataKey="net_revenue"
              stroke="#6366f1"
              strokeWidth={2.5}
              fillOpacity={1}
              fill="url(#netRevGradient)"
              name="Net Revenue"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
