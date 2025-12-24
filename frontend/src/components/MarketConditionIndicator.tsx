"use client"

import { useEffect, useState } from "react"
import { api } from "@/lib/api"
import { TrendingUp, TrendingDown, AlertCircle, CheckCircle, Loader2, Clock } from "lucide-react"

interface MarketConditionData {
  ticker: string
  current_price: number
  ema_12: number
  ema_21: number
  ema_diff_percent: number
  condition: "bullish" | "bearish"
  recommendation: "favorable" | "caution"
  message: string
  crossover: "bullish" | "bearish" | null
  trend_strength: "weak" | "moderate" | "strong"
  last_updated: string
  timeframe: string
  data_points: number
  period: string
  estimated_improvement_time?: {
    days: number | null
    hours: number | null
    total_hours: number | null
    message?: string
  }
  estimated_improvement_date?: string
  improvement_confidence?: "high" | "medium" | "low"
}

export default function MarketConditionIndicator() {
  const [data, setData] = useState<MarketConditionData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchMarketCondition = async () => {
    try {
      setLoading(true)
      setError(null)
      const result = await api.getMarketCondition()
      setData(result)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch market condition")
      console.error("Error fetching market condition:", err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    // Fetch immediately
    fetchMarketCondition()

    // Poll every 15 minutes (900000 ms) - 4H timeframe updates periodically
    const interval = setInterval(fetchMarketCondition, 15 * 60 * 1000)

    return () => clearInterval(interval)
  }, [])

  if (loading && !data) {
    return (
      <div className="flex items-center gap-2 px-4 py-2 bg-white/80 backdrop-blur-sm border border-slate-200 rounded-lg shadow-sm">
        <Loader2 className="w-4 h-4 animate-spin text-slate-400" />
        <span className="text-sm text-slate-600">Loading market condition...</span>
      </div>
    )
  }

  if (error && !data) {
    return (
      <div className="flex items-center gap-2 px-4 py-2 bg-red-50 border border-red-200 rounded-lg">
        <AlertCircle className="w-4 h-4 text-red-500" />
        <span className="text-sm text-red-600">Failed to load market data</span>
      </div>
    )
  }

  if (!data) return null

  const isBullish = data.condition === "bullish"
  const bgColor = isBullish ? "bg-green-50 border-green-200" : "bg-orange-50 border-orange-200"
  const textColor = isBullish ? "text-green-700" : "text-orange-700"
  const iconColor = isBullish ? "text-green-600" : "text-orange-600"
  const Icon = isBullish ? TrendingUp : TrendingDown
  const StatusIcon = data.recommendation === "favorable" ? CheckCircle : AlertCircle

  return (
    <div className={`px-4 py-3 bg-white/90 backdrop-blur-sm border rounded-lg shadow-sm transition-all ${bgColor}`}>
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-3 flex-1">
          <div className={`mt-0.5 ${iconColor}`}>
            <Icon className="w-5 h-5" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="font-semibold text-sm text-slate-900">Nifty 50 Market Condition</h3>
              {data.crossover && (
                <span className="px-2 py-0.5 text-xs font-medium rounded-full bg-amber-100 text-amber-700">
                  {data.crossover === "bullish" ? "Golden Cross" : "Death Cross"}
                </span>
              )}
            </div>
            <p className={`text-sm font-medium mb-2 ${textColor}`}>
              {data.message}
            </p>
            <div className="flex items-center gap-4 text-xs text-slate-600">
              <div className="flex items-center gap-1">
                <StatusIcon className={`w-3.5 h-3.5 ${iconColor}`} />
                <span className="capitalize font-medium">{data.recommendation}</span>
              </div>
              <span>•</span>
              <span>EMA 12/21 ({data.timeframe})</span>
              <span>•</span>
              <span className="capitalize">{data.trend_strength} trend</span>
            </div>
          </div>
        </div>
        <div className="text-right">
          <div className="text-lg font-bold text-slate-900">
            ₹{data.current_price.toLocaleString("en-IN", { maximumFractionDigits: 0 })}
          </div>
          <div className="text-xs text-slate-500 mt-0.5">
            {data.ema_diff_percent > 0 ? "+" : ""}
            {data.ema_diff_percent.toFixed(2)}%
          </div>
        </div>
      </div>
      
      {/* Estimated Improvement Time (shown when market is bearish) */}
      {!isBullish && data.estimated_improvement_time && (
        <div className="mt-3 pt-3 border-t border-slate-200/50">
          <div className="flex items-start gap-2">
            <Clock className={`w-4 h-4 mt-0.5 ${iconColor}`} />
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xs font-semibold text-slate-900">
                  Estimated Time to Market Improvement:
                </span>
                {data.improvement_confidence && (
                  <span className={`text-xs px-2 py-0.5 rounded-full ${
                    data.improvement_confidence === "high" 
                      ? "bg-green-100 text-green-700"
                      : data.improvement_confidence === "medium"
                      ? "bg-yellow-100 text-yellow-700"
                      : "bg-gray-100 text-gray-700"
                  }`}>
                    {data.improvement_confidence === "high" ? "High" : data.improvement_confidence === "medium" ? "Medium" : "Low"} Confidence
                  </span>
                )}
              </div>
              {data.estimated_improvement_time.message ? (
                <p className="text-xs text-slate-600 italic">
                  {data.estimated_improvement_time.message}
                </p>
              ) : (
                <div className="flex items-center gap-4">
                  {data.estimated_improvement_time.days !== null && (
                    <div>
                      <span className="text-sm font-bold text-slate-900">
                        {data.estimated_improvement_time.days}
                      </span>
                      <span className="text-xs text-slate-600 ml-1">
                        {data.estimated_improvement_time.days === 1 ? "day" : "days"}
                      </span>
                    </div>
                  )}
                  {data.estimated_improvement_time.hours !== null && data.estimated_improvement_time.hours > 0 && (
                    <div>
                      <span className="text-sm font-bold text-slate-900">
                        {data.estimated_improvement_time.hours}
                      </span>
                      <span className="text-xs text-slate-600 ml-1">
                        {data.estimated_improvement_time.hours === 1 ? "hour" : "hours"}
                      </span>
                    </div>
                  )}
                  {data.estimated_improvement_date && (
                    <div className="ml-auto text-xs text-slate-500">
                      Target: {new Date(data.estimated_improvement_date).toLocaleDateString("en-IN", {
                        month: "short",
                        day: "numeric",
                        year: "numeric"
                      })}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
      
      {/* Show "Good to invest now" when bullish */}
      {isBullish && (
        <div className="mt-3 pt-3 border-t border-green-200/50">
          <div className="flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-green-600" />
            <span className="text-xs font-semibold text-green-700">
              Market conditions are favorable. Good time to start investing!
            </span>
          </div>
        </div>
      )}
      
      {data.last_updated && (
        <div className="mt-2 pt-2 border-t border-slate-200/50">
          <p className="text-xs text-slate-500">
            Last updated: {new Date(data.last_updated).toLocaleTimeString("en-IN")}
          </p>
        </div>
      )}
    </div>
  )
}

