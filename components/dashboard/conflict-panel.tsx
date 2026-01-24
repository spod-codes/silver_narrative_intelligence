'use client'

import { AlertTriangle, Swords, Split, GitCompare } from 'lucide-react'
import { ConflictingNarratives } from '@/lib/types'

interface ConflictPanelProps {
  conflicts: ConflictingNarratives[]
}

const conflictTypeConfig = {
  opposing: { icon: Swords, label: 'OPPOSING', color: 'text-bearish', bg: 'bg-bearish/10' },
  contradictory: { icon: Split, label: 'CONTRADICTORY', color: 'text-neutral', bg: 'bg-neutral/10' },
  competing: { icon: GitCompare, label: 'COMPETING', color: 'text-chart-4', bg: 'bg-chart-4/10' },
}

export function ConflictPanel({ conflicts }: ConflictPanelProps) {
  if (conflicts.length === 0) {
    return (
      <div className="rounded-lg border border-border bg-card">
        <div className="border-b border-border px-4 py-3">
          <h3 className="text-xs font-mono font-semibold text-muted-foreground tracking-wider">
            NARRATIVE CONFLICTS
          </h3>
        </div>
        <div className="p-4 flex flex-col items-center justify-center gap-2 text-center">
          <div className="h-10 w-10 rounded-full bg-bullish/10 flex items-center justify-center">
            <AlertTriangle className="h-5 w-5 text-bullish" />
          </div>
          <p className="text-sm text-muted-foreground font-mono">NO CONFLICTS DETECTED</p>
          <p className="text-[10px] text-muted-foreground/60 max-w-[200px]">
            Narratives are currently aligned without significant contradictions
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="rounded-lg border border-border bg-card">
      <div className="border-b border-border px-4 py-3 flex items-center justify-between">
        <h3 className="text-xs font-mono font-semibold text-muted-foreground tracking-wider">
          NARRATIVE CONFLICTS
        </h3>
        <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-bearish/10 text-bearish">
          {conflicts.length} DETECTED
        </span>
      </div>
      <div className="divide-y divide-border">
        {conflicts.slice(0, 5).map((conflict, index) => {
          const config = conflictTypeConfig[conflict.conflictType]
          const Icon = config.icon

          return (
            <div key={index} className="p-4">
              <div className="flex items-start gap-3">
                <div className={`h-8 w-8 rounded-md ${config.bg} flex items-center justify-center flex-shrink-0`}>
                  <Icon className={`h-4 w-4 ${config.color}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className={`text-[10px] font-mono font-medium ${config.color}`}>
                      {config.label}
                    </span>
                  </div>
                  <div className="mt-1 flex items-center gap-2 text-sm">
                    <span className="font-medium text-foreground truncate">
                      {conflict.narrative1.name}
                    </span>
                    <span className="text-muted-foreground">vs</span>
                    <span className="font-medium text-foreground truncate">
                      {conflict.narrative2.name}
                    </span>
                  </div>
                  <p className="mt-1 text-xs text-muted-foreground line-clamp-2">
                    {conflict.description}
                  </p>
                </div>
              </div>
            </div>
          )
        })}
      </div>
      {conflicts.length > 5 && (
        <div className="border-t border-border px-4 py-2 text-center">
          <span className="text-[10px] font-mono text-muted-foreground">
            +{conflicts.length - 5} more conflicts
          </span>
        </div>
      )}
    </div>
  )
}
