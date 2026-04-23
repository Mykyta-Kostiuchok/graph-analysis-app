import Graph from "graphology";
import { bidirectional } from "graphology-shortest-path";
import { NodeMetrics } from "@/types/metrics";

export interface BetweennessResult {
  nodeId: string;
  betweenness: number;
  normalizedBetweenness: number;
  rank: number;
}

export interface ClosenessResult {
  nodeId: string;
  closeness: number;
  normalizedCloseness: number;
  rank: number;
}

// Calculate Betweenness Centrality using Brandes algorithm
export function calculateBetweennessCentrality(
  graph: Graph,
): BetweennessResult[] {
  const nodes = graph.nodes();
  const n = nodes.length;

  if (n === 0) return [];

  // Initialize betweenness for each node
  const betweenness: Record<string, number> = {};
  nodes.forEach((node) => {
    betweenness[node] = 0;
  });

  // For each node, calculate shortest paths
  for (const source of nodes) {
    // Brandes algorithm for betweenness calculation
    const sigma: Record<string, number> = {}; // number of shortest paths
    const dist: Record<string, number> = {};
    const delta: Record<string, number> = {};
    const queue: string[] = [];
    const predecessors: Record<string, string[]> = {};

    nodes.forEach((node) => {
      sigma[node] = 0;
      dist[node] = Infinity;
      delta[node] = 0;
      predecessors[node] = [];
    });

    sigma[source] = 1;
    dist[source] = 0;
    queue.push(source);

    const stack: string[] = [];

    // BFS
    while (queue.length > 0) {
      const currentNode = queue.shift()!;
      stack.push(currentNode);

      graph.neighbors(currentNode).forEach((neighbor) => {
        if (dist[neighbor] === Infinity) {
          dist[neighbor] = dist[currentNode] + 1;
          queue.push(neighbor);
        }

        if (dist[neighbor] === dist[currentNode] + 1) {
          sigma[neighbor] += sigma[currentNode];
          predecessors[neighbor].push(currentNode);
        }
      });
    }

    // Backward pass
    while (stack.length > 0) {
      const currentNode = stack.pop()!;
      predecessors[currentNode].forEach((pred) => {
        delta[pred] +=
          (sigma[pred] / sigma[currentNode]) * (1 + delta[currentNode]);
      });

      if (currentNode !== source) {
        betweenness[currentNode] += delta[currentNode];
      }
    }
  }

  // Check if graph is directed using graph.type property
  const isDirectedGraph = graph.type === "directed" || graph.type === "mixed";
  const normalizationFactor = isDirectedGraph
    ? (n - 1) * (n - 2)
    : ((n - 1) * (n - 2)) / 2;

  const normalizedBetweenness: BetweennessResult[] = nodes.map((nodeId) => {
    const bw = betweenness[nodeId];
    const normalizedBw = normalizationFactor > 0 ? bw / normalizationFactor : 0;

    return {
      nodeId,
      betweenness: bw,
      normalizedBetweenness: normalizedBw,
      rank: 0,
    };
  });

  // Sort by betweenness descending
  normalizedBetweenness.sort((a, b) => b.betweenness - a.betweenness);

  // Set ranks
  normalizedBetweenness.forEach((node, index) => {
    node.rank = index + 1;
  });

  return normalizedBetweenness;
}

// Calculate Closeness Centrality
export function calculateClosenessCentrality(graph: Graph): ClosenessResult[] {
  const nodes = graph.nodes();
  const n = nodes.length;

  if (n === 0) return [];

  const closenessResults: ClosenessResult[] = [];

  for (const nodeId of nodes) {
    let totalDistance = 0;
    let reachableNodes = 0;

    // Calculate distances to all other nodes
    for (const targetId of nodes) {
      if (nodeId !== targetId) {
        try {
          // Use single-source shortest path instead of bidirectional
          const distances = getAllShortestPaths(graph, nodeId);

          if (
            distances[targetId] !== undefined &&
            distances[targetId] !== Infinity
          ) {
            totalDistance += distances[targetId];
            reachableNodes++;
          }
        } catch (error) {
          // Handle cases where path calculation fails
          continue;
        }
      }
    }

    // Closeness centrality = 1 / (sum of distances)
    let closeness = 0;
    let normalizedCloseness = 0;

    if (totalDistance > 0) {
      closeness = 1 / totalDistance;
      // Normalization: reachable nodes / sum of distances
      normalizedCloseness =
        reachableNodes > 0 ? reachableNodes / totalDistance : 0;
    }

    closenessResults.push({
      nodeId,
      closeness,
      normalizedCloseness,
      rank: 0,
    });
  }

  // Sort by closeness descending
  closenessResults.sort((a, b) => b.closeness - a.closeness);

  // Set ranks
  closenessResults.forEach((node, index) => {
    node.rank = index + 1;
  });

  return closenessResults;
}

// Helper function to get all shortest paths from a source node
function getAllShortestPaths(
  graph: Graph,
  source: string,
): Record<string, number> {
  const distances: Record<string, number> = {};
  const visited = new Set<string>();
  const queue: Array<{ node: string; distance: number }> = [];

  // Initialize distances
  graph.nodes().forEach((node) => {
    distances[node] = Infinity;
  });

  distances[source] = 0;
  queue.push({ node: source, distance: 0 });

  while (queue.length > 0) {
    // Sort by distance and get the closest unvisited node
    queue.sort((a, b) => a.distance - b.distance);
    const current = queue.shift();

    if (!current || visited.has(current.node)) continue;

    visited.add(current.node);

    // Update distances to neighbors
    graph.neighbors(current.node).forEach((neighbor) => {
      if (!visited.has(neighbor)) {
        const newDistance = current.distance + 1;
        if (newDistance < distances[neighbor]) {
          distances[neighbor] = newDistance;
          queue.push({ node: neighbor, distance: newDistance });
        }
      }
    });
  }

  return distances;
}

// Get top nodes by betweenness
export function getTopNodesByBetweenness(
  graph: Graph,
  limit: number = 10,
): BetweennessResult[] {
  const results = calculateBetweennessCentrality(graph);
  return results.slice(0, limit);
}

// Get top nodes by closeness
export function getTopNodesByCloseness(
  graph: Graph,
  limit: number = 10,
): ClosenessResult[] {
  const results = calculateClosenessCentrality(graph);
  return results.slice(0, limit);
}

// Add centrality metrics to graph attributes
export function addCentralityMetricsToGraph(
  graph: Graph,
  betweennessResults: BetweennessResult[],
  closenessResults: ClosenessResult[],
): void {
  // Add betweenness metrics
  betweennessResults.forEach((result) => {
    if (graph.hasNode(result.nodeId)) {
      graph.setNodeAttribute(result.nodeId, "betweenness", result.betweenness);
      graph.setNodeAttribute(
        result.nodeId,
        "normalizedBetweenness",
        result.normalizedBetweenness,
      );
      graph.setNodeAttribute(result.nodeId, "betweennessRank", result.rank);
    }
  });

  // Add closeness metrics
  closenessResults.forEach((result) => {
    if (graph.hasNode(result.nodeId)) {
      graph.setNodeAttribute(result.nodeId, "closeness", result.closeness);
      graph.setNodeAttribute(
        result.nodeId,
        "normalizedCloseness",
        result.normalizedCloseness,
      );
      graph.setNodeAttribute(result.nodeId, "closenessRank", result.rank);
    }
  });
}
