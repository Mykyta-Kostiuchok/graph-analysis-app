import Graph, { UndirectedGraph, DirectedGraph } from 'graphology'
import { normalizeGraphData } from '../graphology'
import { GraphData } from '@/types/graph'

export interface BuiltGraphResult {
  graph: Graph
  nodeCount: number
  edgeCount: number
  isDirected: boolean
  isConnected: boolean
}

export function buildGraph(graphData: GraphData): BuiltGraphResult {
  try {
    // Normalize data
    const normalizedData = normalizeGraphData(graphData.nodes, graphData.edges)

    // Detect directionality BEFORE building the graph, on raw edge data
    const isDirected = detectIfDirected(normalizedData.edges)

    // Explicitly create the correct graph type — Louvain requires UndirectedGraph
    const graph: Graph = isDirected ? new DirectedGraph() : new UndirectedGraph()

    // Add nodes
    normalizedData.nodes.forEach(node => {
      graph.addNode(node.id, { label: node.label ?? node.id })
    })

    // Add edges, skip duplicates
    normalizedData.edges.forEach(edge => {
      if (!graph.hasEdge(edge.source, edge.target)) {
        graph.addEdge(edge.source, edge.target, { weight: edge.weight ?? 1 })
      }
    })

    const isConnected = checkIfConnected(graph)

    return {
      graph,
      nodeCount: graph.order,
      edgeCount: graph.size,
      isDirected,
      isConnected
    }
  } catch (error) {
    throw new Error(
      `Graph build error: ${error instanceof Error ? error.message : 'Unknown error'}`
    )
  }
}

 // Default to undirected when edge direction isn't explicitly provided.
function detectIfDirected(edges: GraphData['edges']): boolean {
  return false
}

// Check graph connectivity via DFS
function checkIfConnected(graph: Graph): boolean {
  if (graph.order === 0) return true
  if (graph.order === 1) return true

  try {
    const components = getConnectedComponents(graph)
    return components.length === 1
  } catch {
    return false
  }
}

function getConnectedComponents(graph: Graph): string[][] {
  const visited = new Set<string>()
  const components: string[][] = []

  graph.forEachNode(node => {
    if (!visited.has(node)) {
      const component: string[] = []
      const stack: string[] = [node]

      while (stack.length > 0) {
        const current = stack.pop()!

        if (!visited.has(current)) {
          visited.add(current)
          component.push(current)

          // Use neighbors() — works for both directed and undirected
          graph.neighbors(current).forEach(neighbor => {
            if (!visited.has(neighbor)) {
              stack.push(neighbor)
            }
          })
        }
      }

      components.push(component)
    }
  })

  return components
}

// Stub kept for API compatibility — layout is handled on the frontend
export function prepareGraphForVisualization(graph: Graph): Graph {
  return graph
}