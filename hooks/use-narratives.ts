'use client'

import useSWR from 'swr'
import { DashboardData, ConflictingNarratives } from '@/lib/types'

interface NarrativesResponse {
  success: boolean
  data: DashboardData
  conflicts: ConflictingNarratives[]
  meta: {
    totalNarratives: number
    totalClusters: number
    sourcesAvailable: number
    sourcesTotal: number
    silverPriceAvailable: boolean
  }
  error?: string
}

const fetcher = async (url: string): Promise<NarrativesResponse> => {
  const res = await fetch(url)
  if (!res.ok) {
    throw new Error('Failed to fetch narratives')
  }
  return res.json()
}

export function useNarratives() {
  const { data, error, isLoading, mutate } = useSWR<NarrativesResponse>(
    '/api/narratives',
    fetcher,
    {
      refreshInterval: 5 * 60 * 1000, // Refresh every 5 minutes
      revalidateOnFocus: false,
      dedupingInterval: 60 * 1000, // Dedupe requests within 1 minute
    }
  )

  return {
    data: data?.data,
    conflicts: data?.conflicts ?? [],
    meta: data?.meta,
    isLoading,
    isError: error || !data?.success,
    errorMessage: error?.message || data?.error,
    refresh: mutate
  }
}
