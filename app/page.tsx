'use client'

import { useState } from 'react'
import { useNarratives } from '@/hooks/use-narratives'
import { DashboardHeader } from '@/components/dashboard/header'
import { DataStatusPanel } from '@/components/dashboard/data-status-panel'
import { NarrativeClusterCard } from '@/components/dashboard/narrative-cluster-card'
import { VelocityChart } from '@/components/dashboard/velocity-chart'
import { SentimentDistribution } from '@/components/dashboard/sentiment-distribution'
import { SilverPriceChart } from '@/components/dashboard/silver-price-chart'
import { NewsVolumeHeatmap } from '@/components/dashboard/news-volume-heatmap'
import { ConflictPanel } from '@/components/dashboard/conflict-panel'
import { RecentNarrativesFeed } from '@/components/dashboard/recent-narratives-feed'
import { NarrativeMap } from '@/components/dashboard/narrative-map'
import { NarrativeCopilot } from '@/components/dashboard/narrative-copilot'
import { ClusterDetailModal } from '@/components/dashboard/cluster-detail-modal'
import { NarrativeCluster } from '@/lib/types'
import { Loader2, AlertTriangle } from 'lucide-react'

export default function Dashboard() {
  const { data, conflicts, meta, isLoading, isError, errorMessage, refresh } = useNarratives()
  const [selectedCluster, setSelectedCluster] = useState<NarrativeCluster | null>(null)

  // Loading state
  if (isLoading && !data) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-sm font-mono text-muted-foreground">INITIALIZING DATA SOURCES...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <DashboardHeader
        lastUpdated={data?.lastUpdated}
        dataSources={data?.dataSources}
        onRefresh={refresh}
        isLoading={isLoading}
      />

      <main className="px-6 py-6">
        {/* Error Banner */}
        {isError && (
          <div className="mb-6 rounded-lg border border-destructive/50 bg-destructive/10 p-4 flex items-center gap-3">
            <AlertTriangle className="h-5 w-5 text-destructive" />
            <div>
              <p className="text-sm font-medium text-destructive">Data Fetch Issue</p>
              <p className="text-xs text-muted-foreground">{errorMessage || 'Some data sources may be unavailable'}</p>
            </div>
          </div>
        )}

        {/* Data Source Status */}
        <div className="mb-6">
          <DataStatusPanel sources={data?.dataSources ?? []} />
        </div>

        {/* Silver Price Chart - Full Width Hero */}
        <div className="mb-6">
          <SilverPriceChart data={data?.silverPrice ?? null} />
        </div>

        {/* Main Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - 2/3 width on large screens */}
          <div className="lg:col-span-2 space-y-6">
            {/* Top Charts Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <VelocityChart data={data?.narrativeVelocity ?? []} />
              <SentimentDistribution items={data?.narratives ?? []} />
            </div>

            {/* Narrative Map */}
            <NarrativeMap
              clusters={data?.clusters ?? []}
              onClusterSelect={setSelectedCluster}
            />

            {/* News Volume Heatmap */}
            <NewsVolumeHeatmap data={data?.newsVolume ?? []} />

            {/* Narrative Clusters Grid */}
            <div>
              <h2 className="text-xs font-mono font-semibold text-muted-foreground tracking-wider mb-4">
                ACTIVE NARRATIVE CLUSTERS ({data?.clusters?.length ?? 0})
              </h2>
              {data?.clusters && data.clusters.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {data.clusters.map((cluster) => (
                    <NarrativeClusterCard
                      key={cluster.id}
                      cluster={cluster}
                      onClick={() => setSelectedCluster(cluster)}
                    />
                  ))}
                </div>
              ) : (
                <div className="rounded-lg border border-border bg-card p-8 text-center">
                  <p className="text-sm text-muted-foreground font-mono">NO CLUSTERS AVAILABLE</p>
                  <p className="text-xs text-muted-foreground/60 mt-1">
                    Clusters will appear when sufficient narrative data is collected
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Right Column - 1/3 width on large screens */}
          <div className="space-y-6">
            {/* Copilot */}
            <NarrativeCopilot />

            {/* Conflicts */}
            <ConflictPanel conflicts={conflicts} />

            {/* Recent Feed */}
            <RecentNarrativesFeed items={data?.narratives ?? []} maxItems={15} />
          </div>
        </div>

        {/* Stats Footer */}
        <div className="mt-8 pt-6 border-t border-border">
          <div className="flex flex-wrap items-center justify-between gap-4 text-[10px] font-mono text-muted-foreground">
            <div className="flex items-center gap-6">
              <span>NARRATIVES: <span className="text-foreground">{meta?.totalNarratives ?? 0}</span></span>
              <span>CLUSTERS: <span className="text-foreground">{meta?.totalClusters ?? 0}</span></span>
              <span>SOURCES: <span className="text-foreground">{meta?.sourcesAvailable ?? 0}/{meta?.sourcesTotal ?? 0}</span></span>
              {data?.silverPrice?.available && (
                <span>SILVER: <span className="text-foreground">${data.silverPrice.currentPrice.toFixed(2)}</span></span>
              )}
            </div>
            <div>
              <span className="text-muted-foreground/60">SILVER NARRATIVE INTELLIGENCE v1.0</span>
            </div>
          </div>
        </div>
      </main>

      {/* Cluster Detail Modal */}
      <ClusterDetailModal
        cluster={selectedCluster}
        onClose={() => setSelectedCluster(null)}
      />
    </div>
  )
}
