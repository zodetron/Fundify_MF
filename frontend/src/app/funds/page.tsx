'use client';

import { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { Search, Filter, TrendingUp, Building, ArrowUpRight, BarChart3, Shield } from 'lucide-react';
import { useTheme } from '@/contexts/ThemeContext';

interface Fund {
  scheme_name: string;
  amc_name: string;
  category: string;
  fund_size: number;
  expense_ratio: number;
  return_1yr: number;
  return_3yr: number;
  return_5yr: number;
  risk_level: number;
  rating: number;
}

interface FundsResponse {
  funds: Fund[];
  total: number;
}

interface TopPerformer {
  rank: number;
  scheme_name: string;
  amc_name: string;
  metric_value: number;
}

interface TopPerformersResponse {
  top_performers: TopPerformer[];
  metric: string;
  total_evaluated: number;
}

export default function FundsPage() {
  const { theme } = useTheme();
  const [funds, setFunds] = useState<Fund[]>([]);
  const [topPerformers, setTopPerformers] = useState<TopPerformersResponse | null>(null);
  const [amcs, setAMCs] = useState<string[]>([]);
  const [categories, setCategories] = useState<Array<{ name: string; count: number }>>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('search');

  const [filters, setFilters] = useState({
    amc_name: '',
    category: '',
    risk_level: 0,
    min_rating: 0,
    limit: 50
  });

  const [topPerformersFilters, setTopPerformersFilters] = useState({
    metric: 'return_3yr',
    category: '',
    limit: 10
  });

  useEffect(() => {
    const loadInitialData = async () => {
      try {
        const [amcRes, catRes] = await Promise.all([api.getAMCs(), api.getCategories()]);
        setAMCs(amcRes.amcs);
        setCategories(catRes.categories);
        await searchFunds();
        await loadTopPerformers();
      } catch (error) {
        setError('Quant Engine initialization failed.');
      }
    };
    loadInitialData();
  }, []);

  const searchFunds = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.getFunds({
        ...filters,
        risk_level: filters.risk_level || undefined,
        min_rating: filters.min_rating || undefined
      });
      setFunds((response as FundsResponse).funds);
    } catch (error) {
      setError('Search query execution failed.');
    } finally {
      setLoading(false);
    }
  };

  const loadTopPerformers = async () => {
    try {
      const response = await api.getTopPerformers(
        topPerformersFilters.metric,
        topPerformersFilters.category || undefined,
        topPerformersFilters.limit
      );
      setTopPerformers(response as TopPerformersResponse);
    } catch (error) {
      console.error('Performance load failed');
    }
  };

  const handleFilterChange = (key: string, value: any) => setFilters(prev => ({ ...prev, [key]: value }));
  const handleTopPerformersFilterChange = (key: string, value: any) => setTopPerformersFilters(prev => ({ ...prev, [key]: value }));

  const filteredFunds = funds.filter(fund =>
    fund.scheme_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    fund.amc_name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const formatCurrency = (amount: number) => {
    return `₹${(amount / 1000).toFixed(2)}K CR`;
  };

  const getRiskLabel = (risk: number) => {
    const labels = ["", "LOW", "LOW-MOD", "MOD", "MOD-HIGH", "HIGH", "V-HIGH"];
    return labels[risk] || "N/A";
  };

  return (
    <div className={`min-h-screen font-sans selection:bg-amber-500/30 theme-transition ${
      theme === 'light' 
        ? 'bg-gray-50 text-gray-800' 
        : 'bg-slate-950 text-slate-200'
    }`}>
      <div className="max-w-7xl mx-auto px-6 py-12">
        {/* Institutional Header */}
        <header className="mb-12 border-l-2 border-amber-500 pl-6">
          <div className="flex items-center space-x-2 text-amber-500 mb-2">
            <BarChart3 size={18} />
            <span className="text-xs font-black tracking-[0.2em] uppercase">Terminal v4.0.1</span>
          </div>
          <h1 className={`text-5xl font-light tracking-tight mb-2 theme-transition ${
            theme === 'light' ? 'text-gray-900' : 'text-white'
          }`}>
            Asset <span className="font-bold">Intelligence</span>
          </h1>
          <p className={`font-mono text-sm uppercase tracking-widest theme-transition ${
            theme === 'light' ? 'text-gray-600' : 'text-slate-400'
          }`}>
            Real-time mutual fund quantitative analysis
          </p>
        </header>

        {/* Tab Navigation */}
        <div className="grid grid-cols-1 gap-8">
          <div className={`flex space-x-1 p-1 rounded-sm w-fit border theme-transition ${
            theme === 'light' 
              ? 'bg-gray-100 border-gray-200' 
              : 'bg-slate-900/50 border-slate-800'
          }`}>
            {['search', 'top-performers'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-8 py-2 text-xs font-bold uppercase tracking-tighter transition-all theme-transition ${
                  activeTab === tab 
                    ? 'bg-amber-500 text-white' 
                    : theme === 'light'
                      ? 'text-gray-600 hover:text-gray-900'
                      : 'text-slate-500 hover:text-slate-300'
                }`}
              >
                {tab.replace('-', ' ')}
              </button>
            ))}
          </div>

          <div className={`border rounded-sm overflow-hidden theme-transition ${
            theme === 'light' 
              ? 'bg-white border-gray-200' 
              : 'bg-slate-900 border-slate-800'
          }`}>
            <div className="p-8">
              {/* Search & Filter View */}
              {activeTab === 'search' && (
                <div className="space-y-10">
                  <div className="flex flex-col md:flex-row gap-4">
                    <div className="relative flex-grow">
                      <Search className={`absolute left-4 top-1/2 -translate-y-1/2 theme-transition ${
                        theme === 'light' ? 'text-gray-500' : 'text-slate-500'
                      }`} size={18} />
                      <input
                        type="text"
                        placeholder="IDENTIFY SECURITY NAME OR AMC..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className={`w-full border p-4 pl-12 font-mono text-sm focus:border-amber-500 outline-none transition-colors uppercase theme-transition ${
                          theme === 'light' 
                            ? 'bg-white border-gray-300 text-gray-900 placeholder:text-gray-500' 
                            : 'bg-slate-950 border-slate-700 text-white placeholder:text-slate-700'
                        }`}
                      />
                    </div>
                    <button
                      onClick={searchFunds}
                      disabled={loading}
                      className={`px-10 py-4 font-black uppercase text-xs transition-colors flex items-center justify-center min-w-[200px] theme-transition ${
                        theme === 'light' 
                          ? 'bg-gray-900 text-white hover:bg-gray-800' 
                          : 'bg-slate-200 text-slate-950 hover:bg-white'
                      }`}
                    >
                      <Filter className="mr-2" size={16} />
                      {loading ? 'Executing...' : 'Run Query'}
                    </button>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {[
                      { label: 'Asset Management', options: amcs, key: 'amc_name' },
                      { label: 'Fund Category', options: categories.map(c => c.name), key: 'category' }
                    ].map((filter) => (
                      <div key={filter.key} className="space-y-2">
                        <label className={`text-[10px] font-black uppercase tracking-widest theme-transition ${
                          theme === 'light' ? 'text-gray-600' : 'text-slate-500'
                        }`}>{filter.label}</label>
                        <select
                          onChange={(e) => handleFilterChange(filter.key, e.target.value)}
                          className={`w-full border p-3 text-xs font-mono focus:border-amber-500/50 outline-none theme-transition ${
                            theme === 'light' 
                              ? 'bg-white border-gray-300 text-gray-900' 
                              : 'bg-slate-950 border-slate-800 text-white'
                          }`}
                        >
                          <option value="">ALL_LISTED</option>
                          {filter.options.map(opt => <option key={opt} value={opt}>{opt.toUpperCase()}</option>)}
                        </select>
                      </div>
                    ))}
                  </div>

                  {/* Fund Grid */}
                  <div className={`grid grid-cols-1 xl:grid-cols-2 gap-[1px] border theme-transition ${
                    theme === 'light' 
                      ? 'bg-gray-200 border-gray-200' 
                      : 'bg-slate-800 border-slate-800'
                  }`}>
                    {filteredFunds.map((fund, idx) => (
                      <div key={idx} className={`p-8 transition-colors group theme-transition ${
                        theme === 'light' 
                          ? 'bg-white hover:bg-gray-50' 
                          : 'bg-slate-950 hover:bg-slate-900/50'
                      }`}>
                        <div className="flex justify-between items-start mb-8">
                          <div>
                            <span className="text-amber-500 font-mono text-[10px] font-bold tracking-[0.3em] uppercase block mb-2">
                              {fund.amc_name}
                            </span>
                            <h3 className={`text-xl font-bold group-hover:text-amber-400 transition-colors leading-tight theme-transition ${
                              theme === 'light' ? 'text-gray-900' : 'text-white'
                            }`}>
                              {fund.scheme_name}
                            </h3>
                          </div>
                          <div className="text-right">
                             <div className={`text-[10px] font-mono mb-1 tracking-tighter uppercase theme-transition ${
                               theme === 'light' ? 'text-gray-500' : 'text-slate-500'
                             }`}>Risk Profile</div>
                             <div className={`px-2 py-1 text-amber-500 text-[10px] font-black border border-amber-500/20 theme-transition ${
                               theme === 'light' ? 'bg-gray-100' : 'bg-slate-800'
                             }`}>
                               {getRiskLabel(fund.risk_level)}
                             </div>
                          </div>
                        </div>

                        <div className={`grid grid-cols-3 gap-8 mb-8 border-y py-6 theme-transition ${
                          theme === 'light' ? 'border-gray-200' : 'border-slate-900'
                        }`}>
                          {[
                            { val: fund.return_1yr, lab: '1Y_RTN' },
                            { val: fund.return_3yr, lab: '3Y_RTN' },
                            { val: fund.return_5yr, lab: '5Y_RTN' }
                          ].map((m, i) => (
                            <div key={i}>
                              <div className={`text-3xl font-black font-mono tracking-tighter theme-transition ${
                                theme === 'light' ? 'text-gray-900' : 'text-white'
                              }`}>
                                {m.val > 0 ? '+' : ''}{m.val.toFixed(2)}<span className={`text-lg theme-transition ${
                                  theme === 'light' ? 'text-gray-400' : 'text-slate-600'
                                }`}>%</span>
                              </div>
                              <div className={`text-[10px] font-mono uppercase tracking-widest mt-1 theme-transition ${
                                theme === 'light' ? 'text-gray-500' : 'text-slate-500'
                              }`}>{m.lab}</div>
                            </div>
                          ))}
                        </div>

                        <div className={`flex justify-between items-center text-[10px] font-mono theme-transition ${
                          theme === 'light' ? 'text-gray-600' : 'text-slate-400'
                        }`}>
                          <div className="flex space-x-6 uppercase">
                            <span>AUM: <span className={`theme-transition ${
                              theme === 'light' ? 'text-gray-800' : 'text-slate-200'
                            }`}>{formatCurrency(fund.fund_size)}</span></span>
                            <span>EXP: <span className={`theme-transition ${
                              theme === 'light' ? 'text-gray-800' : 'text-slate-200'
                            }`}>{fund.expense_ratio.toFixed(2)}%</span></span>
                          </div>
                          <div className="flex text-amber-500">
                            {'★'.repeat(fund.rating)}<span className={`theme-transition ${
                              theme === 'light' ? 'text-gray-300' : 'text-slate-800'
                            }`}>{'★'.repeat(5-fund.rating)}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Top Performers View */}
              {activeTab === 'top-performers' && topPerformers && (
                <div className="space-y-8">
                  <div className={`flex justify-between items-end border-b pb-6 theme-transition ${
                    theme === 'light' ? 'border-gray-200' : 'border-slate-800'
                  }`}>
                    <div>
                      <h2 className={`text-2xl font-bold uppercase tracking-tighter theme-transition ${
                        theme === 'light' ? 'text-gray-900' : 'text-white'
                      }`}>Performance Leaders</h2>
                      <p className={`text-xs font-mono uppercase theme-transition ${
                        theme === 'light' ? 'text-gray-600' : 'text-slate-500'
                      }`}>Metric: {topPerformers.metric} | N={topPerformers.total_evaluated}</p>
                    </div>
                    <button onClick={loadTopPerformers} className={`px-6 py-2 text-[10px] font-black uppercase transition-all flex items-center theme-transition ${
                      theme === 'light' 
                        ? 'bg-amber-500 text-white hover:bg-amber-600' 
                        : 'bg-amber-500 text-slate-950 hover:bg-amber-400'
                    }`}>
                       <TrendingUp size={14} className="mr-2" /> Refresh Alpha
                    </button>
                  </div>

                  <div className="space-y-2">
                    {topPerformers.top_performers.map((fund, idx) => (
                      <div key={idx} className={`flex flex-col md:flex-row items-center border p-6 gap-6 hover:border-amber-500/30 transition-all group theme-transition ${
                        theme === 'light' 
                          ? 'bg-white border-gray-200' 
                          : 'bg-slate-950 border-slate-800'
                      }`}>
                        <div className={`text-5xl font-black italic w-16 group-hover:text-amber-500/20 transition-colors theme-transition ${
                          theme === 'light' ? 'text-gray-300' : 'text-slate-800'
                        }`}>
                          {String(fund.rank).padStart(2, '0')}
                        </div>
                        <div className="flex-grow">
                          <h4 className={`text-lg font-bold uppercase tracking-tight theme-transition ${
                            theme === 'light' ? 'text-gray-900' : 'text-white'
                          }`}>{fund.scheme_name}</h4>
                          <div className={`flex items-center text-xs mt-1 uppercase font-mono theme-transition ${
                            theme === 'light' ? 'text-gray-600' : 'text-slate-500'
                          }`}>
                            <Building size={12} className="mr-1" /> {fund.amc_name}
                          </div>
                        </div>
                        <div className="flex space-x-12 items-center">
                          <div className="text-right">
                            <div className="text-4xl font-black font-mono text-amber-400 tracking-tighter">
                              {fund.metric_value.toFixed(2)}
                              <span className="text-sm ml-1 text-amber-600 font-bold">
                                {topPerformersFilters.metric.includes('return') ? '%' : 'α'}
                              </span>
                            </div>
                            <div className={`text-[10px] uppercase font-bold tracking-widest theme-transition ${
                              theme === 'light' ? 'text-gray-500' : 'text-slate-500'
                            }`}>{topPerformers.metric}</div>
                          </div>
                          <div className="hidden md:block">
                            <ArrowUpRight className={`group-hover:text-amber-500 transition-colors theme-transition ${
                              theme === 'light' ? 'text-gray-400' : 'text-slate-700'
                            }`} size={32} />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}