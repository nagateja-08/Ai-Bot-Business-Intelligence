import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell
} from 'recharts';
import { RegionalRevenueItem } from '../types';

interface RegionalRevenueChartProps {
  data: RegionalRevenueItem[];
}

const REGION_COLORS: { [key: string]: string } = {
  South: '#10b981', // Emerald
  North: '#6366f1', // Indigo
  East: '#06b6d4',  // Cyan
  West: '#f59e0b',  // Amber
};

const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    const item = payload[0].payload as RegionalRevenueItem;
    return (
      <div className="p-3 bg-slate-900/95 border border-slate-700/80 rounded-xl shadow-xl backdrop-blur-md text-xs space-y-1 min-w-[160px]">
        <p className="font-semibold text-slate-200 border-b border-slate-800 pb-1">{item.region} Region</p>
        <div className="flex justify-between items-center text-emerald-400">
          <span>Net Sales:</span>
          <span className="font-bold">₹{item.net_revenue.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
        </div>
        <div className="flex justify-between items-center text-slate-400">
          <span>Market Share:</span>
          <span>{item.revenue_percentage}%</span>
        </div>
        <div className="flex justify-between items-center text-slate-400">
          <span>Orders:</span>
          <span>{item.transaction_count}</span>
        </div>
      </div>
    );
  }
  return null;
};

export const RegionalRevenueChart: React.FC<RegionalRevenueChartProps> = ({ data }) => {
  return (
    <div className="p-5 rounded-2xl glass-panel border border-slate-800 space-y-4">
      <div>
        <h4 className="font-bold text-white text-base">Regional Performance</h4>
        <p className="text-xs text-slate-400">Sales volume and market distribution by territory</p>
      </div>

      <div className="h-[280px] w-full pt-2">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.4} vertical={false} />
            <XAxis
              dataKey="region"
              stroke="#94a3b8"
              fontSize={11}
              tickLine={false}
              axisLine={{ stroke: '#334155' }}
            />
            <YAxis
              stroke="#94a3b8"
              fontSize={11}
              tickLine={false}
              axisLine={false}
              tickFormatter={(val) => `₹${(val / 1000).toFixed(0)}k`}
            />
            <Tooltip content={<CustomTooltip />} />
            <Bar dataKey="net_revenue" radius={[6, 6, 0, 0]}>
              {data.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={REGION_COLORS[entry.region] || '#6366f1'}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
