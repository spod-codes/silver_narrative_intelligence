'use client'

import { ExternalLink, TrendingUp, TrendingDown, Minus } from 'lucide-react'
import { NarrativeItem, SentimentType } from '@/lib/types'

interface RecentNarrativesFeedProps {
  items: NarrativeItem[]
  maxItems?: number
}

const sentimentConfig: Record<SentimentType, { icon: typeof TrendingUp; color: string; bg: string }> = {
  bullish: { icon: TrendingUp, color: 'text-bullish', bg: 'bg-bullish/10' },
  bearish: { icon: TrendingDown, color: 'text-bearish', bg: 'bg-bearish/10' },
  neutral: { icon: Minus, color: 'text-neutral', bg: 'bg-neutral/10' },
}

export function RecentNarrativesFeed({ items, maxItems = 10 }: RecentNarrativesFeedProps) {
  const sortedItems = [...items]
    .sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime())
    .slice(0, maxItems)

  if (sortedItems.length === 0) {
    return (
      <div className="rounded-lg border border-border bg-card">
        <div className="border-b border-border px-4 py-3">
          <h3 className="text-xs font-mono font-semibold text-muted-foreground tracking-wider">
            RECENT NARRATIVES
          </h3>
        </div>
        <div className="h-64 flex items-center justify-center">
          <p className="text-sm text-muted-foreground font-mono">NO RECENT DATA</p>
        </div>
      </div>
    )
  }

  return (
    <div className="rounded-lg border border-border bg-card">
      <div className="border-b border-border px-4 py-3 flex items-center justify-between">
        <h3 className="text-xs font-mono font-semibold text-muted-foreground tracking-wider">
          RECENT NARRATIVES
        </h3>
        <span className="text-[10px] font-mono text-muted-foreground">
          LIVE FEED
        </span>
      </div>
      <div className="divide-y divide-border max-h-[400px] overflow-y-auto">
        {sortedItems.map((item) => {
          const sentiment = sentimentConfig[item.sentiment]
          const SentimentIcon = sentiment.icon

          return (
            <div key={item.id} className="p-3 hover:bg-accent/50 transition-colors">
              <div className="flex items-start gap-3">
                <div className={`h-7 w-7 rounded-md ${sentiment.bg} flex items-center justify-center flex-shrink-0 mt-0.5`}>
                  <SentimentIcon className={`h-3.5 w-3.5 ${sentiment.color}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <h4 className="text-sm font-medium text-foreground line-clamp-2 leading-snug">
                      {item.title}
                    </h4>
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
                  <div className="mt-1.5 flex items-center gap-2 flex-wrap">
                    <span className="text-[10px] font-mono text-muted-foreground bg-secondary px-1.5 py-0.5 rounded">
                      {item.source}
                    </span>
                    <span className="text-[10px] font-mono text-muted-foreground">
                      {new Date(item.publishedAt).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </span>
                  </div>
                  {item.keywords.length > 0 && (
                    <div className="mt-1.5 flex flex-wrap gap-1">
                      {item.keywords.slice(0, 3).map((keyword) => (
                        <span
                          key={keyword}
                          className="text-[9px] font-mono text-muted-foreground/70 bg-muted px-1 py-0.5 rounded"
                        >
                          {keyword}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
