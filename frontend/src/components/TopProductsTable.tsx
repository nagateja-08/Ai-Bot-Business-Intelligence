import React from 'react';
import { TopProductItem } from '../types';
import { Package, Award } from 'lucide-react';

interface TopProductsTableProps {
  products: TopProductItem[];
}

export const TopProductsTable: React.FC<TopProductsTableProps> = ({ products }) => {
  const maxNet = products.length > 0 ? Math.max(...products.map(p => p.net_revenue)) : 1;

  return (
    <div className="p-5 rounded-2xl glass-panel border border-slate-800 space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h4 className="font-bold text-white text-base">Top Products by Revenue</h4>
          <p className="text-xs text-slate-400">Ranked performance and unit sales</p>
        </div>
        <span className="text-xs text-brand-400 bg-brand-500/10 px-2.5 py-1 rounded-lg border border-brand-500/20 font-medium">
          {products.length} Products Tracked
        </span>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="border-b border-slate-800 text-slate-400 font-medium">
              <th className="pb-3 pl-2">Rank</th>
              <th className="pb-3">Product</th>
              <th className="pb-3">Category</th>
              <th className="pb-3 text-right">Units Sold</th>
              <th className="pb-3 text-right">Avg Unit Price</th>
              <th className="pb-3 text-right pr-2">Net Revenue</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60 text-slate-300">
            {products.map((item, idx) => {
              const share = ((item.net_revenue / maxNet) * 100).toFixed(0);
              return (
                <tr key={item.product} className="hover:bg-slate-800/30 transition">
                  <td className="py-3 pl-2 font-mono text-slate-500">
                    {idx === 0 ? (
                      <span className="flex items-center text-amber-400 font-bold">
                        <Award className="w-4 h-4 mr-1 inline" /> #1
                      </span>
                    ) : (
                      `#${idx + 1}`
                    )}
                  </td>
                  <td className="py-3 font-semibold text-white">
                    <div className="flex items-center space-x-2">
                      <span>{item.product}</span>
                    </div>
                  </td>
                  <td className="py-3">
                    <span className={`inline-block px-2 py-0.5 rounded text-[11px] font-medium ${
                      item.category === 'Electronics'
                        ? 'bg-purple-500/15 text-purple-300 border border-purple-500/30'
                        : item.category === 'Furniture'
                        ? 'bg-amber-500/15 text-amber-300 border border-amber-500/30'
                        : 'bg-indigo-500/15 text-indigo-300 border border-indigo-500/30'
                    }`}>
                      {item.category}
                    </span>
                  </td>
                  <td className="py-3 text-right font-medium text-slate-200">
                    {item.units_sold}
                  </td>
                  <td className="py-3 text-right font-mono text-slate-400">
                    ₹{item.average_unit_price.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                  </td>
                  <td className="py-3 text-right pr-2">
                    <div className="flex flex-col items-end">
                      <span className="font-bold text-emerald-400 font-mono">
                        ₹{item.net_revenue.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                      </span>
                      <div className="w-20 bg-slate-800 h-1 rounded-full mt-1 overflow-hidden">
                        <div
                          className="bg-emerald-400 h-full rounded-full"
                          style={{ width: `${share}%` }}
                        ></div>
                      </div>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
