'use client'

import { useMemo, useState } from 'react'
import { NarrativeCluster, LifecyclePhase, SentimentType } from '@/lib/types'
import { TrendingUp, TrendingDown, Minus, Info } from 'lucide-react'

interface NarrativeMapProps {
  clusters: NarrativeCluster[]
  onClusterSelect?: (cluster: NarrativeCluster) => void
}

const phaseStyles: Record<LifecyclePhase, string> = {
  emergence: 'border-emergence border-dashed',
  acceleration: 'border-acceleration border-solid',
  peak: 'border-peak border-double border-2',
  decay: 'border-decay border-dotted',
}

const sentimentColors: Record<SentimentType, string> = {
  bullish: 'bg-bullish/20',
  bearish: 'bg-bearish/20',
  neutral: 'bg-neutral/20',
}

const SentimentIcon = ({ sentiment }: { sentiment: SentimentType }) => {
  switch (sentiment) {
    case 'bullish':
      return <TrendingUp className="h-3 w-3 text-bullish" />
    case 'bearish':
      return <TrendingDown className="h-3 w-3 text-bearish" />
    default:
      return <Minus className="h-3 w-3 text-neutral" />
  }
}

export function NarrativeMap({ clusters, onClusterSelect }: NarrativeMapProps) {
  const [hoveredCluster, setHoveredCluster] = useState<string | null>(null)

  // Calculate positions for clusters in a force-directed-like layout
  const positionedClusters = useMemo(() => {
    if (clusters.length === 0) return []

    // Simple circular layout with size based on strength
    const centerX = 50
    const centerY = 50
    const maxRadius = 35

    return clusters.map((cluster, index) => {
      const angle = (index / clusters.length) * 2 * Math.PI - Math.PI / 2
      const distanceFromCenter = maxRadius * (1 - cluster.strength / 150)
      
      return {
        cluster,
        x: centerX + Math.cos(angle) * distanceFromCenter,
        y: centerY + Math.sin(angle) * distanceFromCenter,
        size: Math.max(40, Math.min(80, cluster.strength * 0.8)),
      }
    })
  }, [clusters])

  if (clusters.length === 0) {
    return (
      <div className="rounded-lg border border-border bg-card">
        <div className="border-b border-border px-4 py-3">
          <h3 className="text-xs font-mono font-semibold text-muted-foreground tracking-wider">
            NARRATIVE MAP
          </h3>
        </div>
        <div className="h-80 flex flex-col items-center justify-center gap-2">
          <Info className="h-6 w-6 text-muted-foreground" />
          <p className="text-sm text-muted-foreground font-mono">NO NARRATIVES TO DISPLAY</p>
          <p className="text-[10px] text-muted-foreground/60 max-w-[200px] text-center">
            Narrative clusters will appear here once data is available
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="rounded-lg border border-border bg-card">
      <div className="border-b border-border px-4 py-3 flex items-center justify-between">
        <h3 className="text-xs font-mono font-semibold text-muted-foreground tracking-wider">
          NARRATIVE MAP
        </h3>
        <div className="flex items-center gap-4 text-[10px] font-mono text-muted-foreground">
          <div className="flex items-center gap-1.5">
            <div className="h-2 w-2 rounded-full bg-bullish/50" />
            <span>Bullish</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="h-2 w-2 rounded-full bg-bearish/50" />
            <span>Bearish</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="h-2 w-2 rounded-full bg-neutral/50" />
            <span>Neutral</span>
          </div>
        </div>
      </div>
      
      {/* Map Container */}
      <div className="relative h-80 overflow-hidden">
        {/* Background Grid */}
        <svg className="absolute inset-0 w-full h-full" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
              <path d="M 20 0 L 0 0 0 20" fill="none" stroke="var(--border)" strokeWidth="0.5" opacity="0.3" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid)" />
        </svg>

        {/* Cluster Nodes */}
        {positionedClusters.map(({ cluster, x, y, size }) => {
          const isHovered = hoveredCluster === cluster.id

          return (
            <div
              key={cluster.id}
              className={`absolute transform -translate-x-1/2 -translate-y-1/2 transition-all duration-300 cursor-pointer ${
                isHovered ? 'z-20 scale-110' : 'z-10'
              }`}
              style={{
                left: `${x}%`,
                top: `${y}%`,
              }}
              onMouseEnter={() => setHoveredCluster(cluster.id)}
              onMouseLeave={() => setHoveredCluster(null)}
              onClick={() => onClusterSelect?.(cluster)}
            >
              {/* Node */}
              <div
                className={`rounded-full border-2 flex flex-col items-center justify-center transition-all ${
                  sentimentColors[cluster.sentiment]
                } ${phaseStyles[cluster.phase]} ${
                  isHovered ? 'shadow-lg shadow-primary/20' : ''
                }`}
                style={{
                  width: `${size}px`,
                  height: `${size}px`,
                }}
              >
                <SentimentIcon sentiment={cluster.sentiment} />
                <span className="text-[8px] font-mono font-semibold text-foreground text-center px-1 mt-0.5 leading-tight line-clamp-2">
                  {cluster.name.split(' ').slice(0, 2).join(' ')}
                </span>
              </div>

              {/* Tooltip on hover */}
              {isHovered && (
                <div className="absolute left-1/2 -translate-x-1/2 top-full mt-2 bg-popover border border-border rounded-md p-2 shadow-lg min-w-[150px] z-30">
                  <p className="text-xs font-semibold text-foreground">{cluster.name}</p>
                  <div className="mt-1 space-y-0.5 text-[10px] font-mono text-muted-foreground">
                    <p>Strength: <span className="text-foreground">{cluster.strength}</span></p>
                    <p>Phase: <span className="text-foreground capitalize">{cluster.phase}</span></p>
                    <p>Items: <span className="text-foreground">{cluster.items.length}</span></p>
                  </div>
                </div>
              )}
            </div>
          )
        })}

        {/* Legend for lifecycle phases */}
        <div className="absolute bottom-4 left-4 flex flex-col gap-1.5 text-[9px] font-mono text-muted-foreground bg-card/80 backdrop-blur-sm p-2 rounded border border-border">
          <p className="font-semibold text-foreground text-[10px]">LIFECYCLE</p>
          <div className="flex items-center gap-1.5">
            <div className="w-4 h-2 border border-emergence border-dashed rounded-sm" />
            <span>Emergence</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-4 h-2 border border-acceleration rounded-sm" />
            <span>Acceleration</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-4 h-2 border-2 border-peak border-double rounded-sm" />
            <span>Peak</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-4 h-2 border border-decay border-dotted rounded-sm" />
            <span>Decay</span>
          </div>
        </div>
      </div>
    </div>
  )
}
