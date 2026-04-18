import { parse } from 'graphology-gexf/browser'
import { GraphData } from '@/types/graph'

export async function parseGEXF(file: File): Promise<GraphData> {
  try {
    const text = await file.text()
    
    // Parse GEXF into a graph
    const graph = parse(text)

    // Convert it to our format
    const nodes = graph.nodes().map(nodeId => ({
      id: nodeId,
      ...graph.getNodeAttributes(nodeId)
    }))

    const edges = graph.edges().map(edgeId => ({
      id: edgeId,
      source: graph.source(edgeId),
      target: graph.target(edgeId),
      ...graph.getEdgeAttributes(edgeId)
    }))

    return {
      nodes,
      edges,
      metadata: {
        nodeCount: nodes.length,
        edgeCount: edges.length,
        format: 'gexf',
        fileName: file.name
      }
    }
  } catch (error) {
    throw new Error(`Parsing error GEXF: ${error instanceof Error ? error.message : 'Unknown error'}`)
  }
}
