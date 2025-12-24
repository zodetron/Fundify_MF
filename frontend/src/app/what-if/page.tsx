'use client';

import { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { useTheme } from '@/contexts/ThemeContext';
import { TrendingUp, TrendingDown, Clock, DollarSign, AlertCircle, CheckCircle, Loader2, BarChart3 } from 'lucide-react';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

export default function WhatIfPage() {
  const { theme } = useTheme();
  const [fundNames, setFundNames] = useState<string[]>([]);
  const [availableFunds, setAvailableFunds] = useState<Array<{ scheme_name: string; amc_name: string }>>([]);
  const [investmentAmount, setInvestmentAmount] = useState<number>(100000);
  const [durationYears, setDurationYears] = useState<number>(3);
  const [marketRegime, setMarketRegime] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [simulationResults, setSimulationResults] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Load available funds
    const loadFunds = async () => {
      try {
        const response = await api.getFunds({ limit: 100 });
        if (response.funds) {
          setAvailableFunds(response.funds.map((f: any) => ({
            scheme_name: f.scheme_name,
            amc_name: f.amc_name
          })));
        }
      } catch (err) {
        console.error('Error loading funds:', err);
      }
    };
    loadFunds();

    // Get current market regime
    const loadMarketRegime = async () => {
      try {
        const condition = await api.getMarketCondition();
        // Map condition to regime
        if (condition.condition === 'bullish' && condition.trend_strength === 'strong') {
          setMarketRegime('bull');
        } else if (condition.condition === 'bearish' || condition.trend_strength === 'weak') {
          setMarketRegime('volatile');
        } else {
          setMarketRegime('sideways');
        }
      } catch (err) {
        setMarketRegime('sideways'); // Default
      }
    };
    loadMarketRegime();
  }, []);

  const handleRunSimulation = async () => {
    if (fundNames.length === 0) {
      setError('Please select at least one fund');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const results = await api.whatIfSimulation({
        fund_names: fundNames,
        investment_amount: investmentAmount,
        duration_years: durationYears,
        market_regime: marketRegime || undefined,
      });
      setSimulationResults(results);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to run simulation');
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

  // Prepare chart data
  const chartData = simulationResults?.scenarios.map((scenario: any) => ({
    waitMonths: `${scenario.wait_months}M`,
    investNow: scenario.aggregate.avg_invest_now_profit,
    waitAndInvest: scenario.aggregate.avg_wait_profit,
    difference: scenario.aggregate.net_difference,
  })) || [];

  return (
    <div className={`min-h-screen py-12 px-6 font-sans theme-transition ${
      theme === 'light' 
        ? 'bg-gray-50 text-gray-700' 
        : 'bg-slate-950 text-slate-300'
    }`}>
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-12 border-l-4 border-amber-500 pl-6">
          <div className="flex items-center space-x-3 text-amber-500 mb-2">
            <Clock size={20} />
            <span className="font-mono text-xs font-black tracking-widest uppercase">What If I Wait?</span>
          </div>
          <h1 className={`text-5xl font-black tracking-tighter uppercase italic theme-transition ${
            theme === 'light' ? 'text-gray-900' : 'text-white'
          }`}>Investment Timing Simulator</h1>
          <p className={`font-mono text-xs uppercase tracking-[0.2em] mt-2 theme-transition ${
            theme === 'light' ? 'text-gray-500' : 'text-slate-500'
          }`}>Compare Investing Now vs Waiting 1, 3, or 6 Months</p>
        </div>

        {/* Input Form */}
        <div className={`border mb-8 p-8 theme-transition ${
          theme === 'light' 
            ? 'bg-white border-gray-200' 
            : 'bg-slate-900 border-slate-800'
        }`}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Fund Selection */}
            <div>
              <label className={`block text-sm font-semibold mb-2 theme-transition ${
                theme === 'light' ? 'text-gray-900' : 'text-white'
              }`}>
                Select Mutual Fund(s)
              </label>
              <select
                multiple
                value={fundNames}
                onChange={(e) => setFundNames(Array.from(e.target.selectedOptions, option => option.value))}
                className={`w-full p-3 border rounded-lg theme-transition ${
                  theme === 'light'
                    ? 'bg-white border-gray-300 text-gray-900'
                    : 'bg-slate-800 border-slate-700 text-white'
                }`}
                size={5}
              >
                {availableFunds.map((fund) => (
                  <option key={fund.scheme_name} value={fund.scheme_name}>
                    {fund.scheme_name} ({fund.amc_name})
                  </option>
                ))}
              </select>
              <p className={`text-xs mt-2 theme-transition ${
                theme === 'light' ? 'text-gray-500' : 'text-slate-400'
              }`}>
                Hold Ctrl/Cmd to select multiple funds
              </p>
            </div>

            {/* Investment Amount */}
            <div>
              <label className={`block text-sm font-semibold mb-2 theme-transition ${
                theme === 'light' ? 'text-gray-900' : 'text-white'
              }`}>
                Investment Amount (₹)
              </label>
              <input
                type="number"
                value={investmentAmount}
                onChange={(e) => setInvestmentAmount(Number(e.target.value))}
                className={`w-full p-3 border rounded-lg theme-transition ${
                  theme === 'light'
                    ? 'bg-white border-gray-300 text-gray-900'
                    : 'bg-slate-800 border-slate-700 text-white'
                }`}
                min="1000"
                step="1000"
              />
            </div>

            {/* Duration */}
            <div>
              <label className={`block text-sm font-semibold mb-2 theme-transition ${
                theme === 'light' ? 'text-gray-900' : 'text-white'
              }`}>
                Investment Duration
              </label>
              <select
                value={durationYears}
                onChange={(e) => setDurationYears(Number(e.target.value))}
                className={`w-full p-3 border rounded-lg theme-transition ${
                  theme === 'light'
                    ? 'bg-white border-gray-300 text-gray-900'
                    : 'bg-slate-800 border-slate-700 text-white'
                }`}
              >
                <option value={1}>1 Year</option>
                <option value={3}>3 Years</option>
                <option value={5}>5 Years</option>
              </select>
            </div>

            {/* Market Regime */}
            <div>
              <label className={`block text-sm font-semibold mb-2 theme-transition ${
                theme === 'light' ? 'text-gray-900' : 'text-white'
              }`}>
                Market Regime (Auto-detected)
              </label>
              <select
                value={marketRegime}
                onChange={(e) => setMarketRegime(e.target.value)}
                className={`w-full p-3 border rounded-lg theme-transition ${
                  theme === 'light'
                    ? 'bg-white border-gray-300 text-gray-900'
                    : 'bg-slate-800 border-slate-700 text-white'
                }`}
              >
                <option value="">Auto-detect</option>
                <option value="bull">Bull Market</option>
                <option value="sideways">Sideways Market</option>
                <option value="volatile">Volatile Market</option>
              </select>
            </div>
          </div>

          {/* Run Button */}
          <div className="mt-6">
            <button
              onClick={handleRunSimulation}
              disabled={loading || fundNames.length === 0}
              className={`px-8 py-3 rounded-lg font-bold transition-all flex items-center gap-2 ${
                loading || fundNames.length === 0
                  ? 'opacity-50 cursor-not-allowed'
                  : theme === 'light'
                    ? 'bg-amber-600 text-white hover:bg-amber-700'
                    : 'bg-amber-500 text-slate-950 hover:bg-amber-400'
              }`}
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Running Simulation...
                </>
              ) : (
                <>
                  <BarChart3 className="w-5 h-5" />
                  Run Simulation
                </>
              )}
            </button>
          </div>

          {error && (
            <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-red-600" />
              <span className="text-red-600">{error}</span>
            </div>
          )}
        </div>

        {/* Results */}
        {simulationResults && (
          <div className="space-y-8">
            {/* Summary Card */}
            <div className={`border p-8 theme-transition ${
              theme === 'light' 
                ? 'bg-white border-gray-200' 
                : 'bg-slate-900 border-slate-800'
            }`}>
              <h2 className={`text-2xl font-bold mb-6 theme-transition ${
                theme === 'light' ? 'text-gray-900' : 'text-white'
              }`}>
                Simulation Summary
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className={`p-4 rounded-lg border theme-transition ${
                  theme === 'light' ? 'bg-gray-50 border-gray-200' : 'bg-slate-800/50 border-slate-700'
                }`}>
                  <div className={`text-sm font-medium mb-2 theme-transition ${
                    theme === 'light' ? 'text-gray-600' : 'text-slate-400'
                  }`}>Market Regime</div>
                  <div className={`text-xl font-bold capitalize theme-transition ${
                    theme === 'light' ? 'text-gray-900' : 'text-white'
                  }`}>{simulationResults.market_regime}</div>
                </div>
                <div className={`p-4 rounded-lg border theme-transition ${
                  theme === 'light' ? 'bg-gray-50 border-gray-200' : 'bg-slate-800/50 border-slate-700'
                }`}>
                  <div className={`text-sm font-medium mb-2 theme-transition ${
                    theme === 'light' ? 'text-gray-600' : 'text-slate-400'
                  }`}>General Recommendation</div>
                  <div className={`text-xl font-bold capitalize flex items-center gap-2 theme-transition ${
                    simulationResults.summary.general_recommendation === 'invest_now'
                      ? 'text-green-600'
                      : 'text-orange-600'
                  }`}>
                    {simulationResults.summary.general_recommendation === 'invest_now' ? (
                      <>
                        <CheckCircle className="w-5 h-5" />
                        Invest Now
                      </>
                    ) : (
                      <>
                        <Clock className="w-5 h-5" />
                        Wait
                      </>
                    )}
                  </div>
                </div>
                <div className={`p-4 rounded-lg border theme-transition ${
                  theme === 'light' ? 'bg-gray-50 border-gray-200' : 'bg-slate-800/50 border-slate-700'
                }`}>
                  <div className={`text-sm font-medium mb-2 theme-transition ${
                    theme === 'light' ? 'text-gray-600' : 'text-slate-400'
                  }`}>Investment Amount</div>
                  <div className={`text-xl font-bold theme-transition ${
                    theme === 'light' ? 'text-gray-900' : 'text-white'
                  }`}>{formatCurrency(simulationResults.investment_amount)}</div>
                </div>
              </div>
            </div>

            {/* Chart */}
            <div className={`border p-8 theme-transition ${
              theme === 'light' 
                ? 'bg-white border-gray-200' 
                : 'bg-slate-900 border-slate-800'
            }`}>
              <h3 className={`text-lg font-bold mb-6 theme-transition ${
                theme === 'light' ? 'text-gray-900' : 'text-white'
              }`}>
                Profit Comparison: Invest Now vs Wait
              </h3>
              <ResponsiveContainer width="100%" height={400}>
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke={theme === 'light' ? '#e5e7eb' : '#1e293b'} />
                  <XAxis dataKey="waitMonths" stroke={theme === 'light' ? '#6b7280' : '#475569'} />
                  <YAxis stroke={theme === 'light' ? '#6b7280' : '#475569'} />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: theme === 'light' ? '#ffffff' : '#020617', 
                      border: theme === 'light' ? '1px solid #e5e7eb' : '1px solid #1e293b',
                      color: theme === 'light' ? '#374151' : '#fbbf24'
                    }}
                    formatter={(value: number) => formatCurrency(value)}
                  />
                  <Legend />
                  <Bar dataKey="investNow" fill="#10B981" name="Invest Now" />
                  <Bar dataKey="waitAndInvest" fill="#F59E0B" name="Wait & Invest" />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Detailed Scenarios */}
            {simulationResults.scenarios.map((scenario: any, index: number) => (
              <div key={index} className={`border p-8 theme-transition ${
                theme === 'light' 
                  ? 'bg-white border-gray-200' 
                  : 'bg-slate-900 border-slate-800'
              }`}>
                <div className="flex items-center justify-between mb-6">
                  <h3 className={`text-xl font-bold theme-transition ${
                    theme === 'light' ? 'text-gray-900' : 'text-white'
                  }`}>
                    Waiting {scenario.wait_months} Month{scenario.wait_months > 1 ? 's' : ''}
                  </h3>
                  <div className={`px-4 py-2 rounded-full text-sm font-bold ${
                    scenario.aggregate.recommendation === 'invest_now'
                      ? theme === 'light'
                        ? 'bg-green-100 text-green-800'
                        : 'bg-green-900/30 text-green-400'
                      : theme === 'light'
                        ? 'bg-orange-100 text-orange-800'
                        : 'bg-orange-900/30 text-orange-400'
                  }`}>
                    {scenario.aggregate.recommendation === 'invest_now' ? 'Invest Now' : 'Wait'}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  <div className={`p-6 rounded-lg border theme-transition ${
                    theme === 'light' ? 'bg-green-50 border-green-200' : 'bg-green-900/20 border-green-800/50'
                  }`}>
                    <div className="flex items-center gap-2 mb-4">
                      <TrendingUp className="w-5 h-5 text-green-600" />
                      <h4 className={`font-bold theme-transition ${
                        theme === 'light' ? 'text-gray-900' : 'text-white'
                      }`}>Invest Now</h4>
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className={theme === 'light' ? 'text-gray-600' : 'text-slate-400'}>Final Value:</span>
                        <span className={`font-bold theme-transition ${
                          theme === 'light' ? 'text-gray-900' : 'text-white'
                        }`}>{formatCurrency(scenario.aggregate.avg_invest_now_profit + simulationResults.investment_amount)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className={theme === 'light' ? 'text-gray-600' : 'text-slate-400'}>Profit:</span>
                        <span className={`font-bold text-green-600 theme-transition ${
                          theme === 'light' ? 'text-green-700' : 'text-green-400'
                        }`}>{formatCurrency(scenario.aggregate.avg_invest_now_profit)}</span>
                      </div>
                    </div>
                  </div>

                  <div className={`p-6 rounded-lg border theme-transition ${
                    theme === 'light' ? 'bg-orange-50 border-orange-200' : 'bg-orange-900/20 border-orange-800/50'
                  }`}>
                    <div className="flex items-center gap-2 mb-4">
                      <Clock className="w-5 h-5 text-orange-600" />
                      <h4 className={`font-bold theme-transition ${
                        theme === 'light' ? 'text-gray-900' : 'text-white'
                      }`}>Wait {scenario.wait_months}M Then Invest</h4>
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className={theme === 'light' ? 'text-gray-600' : 'text-slate-400'}>Final Value:</span>
                        <span className={`font-bold theme-transition ${
                          theme === 'light' ? 'text-gray-900' : 'text-white'
                        }`}>{formatCurrency(scenario.aggregate.avg_wait_profit + simulationResults.investment_amount)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className={theme === 'light' ? 'text-gray-600' : 'text-slate-400'}>Profit:</span>
                        <span className={`font-bold text-orange-600 theme-transition ${
                          theme === 'light' ? 'text-orange-700' : 'text-orange-400'
                        }`}>{formatCurrency(scenario.aggregate.avg_wait_profit)}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className={`p-4 rounded-lg border theme-transition ${
                  theme === 'light' ? 'bg-amber-50 border-amber-200' : 'bg-amber-900/20 border-amber-800/50'
                }`}>
                  <div className="flex items-center justify-between">
                    <span className={`font-semibold theme-transition ${
                      theme === 'light' ? 'text-gray-900' : 'text-white'
                    }`}>Net Difference:</span>
                    <span className={`text-2xl font-bold theme-transition ${
                      scenario.aggregate.net_difference >= 0
                        ? theme === 'light' ? 'text-green-600' : 'text-green-400'
                        : theme === 'light' ? 'text-red-600' : 'text-red-400'
                    }`}>
                      {scenario.aggregate.net_difference >= 0 ? '+' : ''}
                      {formatCurrency(scenario.aggregate.net_difference)}
                    </span>
                  </div>
                  <p className={`text-sm mt-2 theme-transition ${
                    theme === 'light' ? 'text-gray-600' : 'text-slate-400'
                  }`}>
                    {scenario.aggregate.net_difference >= 0
                      ? `Investing now would yield ${formatCurrency(Math.abs(scenario.aggregate.net_difference))} more profit`
                      : `Waiting ${scenario.wait_months} months could save you ${formatCurrency(Math.abs(scenario.aggregate.net_difference))}`}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

