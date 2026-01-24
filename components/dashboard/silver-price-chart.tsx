'use client'

import { useMemo } from 'react'
import {
  Area,
  AreaChart,
  ResponsiveContainer,
  XAxis,
  YAxis,
  Tooltip,
  ReferenceLine
} from 'recharts'
import { TrendingUp, TrendingDown, Minus, AlertCircle, DollarSign } from 'lucide-react'
import { SilverPriceData } from '@/lib/types'
import { calculatePriceTrend, getSupportResistance } from '@/lib/services/silver-price-service'

interface SilverPriceChartProps {
  data: SilverPriceData | null
}

export function SilverPriceChart({ data }: SilverPriceChartProps) {
  const trend = useMemo(() => {
    if (!data?.available || !data.priceHistory.length) return 'unknown'
    return calculatePriceTrend(data.priceHistory)
  }, [data])

  const levels = useMemo(() => {
    if (!data?.priceHistory) return null
    return getSupportResistance(data.priceHistory)
  }, [data])

  const chartData = useMemo(() => {
    if (!data?.priceHistory) return []
    return data.priceHistory.map(d => ({
      ...d,
      dateLabel: new Date(d.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
    }))
  }, [data])

  const priceRange = useMemo(() => {
    if (!chartData.length) return { min: 0, max: 100 }
    const prices = chartData.map(d => d.price)
    const min = Math.min(...prices) * 0.98
    const max = Math.max(...prices) * 1.02
    return { min: parseFloat(min.toFixed(2)), max: parseFloat(max.toFixed(2)) }
  }, [chartData])

  if (!data?.available || chartData.length === 0) {
    return (
      <div className="rounded-lg border border-border bg-card">
        <div className="border-b border-border px-4 py-3">
          <h3 className="text-xs font-mono font-semibold text-muted-foreground tracking-wider">
            SILVER PRICE (XAG/USD)
          </h3>
        </div>
        <div className="h-64 flex flex-col items-center justify-center gap-2">
          <AlertCircle className="h-5 w-5 text-muted-foreground" />
          <p className="text-sm text-muted-foreground font-mono">PRICE DATA UNAVAILABLE</p>
          <p className="text-[10px] text-muted-foreground/60 font-mono max-w-[200px] text-center">
            Silver price data could not be fetched from market data providers.
          </p>
        </div>
      </div>
    )
  }

  const isPositive = data.change24h >= 0

  return (
    <div className="rounded-lg border border-border bg-card">
      {/* Header with current price */}
      <div className="border-b border-border px-4 py-3">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-xs font-mono font-semibold text-muted-foreground tracking-wider">
              SILVER PRICE (XAG/USD)
            </h3>
            <div className="flex items-baseline gap-3 mt-1">
              <span className="text-2xl font-mono font-bold text-foreground">
                ${data.currentPrice.toFixed(2)}
              </span>
              <span className={`text-sm font-mono font-medium ${isPositive ? 'text-bullish' : 'text-bearish'}`}>
                {isPositive ? '+' : ''}{data.change24h.toFixed(2)} ({isPositive ? '+' : ''}{data.changePercent24h.toFixed(2)}%)
              </span>
            </div>
          </div>
          <div className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-md ${
            trend === 'rising' ? 'bg-bullish/10 text-bullish' :
            trend === 'falling' ? 'bg-bearish/10 text-bearish' :
            'bg-muted text-muted-foreground'
          }`}>
            {trend === 'rising' && <TrendingUp className="h-4 w-4" />}
            {trend === 'falling' && <TrendingDown className="h-4 w-4" />}
            {(trend === 'stable' || trend === 'unknown') && <Minus className="h-4 w-4" />}
            <span className="text-xs font-mono font-medium uppercase">
              {trend === 'unknown' ? 'N/A' : trend}
            </span>
          </div>
        </div>
      </div>

      {/* Price stats */}
      <div className="grid grid-cols-4 border-b border-border">
        <div className="px-3 py-2 border-r border-border">
          <p className="text-[10px] font-mono text-muted-foreground">24H HIGH</p>
          <p className="text-sm font-mono font-medium text-foreground">${data.high24h.toFixed(2)}</p>
        </div>
        <div className="px-3 py-2 border-r border-border">
          <p className="text-[10px] font-mono text-muted-foreground">24H LOW</p>
          <p className="text-sm font-mono font-medium text-foreground">${data.low24h.toFixed(2)}</p>
        </div>
        <div className="px-3 py-2 border-r border-border">
          <p className="text-[10px] font-mono text-muted-foreground">SUPPORT</p>
          <p className="text-sm font-mono font-medium text-bearish">
            {levels ? `$${levels.support.toFixed(2)}` : 'N/A'}
          </p>
        </div>
        <div className="px-3 py-2">
          <p className="text-[10px] font-mono text-muted-foreground">RESISTANCE</p>
          <p className="text-sm font-mono font-medium text-bullish">
            {levels ? `$${levels.resistance.toFixed(2)}` : 'N/A'}
          </p>
        </div>
      </div>

      {/* Chart */}
      <div className="p-4">
        <div className="h-48">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData} margin={{ top: 5, right: 5, bottom: 5, left: 0 }}>
              <defs>
                <linearGradient id="silverGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={isPositive ? 'var(--bullish)' : 'var(--bearish)'} stopOpacity={0.3} />
                  <stop offset="95%" stopColor={isPositive ? 'var(--bullish)' : 'var(--bearish)'} stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis
                dataKey="dateLabel"
                axisLine={false}
                tickLine={false}
                tick={{ fill: 'var(--muted-foreground)', fontSize: 10, fontFamily: 'var(--font-mono)' }}
                dy={10}
                interval="preserveStartEnd"
              />
              <YAxis
                axisLine={false}
                tickLine={false}
                tick={{ fill: 'var(--muted-foreground)', fontSize: 10, fontFamily: 'var(--font-mono)' }}
                width={45}
                domain={[priceRange.min, priceRange.max]}
                tickFormatter={(value) => `$${value}`}
              />
              {levels && (
                <>
                  <ReferenceLine
                    y={levels.support}
                    stroke="var(--bearish)"
                    strokeDasharray="3 3"
                    strokeOpacity={0.5}
                  />
                  <ReferenceLine
                    y={levels.resistance}
                    stroke="var(--bullish)"
                    strokeDasharray="3 3"
                    strokeOpacity={0.5}
                  />
                </>
              )}
              <Tooltip
                contentStyle={{
                  backgroundColor: 'var(--card)',
                  border: '1px solid var(--border)',
                  borderRadius: '0.5rem',
                  fontSize: '12px',
                  fontFamily: 'var(--font-mono)'
                }}
                labelStyle={{ color: 'var(--foreground)', fontWeight: 'bold' }}
                formatter={(value: number) => [`$${value.toFixed(2)}`, 'Price']}
              />
              <Area
                type="monotone"
                dataKey="price"
                stroke={isPositive ? 'var(--bullish)' : 'var(--bearish)'}
                strokeWidth={2}
                fill="url(#silverGradient)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
        <p className="text-[10px] font-mono text-muted-foreground/60 text-center mt-2">
          90-DAY PRICE HISTORY • DATA FROM YAHOO FINANCE
        </p>
      </div>
    </div>
  )
}
