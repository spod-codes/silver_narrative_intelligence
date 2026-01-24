'use client'

import { useMemo } from 'react'
import { TrendingUp, TrendingDown, Minus } from 'lucide-react'
import { NarrativeItem, SentimentType } from '@/lib/types'

interface SentimentDistributionProps {
  items: NarrativeItem[]
}

export function SentimentDistribution({ items }: SentimentDistributionProps) {
  const distribution = useMemo(() => {
    const counts = { bullish: 0, bearish: 0, neutral: 0 }
    items.forEach(item => counts[item.sentiment]++)
    
    const total = items.length || 1
    return {
      bullish: { count: counts.bullish, percent: Math.round((counts.bullish / total) * 100) },
      bearish: { count: counts.bearish, percent: Math.round((counts.bearish / total) * 100) },
      neutral: { count: counts.neutral, percent: Math.round((counts.neutral / total) * 100) },
    }
  }, [items])

  const dominantSentiment = useMemo((): SentimentType => {
    if (distribution.bullish.count >= distribution.bearish.count && 
        distribution.bullish.count >= distribution.neutral.count) {
      return 'bullish'
    }
    if (distribution.bearish.count >= distribution.neutral.count) {
      return 'bearish'
    }
    return 'neutral'
  }, [distribution])

  if (items.length === 0) {
    return (
      <div className="rounded-lg border border-border bg-card">
        <div className="border-b border-border px-4 py-3">
          <h3 className="text-xs font-mono font-semibold text-muted-foreground tracking-wider">
            SENTIMENT DISTRIBUTION
          </h3>
        </div>
        <div className="h-40 flex items-center justify-center">
          <p className="text-sm text-muted-foreground font-mono">DATA UNAVAILABLE</p>
        </div>
      </div>
    )
  }

  return (
    <div className="rounded-lg border border-border bg-card">
      <div className="border-b border-border px-4 py-3 flex items-center justify-between">
        <h3 className="text-xs font-mono font-semibold text-muted-foreground tracking-wider">
          SENTIMENT DISTRIBUTION
        </h3>
        <span className="text-[10px] font-mono text-muted-foreground">
          {items.length} ITEMS
        </span>
      </div>
      <div className="p-4">
        {/* Dominant Sentiment */}
        <div className="mb-4 text-center">
          <p className="text-[10px] font-mono text-muted-foreground mb-1">DOMINANT</p>
          <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-md ${
            dominantSentiment === 'bullish' ? 'bg-bullish/10 text-bullish' :
            dominantSentiment === 'bearish' ? 'bg-bearish/10 text-bearish' :
            'bg-neutral/10 text-neutral'
          }`}>
            {dominantSentiment === 'bullish' && <TrendingUp className="h-4 w-4" />}
            {dominantSentiment === 'bearish' && <TrendingDown className="h-4 w-4" />}
            {dominantSentiment === 'neutral' && <Minus className="h-4 w-4" />}
            <span className="text-sm font-semibold uppercase">{dominantSentiment}</span>
          </div>
        </div>

        {/* Distribution Bars */}
        <div className="space-y-3">
          {/* Bullish */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <div className="flex items-center gap-1.5">
                <TrendingUp className="h-3 w-3 text-bullish" />
                <span className="text-xs font-mono text-muted-foreground">BULLISH</span>
              </div>
              <span className="text-xs font-mono text-foreground">
                {distribution.bullish.count} ({distribution.bullish.percent}%)
              </span>
            </div>
            <div className="h-2 rounded-full bg-secondary overflow-hidden">
              <div 
                className="h-full rounded-full bg-bullish transition-all duration-500"
                style={{ width: `${distribution.bullish.percent}%` }}
              />
            </div>
          </div>

          {/* Bearish */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <div className="flex items-center gap-1.5">
                <TrendingDown className="h-3 w-3 text-bearish" />
                <span className="text-xs font-mono text-muted-foreground">BEARISH</span>
              </div>
              <span className="text-xs font-mono text-foreground">
                {distribution.bearish.count} ({distribution.bearish.percent}%)
              </span>
            </div>
            <div className="h-2 rounded-full bg-secondary overflow-hidden">
              <div 
                className="h-full rounded-full bg-bearish transition-all duration-500"
                style={{ width: `${distribution.bearish.percent}%` }}
              />
            </div>
          </div>

          {/* Neutral */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <div className="flex items-center gap-1.5">
                <Minus className="h-3 w-3 text-neutral" />
                <span className="text-xs font-mono text-muted-foreground">NEUTRAL</span>
              </div>
              <span className="text-xs font-mono text-foreground">
                {distribution.neutral.count} ({distribution.neutral.percent}%)
              </span>
            </div>
            <div className="h-2 rounded-full bg-secondary overflow-hidden">
              <div 
                className="h-full rounded-full bg-neutral transition-all duration-500"
                style={{ width: `${distribution.neutral.percent}%` }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
