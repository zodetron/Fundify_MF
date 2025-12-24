'use client';

import { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts';
import { TrendingUp, DollarSign, Users, Award, Activity, Cpu } from 'lucide-react';
import { useTheme } from '@/contexts/ThemeContext';
import MarketConditionIndicator from '@/components/MarketConditionIndicator';

interface MarketOverview {
  total_funds: number;
  total_amcs: number;
  total_aum: number;
  avg_1yr_return: number;
  avg_3yr_return: number;
  avg_5yr_return: number;
}

interface TopPerformer {
  fund_name: string;
  amc_name: string;
  return_3yr: number;
}

interface ModelPerformance {
  accuracy: string;
  rmse: string;
}

interface PerformanceDistribution {
  excellent: number;
  good: number;
  average: number;
  below_average: number;
}

interface DashboardData {
  market_overview: MarketOverview;
  top_performers: Record<string, TopPerformer>;
  model_performance: Record<string, ModelPerformance>;
}

interface MarketTrends {
  performance_distribution: PerformanceDistribution;
}

const AMBER_PALETTE = ['#fbbf24', '#f59e0b', '#d97706', '#b45309', '#78350f'];

export default function DashboardPage() {
  const { theme } = useTheme();
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [marketTrends, setMarketTrends] = useState<MarketTrends | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        setLoading(true);
        const [dashRes, trendsRes] = await Promise.all([api.getDashboardData(), api.getMarketTrends()]);
        setDashboardData(dashRes as DashboardData);
        setMarketTrends(trendsRes as MarketTrends);
      } catch (error) {
        setError('DATA_SYNCHRONIZATION_ERROR');
      } finally {
        setLoading(false);
      }
    };
    loadDashboardData();
  }, []);

  const formatCurrency = (amount: number) => {
    return `₹${(amount / 1000000).toFixed(2)}M`;
  };

  if (loading) {
    return (
      <div className={`min-h-screen flex items-center justify-center font-mono theme-transition ${
        theme === 'light' ? 'bg-gray-50' : 'bg-slate-950'
      }`}>
        <div className="text-center">
          <div className={`w-16 h-1 w-16 relative overflow-hidden mb-4 ${
            theme === 'light' ? 'bg-gray-200' : 'bg-slate-800'
          }`}>
            <div className="absolute inset-0 bg-amber-500 animate-loading-bar"></div>
          </div>
          <p className="text-amber-500 text-xs tracking-[0.3em] animate-pulse uppercase">Initializing Analytics Engine...</p>
        </div>
      </div>
    );
  }

  const performanceData = [
    { name: 'EXC', value: marketTrends?.performance_distribution.excellent },
    { name: 'GOOD', value: marketTrends?.performance_distribution.good },
    { name: 'AVG', value: marketTrends?.performance_distribution.average },
    { name: 'BELOW', value: marketTrends?.performance_distribution.below_average },
  ];

  return (
    <div className={`min-h-screen py-12 px-6 font-sans theme-transition ${
      theme === 'light' 
        ? 'bg-gray-50 text-gray-700' 
        : 'bg-slate-950 text-slate-300'
    }`}>
      <div className="max-w-7xl mx-auto">
        {/* Header Section */}
        <div className="mb-12 border-l-4 border-amber-500 pl-6">
          <div className="flex items-center space-x-3 text-amber-500 mb-2">
            <Cpu size={20} />
            <span className="font-mono text-xs font-black tracking-widest uppercase">System Status: Operational</span>
          </div>
          <h1 className={`text-5xl font-black tracking-tighter uppercase italic theme-transition ${
            theme === 'light' ? 'text-gray-900' : 'text-white'
          }`}>Market Terminal</h1>
          <p className={`font-mono text-xs uppercase tracking-[0.2em] mt-2 theme-transition ${
            theme === 'light' ? 'text-gray-500' : 'text-slate-500'
          }`}>Aggregate Institutional Oversight & Predictive Metrics</p>
        </div>

        {/* Market Condition Indicator */}
        <div className="mb-8">
          <MarketConditionIndicator />
        </div>

        {/* Quant Metric Cards */}
        <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-[1px] border mb-12 shadow-2xl theme-transition ${
          theme === 'light' 
            ? 'bg-gray-200 border-gray-200' 
            : 'bg-slate-800 border-slate-800'
        }`}>
          {[
            { label: 'Total Managed Funds', val: dashboardData?.market_overview.total_funds, icon: Users, sub: 'ACTIVE_INSTRUMENTS' },
            { label: 'Market Providers', val: dashboardData?.market_overview.total_amcs, icon: Award, sub: 'CERTIFIED_AMCS' },
            { label: 'Avg 3Y Return', val: `${dashboardData?.market_overview.avg_3yr_return.toFixed(2)}%`, icon: TrendingUp, sub: 'SYSTEM_ALPHA' },
            { label: 'Aggregated AUM', val: formatCurrency(dashboardData?.market_overview.total_aum || 0), icon: DollarSign, sub: 'TOTAL_LIQUIDITY' }
          ].map((item, i) => (
            <div key={i} className={`p-8 transition-colors theme-transition ${
              theme === 'light' 
                ? 'bg-white hover:bg-gray-50' 
                : 'bg-slate-950 hover:bg-slate-900'
            }`}>
              <div className="flex justify-between items-start mb-4">
                <span className={`text-[10px] font-mono uppercase tracking-widest theme-transition ${
                  theme === 'light' ? 'text-gray-500' : 'text-slate-500'
                }`}>{item.label}</span>
                <item.icon size={16} className="text-amber-500/50" />
              </div>
              <div className={`text-5xl font-black font-mono tracking-tighter mb-2 theme-transition ${
                theme === 'light' ? 'text-gray-900' : 'text-white'
              }`}>
                {item.val}
              </div>
              <div className="text-[10px] font-mono text-amber-600/80 font-bold tracking-tighter uppercase">{item.sub}</div>
            </div>
          ))}
        </div>

        {/* Chart Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Performance Pie */}
          <div className={`border p-8 theme-transition ${
            theme === 'light' 
              ? 'bg-white border-gray-200' 
              : 'bg-slate-900/40 border-slate-800'
          }`}>
            <h3 className={`text-xs font-mono font-black uppercase tracking-widest mb-8 border-b pb-4 theme-transition ${
              theme === 'light' 
                ? 'text-gray-600 border-gray-200' 
                : 'text-slate-400 border-slate-800'
            }`}>Performance Stratification</h3>
            <ResponsiveContainer width="100%" height={260}>
              <PieChart>
                <Pie data={performanceData} innerRadius={60} outerRadius={90} paddingAngle={5} dataKey="value" stroke="none">
                  {performanceData.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={AMBER_PALETTE[index % AMBER_PALETTE.length]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ 
                  backgroundColor: theme === 'light' ? '#ffffff' : '#020617', 
                  border: theme === 'light' ? '1px solid #e5e7eb' : '1px solid #1e293b', 
                  fontSize: '12px', 
                  fontFamily: 'monospace',
                  color: theme === 'light' ? '#374151' : '#fbbf24'
                }} />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Line Chart Returns */}
          <div className={`border p-8 theme-transition ${
            theme === 'light' 
              ? 'bg-white border-gray-200' 
              : 'bg-slate-900/40 border-slate-800'
          }`}>
            <h3 className={`text-xs font-mono font-black uppercase tracking-widest mb-8 border-b pb-4 theme-transition ${
              theme === 'light' 
                ? 'text-gray-600 border-gray-200' 
                : 'text-slate-400 border-slate-800'
            }`}>Multi-Period Alpha Growth</h3>
            <ResponsiveContainer width="100%" height={260}>
              <LineChart data={[
                { period: '1Y', return: dashboardData?.market_overview.avg_1yr_return },
                { period: '3Y', return: dashboardData?.market_overview.avg_3yr_return },
                { period: '5Y', return: dashboardData?.market_overview.avg_5yr_return },
              ]}>
                <CartesianGrid strokeDasharray="3 3" stroke={theme === 'light' ? '#e5e7eb' : '#1e293b'} vertical={false} />
                <XAxis dataKey="period" stroke={theme === 'light' ? '#6b7280' : '#475569'} fontSize={10} fontBold fontMono />
                <YAxis stroke={theme === 'light' ? '#6b7280' : '#475569'} fontSize={10} fontMono />
                <Tooltip contentStyle={{ 
                  backgroundColor: theme === 'light' ? '#ffffff' : '#020617', 
                  border: theme === 'light' ? '1px solid #e5e7eb' : '1px solid #1e293b', 
                  color: '#fbbf24' 
                }} />
                <Line type="stepAfter" dataKey="return" stroke="#fbbf24" strokeWidth={4} dot={{ r: 6, fill: '#fbbf24' }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Top Performers by Category */}
        <div className={`border mb-8 overflow-hidden shadow-2xl theme-transition ${
          theme === 'light' 
            ? 'bg-white border-gray-200' 
            : 'bg-slate-900 border-slate-800'
        }`}>
          <div className={`px-8 py-4 border-b theme-transition ${
            theme === 'light' 
              ? 'bg-gray-50 border-gray-200' 
              : 'bg-slate-800/50 border-slate-700'
          }`}>
            <h3 className={`text-xs font-mono font-black uppercase tracking-[0.3em] theme-transition ${
              theme === 'light' ? 'text-gray-900' : 'text-white'
            }`}>Category Leaderboard (3Y Performance)</h3>
          </div>
          <div className={`grid grid-cols-1 md:grid-cols-3 divide-x theme-transition ${
            theme === 'light' ? 'divide-gray-200' : 'divide-slate-800'
          }`}>
            {Object.entries(dashboardData?.top_performers || {}).map(([category, fund]) => (
              <div key={category} className={`p-8 transition-colors group theme-transition ${
                theme === 'light' 
                  ? 'hover:bg-gray-50' 
                  : 'hover:bg-slate-950'
              }`}>
                <div className="flex justify-between items-center mb-6">
                  <span className="text-[10px] font-mono font-bold text-amber-500 uppercase tracking-widest bg-amber-500/10 px-2 py-1 italic">
                    {category.split(' ').join('_')}
                  </span>
                </div>
                <div className={`text-6xl font-black font-mono mb-4 tracking-tighter group-hover:text-amber-400 transition-colors theme-transition ${
                  theme === 'light' ? 'text-gray-900' : 'text-white'
                }`}>
                  {fund.return_3yr.toFixed(1)}%
                </div>
                <div className="space-y-1">
                  <p className={`text-sm font-bold truncate uppercase theme-transition ${
                    theme === 'light' ? 'text-gray-800' : 'text-slate-200'
                  }`}>{fund.fund_name}</p>
                  <p className={`text-[10px] font-mono uppercase theme-transition ${
                    theme === 'light' ? 'text-gray-500' : 'text-slate-500'
                  }`}>{fund.amc_name}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* AI Performance Section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {Object.entries(dashboardData?.model_performance || {}).map(([key, model]) => (
            <div key={key} className={`border-t-2 border-amber-600 p-6 flex items-center justify-between theme-transition ${
              theme === 'light' ? 'bg-white' : 'bg-slate-950'
            }`}>
              <div>
                <p className={`text-[10px] font-mono uppercase mb-1 theme-transition ${
                  theme === 'light' ? 'text-gray-500' : 'text-slate-500'
                }`}>{key.replace('_', ' ')}</p>
                <p className={`text-3xl font-black font-mono tracking-tighter theme-transition ${
                  theme === 'light' ? 'text-gray-900' : 'text-white'
                }`}>{model.accuracy}</p>
              </div>
              <div className="text-right">
                <Activity size={16} className="text-amber-500 ml-auto mb-2" />
                <p className={`text-[10px] font-mono uppercase italic theme-transition ${
                  theme === 'light' ? 'text-gray-500' : 'text-slate-500'
                }`}>RMSE: {model.rmse}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}