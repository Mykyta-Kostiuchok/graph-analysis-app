import Graph from "graphology";
import {
  calculateDegreeCentrality,
  addDegreeCentralityToGraph,
  getDegreeStatistics,
  getTopNodesByDegree,
  DegreeCentralityResult,
} from "./degree";
import { 
  calculateBetweennessCentrality, 
  calculateClosenessCentrality,
  BetweennessResult,
  ClosenessResult 
} from "./centrality";
import { 
  calculatePageRank,
  PageRankResult 
} from "./pagerank";
import { NodeMetrics, NetworkMetrics } from "@/types/metrics";

export interface AllMetricsResult {
  nodeMetrics: NodeMetrics[];
  networkMetrics: NetworkMetrics;
}

export function calculateAllMetrics(graph: Graph): AllMetricsResult {
  // calculate all metrics
  const degreeResults = calculateDegreeCentrality(graph);
  const betweennessResults = calculateBetweennessCentrality(graph);
  const closenessResults = calculateClosenessCentrality(graph);
  const pagerankResults = calculatePageRank(graph);
  
  const degreeStats = computeStatsFromResults(degreeResults);

  // Combine node metrics into a single structure
  const nodeMetrics: NodeMetrics[] = degreeResults.map((degree) => {
    const nodeId = degree.nodeId;
    
    // Find corresponding betweenness, closeness, and pagerank results for this node
    const betweenness = betweennessResults.find(b => b.nodeId === nodeId);
    const closeness = closenessResults.find(c => c.nodeId === nodeId);
    const pagerank = pagerankResults.find(p => p.nodeId === nodeId); 
    
    return {
      nodeId: degree.nodeId,
      degree: degree.degree,
      normalizedDegree: degree.normalizedDegree,
      degreeRank: degree.rank,
      ...(degree.inDegree !== undefined && { inDegree: degree.inDegree }),
      ...(degree.outDegree !== undefined && { outDegree: degree.outDegree }),
      ...(betweenness && {
        betweenness: betweenness.betweenness,
        normalizedBetweenness: betweenness.normalizedBetweenness,
        betweennessRank: betweenness.rank
      }),
      ...(closeness && {
        closeness: closeness.closeness,
        normalizedCloseness: closeness.normalizedCloseness,
        closenessRank: closeness.rank
      }),
      ...(pagerank && {
        pagerank: pagerank.pagerank,
        pagerankRank: pagerank.rank
      })
    };
  });

  const networkMetrics: NetworkMetrics = {
    nodeCount: graph.order,
    edgeCount: graph.size,
    density: calculateDensity(graph),
    averageDegree: degreeStats.mean,
    degreeDistribution: {
      min: degreeStats.min,
      max: degreeStats.max,
      mean: degreeStats.mean,
      median: degreeStats.median,
      stdDev: degreeStats.stdDev,
    },
  };

  return { nodeMetrics, networkMetrics };
}

// Accepts pre-computed results to avoid a redundant graph traversal
function computeStatsFromResults(results: DegreeCentralityResult[]): {
  min: number;
  max: number;
  mean: number;
  median: number;
  stdDev: number;
} {
  const values = results.map((d) => d.degree).sort((a, b) => a - b);

  if (values.length === 0) {
    return { min: 0, max: 0, mean: 0, median: 0, stdDev: 0 };
  }

  const min = values[0];
  const max = values[values.length - 1];
  const mean = values.reduce((sum, val) => sum + val, 0) / values.length;

  const mid = Math.floor(values.length / 2);
  const median =
    values.length % 2 === 0 ? (values[mid - 1] + values[mid]) / 2 : values[mid];

  const variance =
    values.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) /
    values.length;
  const stdDev = Math.sqrt(variance);

  return { min, max, mean, median, stdDev };
}

function calculateDensity(graph: Graph): number {
  const n = graph.order;
  if (n <= 1) return 0;

  // Fix: graph.directed is not a valid property — use graph.type
  const isDirected = graph.type === "directed" || graph.type === "mixed";
  return isDirected
    ? graph.size / (n * (n - 1))
    : (2 * graph.size) / (n * (n - 1));
}

export {
  calculateDegreeCentrality,
  addDegreeCentralityToGraph,
  getDegreeStatistics,
  getTopNodesByDegree,
  calculateBetweennessCentrality,
  calculateClosenessCentrality,
  calculatePageRank,
};
