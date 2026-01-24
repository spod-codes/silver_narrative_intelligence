'use client'

import { useMemo } from 'react'
import { Area, AreaChart, ResponsiveContainer, XAxis, YAxis, Tooltip } from 'recharts'
import { NarrativeVelocity } from '@/lib/types'

interface VelocityChartProps {
  data: NarrativeVelocity[]
  title?: string
}

export function VelocityChart({ data, title = 'Narrative Velocity' }: VelocityChartProps) {
  const chartData = useMemo(() => {
    return data.map(d => ({
      ...d,
      dateLabel: new Date(d.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
    }))
  }, [data])

  if (data.length === 0) {
    return (
      <div className="rounded-lg border border-border bg-card">
        <div className="border-b border-border px-4 py-3">
          <h3 className="text-xs font-mono font-semibold text-muted-foreground tracking-wider">
            {title.toUpperCase()}
          </h3>
        </div>
        <div className="h-48 flex items-center justify-center">
          <p className="text-sm text-muted-foreground font-mono">DATA UNAVAILABLE</p>
        </div>
      </div>
    )
  }

  return (
    <div className="rounded-lg border border-border bg-card">
      <div className="border-b border-border px-4 py-3 flex items-center justify-between">
        <h3 className="text-xs font-mono font-semibold text-muted-foreground tracking-wider">
          {title.toUpperCase()}
        </h3>
        <div className="flex items-center gap-4 text-[10px] font-mono">
          <div className="flex items-center gap-1.5">
            <div className="h-2 w-2 rounded-full bg-chart-1" />
            <span className="text-muted-foreground">Posts</span>
          </div>
        </div>
      </div>
      <div className="p-4">
        <div className="h-48">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData} margin={{ top: 5, right: 5, bottom: 5, left: 0 }}>
              <defs>
                <linearGradient id="velocityGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="var(--chart-1)" stopOpacity={0.3} />
                  <stop offset="100%" stopColor="var(--chart-1)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis
                dataKey="dateLabel"
                axisLine={false}
                tickLine={false}
                tick={{ fill: 'var(--muted-foreground)', fontSize: 10, fontFamily: 'var(--font-mono)' }}
                dy={10}
              />
              <YAxis
                axisLine={false}
                tickLine={false}
                tick={{ fill: 'var(--muted-foreground)', fontSize: 10, fontFamily: 'var(--font-mono)' }}
                width={30}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'var(--card)',
                  border: '1px solid var(--border)',
                  borderRadius: '0.5rem',
                  fontSize: '12px',
                  fontFamily: 'var(--font-mono)'
                }}
                labelStyle={{ color: 'var(--foreground)' }}
                itemStyle={{ color: 'var(--chart-1)' }}
              />
              <Area
                type="monotone"
                dataKey="postCount"
                stroke="var(--chart-1)"
                strokeWidth={2}
                fill="url(#velocityGradient)"
                name="Posts"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  )
}
