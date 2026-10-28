import React from 'react';
import { AlertTriangle, Database, Terminal, CheckCircle2 } from 'lucide-react';
import { HealthResponse } from '../types';

interface ConnectionBannerProps {
  health: HealthResponse | null;
  onRetry: () => void;
}

export const ConnectionBanner: React.FC<ConnectionBannerProps> = ({ health, onRetry }) => {
  // If health is null (cannot reach backend at all)
  if (!health) {
    return (
      <div className="bg-rose-950/60 border-b border-rose-800/80 px-4 py-3 text-rose-200">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
          <div className="flex items-center space-x-2.5">
            <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
            <div>
              <span className="font-bold text-white">Backend Server Unreachable:</span> Make sure FastAPI is running on port 8000 (
              <code className="bg-rose-900/40 px-1.5 py-0.5 rounded font-mono text-rose-300">python -m uvicorn backend.main:app --port 8000</code>).
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
