'use client';

import { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { 
  TrendingUp, DollarSign, Calendar, Shield, Star, 
  Building, Zap, ArrowRight, Sparkles, ChevronRight, Globe, PieChart, BarChart3, Activity
} from 'lucide-react';
import { PieChart as RechartsPieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, LineChart, Line, ScatterChart, Scatter, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from 'recharts';

interface Recommendation {
  scheme_name: string;
  amc_name: string;
  predicted_return: string;
  suggested_allocation: string;
  risk_level: string;
  rating: string;
  allocation_percentage: string;
  comprehensive_score: string;
  actual_historical_return?: string;
  expense_ratio?: string;
  fund_size?: number;
  fund_age?: number;
}

interface RecommendationResponse {
  status: string;
  message: string;
  recommendations: Recommendation[];
  investment_summary: {
    total_amount: number;
    investment_horizon: string;
    risk_tolerance: string;
    category_preference?: string;
  };
}

export default function RecommendPage() {
  const [amcs, setAMCs] = useState<string[]>([]);
  const [categories, setCategories] = useState<Array<{ name: string; count: number }>>([]);
  const [loading, setLoading] = useState(false);
  const [recommendations, setRecommendations] = useState<RecommendationResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    amc_name: '',
    category: '',
    amount: 50000,
    tenure: 3,
    risk_tolerance: 'moderate'
  });

  useEffect(() => {
    const loadData = async () => {
      try {
        const [amcRes, catRes] = await Promise.all([
          api.getAMCs(),
          api.getCategories()
        ]);
        setAMCs(amcRes.amcs);
        setCategories(catRes.categories);
      } catch (error) {
        setError('Failed to load system data');
      }
    };
    loadData();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const response = await api.getRecommendations(formData);
      setRecommendations(response as RecommendationResponse);
    } catch (error) {
      setError('Failed to fetch recommendations.');
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <div className="min-h-screen bg-[#FCFBF7] text-slate-900 selection:bg-amber-100 font-sans overflow-x-hidden">
      {/* Background Ambient Orbs */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] right-[-5%] w-[60%] h-[50%] rounded-full bg-gradient-to-br from-amber-100/40 to-transparent blur-[120px]" />
        <div className="absolute bottom-[-5%] left-[-5%] w-[50%] h-[50%] rounded-full bg-gradient-to-tr from-yellow-50/50 to-transparent blur-[120px]" />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-20">
        {/* Page Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white border border-amber-200/50 shadow-sm text-amber-700 text-xs font-bold mb-6 uppercase tracking-widest">
            <Zap className="w-3 h-3 fill-amber-500 text-amber-500" />
            Tier-1 Quant Intelligence
          </div>
          <h1 className="text-4xl md:text-6xl font-black tracking-tighter text-slate-950 mb-6 leading-tight">
            Portfolio <span className="bg-clip-text text-transparent bg-gradient-to-r from-amber-600 to-amber-800">Architect</span>
          </h1>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto font-medium leading-relaxed">
            Our high-fidelity machine learning models analyze 789+ funds to pinpoint your optimal growth path.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          {/* Left Column: Form Section */}
          <div className="lg:col-span-4">
            <div className="bg-white border border-amber-100 p-8 rounded-[2.5rem] shadow-xl shadow-amber-900/5 sticky top-24">
              <h2 className="text-xl font-black text-slate-950 mb-8 flex items-center gap-2 uppercase tracking-tight">
                Parameters
              </h2>
              
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-1.5">
                  <label className="text-[10px] uppercase tracking-widest font-black text-slate-400 ml-1">Asset Manager</label>
                  <select 
                    value={formData.amc_name}
                    onChange={(e) => setFormData({...formData, amc_name: e.target.value})}
                    className="w-full bg-slate-50 border-none rounded-2xl p-4 text-sm font-bold focus:ring-2 focus:ring-amber-500 transition-all appearance-none cursor-pointer"
                  >
                    <option value="">All Institutions</option>
                    {amcs.map(amc => <option key={amc} value={amc}>{amc}</option>)}
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] uppercase tracking-widest font-black text-slate-400 ml-1">Investment Amount (₹)</label>
                  <input
                    type="number"
                    value={formData.amount}
                    onChange={(e) => setFormData({...formData, amount: parseInt(e.target.value) || 0})}
                    className="w-full bg-slate-50 border-none rounded-2xl p-4 text-sm font-bold focus:ring-2 focus:ring-amber-500 transition-all"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] uppercase tracking-widest font-black text-slate-400 ml-1">Tenure</label>
                    <select 
                      value={formData.tenure}
                      onChange={(e) => setFormData({...formData, tenure: parseInt(e.target.value)})}
                      className="w-full bg-slate-50 border-none rounded-2xl p-4 text-sm font-bold focus:ring-2 focus:ring-amber-500 appearance-none"
                    >
                      <option value={1}>1 Year</option>
                      <option value={3}>3 Years</option>
                      <option value={5}>5 Years</option>
                    </select>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] uppercase tracking-widest font-black text-slate-400 ml-1">Risk Bias</label>
                    <select 
                      value={formData.risk_tolerance}
                      onChange={(e) => setFormData({...formData, risk_tolerance: e.target.value})}
                      className="w-full bg-slate-50 border-none rounded-2xl p-4 text-sm font-bold focus:ring-2 focus:ring-amber-500 appearance-none"
                    >
                      <option value="conservative">Low Risk</option>
                      <option value="moderate">Moderate</option>
                      <option value="aggressive">High Risk</option>
                    </select>
                  </div>
                </div>

                <button 
                  type="submit" 
                  disabled={loading}
                  className="w-full bg-slate-950 text-white p-5 rounded-2xl font-bold hover:bg-amber-600 transition-all flex items-center justify-center gap-2 group disabled:opacity-50"
                >
                  {loading ? 'Processing Model...' : 'Compute Recommendations'}
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </button>
              </form>

              {error && (
                <div className="mt-4 p-4 bg-red-50 border border-red-100 rounded-2xl">
                  <p className="text-red-600 text-xs font-bold">{error}</p>
                </div>
              )}
            </div>
          </div>

          {/* Right Column: Results Section */}
          <div className="lg:col-span-8">
            {recommendations ? (
              <div className="space-y-8 animate-fade-in">
                {/* Dashboard Summary Bar */}
                <div className="bg-slate-950 rounded-[2.5rem] p-8 text-white grid grid-cols-2 md:grid-cols-4 gap-8 shadow-2xl shadow-amber-900/20 border border-white/5">
                  <div>
                    <div className="text-[10px] uppercase tracking-widest text-slate-500 font-bold mb-1">Portfolio Size</div>
                    <div className="text-2xl font-black text-amber-500 tracking-tighter">{formatCurrency(recommendations.investment_summary.total_amount)}</div>
                  </div>
                  <div>
                    <div className="text-[10px] uppercase tracking-widest text-slate-500 font-bold mb-1">Horizon</div>
                    <div className="text-2xl font-black tracking-tighter">{recommendations.investment_summary.investment_horizon}</div>
                  </div>
                  <div>
                    <div className="text-[10px] uppercase tracking-widest text-slate-500 font-bold mb-1">Strategy</div>
                    <div className="text-2xl font-black capitalize tracking-tighter">{recommendations.investment_summary.risk_tolerance}</div>
                  </div>
                  <div>
                    <div className="text-[10px] uppercase tracking-widest text-slate-500 font-bold mb-1">AI Logic</div>
                    <div className="text-2xl font-black text-green-500 tracking-tighter italic">Optimized</div>
                  </div>
                </div>

                {/* Enhanced Graphs Section */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Allocation Pie Chart */}
                  <div className="bg-white/90 backdrop-blur-sm border border-white p-8 rounded-[2.5rem] shadow-xl shadow-amber-900/5">
                    <div className="flex items-center gap-3 mb-6">
                      <div className="p-3 bg-amber-50 rounded-2xl">
                        <PieChart className="w-6 h-6 text-amber-600" />
                      </div>
                      <div>
                        <h3 className="text-xl font-black text-slate-950 tracking-tight">Portfolio Allocation</h3>
                        <p className="text-xs text-slate-500 uppercase tracking-widest">Distribution Breakdown</p>
                      </div>
                    </div>
                    <ResponsiveContainer width="100%" height={300}>
                      <RechartsPieChart>
                        <Pie
                          data={recommendations.recommendations.map((fund, idx) => ({
                            name: fund.scheme_name.length > 20 ? fund.scheme_name.substring(0, 20) + '...' : fund.scheme_name,
                            value: parseFloat(fund.allocation_percentage.replace('%', '')),
                            fill: ['#f59e0b', '#fbbf24', '#fcd34d', '#fde68a', '#fef3c7'][idx % 5]
                          }))}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(1)}%`}
                          outerRadius={100}
                          innerRadius={40}
                          dataKey="value"
                        >
                          {recommendations.recommendations.map((_, idx) => (
                            <Cell key={`cell-${idx}`} fill={['#f59e0b', '#fbbf24', '#fcd34d', '#fde68a', '#fef3c7'][idx % 5]} />
                          ))}
                        </Pie>
                        <Tooltip formatter={(value: number) => `${value.toFixed(1)}%`} />
                      </RechartsPieChart>
                    </ResponsiveContainer>
                  </div>

                  {/* Risk-Return Scatter Chart */}
                  <div className="bg-white/90 backdrop-blur-sm border border-white p-8 rounded-[2.5rem] shadow-xl shadow-amber-900/5">
                    <div className="flex items-center gap-3 mb-6">
                      <div className="p-3 bg-blue-50 rounded-2xl">
                        <Activity className="w-6 h-6 text-blue-600" />
                      </div>
                      <div>
                        <h3 className="text-xl font-black text-slate-950 tracking-tight">Risk-Return Matrix</h3>
                        <p className="text-xs text-slate-500 uppercase tracking-widest">Performance vs Risk</p>
                      </div>
                    </div>
                    <ResponsiveContainer width="100%" height={300}>
                      <ScatterChart>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                        <XAxis 
                          type="number" 
                          dataKey="risk" 
                          name="Risk Level" 
                          domain={[0, 7]}
                          label={{ value: 'Risk Level', position: 'insideBottom', offset: -5 }}
                        />
                        <YAxis 
                          type="number" 
                          dataKey="return" 
                          name="Predicted Return %"
                          label={{ value: 'Return %', angle: -90, position: 'insideLeft' }}
                        />
                        <Tooltip 
                          cursor={{ strokeDasharray: '3 3' }}
                          formatter={(value: number, name: string) => [
                            name === 'return' ? `${value.toFixed(2)}%` : value.toFixed(1),
                            name === 'return' ? 'Predicted Return' : 'Risk Level'
                          ]}
                        />
                        <Scatter 
                          name="Funds" 
                          data={recommendations.recommendations.map(fund => ({
                            risk: parseFloat(fund.risk_level.split('/')[0]),
                            return: parseFloat(fund.predicted_return.replace('%', '')),
                            name: fund.scheme_name
                          }))} 
                          fill="#f59e0b"
                        />
                      </ScatterChart>
                    </ResponsiveContainer>
                  </div>

                  {/* Projected Growth Line Chart */}
                  <div className="bg-white/90 backdrop-blur-sm border border-white p-8 rounded-[2.5rem] shadow-xl shadow-amber-900/5 lg:col-span-2">
                    <div className="flex items-center gap-3 mb-6">
                      <div className="p-3 bg-green-50 rounded-2xl">
                        <TrendingUp className="w-6 h-6 text-green-600" />
                      </div>
                      <div>
                        <h3 className="text-xl font-black text-slate-950 tracking-tight">Projected Growth Trajectory</h3>
                        <p className="text-xs text-slate-500 uppercase tracking-widest">Multi-Year Performance Forecast</p>
                      </div>
                    </div>
                    <ResponsiveContainer width="100%" height={350}>
                      {(() => {
                        const horizon = parseInt(recommendations.investment_summary.investment_horizon) || 3;
                        const years = [0, 1, 2, 3, 4, 5].filter(y => y <= horizon);
                        
                        // Create merged data for all funds
                        const mergedData = years.map((year) => {
                          const point: any = { year };
                          recommendations.recommendations.forEach((fund, fIdx) => {
                            const amt = parseFloat(fund.suggested_allocation.replace(/[₹,]/g, ''));
                            const rate = parseFloat(fund.predicted_return.replace('%', '')) / 100;
                            point[`fund_${fIdx}`] = amt * Math.pow(1 + rate, year);
                          });
                          return point;
                        });
                        
                        return (
                          <LineChart data={mergedData}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                            <XAxis 
                              dataKey="year" 
                              label={{ value: 'Investment Year', position: 'insideBottom', offset: -5 }}
                            />
                            <YAxis 
                              label={{ value: 'Portfolio Value (₹)', angle: -90, position: 'insideLeft' }}
                              tickFormatter={(value) => `₹${(value / 1000).toFixed(0)}K`}
                            />
                            <Tooltip 
                              formatter={(value: number) => formatCurrency(value)}
                              labelFormatter={(label) => `Year ${label}`}
                            />
                            <Legend />
                            {recommendations.recommendations.map((fund, idx) => (
                              <Line
                                key={idx}
                                type="monotone"
                                dataKey={`fund_${idx}`}
                                name={fund.scheme_name.length > 25 ? fund.scheme_name.substring(0, 25) + '...' : fund.scheme_name}
                                stroke={['#f59e0b', '#fbbf24', '#fcd34d', '#fde68a', '#fef3c7'][idx % 5]}
                                strokeWidth={3}
                                dot={{ r: 5, fill: ['#f59e0b', '#fbbf24', '#fcd34d', '#fde68a', '#fef3c7'][idx % 5] }}
                                activeDot={{ r: 8 }}
                              />
                            ))}
                          </LineChart>
                        );
                      })()}
                    </ResponsiveContainer>
                  </div>

                  {/* Performance Comparison Bar Chart */}
                  <div className="bg-white/90 backdrop-blur-sm border border-white p-8 rounded-[2.5rem] shadow-xl shadow-amber-900/5 lg:col-span-2">
                    <div className="flex items-center gap-3 mb-6">
                      <div className="p-3 bg-purple-50 rounded-2xl">
                        <BarChart3 className="w-6 h-6 text-purple-600" />
                      </div>
                      <div>
                        <h3 className="text-xl font-black text-slate-950 tracking-tight">Comprehensive Performance Metrics</h3>
                        <p className="text-xs text-slate-500 uppercase tracking-widest">Multi-Dimensional Analysis</p>
                      </div>
                    </div>
                    <ResponsiveContainer width="100%" height={350}>
                      <BarChart data={recommendations.recommendations.map(fund => ({
                        name: fund.scheme_name.length > 15 ? fund.scheme_name.substring(0, 15) + '...' : fund.scheme_name,
                        predictedReturn: parseFloat(fund.predicted_return.replace('%', '')),
                        historicalReturn: fund.actual_historical_return ? parseFloat(fund.actual_historical_return.replace('%', '')) : 0,
                        score: parseFloat(fund.comprehensive_score) * 100,
                        rating: parseFloat(fund.rating.split('/')[0]) * 20
                      }))}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                        <XAxis dataKey="name" angle={-45} textAnchor="end" height={100} />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Bar dataKey="predictedReturn" fill="#f59e0b" name="Predicted Return %" />
                        <Bar dataKey="historicalReturn" fill="#10b981" name="Historical Return %" />
                        <Bar dataKey="score" fill="#8b5cf6" name="Quant Score (×100)" />
                        <Bar dataKey="rating" fill="#fbbf24" name="Rating Score" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* Fund Cards */}
                <div className="space-y-6">
                  {recommendations.recommendations.map((fund, index) => (
                    <div key={index} className="group relative bg-white/70 backdrop-blur-sm border border-white p-8 rounded-[2.5rem] hover:bg-white hover:shadow-2xl hover:shadow-amber-900/5 transition-all duration-500">
                      <div className="flex flex-col md:flex-row justify-between gap-6 mb-8">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-3">
                            <span className="bg-amber-50 text-amber-700 text-[10px] font-black px-2 py-0.5 rounded uppercase tracking-wider border border-amber-100/50">
                              {fund.risk_level}
                            </span>
                            <span className="text-slate-300">•</span>
                            <span className="text-slate-400 text-[10px] font-bold uppercase tracking-widest">{fund.amc_name}</span>
                          </div>
                          <h4 className="text-2xl font-black text-slate-950 leading-tight group-hover:text-amber-700 transition-colors">
                            {fund.scheme_name}
                          </h4>
                        </div>
                        <div className="md:text-right">
                           <div className="text-4xl font-black text-amber-600 tracking-tighter leading-none mb-1">
                             {fund.predicted_return}
                           </div>
                           <div className="text-[10px] uppercase tracking-[0.2em] font-black text-slate-400">Est. Growth</div>
                        </div>
                      </div>

                      {/* Enhanced Stat Grid with Visual Indicators */}
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-px bg-slate-200/50 rounded-3xl overflow-hidden border border-slate-100">
                        <EnhancedStatBlock 
                          label="Allocation" 
                          value={fund.suggested_allocation} 
                          icon={<DollarSign className="w-5 h-5"/>}
                          trend={parseFloat(fund.allocation_percentage.replace('%', ''))}
                          color="amber"
                        />
                        <EnhancedStatBlock 
                          label="Rating" 
                          value={`★ ${fund.rating}`} 
                          icon={<Star className="w-5 h-5"/>}
                          trend={parseFloat(fund.rating.split('/')[0])}
                          color="yellow"
                          maxValue={5}
                        />
                        <EnhancedStatBlock 
                          label="Share" 
                          value={fund.allocation_percentage} 
                          icon={<TrendingUp className="w-5 h-5"/>}
                          trend={parseFloat(fund.allocation_percentage.replace('%', ''))}
                          color="green"
                        />
                        <EnhancedStatBlock 
                          label="Quant Score" 
                          value={fund.comprehensive_score} 
                          icon={<Zap className="w-5 h-5"/>}
                          trend={parseFloat(fund.comprehensive_score) * 100}
                          color="purple"
                          highlight
                        />
                      </div>
                      
                      {/* Additional Metrics Row */}
                      {fund.actual_historical_return && (
                        <div className="mt-6 pt-6 border-t border-slate-200 grid grid-cols-2 md:grid-cols-3 gap-4">
                          <div className="flex items-center gap-3">
                            <div className="p-2 bg-blue-50 rounded-xl">
                              <Calendar className="w-4 h-4 text-blue-600" />
                            </div>
                            <div>
                              <div className="text-[10px] uppercase tracking-widest text-slate-400 font-bold">Historical</div>
                              <div className="text-lg font-black text-slate-950">{fund.actual_historical_return}</div>
                            </div>
                          </div>
                          {fund.expense_ratio && (
                            <div className="flex items-center gap-3">
                              <div className="p-2 bg-red-50 rounded-xl">
                                <Shield className="w-4 h-4 text-red-600" />
                              </div>
                              <div>
                                <div className="text-[10px] uppercase tracking-widest text-slate-400 font-bold">Expense</div>
                                <div className="text-lg font-black text-slate-950">{fund.expense_ratio}</div>
                              </div>
                            </div>
                          )}
                          {fund.fund_size && (
                            <div className="flex items-center gap-3">
                              <div className="p-2 bg-indigo-50 rounded-xl">
                                <Building className="w-4 h-4 text-indigo-600" />
                              </div>
                              <div>
                                <div className="text-[10px] uppercase tracking-widest text-slate-400 font-bold">AUM</div>
                                <div className="text-lg font-black text-slate-950">₹{(fund.fund_size / 1000000).toFixed(1)}M</div>
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ) : !loading ? (
              /* Empty State */
              <div className="h-full min-h-[500px] flex flex-col items-center justify-center bg-white/40 backdrop-blur-sm border-2 border-dashed border-amber-100 rounded-[3rem] text-center p-12">
                <div className="mb-8 p-6 bg-white rounded-3xl shadow-sm border border-amber-50">
                  <Globe className="h-12 w-12 text-amber-600" />
                </div>
                <h3 className="text-2xl font-black text-slate-950 mb-3 tracking-tight uppercase">Awaiting Computation</h3>
                <p className="text-slate-500 max-w-sm font-medium leading-relaxed">
                  Enter your investment criteria on the left to activate our proprietary neural fund matching engine.
                </p>
              </div>
            ) : (
              /* Skeleton Loader */
              <div className="space-y-8 animate-pulse">
                <div className="bg-slate-200 h-48 rounded-[2.5rem]" />
                <div className="bg-slate-100 h-64 rounded-[2.5rem]" />
                <div className="bg-slate-100 h-64 rounded-[2.5rem]" />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Simplified Footer */}
      <footer className="bg-slate-950 text-white py-12 mt-20">
        <div className="max-w-7xl mx-auto px-4 flex justify-between items-center">
          <div className="font-black text-lg tracking-tighter">MUTUAL.AI</div>
          <div className="text-[10px] text-slate-500 font-bold uppercase tracking-[0.3em]">Institutional Grade Assets • 2025</div>
        </div>
      </footer>
    </div>
  );
}

/**
 * Enhanced Stat Component with visual progress indicators
 */
function EnhancedStatBlock({ 
  label, 
  value, 
  icon, 
  trend, 
  color = "amber",
  maxValue = 100,
  highlight = false 
}: { 
  label: string, 
  value: string, 
  icon: React.ReactNode, 
  trend: number,
  color?: "amber" | "yellow" | "green" | "purple" | "blue",
  maxValue?: number,
  highlight?: boolean 
}) {
  const colorClasses = {
    amber: { bg: "bg-amber-50", icon: "text-amber-600", bar: "bg-amber-500", text: "text-amber-600" },
    yellow: { bg: "bg-yellow-50", icon: "text-yellow-600", bar: "bg-yellow-500", text: "text-yellow-600" },
    green: { bg: "bg-green-50", icon: "text-green-600", bar: "bg-green-500", text: "text-green-600" },
    purple: { bg: "bg-purple-50", icon: "text-purple-600", bar: "bg-purple-500", text: "text-purple-600" },
    blue: { bg: "bg-blue-50", icon: "text-blue-600", bar: "bg-blue-500", text: "text-blue-600" },
  };
  
  const colors = colorClasses[color];
  const percentage = Math.min((trend / maxValue) * 100, 100);
  
  return (
    <div className="bg-white p-6 group-hover:bg-slate-50 transition-all duration-300 flex flex-col justify-between relative overflow-hidden">
      {/* Animated background gradient */}
      <div className={`absolute inset-0 opacity-5 ${colors.bg} transition-opacity group-hover:opacity-10`} />
      
      <div className="relative z-10">
        <div className="flex items-center gap-2 mb-3">
          <span className={`${colors.icon} transition-transform group-hover:scale-110`}>{icon}</span>
          <span className="text-[10px] uppercase tracking-[0.15em] font-black text-slate-400">{label}</span>
        </div>
        
        <div className={`tracking-tighter font-black mb-3 transition-all ${
          highlight 
            ? `${colors.text} text-3xl italic font-mono` 
            : 'text-slate-950 text-2xl'
        }`}>
          {value}
        </div>
        
        {/* Progress Bar */}
        <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
          <div 
            className={`h-full ${colors.bar} transition-all duration-1000 ease-out rounded-full`}
            style={{ width: `${percentage}%` }}
          />
        </div>
        
        {/* Trend indicator */}
        <div className="mt-2 text-[9px] uppercase tracking-widest text-slate-400 font-bold">
          {percentage.toFixed(0)}% of max
        </div>
      </div>
    </div>
  );
}