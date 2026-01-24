'use client'

import { CheckCircle2, XCircle, AlertCircle } from 'lucide-react'
import { DataSourceStatus } from '@/lib/types'

interface DataStatusPanelProps {
  sources: DataSourceStatus[]
}

export function DataStatusPanel({ sources }: DataStatusPanelProps) {
  if (sources.length === 0) {
    return (
      <div className="rounded-lg border border-border bg-card p-4">
        <div className="flex items-center gap-2 text-muted-foreground">
          <AlertCircle className="h-4 w-4" />
          <span className="text-sm font-mono">NO DATA SOURCES CONFIGURED</span>
        </div>
      </div>
    )
  }

  return (
    <div className="rounded-lg border border-border bg-card">
      <div className="border-b border-border px-4 py-3">
        <h3 className="text-xs font-mono font-semibold text-muted-foreground tracking-wider">
          DATA SOURCE STATUS
        </h3>
      </div>
      <div className="p-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {sources.map((source) => (
            <div
              key={source.name}
              className={`rounded-md border p-3 ${
                source.status === 'available'
                  ? 'border-bullish/30 bg-bullish/5'
                  : source.status === 'partial'
                    ? 'border-neutral/30 bg-neutral/5'
                    : 'border-border bg-card'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono text-foreground">
                  {source.name}
                </span>
                {source.status === 'available' ? (
                  <CheckCircle2 className="h-3.5 w-3.5 text-bullish" />
                ) : source.status === 'partial' ? (
                  <AlertCircle className="h-3.5 w-3.5 text-neutral" />
                ) : (
                  <XCircle className="h-3.5 w-3.5 text-muted-foreground" />
                )}
              </div>
              <div className="mt-2">
                <span className="text-lg font-semibold text-foreground">
                  {source.itemCount}
                </span>
                <span className="text-xs text-muted-foreground ml-1">items</span>
              </div>
              {source.status === 'unavailable' && (
                <p className="mt-1 text-[10px] font-mono text-muted-foreground">
                  UNAVAILABLE
                </p>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
