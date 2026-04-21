import Graph from "graphology";
import {
  calculateDegreeCentrality,
  addDegreeCentralityToGraph,
  getDegreeStatistics,
  getTopNodesByDegree,
  DegreeCentralityResult,
} from "./degree";
import { NodeMetrics, NetworkMetrics } from "@/types/metrics";

export interface AllMetricsResult {
  nodeMetrics: NodeMetrics[];
  networkMetrics: NetworkMetrics;
}

export function calculateAllMetrics(graph: Graph): AllMetricsResult {
  // Single pass — reuse results for both node metrics and statistics
  const degreeResults = calculateDegreeCentrality(graph);
  const degreeStats = computeStatsFromResults(degreeResults);

  const nodeMetrics: NodeMetrics[] = degreeResults.map((degree) => ({
    nodeId: degree.nodeId,
    degree: degree.degree,
    normalizedDegree: degree.normalizedDegree,
    degreeRank: degree.rank,
    ...(degree.inDegree !== undefined && { inDegree: degree.inDegree }),
    ...(degree.outDegree !== undefined && { outDegree: degree.outDegree }),
  }));

  const networkMetrics: NetworkMetrics = {
    nodeCount: graph.order,
    edgeCount: graph.size,
    density: calculateDensity(graph),
    averageDegree: degreeStats.mean,
    degreeDistribution: {
      // <- Правильная структура
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
};
