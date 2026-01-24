// Silver Price Service
// Fetches real silver price data from Yahoo Finance
// Single attempt, fails silently, returns null on failure

import { SilverPriceData, SilverPricePoint } from '@/lib/types'

// Yahoo Finance silver futures symbol
const SILVER_SYMBOL = 'SI=F'

export async function fetchSilverPrice(): Promise<SilverPriceData | null> {
  try {
    // Fetch from Yahoo Finance chart API
    // Get 3 months of daily data
    const endDate = Math.floor(Date.now() / 1000)
    const startDate = endDate - (90 * 24 * 60 * 60) // 90 days ago
    
    const url = `https://query1.finance.yahoo.com/v8/finance/chart/${SILVER_SYMBOL}?period1=${startDate}&period2=${endDate}&interval=1d&includePrePost=false`
    
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Accept': 'application/json'
      },
      signal: AbortSignal.timeout(15000)
    })
    
    if (!response.ok) {
      console.log(`[SilverPrice] Yahoo Finance returned ${response.status}`)
      return null
    }
    
    const data = await response.json()
    
    const result = data?.chart?.result?.[0]
    if (!result) {
      console.log('[SilverPrice] No chart result in response')
      return null
    }
    
    const timestamps = result.timestamp || []
    const quote = result.indicators?.quote?.[0] || {}
    const meta = result.meta || {}
    
    // Build price history
    const priceHistory: SilverPricePoint[] = []
    
    for (let i = 0; i < timestamps.length; i++) {
      const price = quote.close?.[i]
      const open = quote.open?.[i]
      const high = quote.high?.[i]
      const low = quote.low?.[i]
      const volume = quote.volume?.[i]
      
      // Skip if price is null/undefined
      if (price == null) continue
      
      const date = new Date(timestamps[i] * 1000)
      priceHistory.push({
        date: date.toISOString().split('T')[0],
        price: parseFloat(price.toFixed(2)),
        open: parseFloat((open || price).toFixed(2)),
        high: parseFloat((high || price).toFixed(2)),
        low: parseFloat((low || price).toFixed(2)),
        volume: volume || 0
      })
    }
    
    if (priceHistory.length === 0) {
      console.log('[SilverPrice] No valid price data points')
      return null
    }
    
    // Calculate current price and changes
    const currentPrice = meta.regularMarketPrice || priceHistory[priceHistory.length - 1]?.price || 0
    const previousClose = meta.previousClose || (priceHistory.length > 1 ? priceHistory[priceHistory.length - 2]?.price : currentPrice)
    
    const change24h = parseFloat((currentPrice - previousClose).toFixed(2))
    const changePercent24h = parseFloat(((change24h / previousClose) * 100).toFixed(2))
    
    // Get today's high/low from meta or last data point
    const todayData = priceHistory[priceHistory.length - 1]
    const high24h = meta.regularMarketDayHigh || todayData?.high || currentPrice
    const low24h = meta.regularMarketDayLow || todayData?.low || currentPrice
    
    return {
      currentPrice: parseFloat(currentPrice.toFixed(2)),
      change24h,
      changePercent24h,
      high24h: parseFloat(high24h.toFixed(2)),
      low24h: parseFloat(low24h.toFixed(2)),
      priceHistory,
      available: true,
      lastUpdated: new Date()
    }
    
  } catch (error) {
    console.log('[SilverPrice] Failed to fetch silver price:', error instanceof Error ? error.message : 'Unknown error')
    return null
  }
}

// Calculate price trend direction
export function calculatePriceTrend(data: SilverPricePoint[]): 'rising' | 'falling' | 'stable' | 'unknown' {
  if (data.length < 5) return 'unknown'
  
  // Compare last 7 days average to previous 7 days
  const recent = data.slice(-7)
  const previous = data.slice(-14, -7)
  
  if (previous.length === 0) return 'unknown'
  
  const recentAvg = recent.reduce((sum, d) => sum + d.price, 0) / recent.length
  const previousAvg = previous.reduce((sum, d) => sum + d.price, 0) / previous.length
  
  const changePercent = ((recentAvg - previousAvg) / previousAvg) * 100
  
  if (changePercent > 2) return 'rising'
  if (changePercent < -2) return 'falling'
  return 'stable'
}

// Get support and resistance levels (simplified)
export function getSupportResistance(data: SilverPricePoint[]): { support: number; resistance: number } | null {
  if (data.length < 10) return null
  
  const prices = data.map(d => d.price)
  const lows = data.map(d => d.low)
  const highs = data.map(d => d.high)
  
  // Simple support = recent low, resistance = recent high
  const support = Math.min(...lows.slice(-30))
  const resistance = Math.max(...highs.slice(-30))
  
  return {
    support: parseFloat(support.toFixed(2)),
    resistance: parseFloat(resistance.toFixed(2))
  }
}
