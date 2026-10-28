import React from 'react';
import { Sparkles, Database, Cpu, RefreshCw, Menu, X } from 'lucide-react';
import { HealthResponse } from '../types';

interface NavbarProps {
  health: HealthResponse | null;
  loading: boolean;
  onRefresh: () => void;
  mobileMenuOpen: boolean;
  setMobileMenuOpen: (open: boolean) => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  health,
  loading,
  onRefresh,
  mobileMenuOpen,
  setMobileMenuOpen
}) => {
  const isDbConnected = health?.database_connected ?? false;
  const isGroqConfigured = health?.groq_configured ?? false;

  return (
    <header className="sticky top-0 z-30 bg-slate-900/90 backdrop-blur-md border-b border-slate-800 px-4 lg:px-8 py-3.5 flex items-center justify-between">
      {/* Brand & Title */}
      <div className="flex items-center space-x-3">
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="lg:hidden p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
          aria-label="Toggle Navigation"
        >
          {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>

        <div className="flex items-center space-x-2.5">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-brand-600 via-indigo-500 to-purple-500 flex items-center justify-center shadow-lg shadow-indigo-500/20">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="font-bold text-lg text-white tracking-tight">Sales<span className="text-brand-400">IQ</span></span>
              <span className="text-[10px] uppercase font-semibold px-1.5 py-0.5 rounded bg-brand-500/20 text-brand-300 border border-brand-500/30">
                AI BI Assistant
              </span>
            </div>
            <p className="text-xs text-slate-400 hidden sm:block">Intelligent Business Analytics & Groq Natural Language Engine</p>
          </div>
        </div>
      </div>

      {/* System Status Indicators */}
      <div className="flex items-center space-x-3">
        {/* MySQL Status Pill */}
        <div className="hidden md:flex items-center space-x-1.5 px-3 py-1.5 rounded-full bg-slate-800/80 border border-slate-700/60 text-xs">
          <Database className={`w-3.5 h-3.5 ${isDbConnected ? 'text-emerald-400' : 'text-rose-400'}`} />
          <span className="text-slate-300 font-medium">MySQL:</span>
          <span className={`inline-flex items-center ${isDbConnected ? 'text-emerald-400' : 'text-rose-400'}`}>
            <span className={`w-1.5 h-1.5 rounded-full mr-1.5 ${isDbConnected ? 'bg-emerald-400 animate-pulse' : 'bg-rose-400'}`}></span>
            {isDbConnected ? 'Connected' : 'Offline'}
          </span>
        </div>

        {/* Groq AI Status Pill */}
        <div className="hidden sm:flex items-center space-x-1.5 px-3 py-1.5 rounded-full bg-slate-800/80 border border-slate-700/60 text-xs">
          <Cpu className={`w-3.5 h-3.5 ${isGroqConfigured ? 'text-purple-400' : 'text-amber-400'}`} />
          <span className="text-slate-300 font-medium">Groq:</span>
          <span className={isGroqConfigured ? 'text-purple-300' : 'text-amber-300'}>
            {isGroqConfigured ? (health?.groq_model || 'Active') : 'Deterministic Engine'}
          </span>
        </div>

        {/* Refresh Button */}
        <button
          onClick={onRefresh}
          disabled={loading}
          title="Refresh Data & Connectivity"
          className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition border border-slate-700 disabled:opacity-50"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-brand-400' : ''}`} />
        </button>
      </div>
    </header>
  );
};
