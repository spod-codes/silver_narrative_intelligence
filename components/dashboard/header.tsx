'use client'

import { RefreshCw, Activity, Database } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { DataSourceStatus } from '@/lib/types'

interface HeaderProps {
  lastUpdated?: Date
  dataSources?: DataSourceStatus[]
  onRefresh?: () => void
  isLoading?: boolean
}

export function DashboardHeader({ lastUpdated, dataSources, onRefresh, isLoading }: HeaderProps) {
  const availableSources = dataSources?.filter(s => s.status === 'available').length ?? 0
  const totalSources = dataSources?.length ?? 0

  return (
    <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
      <div className="px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-md bg-primary/10 flex items-center justify-center">
                <Activity className="h-4 w-4 text-primary" />
              </div>
              <div>
                <h1 className="text-lg font-semibold tracking-tight text-foreground">
                  Silver Narrative Intelligence
                </h1>
                <p className="text-xs text-muted-foreground font-mono">
                  NARRATIVE & SENTIMENT ANALYSIS
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-4">
            {/* Data Sources Status */}
            <div className="flex items-center gap-2 text-xs font-mono">
              <Database className="h-3.5 w-3.5 text-muted-foreground" />
              <span className="text-muted-foreground">SOURCES:</span>
              <span className={availableSources > 0 ? 'text-bullish' : 'text-muted-foreground'}>
                {availableSources}/{totalSources}
              </span>
            </div>

            {/* Last Updated */}
            {lastUpdated && (
              <div className="text-xs font-mono text-muted-foreground">
                <span className="text-muted-foreground/60">UPDATED: </span>
                {new Date(lastUpdated).toLocaleTimeString()}
              </div>
            )}

            {/* Refresh Button */}
            <Button
              variant="outline"
              size="sm"
              onClick={onRefresh}
              disabled={isLoading}
              className="h-8 gap-2 font-mono text-xs bg-transparent"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${isLoading ? 'animate-spin' : ''}`} />
              REFRESH
            </Button>
          </div>
        </div>
      </div>
    </header>
  )
}
