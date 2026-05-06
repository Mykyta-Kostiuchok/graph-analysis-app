import { NextResponse } from 'next/server'
import { karateClubDataset } from '@/lib/datasets/karateClub'
import { buildGraph } from '@/lib/algorithms/graphBuilder'
import { calculateAllMetrics } from '@/lib/algorithms/metrics'

// demo datasets
const demoDatasets: Record<string, any> = {
  'karate': karateClubDataset,
}

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const datasetId = params.id
    
    // Check if the dataset exists
    if (!demoDatasets[datasetId]) {
      return NextResponse.json(
        { error: 'Dataset not found' },
        { status: 404 }
      )
    }

    const dataset = demoDatasets[datasetId]
    
    // Build the graph
    const graphResult = buildGraph(dataset)
    
    // Calculate metrics
    const metrics = calculateAllMetrics(graphResult.graph)
    
    const responseData = {
      success: true,
      dataset: datasetId,
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
    console.error('Demo dataset error:', error)
    return NextResponse.json(
      { 
        success: false,
        error: error instanceof Error ? error.message : 'Error processing demo dataset',
      },
      { status: 500 }
    )
  }
}

export const runtime = 'nodejs'
