import { NextResponse } from 'next/server'
import { buildGraph } from '@/lib/algorithms/graphBuilder'
import { calculateAllMetrics } from '@/lib/algorithms/metrics'
import { GraphData } from '@/types/graph'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { nodes, edges }: GraphData = body
    
    if (!nodes || !edges) {
      return NextResponse.json(
        { error: 'Node and edge data required' },
        { status: 400 }
      )
    }

    // Build graph
    const buildResult = buildGraph({ nodes, edges })
    
    // Calculate metrics
    const metrics = calculateAllMetrics(buildResult.graph)
    
    // Convert the graph into a serializable format
    const graphAttributes = {
      nodes: buildResult.graph.nodes().map(node => ({
        id: node,
        ...buildResult.graph.getNodeAttributes(node)
      })),
      edges: buildResult.graph.edges().map(edge => ({
        id: edge,
        source: buildResult.graph.source(edge),
        target: buildResult.graph.target(edge),
        ...buildResult.graph.getEdgeAttributes(edge)
      }))
    }

    return NextResponse.json({
      success: true,
      graph: graphAttributes,
      metrics: metrics,
      stats: {
        nodeCount: buildResult.nodeCount,
        edgeCount: buildResult.edgeCount,
        isDirected: buildResult.isDirected,
        isConnected: buildResult.isConnected
      }
    })
  } catch (error) {
    console.error('Graph building error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Error while constructing graph' },
      { status: 500 }
    )
  }
}

export const runtime = 'nodejs'
