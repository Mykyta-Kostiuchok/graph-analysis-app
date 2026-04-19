import Graph from 'graphology'
import { createGraphFromData, normalizeGraphData } from '../graphology'
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
    // Normalizing data
    const normalizedData = normalizeGraphData(graphData.nodes, graphData.edges)
    
    // Create graph
    const graph = createGraphFromData(normalizedData.nodes, normalizedData.edges)
    
    // Determine graph properties
    const isDirected = detectIfDirected(graph)
    const isConnected = checkIfConnected(graph)
    
    return {
      graph,
      nodeCount: graph.order, // number of nodes
      edgeCount: graph.size,  // number of edge
      isDirected,
      isConnected
    }
  } catch (error) {
    throw new Error(`Ошибка построения графа: ${error instanceof Error ? error.message : 'Неизвестная ошибка'}`)
  }
}

// Checking whether a graph is directed
function detectIfDirected(graph: Graph): boolean {
  // Check all edges for inverses
  let isDirected = false
  
  graph.forEachEdge((edge, attrs, source, target) => {
    if (!graph.hasEdge(target, source)) {
      isDirected = true
      return false // break the loop
    }
  })
  
  return isDirected
}

// Checking graph connectivity
function checkIfConnected(graph: Graph): boolean {
  if (graph.order === 0) return true
  if (graph.order === 1) return true
  
  try {
    // For a simple check we use connected components
    const components = getConnectedComponents(graph)
    return components.length === 1
  } catch {
    return false
  }
}

// Take from graphology components
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
          
          // Add neighbors to stack
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

// Function to prepare the graph for visualization
export function prepareGraphForVisualization(graph: Graph): Graph {
  
  return graph
}
