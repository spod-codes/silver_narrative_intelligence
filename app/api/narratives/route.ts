// API Route: Fetch and process silver narratives
// Returns real data only - no simulation

import { NextResponse } from 'next/server'
import { fetchAllRSSNarratives } from '@/lib/services/rss-service'
import {
  clusterNarratives,
  detectConflicts,
  calculateVelocityTimeline,
  calculateNewsVolume
} from '@/lib/services/narrative-engine'
import { fetchSilverPrice } from '@/lib/services/silver-price-service'
import { DataSourceStatus, DashboardData } from '@/lib/types'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export async function GET() {
  try {
    // Fetch all RSS narratives and silver price in parallel
    const [rssResult, silverPrice] = await Promise.all([
      fetchAllRSSNarratives(),
      fetchSilverPrice()
    ])

    // Cluster narratives
    const clusters = clusterNarratives(rssResult.items)

    // Detect conflicts
    const conflicts = detectConflicts(clusters)

    // Calculate velocity and volume
    const velocity = calculateVelocityTimeline(rssResult.items)
    const newsVolume = calculateNewsVolume(rssResult.items)

    // Build data source status
    const dataSources: DataSourceStatus[] = [
      ...rssResult.sources.map(s => ({
        name: s.name,
        status: s.available ? 'available' as const : 'unavailable' as const,
        lastFetched: new Date(),
        itemCount: s.count
      })),
      {
        name: 'Silver Price (Yahoo)',
        status: silverPrice?.available ? 'available' as const : 'unavailable' as const,
        lastFetched: new Date(),
        itemCount: silverPrice?.priceHistory.length || 0
      }
    ]

    const dashboardData: DashboardData = {
      narratives: rssResult.items,
      clusters,
      googleTrends: null, // Removed - Google Trends API is not publicly accessible
      silverPrice,
      narrativeVelocity: velocity,
      newsVolume,
      dataSources,
      lastUpdated: new Date()
    }

    return NextResponse.json({
      success: true,
      data: dashboardData,
      conflicts,
      meta: {
        totalNarratives: rssResult.items.length,
        totalClusters: clusters.length,
        sourcesAvailable: rssResult.sources.filter(s => s.available).length,
        sourcesTotal: rssResult.sources.length,
        silverPriceAvailable: silverPrice?.available ?? false
      }
    })

  } catch (error) {
    console.error('[API] Error fetching narratives:', error)

    // Return empty data structure, not error
    return NextResponse.json({
      success: false,
      data: {
        narratives: [],
        clusters: [],
        googleTrends: null,
        silverPrice: null,
        narrativeVelocity: [],
        newsVolume: [],
        dataSources: [],
        lastUpdated: new Date()
      },
      conflicts: [],
      meta: {
        totalNarratives: 0,
        totalClusters: 0,
        sourcesAvailable: 0,
        sourcesTotal: 0,
        silverPriceAvailable: false
      },
      error: 'Data sources temporarily unavailable'
    })
  }
}
