// Narrative Copilot API
// Answers questions using ONLY scraped + processed data
// No hallucinations, no external knowledge injection

import { NextResponse } from 'next/server'
import { fetchAllRSSNarratives } from '@/lib/services/rss-service'
import { clusterNarratives, detectConflicts } from '@/lib/services/narrative-engine'

export const dynamic = 'force-dynamic'

interface CopilotRequest {
  message: string
}

// Analyze question and generate response based on available data
function generateResponse(
  question: string,
  narratives: Awaited<ReturnType<typeof fetchAllRSSNarratives>>['items'],
  clusters: ReturnType<typeof clusterNarratives>,
  conflicts: ReturnType<typeof detectConflicts>
): string {
  const lowerQuestion = question.toLowerCase()

  // No data available
  if (narratives.length === 0) {
    return "Insufficient real-world data available. No narrative data has been collected from sources at this time."
  }

  // Question about dominant sentiment
  if (lowerQuestion.includes('sentiment') || lowerQuestion.includes('bullish') || lowerQuestion.includes('bearish')) {
    const sentimentCounts = { bullish: 0, bearish: 0, neutral: 0 }
    narratives.forEach(n => sentimentCounts[n.sentiment]++)
    
    const total = narratives.length
    const dominant = Object.entries(sentimentCounts).sort((a, b) => b[1] - a[1])[0]
    const percent = Math.round((dominant[1] / total) * 100)

    return `Based on ${total} analyzed narratives:\n\n` +
      `**Dominant Sentiment: ${dominant[0].toUpperCase()}** (${percent}%)\n\n` +
      `- Bullish: ${sentimentCounts.bullish} (${Math.round(sentimentCounts.bullish/total*100)}%)\n` +
      `- Bearish: ${sentimentCounts.bearish} (${Math.round(sentimentCounts.bearish/total*100)}%)\n` +
      `- Neutral: ${sentimentCounts.neutral} (${Math.round(sentimentCounts.neutral/total*100)}%)\n\n` +
      `*This analysis is based solely on text sentiment from collected narratives, not price data.*`
  }

  // Question about narratives/themes
  if (lowerQuestion.includes('narrative') || lowerQuestion.includes('theme') || lowerQuestion.includes('topic')) {
    if (clusters.length === 0) {
      return "No distinct narrative clusters have been identified from the current data."
    }

    const topClusters = clusters.slice(0, 5)
    let response = `**Top ${topClusters.length} Active Narratives:**\n\n`
    
    topClusters.forEach((c, i) => {
      response += `${i + 1}. **${c.name}** (Strength: ${c.strength}, ${c.sentiment})\n`
      response += `   Phase: ${c.phase} | Sources: ${c.sourceCount} | Items: ${c.items.length}\n\n`
    })

    return response + `*Analysis based on ${narratives.length} collected items.*`
  }

  // Question about conflicts or divergence
  if (lowerQuestion.includes('conflict') || lowerQuestion.includes('diverge') || lowerQuestion.includes('contradict')) {
    if (conflicts.length === 0) {
      return "No significant narrative conflicts detected in current data. Market narratives appear relatively aligned."
    }

    let response = `**${conflicts.length} Narrative Conflict(s) Detected:**\n\n`
    
    conflicts.forEach((c, i) => {
      response += `${i + 1}. **${c.narrative1.name}** vs **${c.narrative2.name}**\n`
      response += `   Type: ${c.conflictType}\n`
      response += `   ${c.description}\n\n`
    })

    return response
  }

  // Question about specific cluster
  const clusterMatch = clusters.find(c => 
    lowerQuestion.includes(c.name.toLowerCase()) ||
    c.keywords.some(k => lowerQuestion.includes(k))
  )

  if (clusterMatch) {
    return `**${clusterMatch.name}**\n\n` +
      `${clusterMatch.description}\n\n` +
      `- **Sentiment:** ${clusterMatch.sentiment}\n` +
      `- **Phase:** ${clusterMatch.phase}\n` +
      `- **Strength:** ${clusterMatch.strength}/100\n` +
      `- **Velocity:** ${clusterMatch.velocity.toFixed(2)} posts/day\n` +
      `- **Sources:** ${clusterMatch.sourceCount}\n` +
      `- **Total Items:** ${clusterMatch.items.length}\n\n` +
      `**Keywords:** ${clusterMatch.keywords.join(', ')}\n\n` +
      `*First seen: ${new Date(clusterMatch.firstSeen).toLocaleDateString()} | Last activity: ${new Date(clusterMatch.lastSeen).toLocaleDateString()}*`
  }

  // Question about sources
  if (lowerQuestion.includes('source') || lowerQuestion.includes('where') || lowerQuestion.includes('data')) {
    const sources = new Map<string, number>()
    narratives.forEach(n => sources.set(n.source, (sources.get(n.source) || 0) + 1))
    
    let response = `**Data Sources:**\n\n`
    sources.forEach((count, source) => {
      response += `- ${source}: ${count} items\n`
    })
    response += `\n**Total:** ${narratives.length} narratives collected\n\n`
    response += `*All data is sourced from public RSS feeds. No authenticated APIs or simulated data.*`
    
    return response
  }

  // Question about velocity or trends
  if (lowerQuestion.includes('velocity') || lowerQuestion.includes('trend') || lowerQuestion.includes('accelerat')) {
    const accelerating = clusters.filter(c => c.phase === 'acceleration')
    const emerging = clusters.filter(c => c.phase === 'emergence')
    const decaying = clusters.filter(c => c.phase === 'decay')

    let response = `**Narrative Velocity Analysis:**\n\n`
    
    if (accelerating.length > 0) {
      response += `**Accelerating (${accelerating.length}):**\n`
      accelerating.forEach(c => response += `- ${c.name} (velocity: ${c.velocity.toFixed(2)}/day)\n`)
      response += '\n'
    }
    
    if (emerging.length > 0) {
      response += `**Emerging (${emerging.length}):**\n`
      emerging.forEach(c => response += `- ${c.name}\n`)
      response += '\n'
    }
    
    if (decaying.length > 0) {
      response += `**Decaying (${decaying.length}):**\n`
      decaying.forEach(c => response += `- ${c.name}\n`)
    }

    return response || "Insufficient data to analyze narrative velocity trends."
  }

  // Default response
  return `Based on ${narratives.length} collected narratives across ${new Set(narratives.map(n => n.source)).size} sources:\n\n` +
    `- **${clusters.length}** distinct narrative clusters identified\n` +
    `- **${conflicts.length}** narrative conflicts detected\n\n` +
    `You can ask about:\n` +
    `- Current sentiment distribution\n` +
    `- Active narrative themes\n` +
    `- Narrative conflicts/divergences\n` +
    `- Specific topics (e.g., "squeeze", "inflation", "industrial demand")\n` +
    `- Data sources\n` +
    `- Velocity and trends\n\n` +
    `*All responses are based solely on scraped real-world data. No simulations or estimations.*`
}

export async function POST(request: Request) {
  try {
    const body: CopilotRequest = await request.json()
    const { message } = body

    if (!message?.trim()) {
      return NextResponse.json({ 
        response: "Please provide a question about silver market narratives." 
      })
    }

    // Fetch current data
    const rssResult = await fetchAllRSSNarratives()
    const clusters = clusterNarratives(rssResult.items)
    const conflicts = detectConflicts(clusters)

    // Generate response based on available data
    const response = generateResponse(message, rssResult.items, clusters, conflicts)

    return NextResponse.json({
      response,
      dataContext: {
        narrativeCount: rssResult.items.length,
        clusterCount: clusters.length,
        conflictCount: conflicts.length,
        sourcesAvailable: rssResult.sources.filter(s => s.available).length
      }
    })

  } catch (error) {
    console.error('[Copilot] Error:', error)
    return NextResponse.json({
      response: "Unable to process query at this time. Data sources may be temporarily unavailable.",
      dataContext: null
    })
  }
}
