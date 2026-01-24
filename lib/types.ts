// Core Types for Silver Narrative Intelligence System

export type SentimentType = 'bullish' | 'bearish' | 'neutral'
export type LifecyclePhase = 'emergence' | 'acceleration' | 'peak' | 'decay'

export interface NarrativeItem {
  id: string
  title: string
  content: string
  source: string
  sourceUrl: string
  publishedAt: Date
  sentiment: SentimentType
  keywords: string[]
  narrativeCluster?: string
}

export interface NarrativeCluster {
  id: string
  name: string
  description: string
  keywords: string[]
  sentiment: SentimentType
  phase: LifecyclePhase
  strength: number // 0-100
  velocity: number // rate of change
  items: NarrativeItem[]
  firstSeen: Date
  lastSeen: Date
  sourceCount: number
}

export interface TrendDataPoint {
  date: string
  value: number
}

export interface GoogleTrendsData {
  keyword: string
  interestOverTime: TrendDataPoint[]
  relatedQueries: string[]
  available: boolean
}

export interface NarrativeVelocity {
  date: string
  postCount: number
  commentCount: number
  totalEngagement: number
}

export interface NewsVolumeData {
  date: string
  count: number
  sources: string[]
}

export interface DataSourceStatus {
  name: string
  status: 'available' | 'unavailable' | 'partial'
  lastFetched: Date | null
  itemCount: number
  error?: string
}

export interface DashboardData {
  narratives: NarrativeItem[]
  clusters: NarrativeCluster[]
  googleTrends: GoogleTrendsData | null
  silverPrice: SilverPriceData | null
  narrativeVelocity: NarrativeVelocity[]
  newsVolume: NewsVolumeData[]
  dataSources: DataSourceStatus[]
  lastUpdated: Date
}

export interface ChatMessage {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
  dataContext?: string[]
}

export interface ConflictingNarratives {
  narrative1: NarrativeCluster
  narrative2: NarrativeCluster
  conflictType: 'opposing' | 'contradictory' | 'competing'
  description: string
}

export interface SilverPricePoint {
  date: string
  price: number
  open: number
  high: number
  low: number
  volume: number
}

export interface SilverPriceData {
  currentPrice: number
  change24h: number
  changePercent24h: number
  high24h: number
  low24h: number
  priceHistory: SilverPricePoint[]
  available: boolean
  lastUpdated: Date
}
