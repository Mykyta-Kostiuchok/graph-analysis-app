import { NextResponse } from 'next/server'
import { buildGraph } from '@/lib/algorithms/graphBuilder'
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
    const result = buildGraph({ nodes, edges })
    
    // Convert the graph into a serializable format for the response
    const graphAttributes = {
      nodes: result.graph.nodes().map(node => ({
        id: node,
        ...result.graph.getNodeAttributes(node)
      })),
      edges: result.graph.edges().map(edge => ({
        id: edge,
        source: result.graph.source(edge),
        target: result.graph.target(edge),
        ...result.graph.getEdgeAttributes(edge)
      }))
    }

    return NextResponse.json({
      success: true,
      graph: graphAttributes,
      stats: {
        nodeCount: result.nodeCount,
        edgeCount: result.edgeCount,
        isDirected: result.isDirected,
        isConnected: result.isConnected
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
