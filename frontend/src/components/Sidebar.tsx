import React from 'react';
import {
  LayoutDashboard,
  MessageSquareText,
  BarChart3,
  Sparkles,
  ExternalLink,
  ShieldCheck
} from 'lucide-react';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  mobileMenuOpen: boolean;
  setMobileMenuOpen: (open: boolean) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  setActiveTab,
  mobileMenuOpen,
  setMobileMenuOpen
}) => {
  const navItems = [
    {
      id: 'dashboard',
      label: 'Executive Dashboard',
      icon: LayoutDashboard,
      description: 'KPIs & performance charts'
    },
    {
      id: 'chat',
      label: 'AI BI Assistant',
      icon: MessageSquareText,
      badge: 'Groq AI',
      description: 'Natural language queries'
    },
    {
      id: 'analytics',
      label: 'Sales Explorer',
      icon: BarChart3,
      description: 'Filter transactions & categories'
    }
  ];

  const handleSelect = (id: string) => {
    setActiveTab(id);
    if (mobileMenuOpen) {
      setMobileMenuOpen(false);
    }
  };

  return (
    <>
      {/* Mobile backdrop */}
      {mobileMenuOpen && (
        <div
          onClick={() => setMobileMenuOpen(false)}
          className="fixed inset-0 bg-black/60 z-20 lg:hidden backdrop-blur-sm"
        />
      )}

      {/* Sidebar container */}
      <aside
        className={`fixed lg:static top-0 left-0 bottom-0 z-30 w-64 bg-slate-900 border-r border-slate-800 flex flex-col justify-between transition-transform duration-300 ease-in-out ${
          mobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        <div className="p-4 space-y-6">
          {/* Mobile brand header */}
          <div className="lg:hidden flex items-center justify-between pb-3 border-b border-slate-800">
            <span className="font-bold text-lg text-white">Sales<span className="text-brand-400">IQ</span></span>
            <button
              onClick={() => setMobileMenuOpen(false)}
              className="text-slate-400 hover:text-white text-sm"
            >
              Close
            </button>
          </div>

          {/* Navigation Links */}
          <nav className="space-y-1.5">
            <div className="px-3 pb-2 text-[11px] font-semibold tracking-wider text-slate-400 uppercase">
              Main Menu
            </div>
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleSelect(item.id)}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-medium transition group ${
                    isActive
                      ? 'bg-brand-600/15 text-brand-300 border border-brand-500/30 shadow-sm shadow-brand-500/10'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <Icon className={`w-4 h-4 transition ${isActive ? 'text-brand-400' : 'text-slate-400 group-hover:text-slate-200'}`} />
                    <span>{item.label}</span>
                  </div>
                  {item.badge && (
                    <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-purple-500/20 text-purple-300 border border-purple-500/30">
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Security & System Info Footer */}
        <div className="p-4 border-t border-slate-800 space-y-3">
          <div className="p-3 rounded-xl bg-slate-850 border border-slate-800 text-xs space-y-1.5">
            <div className="flex items-center space-x-1.5 text-slate-300 font-semibold">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>Security Guardrails</span>
            </div>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              Zero direct LLM-to-SQL execution. Parameterized allowlisted queries only.
            </p>
          </div>

          <div className="text-[11px] text-slate-500 text-center">
            SalesIQ v1.0 • Deployment Ready
          </div>
        </div>
      </aside>
    </>
  );
};
