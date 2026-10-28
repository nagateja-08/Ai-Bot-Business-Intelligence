import React from 'react';
import { LucideIcon } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string | number;
  subtext?: string;
  icon: LucideIcon;
  trend?: {
    value: string;
    isPositive?: boolean;
  };
  accentColor?: 'indigo' | 'emerald' | 'purple' | 'amber' | 'rose' | 'cyan';
}

const colorMap = {
  indigo: {
    bg: 'bg-indigo-500/10',
    border: 'border-indigo-500/20',
    iconBg: 'bg-indigo-500/20',
    iconText: 'text-indigo-400',
    glow: 'group-hover:border-indigo-500/40',
  },
  emerald: {
    bg: 'bg-emerald-500/10',
    border: 'border-emerald-500/20',
    iconBg: 'bg-emerald-500/20',
    iconText: 'text-emerald-400',
    glow: 'group-hover:border-emerald-500/40',
  },
  purple: {
    bg: 'bg-purple-500/10',
    border: 'border-purple-500/20',
    iconBg: 'bg-purple-500/20',
    iconText: 'text-purple-400',
    glow: 'group-hover:border-purple-500/40',
  },
  amber: {
    bg: 'bg-amber-500/10',
    border: 'border-amber-500/20',
    iconBg: 'bg-amber-500/20',
    iconText: 'text-amber-400',
    glow: 'group-hover:border-amber-500/40',
  },
  rose: {
    bg: 'bg-rose-500/10',
    border: 'border-rose-500/20',
    iconBg: 'bg-rose-500/20',
    iconText: 'text-rose-400',
    glow: 'group-hover:border-rose-500/40',
  },
  cyan: {
    bg: 'bg-cyan-500/10',
    border: 'border-cyan-500/20',
    iconBg: 'bg-cyan-500/20',
    iconText: 'text-cyan-400',
    glow: 'group-hover:border-cyan-500/40',
  },
};

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  subtext,
  icon: Icon,
  trend,
  accentColor = 'indigo'
}) => {
  const c = colorMap[accentColor];

  return (
    <div className={`group relative p-5 rounded-2xl glass-panel ${c.border} ${c.glow} transition-all duration-200 shadow-sm hover:shadow-md`}>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-medium text-slate-400 tracking-wide uppercase">{title}</p>
          <h3 className="mt-2 text-2xl font-bold text-white tracking-tight">{value}</h3>
          
          {(subtext || trend) && (
            <div className="mt-2 flex items-center space-x-2 text-xs">
              {trend && (
                <span className={`font-semibold ${trend.isPositive ? 'text-emerald-400' : 'text-rose-400'}`}>
                  {trend.value}
                </span>
              )}
              {subtext && <span className="text-slate-400">{subtext}</span>}
            </div>
          )}
        </div>

        <div className={`p-3 rounded-xl ${c.iconBg} ${c.iconText}`}>
          <Icon className="w-5 h-5" />
        </div>
      </div>
    </div>
  );
};
