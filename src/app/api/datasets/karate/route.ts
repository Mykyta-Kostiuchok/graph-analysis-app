import { NextResponse } from 'next/server'
import { karateClubDataset } from '@/lib/datasets/karateClub'
import { buildGraph } from '@/lib/algorithms/graphBuilder'
import { calculateAllMetrics } from '@/lib/algorithms/metrics'

export async function GET() {
  try {
    // Build graph from Karate Club dataset
    const graphResult = buildGraph(karateClubDataset)
    
    // Calculate all metrics
    const metrics = calculateAllMetrics(graphResult.graph)
    
    const responseData = {
      success: true,
      dataset: "Zachary's Karate Club",
      description: "Social network of friendships between 34 members of a karate club",
      graph: {
        nodes: graphResult.graph.nodes().map(nodeId => ({
          id: nodeId,
          ...graphResult.graph.getNodeAttributes(nodeId),
        })),
        edges: graphResult.graph.edges().map(edgeId => ({
          id: edgeId,
          source: graphResult.graph.source(edgeId),
          target: graphResult.graph.target(edgeId),
          ...graphResult.graph.getEdgeAttributes(edgeId),
        })),
      },
      metrics,
      stats: {
        nodeCount: graphResult.nodeCount,
        edgeCount: graphResult.edgeCount,
        isDirected: graphResult.isDirected,
        isConnected: graphResult.isConnected,
      },
    }

    return NextResponse.json(responseData)
  } catch (error) {
    console.error('Karate Club dataset processing error:', error)
    return NextResponse.json(
      { 
        success: false,
        error: error instanceof Error ? error.message : 'Error processing Karate Club dataset',
      },
      { status: 500 }
    )
  }
}

export const runtime = 'nodejs'
