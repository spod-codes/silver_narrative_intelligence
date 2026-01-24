// Narrative Extraction Engine
// Clusters narratives by semantic similarity
// Tracks lifecycle phases and measures narrative strength

import { 
  NarrativeItem, 
  NarrativeCluster, 
  SentimentType, 
  LifecyclePhase,
  ConflictingNarratives 
} from '@/lib/types'

// Predefined narrative themes for silver market
const NARRATIVE_THEMES = [
  {
    id: 'squeeze',
    name: 'Silver Squeeze',
    keywords: ['squeeze', 'short', 'comex', 'drain', 'vault', 'inventory', 'registered', 'eligible'],
    description: 'Coordinated buying to expose silver market manipulation'
  },
  {
    id: 'inflation-hedge',
    name: 'Inflation Hedge',
    keywords: ['inflation', 'hedge', 'cpi', 'fed', 'dollar', 'purchasing power', 'store of value'],
    description: 'Silver as protection against currency debasement'
  },
  {
    id: 'industrial-demand',
    name: 'Industrial Demand',
    keywords: ['solar', 'ev', 'electric', 'industrial', 'demand', 'green', 'technology', 'battery'],
    description: 'Growing industrial applications driving demand'
  },
  {
    id: 'monetary-reset',
    name: 'Monetary Reset',
    keywords: ['reset', 'brics', 'dedollarization', 'cbdc', 'gold standard', 'basel', 'tier 1'],
    description: 'Silver role in potential monetary system changes'
  },
  {
    id: 'supply-crisis',
    name: 'Supply Crisis',
    keywords: ['shortage', 'deficit', 'supply', 'mine', 'production', 'scarcity', 'depletion'],
    description: 'Structural supply deficits in silver market'
  },
  {
    id: 'manipulation',
    name: 'Market Manipulation',
    keywords: ['manipulation', 'suppression', 'naked short', 'paper silver', 'jp morgan', 'spoofing'],
    description: 'Claims of price suppression by large institutions'
  },
  {
    id: 'physical-premium',
    name: 'Physical Premium',
    keywords: ['premium', 'physical', 'coins', 'bars', 'delivery', 'allocation', 'retail'],
    description: 'Disconnect between spot price and physical availability'
  },
  {
    id: 'gold-silver-ratio',
    name: 'Gold/Silver Ratio',
    keywords: ['ratio', 'gold silver', 'gsr', 'undervalued', 'historical', 'mean reversion'],
    description: 'Silver undervaluation relative to gold'
  }
]

// Calculate keyword overlap between item and theme
function calculateThemeMatch(item: NarrativeItem, theme: typeof NARRATIVE_THEMES[0]): number {
  const itemText = `${item.title} ${item.content}`.toLowerCase()
  const matchedKeywords = theme.keywords.filter(kw => itemText.includes(kw))
  return matchedKeywords.length / theme.keywords.length
}

// Assign items to narrative clusters
export function clusterNarratives(items: NarrativeItem[]): NarrativeCluster[] {
  const clusters: Map<string, NarrativeItem[]> = new Map()
  const unclustered: NarrativeItem[] = []
  
  // Assign each item to best matching theme
  for (const item of items) {
    let bestTheme: typeof NARRATIVE_THEMES[0] | null = null
    let bestScore = 0.15 // Minimum threshold
    
    for (const theme of NARRATIVE_THEMES) {
      const score = calculateThemeMatch(item, theme)
      if (score > bestScore) {
        bestScore = score
        bestTheme = theme
      }
    }
    
    if (bestTheme) {
      const existing = clusters.get(bestTheme.id) || []
      existing.push({ ...item, narrativeCluster: bestTheme.id })
      clusters.set(bestTheme.id, existing)
    } else {
      unclustered.push(item)
    }
  }
  
  // Convert to NarrativeCluster format
  const result: NarrativeCluster[] = []
  
  for (const theme of NARRATIVE_THEMES) {
    const clusterItems = clusters.get(theme.id) || []
    
    if (clusterItems.length === 0) continue
    
    // Calculate aggregate sentiment
    const sentimentCounts = { bullish: 0, bearish: 0, neutral: 0 }
    clusterItems.forEach(item => sentimentCounts[item.sentiment]++)
    
    const dominantSentiment: SentimentType = 
      sentimentCounts.bullish >= sentimentCounts.bearish && sentimentCounts.bullish >= sentimentCounts.neutral
        ? 'bullish'
        : sentimentCounts.bearish > sentimentCounts.neutral
          ? 'bearish'
          : 'neutral'
    
    // Calculate lifecycle phase based on velocity and recency
    const sortedByDate = [...clusterItems].sort(
      (a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
    )
    
    const firstSeen = new Date(sortedByDate[sortedByDate.length - 1].publishedAt)
    const lastSeen = new Date(sortedByDate[0].publishedAt)
    
    const phase = calculateLifecyclePhase(clusterItems, firstSeen, lastSeen)
    
    // Strength based on volume and cross-source presence
    const uniqueSources = new Set(clusterItems.map(item => item.source))
    const strength = Math.min(100, (clusterItems.length * 10) + (uniqueSources.size * 15))
    
    // Velocity (items per day in last 7 days)
    const weekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000
    const recentItems = clusterItems.filter(item => new Date(item.publishedAt).getTime() > weekAgo)
    const velocity = recentItems.length / 7
    
    result.push({
      id: theme.id,
      name: theme.name,
      description: theme.description,
      keywords: theme.keywords,
      sentiment: dominantSentiment,
      phase,
      strength,
      velocity,
      items: clusterItems,
      firstSeen,
      lastSeen,
      sourceCount: uniqueSources.size
    })
  }
  
  // Sort by strength
  return result.sort((a, b) => b.strength - a.strength)
}

// Determine lifecycle phase
function calculateLifecyclePhase(
  items: NarrativeItem[], 
  firstSeen: Date, 
  lastSeen: Date
): LifecyclePhase {
  const now = Date.now()
  const ageInDays = (now - firstSeen.getTime()) / (24 * 60 * 60 * 1000)
  const lastActivityDays = (now - lastSeen.getTime()) / (24 * 60 * 60 * 1000)
  
  // Calculate daily volume trend
  const dayBuckets = new Map<string, number>()
  items.forEach(item => {
    const day = new Date(item.publishedAt).toISOString().split('T')[0]
    dayBuckets.set(day, (dayBuckets.get(day) || 0) + 1)
  })
  
  const dailyVolumes = Array.from(dayBuckets.values())
  const avgVolume = dailyVolumes.reduce((a, b) => a + b, 0) / dailyVolumes.length
  const recentVolume = dailyVolumes.slice(-3).reduce((a, b) => a + b, 0) / 3
  
  // Determine phase
  if (ageInDays < 3 && items.length < 5) {
    return 'emergence'
  } else if (recentVolume > avgVolume * 1.5) {
    return 'acceleration'
  } else if (lastActivityDays > 3 || recentVolume < avgVolume * 0.5) {
    return 'decay'
  } else {
    return 'peak'
  }
}

// Detect conflicting/competing narratives
export function detectConflicts(clusters: NarrativeCluster[]): ConflictingNarratives[] {
  const conflicts: ConflictingNarratives[] = []
  
  // Define narrative pairs that may conflict
  const conflictPairs = [
    { a: 'manipulation', b: 'industrial-demand', type: 'competing' as const, 
      desc: 'Price suppression claims vs. organic demand growth narrative' },
    { a: 'supply-crisis', b: 'inflation-hedge', type: 'competing' as const,
      desc: 'Physical scarcity narrative vs. monetary inflation focus' },
    { a: 'squeeze', b: 'physical-premium', type: 'contradictory' as const,
      desc: 'Coordinated action claims vs. organic premium emergence' }
  ]
  
  // Check for sentiment-based conflicts within same timeframe
  const bullishClusters = clusters.filter(c => c.sentiment === 'bullish')
  const bearishClusters = clusters.filter(c => c.sentiment === 'bearish')
  
  for (const bullish of bullishClusters) {
    for (const bearish of bearishClusters) {
      // Check if active in same timeframe
      const overlap = bullish.lastSeen.getTime() > bearish.firstSeen.getTime() &&
                      bearish.lastSeen.getTime() > bullish.firstSeen.getTime()
      
      if (overlap) {
        conflicts.push({
          narrative1: bullish,
          narrative2: bearish,
          conflictType: 'opposing',
          description: `Bullish "${bullish.name}" narrative conflicts with bearish "${bearish.name}" narrative`
        })
      }
    }
  }
  
  // Check predefined conflict pairs
  for (const pair of conflictPairs) {
    const clusterA = clusters.find(c => c.id === pair.a)
    const clusterB = clusters.find(c => c.id === pair.b)
    
    if (clusterA && clusterB && clusterA.strength > 30 && clusterB.strength > 30) {
      conflicts.push({
        narrative1: clusterA,
        narrative2: clusterB,
        conflictType: pair.type,
        description: pair.desc
      })
    }
  }
  
  return conflicts
}

// Calculate narrative velocity over time
export function calculateVelocityTimeline(items: NarrativeItem[], days: number = 14): {
  date: string
  postCount: number
  commentCount: number
  totalEngagement: number
}[] {
  const result: Map<string, { posts: number; comments: number }> = new Map()
  
  // Initialize last N days
  for (let i = 0; i < days; i++) {
    const date = new Date()
    date.setDate(date.getDate() - i)
    const key = date.toISOString().split('T')[0]
    result.set(key, { posts: 0, comments: 0 })
  }
  
  // Count items per day
  for (const item of items) {
    const key = new Date(item.publishedAt).toISOString().split('T')[0]
    if (result.has(key)) {
      const current = result.get(key)!
      current.posts++
    }
  }
  
  // Convert to array
  return Array.from(result.entries())
    .map(([date, data]) => ({
      date,
      postCount: data.posts,
      commentCount: data.comments,
      totalEngagement: data.posts + data.comments
    }))
    .sort((a, b) => a.date.localeCompare(b.date))
}

// Generate news volume heatmap data
export function calculateNewsVolume(items: NarrativeItem[], days: number = 14): {
  date: string
  count: number
  sources: string[]
}[] {
  const volumeMap: Map<string, { count: number; sources: Set<string> }> = new Map()
  
  // Initialize days
  for (let i = 0; i < days; i++) {
    const date = new Date()
    date.setDate(date.getDate() - i)
    const key = date.toISOString().split('T')[0]
    volumeMap.set(key, { count: 0, sources: new Set() })
  }
  
  // Aggregate
  for (const item of items) {
    const key = new Date(item.publishedAt).toISOString().split('T')[0]
    if (volumeMap.has(key)) {
      const data = volumeMap.get(key)!
      data.count++
      data.sources.add(item.source)
    }
  }
  
  return Array.from(volumeMap.entries())
    .map(([date, data]) => ({
      date,
      count: data.count,
      sources: Array.from(data.sources)
    }))
    .sort((a, b) => a.date.localeCompare(b.date))
}
