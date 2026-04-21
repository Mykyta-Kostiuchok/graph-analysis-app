import { parse } from 'graphology-graphml'
import Graph from 'graphology'
import { GraphData } from '@/types/graph'

export async function parseGraphML(file: File): Promise<GraphData> {
  try {
    const text = await file.text()

    // First arg is the Graph constructor, second is the string — mirrors the GEXF parser
       const graph = parse(Graph, text, {
      addMissingNodes: true
    })

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
        format: 'graphml',
        fileName: file.name
      }
    }
  } catch (error) {
    throw new Error(`Parsing error GraphML: ${error instanceof Error ? error.message : 'Unknown error'}`)
  }
}