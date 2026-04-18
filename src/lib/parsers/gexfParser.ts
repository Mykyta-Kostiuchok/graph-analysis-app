import { parse } from 'graphology-gexf/browser'
import Graph from 'graphology'
import { GraphData } from '@/types/graph'

export async function parseGEXF(file: File): Promise<GraphData> {
  try {
    const text = await file.text()
    
    // Pass the Graph constructor, not an instance — parse() creates the graph internally
    const graph = parse(Graph, text)

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