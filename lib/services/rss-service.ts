// RSS Feed Service - Primary Data Source
// Fetches from Reddit RSS, Google News RSS, Yahoo Finance News RSS
// NO retries, NO simulation - fails silently and returns empty array

import { NarrativeItem, SentimentType } from '@/lib/types'

interface RSSItem {
  title: string
  link: string
  pubDate?: string
  description?: string
  content?: string
}

// Simple sentiment analysis based on keywords (no external APIs)
function analyzeSentiment(text: string): SentimentType {
  const lowerText = text.toLowerCase()
  
  const bullishKeywords = [
    'rally', 'surge', 'bullish', 'moon', 'stack', 'buy', 'accumulate',
    'breakout', 'soar', 'skyrocket', 'upside', 'gains', 'higher',
    'squeeze', 'shortage', 'demand', 'inflation hedge', 'safe haven'
  ]
  
  const bearishKeywords = [
    'crash', 'dump', 'bearish', 'sell', 'decline', 'drop', 'fall',
    'plunge', 'collapse', 'downside', 'losses', 'lower', 'weak',
    'oversupply', 'bubble', 'overvalued'
  ]
  
  let bullishScore = 0
  let bearishScore = 0
  
  bullishKeywords.forEach(keyword => {
    if (lowerText.includes(keyword)) bullishScore++
  })
  
  bearishKeywords.forEach(keyword => {
    if (lowerText.includes(keyword)) bearishScore++
  })
  
  if (bullishScore > bearishScore) return 'bullish'
  if (bearishScore > bullishScore) return 'bearish'
  return 'neutral'
}

// Extract keywords from text
function extractKeywords(text: string): string[] {
  const lowerText = text.toLowerCase()
  const silverKeywords = [
    'silver', 'ag', 'slv', 'pslv', 'bullion', 'coins', 'bars',
    'comex', 'lbma', 'mint', 'premium', 'stackers', 'physical',
    'spot price', 'futures', 'etf', 'mining', 'industrial demand',
    'solar', 'ev', 'green energy', 'inflation', 'fed', 'dollar',
    'gold ratio', 'manipulation', 'short squeeze', 'jp morgan',
    'basel iii', 'tier 1', 'monetary metal'
  ]
  
  return silverKeywords.filter(keyword => lowerText.includes(keyword))
}

// Parse RSS XML - basic parser without external dependencies
function parseRSSXML(xml: string): RSSItem[] {
  const items: RSSItem[] = []
  
  try {
    // Extract items using regex (works for most RSS feeds)
    const itemRegex = /<item>([\s\S]*?)<\/item>/gi
    const matches = xml.matchAll(itemRegex)
    
    for (const match of matches) {
      const itemContent = match[1]
      
      const titleMatch = itemContent.match(/<title>(?:<!\[CDATA\[)?(.*?)(?:\]\]>)?<\/title>/i)
      const linkMatch = itemContent.match(/<link>(?:<!\[CDATA\[)?(.*?)(?:\]\]>)?<\/link>/i)
      const pubDateMatch = itemContent.match(/<pubDate>(.*?)<\/pubDate>/i)
      const descMatch = itemContent.match(/<description>(?:<!\[CDATA\[)?([\s\S]*?)(?:\]\]>)?<\/description>/i)
      
      if (titleMatch && linkMatch) {
        items.push({
          title: titleMatch[1].trim(),
          link: linkMatch[1].trim(),
          pubDate: pubDateMatch?.[1],
          description: descMatch?.[1]?.trim() || ''
        })
      }
    }
    
    // Also try entry format (Atom feeds)
    const entryRegex = /<entry>([\s\S]*?)<\/entry>/gi
    const entryMatches = xml.matchAll(entryRegex)
    
    for (const match of entryMatches) {
      const entryContent = match[1]
      
      const titleMatch = entryContent.match(/<title[^>]*>(.*?)<\/title>/i)
      const linkMatch = entryContent.match(/<link[^>]*href="([^"]*)"[^>]*\/?>/i)
      const updatedMatch = entryContent.match(/<updated>(.*?)<\/updated>/i)
      const contentMatch = entryContent.match(/<content[^>]*>([\s\S]*?)<\/content>/i)
      
      if (titleMatch) {
        items.push({
          title: titleMatch[1].trim(),
          link: linkMatch?.[1] || '',
          pubDate: updatedMatch?.[1],
          description: contentMatch?.[1]?.replace(/<[^>]*>/g, '').trim() || ''
        })
      }
    }
  } catch {
    // Fail silently
    return []
  }
  
  return items
}

// Fetch RSS feed - single attempt, no retry
async function fetchRSS(url: string): Promise<RSSItem[]> {
  try {
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; NarrativeBot/1.0)',
        'Accept': 'application/rss+xml, application/xml, text/xml'
      },
      signal: AbortSignal.timeout(10000) // 10 second timeout
    })
    
    if (!response.ok) {
      console.log(`[RSS] ${url} returned ${response.status}`)
      return []
    }
    
    const xml = await response.text()
    return parseRSSXML(xml)
  } catch (error) {
    // Log once, return empty
    console.log(`[RSS] Failed to fetch ${url}:`, error instanceof Error ? error.message : 'Unknown error')
    return []
  }
}

// Convert RSS items to NarrativeItems
function rssToNarratives(items: RSSItem[], source: string): NarrativeItem[] {
  return items.map((item, index) => {
    const fullText = `${item.title} ${item.description || ''}`
    
    return {
      id: `${source}-${Date.now()}-${index}`,
      title: item.title,
      content: item.description || '',
      source,
      sourceUrl: item.link,
      publishedAt: item.pubDate ? new Date(item.pubDate) : new Date(),
      sentiment: analyzeSentiment(fullText),
      keywords: extractKeywords(fullText)
    }
  })
}

// Reddit RSS Feeds
export async function fetchRedditSilver(): Promise<NarrativeItem[]> {
  const feeds = [
    { url: 'https://www.reddit.com/r/Wallstreetsilver/.rss', source: 'r/Wallstreetsilver' },
    { url: 'https://www.reddit.com/r/Silverbugs/.rss', source: 'r/Silverbugs' }
  ]
  
  const results: NarrativeItem[] = []
  
  for (const feed of feeds) {
    const items = await fetchRSS(feed.url)
    results.push(...rssToNarratives(items, feed.source))
  }
  
  return results
}

// Google News RSS
export async function fetchGoogleNewsSilver(): Promise<NarrativeItem[]> {
  const url = 'https://news.google.com/rss/search?q=silver+price+market&hl=en-US&gl=US&ceid=US:en'
  const items = await fetchRSS(url)
  return rssToNarratives(items, 'Google News')
}

// Yahoo Finance News RSS
export async function fetchYahooNewsSilver(): Promise<NarrativeItem[]> {
  const url = 'https://feeds.finance.yahoo.com/rss/2.0/headline?s=SI=F&region=US&lang=en-US'
  const items = await fetchRSS(url)
  return rssToNarratives(items, 'Yahoo Finance')
}

// Aggregate all RSS sources
export async function fetchAllRSSNarratives(): Promise<{
  items: NarrativeItem[]
  sources: { name: string; count: number; available: boolean }[]
}> {
  const [reddit, google, yahoo] = await Promise.all([
    fetchRedditSilver(),
    fetchGoogleNewsSilver(),
    fetchYahooNewsSilver()
  ])
  
  return {
    items: [...reddit, ...google, ...yahoo],
    sources: [
      { name: 'Reddit', count: reddit.length, available: reddit.length > 0 },
      { name: 'Google News', count: google.length, available: google.length > 0 },
      { name: 'Yahoo Finance', count: yahoo.length, available: yahoo.length > 0 }
    ]
  }
}
