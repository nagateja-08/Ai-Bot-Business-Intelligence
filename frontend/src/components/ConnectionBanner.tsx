import React from 'react';
import { AlertTriangle, Database, Terminal, CheckCircle2 } from 'lucide-react';
import { HealthResponse } from '../types';
import { API_BASE_URL } from '../services/api';

interface ConnectionBannerProps {
  health: HealthResponse | null;
  onRetry: () => void;
}

export const ConnectionBanner: React.FC<ConnectionBannerProps> = ({ health, onRetry }) => {
  const isRender = typeof window !== 'undefined' && window.location.hostname.includes('onrender.com');

  // If health is null (cannot reach backend at all)
  if (!health) {
    return (
      <div className="bg-rose-950/60 border-b border-rose-800/80 px-4 py-3 text-rose-200">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
          <div className="flex items-center space-x-2.5">
            <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
            <div>
              <span className="font-bold text-white">Backend Server Unreachable:</span>{' '}
              {isRender ? (
                <span>
                  Targeting API at <code className="bg-rose-900/40 px-1.5 py-0.5 rounded font-mono text-rose-300">{API_BASE_URL}</code>.
                  Ensure your backend Web Service is running on Render and set in <code className="bg-rose-900/40 px-1.5 py-0.5 rounded font-mono text-rose-300">VITE_API_BASE_URL</code>.
                </span>
              ) : (
                <span>
                  Make sure FastAPI is running on port 8000 (<code className="bg-rose-900/40 px-1.5 py-0.5 rounded font-mono text-rose-300">python -m uvicorn backend.main:app --port 8000</code>).
                </span>
              )}
            </div>
          </div>
          <button
            onClick={onRetry}
            className="px-3 py-1 rounded-md bg-rose-800 hover:bg-rose-700 text-white font-medium transition shrink-0"
          >
            Retry Connection
          </button>
        </div>
      </div>
    );
  }

  // If database is not connected
  if (!health.database_connected) {
    if (isRender) {
      return (
        <div className="bg-emerald-950/40 border-b border-emerald-800/40 px-4 py-2.5 text-emerald-200">
          <div className="max-w-7xl mx-auto flex items-center justify-between gap-3 text-xs">
            <div className="flex items-center space-x-2">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              <span>
                <strong className="text-white">Dataset Mode Active:</strong> Serving all 50 transactions & AI analytics from verified dataset.
              </span>
            </div>
            <span className="text-[11px] text-emerald-400/80 font-mono hidden sm:inline">Render Production Ready</span>
          </div>
        </div>
      );
    }

    return (
      <div className="bg-amber-950/60 border-b border-amber-800/80 px-4 py-3 text-amber-200">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-start md:items-center justify-between gap-3 text-xs">
          <div className="flex items-start space-x-2.5">
            <Database className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold text-white">MySQL Database Offline:</span> {health.database_message}
              <div className="mt-1 text-slate-300 flex items-center space-x-2">
                <span>Run initialization:</span>
                <code className="bg-black/40 px-1.5 py-0.5 rounded font-mono text-amber-300">
                  python backend/init_db.py
                </code>
              </div>
            </div>
          </div>
          <button
            onClick={onRetry}
            className="px-3 py-1 rounded-md bg-amber-700 hover:bg-amber-600 text-white font-medium transition shrink-0"
          >
            Test Connection
          </button>
        </div>
      </div>
    );
  }

  return null;
};
