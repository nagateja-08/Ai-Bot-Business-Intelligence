import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { Sidebar } from './components/Sidebar';
import { ConnectionBanner } from './components/ConnectionBanner';
import { DashboardPage } from './pages/DashboardPage';
import { ChatPage } from './pages/ChatPage';
import { AnalyticsPage } from './pages/AnalyticsPage';
import { api } from './services/api';
import {
  HealthResponse,
  OverviewMetrics,
  MonthlyRevenueItem,
  RegionalRevenueItem,
  TopProductItem
} from './types';

export const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [mobileMenuOpen, setMobileMenuOpen] = useState<boolean>(false);

  // Global Data State
  const [health, setHealth] = useState<HealthResponse | null>(null);
  const [overview, setOverview] = useState<OverviewMetrics | null>(null);
  const [monthly, setMonthly] = useState<MonthlyRevenueItem[]>([]);
  const [regional, setRegional] = useState<RegionalRevenueItem[]>([]);
  const [topProducts, setTopProducts] = useState<TopProductItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  const loadData = async () => {
    setLoading(true);
    try {
      // 1. Fetch Health
      try {
        const h = await api.getHealth();
        setHealth(h);
      } catch (e) {
        setHealth(null);
      }

      // 2. Fetch Analytics
      const [ov, mo, reg, tp] = await Promise.allSettled([
        api.getOverview(),
        api.getMonthlyRevenue(),
        api.getRegionalRevenue(),
        api.getTopProducts(10)
      ]);

      if (ov.status === 'fulfilled') setOverview(ov.value);
      if (mo.status === 'fulfilled') setMonthly(mo.value);
      if (reg.status === 'fulfilled') setRegional(reg.value);
      if (tp.status === 'fulfilled') setTopProducts(tp.value);
    } catch (err) {
      console.error('Failed to load application data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();

    // Periodic health polling every 30 seconds
    const interval = setInterval(async () => {
      try {
        const h = await api.getHealth();
        setHealth(h);
      } catch {
        setHealth(null);
      }
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  const handleNavigateToChat = (question?: string) => {
    setActiveTab('chat');
  };

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col selection:bg-brand-500 selection:text-white">
      {/* Top Warning Banner if Connection Issues */}
      <ConnectionBanner health={health} onRetry={loadData} />

      {/* Main Top Header */}
      <Navbar
        health={health}
        loading={loading}
        onRefresh={loadData}
        mobileMenuOpen={mobileMenuOpen}
        setMobileMenuOpen={setMobileMenuOpen}
      />

      <div className="flex-1 flex overflow-hidden">
        {/* Responsive Sidebar Navigation */}
        <Sidebar
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          mobileMenuOpen={mobileMenuOpen}
          setMobileMenuOpen={setMobileMenuOpen}
        />

        {/* Dynamic Main Workspace */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          <div className="max-w-7xl mx-auto">
            {activeTab === 'dashboard' && (
              <DashboardPage
                overview={overview}
                monthly={monthly}
                regional={regional}
                topProducts={topProducts}
                loading={loading}
                onNavigateToChat={handleNavigateToChat}
              />
            )}

            {activeTab === 'chat' && (
              <ChatPage />
            )}

            {activeTab === 'analytics' && (
              <AnalyticsPage />
            )}
          </div>
        </main>
      </div>
    </div>
  );
};

export default App;
