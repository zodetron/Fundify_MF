'use client';

import { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ScatterChart, Scatter, LineChart, Line } from 'recharts';
import { TrendingUp, BarChart3, PieChart, Activity, Info, Cpu } from 'lucide-react';
import { useTheme } from '@/contexts/ThemeContext';

interface EnhancedAnalysis {
  correlation_analysis: {
    correlation_matrix: Record<string, Record<string, number>>;
    strong_correlations: Array<{
      feature1: string;
      feature2: string;
      correlation: number;
      strength: string;
    }>;
    key_insights: string[];
  };
  category_trends: Record<string, {
    count: number;
    avg_return_1yr: number;
    avg_return_3yr: number;
    avg_return_5yr: number;
    avg_risk: number;
    avg_expense: number;
    top_performer: string;
  }>;
  risk_return_analysis: Array<{
    risk_level: number;
    fund_count: number;
    avg_return_1yr: number;
    avg_return_3yr: number;
    avg_return_5yr: number;
    return_volatility: number;
  }>;
  expense_impact: Record<string, {
    count: number;
    avg_return_3yr: number;
    avg_expense: number;
  }>;
  distribution_analysis: {
    returns_1yr: {
      mean: number;
      median: number;
      std: number;
      skewness: number;
      kurtosis: number;
      percentiles: Record<string, number>;
    };
    returns_3yr: {
      mean: number;
      median: number;
      std: number;
      skewness: number;
      kurtosis: number;
      percentiles: Record<string, number>;
    };
  };
  market_insights: {
    total_aum: number;
    high_performers_count: number;
    avg_fund_age: number;
    low_cost_funds_count: number;
  };
}

export default function AnalysisPage() {
  const { theme } = useTheme();
  const [analysisData, setAnalysisData] = useState<EnhancedAnalysis | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('correlations');

  useEffect(() => {
    const loadAnalysisData = async () => {
      try {
        setLoading(true);
        const response = await api.getEnhancedAnalysis();
        setAnalysisData(response as EnhancedAnalysis);
      } catch (error) {
        console.error('Error loading analysis:', error);
        setError('Failed to load analysis data');
      } finally {
        setLoading(false);
      }
    };

    loadAnalysisData();
  }, []);

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
          <p className={`text-amber-500 text-xs tracking-[0.3em] animate-pulse uppercase theme-transition ${
            theme === 'light' ? 'text-gray-600' : 'text-slate-400'
          }`}>Initializing Analysis Engine...</p>
        </div>
      </div>
    );
  }

  if (error || !analysisData) {
    return (
      <div className={`min-h-screen flex items-center justify-center theme-transition ${
        theme === 'light' ? 'bg-gray-50' : 'bg-slate-950'
      }`}>
        <div className="text-center">
          <p className={`mb-4 theme-transition ${
            theme === 'light' ? 'text-red-600' : 'text-red-400'
          }`}>{error || 'Failed to load data'}</p>
          <button 
            onClick={() => window.location.reload()}
            className={`px-4 py-2 rounded-lg transition-colors theme-transition ${
              theme === 'light'
                ? 'bg-amber-600 text-white hover:bg-amber-700'
                : 'bg-amber-500 text-slate-950 hover:bg-amber-400'
            }`}
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  // Prepare chart data
  const categoryData = Object.entries(analysisData.category_trends).map(([name, data]) => ({
    name,
    return_1yr: data.avg_return_1yr,
    return_3yr: data.avg_return_3yr,
    return_5yr: data.avg_return_5yr,
    risk: data.avg_risk,
    expense: data.avg_expense,
    count: data.count,
  }));

  const riskReturnData = analysisData.risk_return_analysis.map(item => ({
    risk: item.risk_level,
    return_3yr: item.avg_return_3yr,
    count: item.fund_count,
    volatility: item.return_volatility,
  }));

  const expenseData = Object.entries(analysisData.expense_impact).map(([category, data]) => ({
    category: category.replace('_', ' ').toUpperCase(),
    return: data.avg_return_3yr,
    expense: data.avg_expense,
    count: data.count,
  }));

  const tabs = [
    { id: 'correlations', label: 'Correlations', icon: Activity },
    { id: 'categories', label: 'Category Analysis', icon: BarChart3 },
    { id: 'risk-return', label: 'Risk vs Return', icon: TrendingUp },
    { id: 'expenses', label: 'Expense Impact', icon: PieChart },
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
          }`}>Advanced Analysis</h1>
          <p className={`font-mono text-xs uppercase tracking-[0.2em] mt-2 theme-transition ${
            theme === 'light' ? 'text-gray-500' : 'text-slate-500'
          }`}>Deep Statistical Insights & Market Correlations</p>
        </div>

        {/* Market Insights Cards */}
        <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-[1px] border mb-12 shadow-2xl theme-transition ${
          theme === 'light' 
            ? 'bg-gray-200 border-gray-200' 
            : 'bg-slate-800 border-slate-800'
        }`}>
          {[
            { label: 'High Performers', val: analysisData.market_insights.high_performers_count, sub: 'Funds with > 20% returns', color: 'text-green-600' },
            { label: 'Low Cost Funds', val: analysisData.market_insights.low_cost_funds_count, sub: 'Expense ratio < 1%', color: 'text-blue-600' },
            { label: 'Avg Fund Age', val: `${analysisData.market_insights.avg_fund_age.toFixed(1)} yrs`, sub: 'Market maturity', color: 'text-purple-600' },
            { label: 'Total AUM', val: `₹${(analysisData.market_insights.total_aum / 1000000).toFixed(1)}M`, sub: 'Assets under management', color: 'text-orange-600' },
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
              </div>
              <div className={`text-5xl font-black font-mono tracking-tighter mb-2 ${item.color} theme-transition`}>
                {item.val}
              </div>
              <div className={`text-[10px] font-mono text-amber-600/80 font-bold tracking-tighter uppercase theme-transition ${
                theme === 'light' ? 'text-gray-500' : 'text-slate-400'
              }`}>{item.sub}</div>
            </div>
          ))}
        </div>

        {/* Tab Navigation */}
        <div className={`border mb-8 overflow-hidden shadow-2xl theme-transition ${
          theme === 'light' 
            ? 'bg-white border-gray-200' 
            : 'bg-slate-900 border-slate-800'
        }`}>
          <div className={`border-b theme-transition ${
            theme === 'light' ? 'border-gray-200' : 'border-slate-700'
          }`}>
            <nav className="flex space-x-8 px-6">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors theme-transition ${
                      activeTab === tab.id
                        ? theme === 'light'
                          ? 'border-amber-500 text-amber-600'
                          : 'border-amber-400 text-amber-400'
                        : theme === 'light'
                          ? 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                          : 'border-transparent text-slate-400 hover:text-white hover:border-slate-600'
                    }`}
                  >
                    <Icon className="h-5 w-5" />
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </nav>
          </div>

          <div className="p-6">
            {/* Correlations Tab */}
            {activeTab === 'correlations' && (
              <div className="space-y-8">
                <div>
                  <h3 className={`text-xs font-mono font-black uppercase tracking-widest mb-6 border-b pb-3 theme-transition ${
                    theme === 'light' 
                      ? 'text-gray-600 border-gray-200' 
                      : 'text-slate-400 border-slate-700'
                  }`}>
                    Strong Correlations Found
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {analysisData.correlation_analysis.strong_correlations.map((corr, index) => (
                      <div key={index} className={`p-5 rounded-lg border transition-all hover:shadow-lg theme-transition ${
                        theme === 'light' 
                          ? 'bg-white border-gray-200 hover:border-gray-300' 
                          : 'bg-slate-800/60 border-slate-700 hover:border-slate-600'
                      }`}>
                        <div className="flex justify-between items-center mb-3">
                          <span className={`font-semibold text-sm theme-transition ${
                            theme === 'light' ? 'text-gray-900' : 'text-white'
                          }`}>
                            {corr.feature1} ↔ {corr.feature2}
                          </span>
                          <span className={`px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                            corr.strength === 'strong' 
                              ? theme === 'light'
                                ? 'bg-red-100 text-red-800 border border-red-200'
                                : 'bg-red-900/40 text-red-300 border border-red-800/50'
                              : theme === 'light'
                                ? 'bg-amber-100 text-amber-800 border border-amber-200'
                                : 'bg-amber-900/40 text-amber-300 border border-amber-800/50'
                          }`}>
                            {corr.strength}
                          </span>
                        </div>
                        <div className={`text-3xl font-black font-mono tracking-tighter theme-transition ${
                          theme === 'light' ? 'text-blue-600' : 'text-blue-400'
                        }`}>
                          {corr.correlation.toFixed(3)}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <h3 className={`text-xs font-mono font-black uppercase tracking-widest mb-6 border-b pb-3 theme-transition ${
                    theme === 'light' 
                      ? 'text-gray-600 border-gray-200' 
                      : 'text-slate-400 border-slate-700'
                  }`}>
                    Key Insights
                  </h3>
                  <div className={`p-6 rounded-lg border theme-transition ${
                    theme === 'light'
                      ? 'bg-blue-50/80 border-blue-200'
                      : 'bg-blue-900/20 border-blue-800/50'
                  }`}>
                    <ul className="space-y-3">
                      {analysisData.correlation_analysis.key_insights.map((insight, index) => (
                        <li key={index} className="flex items-start group">
                          <Info className={`h-5 w-5 mt-0.5 mr-3 flex-shrink-0 transition-colors theme-transition ${
                            theme === 'light' ? 'text-blue-600 group-hover:text-blue-700' : 'text-blue-400 group-hover:text-blue-300'
                          }`} />
                          <span className={`text-sm leading-relaxed theme-transition ${
                            theme === 'light' ? 'text-gray-700' : 'text-slate-300'
                          }`}>{insight}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* Distribution Analysis */}
                <div>
                  <h3 className={`text-xs font-mono font-black uppercase tracking-widest mb-6 border-b pb-3 theme-transition ${
                    theme === 'light' 
                      ? 'text-gray-600 border-gray-200' 
                      : 'text-slate-400 border-slate-700'
                  }`}>
                    Return Distribution Statistics
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {[
                      { label: '1-Year Returns', data: analysisData.distribution_analysis.returns_1yr },
                      { label: '3-Year Returns', data: analysisData.distribution_analysis.returns_3yr },
                    ].map((item, idx) => (
                      <div key={idx} className={`p-6 rounded-lg border transition-all hover:shadow-lg theme-transition ${
                        theme === 'light' 
                          ? 'bg-white border-gray-200 hover:border-gray-300' 
                          : 'bg-slate-800/60 border-slate-700 hover:border-slate-600'
                      }`}>
                        <h4 className={`font-semibold mb-4 text-sm uppercase tracking-wider theme-transition ${
                          theme === 'light' ? 'text-gray-900' : 'text-white'
                        }`}>{item.label}</h4>
                        <div className="space-y-3 text-sm">
                          <div className="flex justify-between items-center py-1.5 border-b border-dashed theme-transition ${
                            theme === 'light' ? 'border-gray-200' : 'border-slate-700'
                          }">
                            <span className={`font-medium theme-transition ${
                              theme === 'light' ? 'text-gray-600' : 'text-slate-400'
                            }`}>Mean:</span>
                            <span className={`font-bold text-base font-mono theme-transition ${
                              theme === 'light' ? 'text-gray-900' : 'text-white'
                            }`}>{item.data.mean.toFixed(2)}%</span>
                          </div>
                          <div className="flex justify-between items-center py-1.5 border-b border-dashed theme-transition ${
                            theme === 'light' ? 'border-gray-200' : 'border-slate-700'
                          }">
                            <span className={`font-medium theme-transition ${
                              theme === 'light' ? 'text-gray-600' : 'text-slate-400'
                            }`}>Median:</span>
                            <span className={`font-bold text-base font-mono theme-transition ${
                              theme === 'light' ? 'text-gray-900' : 'text-white'
                            }`}>{item.data.median.toFixed(2)}%</span>
                          </div>
                          <div className="flex justify-between items-center py-1.5 border-b border-dashed theme-transition ${
                            theme === 'light' ? 'border-gray-200' : 'border-slate-700'
                          }">
                            <span className={`font-medium theme-transition ${
                              theme === 'light' ? 'text-gray-600' : 'text-slate-400'
                            }`}>Std Dev:</span>
                            <span className={`font-bold text-base font-mono theme-transition ${
                              theme === 'light' ? 'text-gray-900' : 'text-white'
                            }`}>{item.data.std.toFixed(2)}%</span>
                          </div>
                          <div className="flex justify-between items-center py-1.5">
                            <span className={`font-medium theme-transition ${
                              theme === 'light' ? 'text-gray-600' : 'text-slate-400'
                            }`}>90th Percentile:</span>
                            <span className={`font-bold text-base font-mono theme-transition ${
                              theme === 'light' ? 'text-amber-600' : 'text-amber-400'
                            }`}>{item.data.percentiles['90th'].toFixed(2)}%</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Category Analysis Tab */}
            {activeTab === 'categories' && (
              <div className="space-y-6">
                <div>
                  <h3 className={`text-xs font-mono font-black uppercase tracking-widest mb-4 theme-transition ${
                    theme === 'light' ? 'text-gray-600' : 'text-slate-400'
                  }`}>
                    Returns by Category
                  </h3>
                  <ResponsiveContainer width="100%" height={400}>
                    <BarChart data={categoryData}>
                      <CartesianGrid strokeDasharray="3 3" stroke={theme === 'light' ? '#e5e7eb' : '#1e293b'} />
                      <XAxis dataKey="name" stroke={theme === 'light' ? '#6b7280' : '#475569'} fontSize={10} />
                      <YAxis stroke={theme === 'light' ? '#6b7280' : '#475569'} fontSize={10} />
                      <Tooltip contentStyle={{ 
                        backgroundColor: theme === 'light' ? '#ffffff' : '#020617', 
                        border: theme === 'light' ? '1px solid #e5e7eb' : '1px solid #1e293b', 
                        color: theme === 'light' ? '#374151' : '#fbbf24'
                      }} />
                      <Bar dataKey="return_1yr" fill="#3B82F6" name="1 Year" />
                      <Bar dataKey="return_3yr" fill="#10B981" name="3 Years" />
                      <Bar dataKey="return_5yr" fill="#8B5CF6" name="5 Years" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {Object.entries(analysisData.category_trends).map(([category, data]) => (
                    <div key={category} className={`p-4 rounded-lg border theme-transition ${
                      theme === 'light' 
                        ? 'bg-gray-50 border-gray-200' 
                        : 'bg-slate-800/50 border-slate-700'
                    }`}>
                      <h4 className={`font-semibold mb-3 theme-transition ${
                        theme === 'light' ? 'text-gray-900' : 'text-white'
                      }`}>{category}</h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className={theme === 'light' ? 'text-gray-600' : 'text-slate-400'}>Fund Count:</span>
                          <span className={`font-medium theme-transition ${
                            theme === 'light' ? 'text-gray-900' : 'text-white'
                          }`}>{data.count}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className={theme === 'light' ? 'text-gray-600' : 'text-slate-400'}>Avg 3yr Return:</span>
                          <span className={`font-medium theme-transition ${
                            theme === 'light' ? 'text-green-600' : 'text-green-400'
                          }`}>{data.avg_return_3yr.toFixed(2)}%</span>
                        </div>
                        <div className="flex justify-between">
                          <span className={theme === 'light' ? 'text-gray-600' : 'text-slate-400'}>Avg Risk:</span>
                          <span className={`font-medium theme-transition ${
                            theme === 'light' ? 'text-gray-900' : 'text-white'
                          }`}>{data.avg_risk.toFixed(1)}/6</span>
                        </div>
                        <div className="flex justify-between">
                          <span className={theme === 'light' ? 'text-gray-600' : 'text-slate-400'}>Avg Expense:</span>
                          <span className={`font-medium theme-transition ${
                            theme === 'light' ? 'text-gray-900' : 'text-white'
                          }`}>{data.avg_expense.toFixed(2)}%</span>
                        </div>
                        <div className={`mt-3 pt-2 border-t theme-transition ${
                          theme === 'light' ? 'border-gray-200' : 'border-slate-700'
                        }`}>
                          <p className={`text-xs theme-transition ${
                            theme === 'light' ? 'text-gray-600' : 'text-slate-400'
                          }`}>Top Performer:</p>
                          <p className={`font-medium text-xs theme-transition ${
                            theme === 'light' ? 'text-gray-900' : 'text-white'
                          }`}>{data.top_performer}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Risk vs Return Tab */}
            {activeTab === 'risk-return' && (
              <div className="space-y-6">
                <div>
                  <h3 className={`text-xs font-mono font-black uppercase tracking-widest mb-4 theme-transition ${
                    theme === 'light' ? 'text-gray-600' : 'text-slate-400'
                  }`}>
                    Risk vs Return Analysis
                  </h3>
                  <ResponsiveContainer width="100%" height={400}>
                    <ScatterChart data={riskReturnData}>
                      <CartesianGrid strokeDasharray="3 3" stroke={theme === 'light' ? '#e5e7eb' : '#1e293b'} />
                      <XAxis dataKey="risk" name="Risk Level" stroke={theme === 'light' ? '#6b7280' : '#475569'} fontSize={10} />
                      <YAxis dataKey="return_3yr" name="3-Year Return %" stroke={theme === 'light' ? '#6b7280' : '#475569'} fontSize={10} />
                      <Tooltip 
                        cursor={{ strokeDasharray: '3 3' }}
                        contentStyle={{ 
                          backgroundColor: theme === 'light' ? '#ffffff' : '#020617', 
                          border: theme === 'light' ? '1px solid #e5e7eb' : '1px solid #1e293b', 
                          color: theme === 'light' ? '#374151' : '#fbbf24'
                        }}
                        formatter={(value, name) => [
                          name === 'return_3yr' ? `${value}%` : value,
                          name === 'return_3yr' ? '3-Year Return' : name
                        ]}
                      />
                      <Scatter dataKey="return_3yr" fill="#8B5CF6" />
                    </ScatterChart>
                  </ResponsiveContainer>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {analysisData.risk_return_analysis.map((item) => (
                    <div key={item.risk_level} className={`p-4 rounded-lg border theme-transition ${
                      theme === 'light' 
                        ? 'bg-gray-50 border-gray-200' 
                        : 'bg-slate-800/50 border-slate-700'
                    }`}>
                      <h4 className={`font-semibold mb-2 theme-transition ${
                        theme === 'light' ? 'text-gray-900' : 'text-white'
                      }`}>
                        Risk Level {item.risk_level}
                      </h4>
                      <div className="space-y-1 text-sm">
                        <div className="flex justify-between">
                          <span className={theme === 'light' ? 'text-gray-600' : 'text-slate-400'}>Fund Count:</span>
                          <span className={`font-medium theme-transition ${
                            theme === 'light' ? 'text-gray-900' : 'text-white'
                          }`}>{item.fund_count}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className={theme === 'light' ? 'text-gray-600' : 'text-slate-400'}>Avg 3yr Return:</span>
                          <span className={`font-medium theme-transition ${
                            theme === 'light' ? 'text-green-600' : 'text-green-400'
                          }`}>{item.avg_return_3yr.toFixed(2)}%</span>
                        </div>
                        <div className="flex justify-between">
                          <span className={theme === 'light' ? 'text-gray-600' : 'text-slate-400'}>Volatility:</span>
                          <span className={`font-medium theme-transition ${
                            theme === 'light' ? 'text-gray-900' : 'text-white'
                          }`}>{item.return_volatility.toFixed(2)}%</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Expense Impact Tab */}
            {activeTab === 'expenses' && (
              <div className="space-y-6">
                <div>
                  <h3 className={`text-xs font-mono font-black uppercase tracking-widest mb-4 theme-transition ${
                    theme === 'light' ? 'text-gray-600' : 'text-slate-400'
                  }`}>
                    Expense Ratio Impact on Returns
                  </h3>
                  <ResponsiveContainer width="100%" height={400}>
                    <BarChart data={expenseData}>
                      <CartesianGrid strokeDasharray="3 3" stroke={theme === 'light' ? '#e5e7eb' : '#1e293b'} />
                      <XAxis dataKey="category" stroke={theme === 'light' ? '#6b7280' : '#475569'} fontSize={10} />
                      <YAxis yAxisId="left" stroke={theme === 'light' ? '#6b7280' : '#475569'} fontSize={10} />
                      <YAxis yAxisId="right" orientation="right" stroke={theme === 'light' ? '#6b7280' : '#475569'} fontSize={10} />
                      <Tooltip contentStyle={{ 
                        backgroundColor: theme === 'light' ? '#ffffff' : '#020617', 
                        border: theme === 'light' ? '1px solid #e5e7eb' : '1px solid #1e293b', 
                        color: theme === 'light' ? '#374151' : '#fbbf24'
                      }} />
                      <Bar yAxisId="left" dataKey="return" fill="#10B981" name="Avg Return %" />
                      <Bar yAxisId="right" dataKey="expense" fill="#F59E0B" name="Avg Expense %" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {Object.entries(analysisData.expense_impact).map(([category, data]) => (
                    <div key={category} className={`p-4 rounded-lg border theme-transition ${
                      theme === 'light' 
                        ? 'bg-gray-50 border-gray-200' 
                        : 'bg-slate-800/50 border-slate-700'
                    }`}>
                      <h4 className={`font-semibold mb-3 capitalize theme-transition ${
                        theme === 'light' ? 'text-gray-900' : 'text-white'
                      }`}>
                        {category.replace('_', ' ')} Cost
                      </h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className={theme === 'light' ? 'text-gray-600' : 'text-slate-400'}>Fund Count:</span>
                          <span className={`font-medium theme-transition ${
                            theme === 'light' ? 'text-gray-900' : 'text-white'
                          }`}>{data.count}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className={theme === 'light' ? 'text-gray-600' : 'text-slate-400'}>Avg Return:</span>
                          <span className={`font-medium theme-transition ${
                            theme === 'light' ? 'text-green-600' : 'text-green-400'
                          }`}>{data.avg_return_3yr.toFixed(2)}%</span>
                        </div>
                        <div className="flex justify-between">
                          <span className={theme === 'light' ? 'text-gray-600' : 'text-slate-400'}>Avg Expense:</span>
                          <span className={`font-medium theme-transition ${
                            theme === 'light' ? 'text-orange-600' : 'text-orange-400'
                          }`}>{data.avg_expense.toFixed(2)}%</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className={`p-4 rounded-lg border theme-transition ${
                  theme === 'light'
                    ? 'bg-blue-50 border-blue-200'
                    : 'bg-blue-900/20 border-blue-800/50'
                }`}>
                  <h4 className={`font-semibold mb-2 theme-transition ${
                    theme === 'light' ? 'text-blue-900' : 'text-blue-300'
                  }`}>Key Finding</h4>
                  <p className={`text-sm theme-transition ${
                    theme === 'light' ? 'text-blue-800' : 'text-blue-200'
                  }`}>
                    Lower expense ratios generally correlate with better net returns for investors. 
                    Consider expense ratios when making investment decisions, as they directly impact your returns over time.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}