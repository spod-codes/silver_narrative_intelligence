'use client'

import { useMemo } from 'react'
import { NewsVolumeData } from '@/lib/types'

interface NewsVolumeHeatmapProps {
  data: NewsVolumeData[]
}

export function NewsVolumeHeatmap({ data }: NewsVolumeHeatmapProps) {
  const maxCount = useMemo(() => {
    return Math.max(...data.map(d => d.count), 1)
  }, [data])

  const getHeatColor = (count: number): string => {
    const intensity = count / maxCount
    if (intensity === 0) return 'bg-secondary'
    if (intensity < 0.25) return 'bg-chart-4/20'
    if (intensity < 0.5) return 'bg-chart-4/40'
    if (intensity < 0.75) return 'bg-chart-4/60'
    return 'bg-chart-4/80'
  }

  if (data.length === 0) {
    return (
      <div className="rounded-lg border border-border bg-card">
        <div className="border-b border-border px-4 py-3">
          <h3 className="text-xs font-mono font-semibold text-muted-foreground tracking-wider">
            NEWS VOLUME HEATMAP
          </h3>
        </div>
        <div className="h-32 flex items-center justify-center">
          <p className="text-sm text-muted-foreground font-mono">DATA UNAVAILABLE</p>
        </div>
      </div>
    )
  }

  return (
    <div className="rounded-lg border border-border bg-card">
      <div className="border-b border-border px-4 py-3 flex items-center justify-between">
        <h3 className="text-xs font-mono font-semibold text-muted-foreground tracking-wider">
          NEWS VOLUME HEATMAP
        </h3>
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-mono text-muted-foreground">INTENSITY</span>
          <div className="flex gap-0.5">
            <div className="h-3 w-3 rounded-sm bg-secondary" />
            <div className="h-3 w-3 rounded-sm bg-chart-4/20" />
            <div className="h-3 w-3 rounded-sm bg-chart-4/40" />
            <div className="h-3 w-3 rounded-sm bg-chart-4/60" />
            <div className="h-3 w-3 rounded-sm bg-chart-4/80" />
          </div>
        </div>
      </div>
      <div className="p-4">
        <div className="flex gap-1.5 overflow-x-auto pb-2">
          {data.map((day) => (
            <div key={day.date} className="flex flex-col items-center gap-1 min-w-[40px]">
              <div
                className={`h-10 w-10 rounded-md ${getHeatColor(day.count)} flex items-center justify-center transition-colors`}
                title={`${day.date}: ${day.count} items from ${day.sources.length} sources`}
              >
                <span className="text-xs font-mono text-foreground font-semibold">
                  {day.count > 0 ? day.count : '-'}
                </span>
              </div>
              <span className="text-[9px] font-mono text-muted-foreground">
                {new Date(day.date).toLocaleDateString('en-US', { weekday: 'short' })}
              </span>
            </div>
          ))}
        </div>
        
        {/* Summary */}
        <div className="mt-3 pt-3 border-t border-border flex items-center justify-between">
          <div className="text-[10px] font-mono text-muted-foreground">
            <span className="text-foreground font-semibold">
              {data.reduce((sum, d) => sum + d.count, 0)}
            </span>
            {' '}total mentions
          </div>
          <div className="text-[10px] font-mono text-muted-foreground">
            Peak: <span className="text-foreground font-semibold">{maxCount}</span>
          </div>
        </div>
      </div>
    </div>
  )
}
