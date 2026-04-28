import Graph from 'graphology'
import louvainAlgorithm from 'graphology-communities-louvain'

export interface CommunityResult {
  nodeId: string
  community: number
}

export interface CommunityStats {
  communityId: number
  size: number
  nodes: string[]
}

export interface LouvainAnalysis {
  communities: CommunityResult[]
  communityStats: CommunityStats[]
  modularity: number
  communityCount: number
}

// Detect communities using Louvain algorithm
export function detectCommunitiesLouvain(
  graph: Graph,
  options: {
    resolution?: number
    randomWalk?: boolean
  } = {}
): LouvainAnalysis {
  try {
    // Run Louvain algorithm
    const result = louvainAlgorithm(graph, {
      resolution: options.resolution || 1.0,
      rng: Math.random,
      ...options
    })

    // Extract community assignments
    const communities: CommunityResult[] = Object.entries(result.communities)
      .map(([nodeId, communityId]) => ({
        nodeId,
        community: communityId as number
      }))

    // Calculate community statistics
    const communityMap = new Map<number, string[]>()
    
    communities.forEach(({ nodeId, community }) => {
      if (!communityMap.has(community)) {
        communityMap.set(community, [])
      }
      communityMap.get(community)?.push(nodeId)
    })

    const communityStats: CommunityStats[] = Array.from(communityMap.entries())
      .map(([communityId, nodes]) => ({
        communityId,
        size: nodes.length,
        nodes
      }))
      .sort((a, b) => b.size - a.size)

    return {
      communities,
      communityStats,
      modularity: result.modularity,
      communityCount: communityStats.length
    }
  } catch (error) {
    console.error('Error detecting communities with Louvain:', error)
    return {
      communities: [],
      communityStats: [],
      modularity: 0,
      communityCount: 0
    }
  }
}

// Get community statistics summary
export function getCommunitySummary(louvainResult: LouvainAnalysis): {
  totalCommunities: number
  modularity: number
  avgCommunitySize: number
  largestCommunity: CommunityStats | null
  smallestCommunity: CommunityStats | null
} {
  const stats = louvainResult.communityStats
  if (stats.length === 0) {
    return {
      totalCommunities: 0,
      modularity: 0,
      avgCommunitySize: 0,
      largestCommunity: null,
      smallestCommunity: null
    }
  }

  const sizes = stats.map(s => s.size)
  const totalSize = sizes.reduce((sum, size) => sum + size, 0)
  const avgCommunitySize = totalSize / stats.length

  return {
    totalCommunities: stats.length,
    modularity: louvainResult.modularity,
    avgCommunitySize,
    largestCommunity: stats[0] || null,
    smallestCommunity: stats[stats.length - 1] || null
  }
}

// Add community information to graph attributes
export function addCommunitiesToGraph(
  graph: Graph,
  louvainResult: LouvainAnalysis
): void {
  louvainResult.communities.forEach(({ nodeId, community }) => {
    if (graph.hasNode(nodeId)) {
      graph.setNodeAttribute(nodeId, 'community', community)
    }
  })
}
