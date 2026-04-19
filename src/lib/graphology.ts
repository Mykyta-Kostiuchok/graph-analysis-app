import Graph from 'graphology'
import { Attributes } from 'graphology-types'
import { Node, Edge } from '@/types/graph'

export function createGraphFromData(nodes: Node[], edges: Edge[]): Graph {
  const graph = new Graph()

  // Add nodes
  nodes.forEach(node => {
    const { id, ...attributes } = node
    graph.addNode(id, attributes)
  })

  // Add edged
  edges.forEach(edge => {
    const { id, source, target, ...attributes } = edge
    // Check for the existence of nodes before adding an edge
    if (graph.hasNode(source) && graph.hasNode(target)) {
      graph.addEdge(source, target, attributes)
    }
  })

  return graph
}

// Function for adding missing nodes from edges
export function ensureAllNodesExist(graph: Graph, edges: Edge[]): void {
  const existingNodes = new Set(graph.nodes())
  
  edges.forEach(edge => {
    if (!existingNodes.has(edge.source)) {
      graph.addNode(edge.source)
      existingNodes.add(edge.source)
    }
    if (!existingNodes.has(edge.target)) {
      graph.addNode(edge.target)
      existingNodes.add(edge.target)
    }
  })
}

// Function to normalize data before creating a graph
export function normalizeGraphData(nodes: Node[], edges: Edge[]): { nodes: Node[], edges: Edge[] } {
  // Checking all nodes have id
  const normalizedNodes = nodes.map(node => ({
    id: node.id || `node_${Math.random().toString(36).substr(2, 9)}`,
    ...node
  }))

  // Checking all edges is a source and a target
  const normalizedEdges = edges.map((edge, index) => ({
    id: edge.id || `edge_${index}`,
    source: edge.source,
    target: edge.target,
    ...edge
  }))

  return { nodes: normalizedNodes, edges: normalizedEdges }
}
