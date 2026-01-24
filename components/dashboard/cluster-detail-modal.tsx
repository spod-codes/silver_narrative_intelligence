'use client'

import { X, TrendingUp, TrendingDown, Minus, ExternalLink, Zap, Users, Calendar } from 'lucide-react'
import { NarrativeCluster, SentimentType, LifecyclePhase } from '@/lib/types'
import { Button } from '@/components/ui/button'

interface ClusterDetailModalProps {
  cluster: NarrativeCluster | null
  onClose: () => void
}

const phaseConfig: Record<LifecyclePhase, { label: string; color: string; bg: string }> = {
  emergence: { label: 'EMERGENCE', color: 'text-emergence', bg: 'bg-emergence/10' },
  acceleration: { label: 'ACCELERATING', color: 'text-acceleration', bg: 'bg-acceleration/10' },
  peak: { label: 'PEAK', color: 'text-peak', bg: 'bg-peak/10' },
  decay: { label: 'DECAY', color: 'text-decay', bg: 'bg-decay/10' },
}

const sentimentConfig: Record<SentimentType, { icon: typeof TrendingUp; color: string; label: string }> = {
  bullish: { icon: TrendingUp, color: 'text-bullish', label: 'BULLISH' },
  bearish: { icon: TrendingDown, color: 'text-bearish', label: 'BEARISH' },
  neutral: { icon: Minus, color: 'text-neutral', label: 'NEUTRAL' },
}

export function ClusterDetailModal({ cluster, onClose }: ClusterDetailModalProps) {
  if (!cluster) return null

  const phase = phaseConfig[cluster.phase]
  const sentiment = sentimentConfig[cluster.sentiment]
  const SentimentIcon = sentiment.icon

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm">
      <div className="relative w-full max-w-2xl max-h-[90vh] overflow-hidden rounded-lg border border-border bg-card shadow-2xl">
        {/* Header */}
        <div className="border-b border-border px-6 py-4 flex items-start justify-between">
          <div>
            <h2 className="text-xl font-semibold text-foreground">{cluster.name}</h2>
            <p className="text-sm text-muted-foreground mt-1">{cluster.description}</p>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose} className="h-8 w-8">
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
          {/* Stats Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="rounded-lg border border-border p-3">
              <div className="flex items-center gap-2 text-muted-foreground">
                <SentimentIcon className={`h-4 w-4 ${sentiment.color}`} />
                <span className="text-[10px] font-mono">SENTIMENT</span>
              </div>
              <p className={`text-lg font-semibold mt-1 ${sentiment.color}`}>
                {sentiment.label}
              </p>
            </div>
            <div className="rounded-lg border border-border p-3">
              <div className="flex items-center gap-2 text-muted-foreground">
                <Zap className="h-4 w-4" />
                <span className="text-[10px] font-mono">PHASE</span>
              </div>
              <p className={`text-lg font-semibold mt-1 ${phase.color}`}>
                {phase.label}
              </p>
            </div>
            <div className="rounded-lg border border-border p-3">
              <div className="flex items-center gap-2 text-muted-foreground">
                <Users className="h-4 w-4" />
                <span className="text-[10px] font-mono">SOURCES</span>
              </div>
              <p className="text-lg font-semibold mt-1 text-foreground">
                {cluster.sourceCount}
              </p>
            </div>
            <div className="rounded-lg border border-border p-3">
              <div className="flex items-center gap-2 text-muted-foreground">
                <Calendar className="h-4 w-4" />
                <span className="text-[10px] font-mono">ITEMS</span>
              </div>
              <p className="text-lg font-semibold mt-1 text-foreground">
                {cluster.items.length}
              </p>
            </div>
          </div>

          {/* Strength & Velocity */}
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div>
              <p className="text-[10px] font-mono text-muted-foreground mb-2">NARRATIVE STRENGTH</p>
              <div className="flex items-center gap-3">
                <div className="flex-1 h-3 rounded-full bg-secondary overflow-hidden">
                  <div 
                    className="h-full rounded-full bg-primary transition-all"
                    style={{ width: `${cluster.strength}%` }}
                  />
                </div>
                <span className="text-sm font-mono font-semibold text-foreground">{cluster.strength}%</span>
              </div>
            </div>
            <div>
              <p className="text-[10px] font-mono text-muted-foreground mb-2">VELOCITY</p>
              <p className="text-2xl font-semibold text-foreground">
                {cluster.velocity.toFixed(2)}
                <span className="text-sm text-muted-foreground ml-1">posts/day</span>
              </p>
            </div>
          </div>

          {/* Keywords */}
          <div className="mb-6">
            <p className="text-[10px] font-mono text-muted-foreground mb-2">KEYWORDS</p>
            <div className="flex flex-wrap gap-2">
              {cluster.keywords.map((keyword) => (
                <span
                  key={keyword}
                  className="px-2 py-1 rounded-md bg-secondary text-xs font-mono text-foreground"
                >
                  {keyword}
                </span>
              ))}
            </div>
          </div>

          {/* Timeline */}
          <div className="mb-6">
            <p className="text-[10px] font-mono text-muted-foreground mb-2">TIMELINE</p>
            <div className="flex items-center gap-4 text-sm">
              <div>
                <span className="text-muted-foreground">First seen: </span>
                <span className="text-foreground font-medium">
                  {new Date(cluster.firstSeen).toLocaleDateString()}
                </span>
              </div>
              <div>
                <span className="text-muted-foreground">Last activity: </span>
                <span className="text-foreground font-medium">
                  {new Date(cluster.lastSeen).toLocaleDateString()}
                </span>
              </div>
            </div>
          </div>

          {/* Recent Items */}
          <div>
            <p className="text-[10px] font-mono text-muted-foreground mb-2">RECENT ITEMS</p>
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {cluster.items.slice(0, 10).map((item) => (
                <div key={item.id} className="p-3 rounded-md bg-secondary/50 border border-border">
                  <div className="flex items-start justify-between gap-2">
                    <h4 className="text-sm text-foreground line-clamp-2">{item.title}</h4>
                    {item.sourceUrl && (
                      <a
                        href={item.sourceUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-muted-foreground hover:text-foreground transition-colors flex-shrink-0"
                      >
                        <ExternalLink className="h-3.5 w-3.5" />
                      </a>
                    )}
                  </div>
                  <div className="mt-1 flex items-center gap-2 text-[10px] font-mono text-muted-foreground">
                    <span>{item.source}</span>
                    <span>•</span>
                    <span>{new Date(item.publishedAt).toLocaleDateString()}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
