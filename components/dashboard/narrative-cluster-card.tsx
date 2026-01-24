'use client'

import { TrendingUp, TrendingDown, Minus, Zap, Clock, Users } from 'lucide-react'
import { NarrativeCluster, LifecyclePhase, SentimentType } from '@/lib/types'

interface NarrativeClusterCardProps {
  cluster: NarrativeCluster
  onClick?: () => void
}

const phaseConfig: Record<LifecyclePhase, { label: string; color: string; bg: string }> = {
  emergence: { label: 'EMERGENCE', color: 'text-emergence', bg: 'bg-emergence/10 border-emergence/30' },
  acceleration: { label: 'ACCELERATING', color: 'text-acceleration', bg: 'bg-acceleration/10 border-acceleration/30' },
  peak: { label: 'PEAK', color: 'text-peak', bg: 'bg-peak/10 border-peak/30' },
  decay: { label: 'DECAY', color: 'text-decay', bg: 'bg-decay/10 border-decay/30' },
}

const sentimentConfig: Record<SentimentType, { icon: typeof TrendingUp; color: string }> = {
  bullish: { icon: TrendingUp, color: 'text-bullish' },
  bearish: { icon: TrendingDown, color: 'text-bearish' },
  neutral: { icon: Minus, color: 'text-neutral' },
}

export function NarrativeClusterCard({ cluster, onClick }: NarrativeClusterCardProps) {
  const phase = phaseConfig[cluster.phase]
  const sentiment = sentimentConfig[cluster.sentiment]
  const SentimentIcon = sentiment.icon

  return (
    <div
      onClick={onClick}
      className={`rounded-lg border bg-card p-4 transition-all hover:border-primary/50 cursor-pointer ${
        onClick ? 'hover:bg-card/80' : ''
      }`}
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-foreground truncate">{cluster.name}</h3>
          <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">
            {cluster.description}
          </p>
        </div>
        <div className={`flex items-center gap-1 ${sentiment.color}`}>
          <SentimentIcon className="h-4 w-4" />
        </div>
      </div>

      {/* Phase Badge */}
      <div className="mt-3">
        <span className={`inline-flex items-center gap-1.5 rounded-md border px-2 py-1 text-[10px] font-mono font-medium ${phase.bg} ${phase.color}`}>
          <Zap className="h-3 w-3" />
          {phase.label}
        </span>
      </div>

      {/* Stats */}
      <div className="mt-4 grid grid-cols-3 gap-3">
        <div>
          <p className="text-[10px] font-mono text-muted-foreground">STRENGTH</p>
          <div className="mt-1 flex items-center gap-2">
            <div className="h-1.5 flex-1 rounded-full bg-secondary overflow-hidden">
              <div 
                className="h-full rounded-full bg-primary transition-all"
                style={{ width: `${cluster.strength}%` }}
              />
            </div>
            <span className="text-xs font-mono text-foreground">{cluster.strength}</span>
          </div>
        </div>
        <div>
          <p className="text-[10px] font-mono text-muted-foreground">VELOCITY</p>
          <p className="text-sm font-semibold text-foreground mt-1">
            {cluster.velocity.toFixed(1)}
            <span className="text-[10px] text-muted-foreground">/day</span>
          </p>
        </div>
        <div>
          <p className="text-[10px] font-mono text-muted-foreground">SOURCES</p>
          <div className="flex items-center gap-1 mt-1">
            <Users className="h-3 w-3 text-muted-foreground" />
            <span className="text-sm font-semibold text-foreground">{cluster.sourceCount}</span>
          </div>
        </div>
      </div>

      {/* Keywords */}
      <div className="mt-3 flex flex-wrap gap-1.5">
        {cluster.keywords.slice(0, 4).map((keyword) => (
          <span
            key={keyword}
            className="inline-flex items-center rounded-sm bg-secondary px-1.5 py-0.5 text-[10px] font-mono text-muted-foreground"
          >
            {keyword}
          </span>
        ))}
        {cluster.keywords.length > 4 && (
          <span className="text-[10px] text-muted-foreground">
            +{cluster.keywords.length - 4}
          </span>
        )}
      </div>

      {/* Footer */}
      <div className="mt-3 pt-3 border-t border-border flex items-center justify-between text-[10px] font-mono text-muted-foreground">
        <div className="flex items-center gap-1">
          <Clock className="h-3 w-3" />
          <span>{cluster.items.length} items</span>
        </div>
        <span>
          Last: {new Date(cluster.lastSeen).toLocaleDateString()}
        </span>
      </div>
    </div>
  )
}
