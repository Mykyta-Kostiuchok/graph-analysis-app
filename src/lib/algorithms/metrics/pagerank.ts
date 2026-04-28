import Graph from "graphology";
import pagerankAlgorithm from "graphology-metrics/centrality/pagerank";
import { NodeMetrics } from "@/types/metrics";

export interface PageRankResult {
  nodeId: string;
  pagerank: number;
  rank: number;
}

// Calculate PageRank centrality
export function calculatePageRank(
  graph: Graph,
  options: {
    alpha?: number; // damping factor (default: 0.85)
    tolerance?: number; // convergence tolerance (default: 1e-5)
    maxIterations?: number; // maximum iterations (default: 100)
  } = {},
): PageRankResult[] {
  try {
    // Calculate PageRank using graphology-metrics
    const pagerankScores = pagerankAlgorithm(graph, {
      alpha: options.alpha || 0.85,
      tolerance: options.tolerance || 1e-5,
      maxIterations: options.maxIterations || 100,
      getEdgeWeight: "weight",
    });

    // Convert to PageRankResult format
    const nodes = Object.keys(pagerankScores);
    const pagerankResults: PageRankResult[] = nodes.map((nodeId) => ({
      nodeId,
      pagerank: pagerankScores[nodeId],
      rank: 0, // will be set later
    }));

    // Sort by PageRank score descending
    pagerankResults.sort((a, b) => b.pagerank - a.pagerank);

    // Set ranks
    pagerankResults.forEach((node, index) => {
      node.rank = index + 1;
    });

    return pagerankResults;
  } catch (error) {
    console.error("Error calculating PageRank:", error);
    return [];
  }
}

// Get top nodes by PageRank
export function getTopNodesByPageRank(
  graph: Graph,
  limit: number = 10,
  options?: {
    alpha?: number;
    tolerance?: number;
    maxIterations?: number;
  },
): PageRankResult[] {
  const results = calculatePageRank(graph, options);
  return results.slice(0, limit);
}

// Add PageRank metrics to graph attributes
export function addPageRankToGraph(
  graph: Graph,
  pagerankResults: PageRankResult[],
): void {
  pagerankResults.forEach((result) => {
    if (graph.hasNode(result.nodeId)) {
      graph.setNodeAttribute(result.nodeId, "pagerank", result.pagerank);
      graph.setNodeAttribute(result.nodeId, "pagerankRank", result.rank);
    }
  });
}
