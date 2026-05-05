import Graph, { UndirectedGraph } from 'graphology'
import louvainAlgorithm from 'graphology-communities-louvain'
import { modularity as computeModularity } from 'graphology-metrics/graph'

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

/**
 * Detect communities using the Louvain algorithm.
 *
 * Fixes applied vs. original version:
 *
 * 1. louvainAlgorithm() returns Record<nodeId, communityId> directly —
 *    NOT an object with a `.communities` property. The old code accessed
 *    `result.communities` which was always undefined → empty partition.
 *
 * 2. Louvain only works on undirected graphs. If the input graph is directed
 *    or mixed, we convert it to UndirectedGraph before running the algorithm.
 *
 * 3. computeModularity() does NOT accept { communities: partition }.
 *    ModularityOptions only has { getNodeCommunity, getEdgeWeight, resolution }.
 *    Fix: write partition into node attributes first, then pass
 *    { getNodeCommunity: 'community' } so the function reads from attributes.
 */
export function detectCommunitiesLouvain(
  graph: Graph,
  options: {
    resolution?: number
    randomWalk?: boolean
  } = {}
): LouvainAnalysis {
  try {
    // Louvain requires an undirected graph — convert if necessary
    let workingGraph: Graph = graph

    if (graph.type === 'directed' || graph.type === 'mixed') {
      workingGraph = new UndirectedGraph()

      graph.forEachNode((node, attrs) => {
        workingGraph.addNode(node, attrs)
      })

      graph.forEachEdge((_, attrs, source, target) => {
        if (!workingGraph.hasEdge(source, target)) {
          workingGraph.addEdge(source, target, attrs)
        }
      })
    }

    // louvainAlgorithm() returns Record<nodeId, communityId> directly —
    // not an object with .communities / .modularity fields
    const partition: Record<string, number> = louvainAlgorithm(workingGraph, {
      resolution: options.resolution ?? 1.0,
      randomWalk: options.randomWalk ?? true,
    })

    // Build CommunityResult array from the partition map
    const communities: CommunityResult[] = Object.entries(partition).map(
      ([nodeId, community]) => ({ nodeId, community })
    )

    // Group nodes by community
    const communityMap = new Map<number, string[]>()

    communities.forEach(({ nodeId, community }) => {
      if (!communityMap.has(community)) {
        communityMap.set(community, [])
      }
      communityMap.get(community)!.push(nodeId)
    })

    const communityStats: CommunityStats[] = Array.from(communityMap.entries())
      .map(([communityId, nodes]) => ({ communityId, size: nodes.length, nodes }))
      .sort((a, b) => b.size - a.size)

    // computeModularity() does NOT accept { communities: partition }.
    // ModularityOptions only supports { getNodeCommunity, getEdgeWeight, resolution }.
    // Write partition into node attributes first, then reference the attribute name.
    Object.entries(partition).forEach(([nodeId, community]) => {
      workingGraph.setNodeAttribute(nodeId, 'community', community)
    })

    let mod = 0
    try {
      mod = computeModularity(workingGraph, { getNodeCommunity: 'community' })
    } catch {
      // computeModularity may throw on degenerate graphs — default to 0
      mod = 0
    }

    return {
      communities,
      communityStats,
      modularity: mod,
      communityCount: communityStats.length,
    }
  } catch (error) {
    console.error('Error detecting communities with Louvain:', error)
    return {
      communities: [],
      communityStats: [],
      modularity: 0,
      communityCount: 0,
    }
  }
}

// Summary helper
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
      smallestCommunity: null,
    }
  }

  const totalSize = stats.reduce((sum, s) => sum + s.size, 0)

  return {
    totalCommunities: stats.length,
    modularity: louvainResult.modularity,
    avgCommunitySize: totalSize / stats.length,
    largestCommunity: stats[0] ?? null,
    smallestCommunity: stats[stats.length - 1] ?? null,
  }
}

// Write community id back into graph node attributes
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