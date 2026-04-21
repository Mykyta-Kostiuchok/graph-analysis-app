import Graph from "graphology";

export interface DegreeCentralityResult {
  nodeId: string;
  degree: number;
  inDegree?: number;
  outDegree?: number;
  normalizedDegree: number;
  rank: number;
}

export function calculateDegreeCentrality(
  graph: Graph,
): DegreeCentralityResult[] {
  const nodes = graph.nodes();
  const totalNodes = nodes.length;

  if (totalNodes === 0) return [];

  const isDirected = graph.type === "directed" || graph.type === "mixed";
  const normalize = (degree: number) =>
    totalNodes > 1 ? degree / (totalNodes - 1) : 0;

  const degrees: DegreeCentralityResult[] = nodes.map((nodeId) => {
    if (isDirected) {
      const inDegree = graph.inDegree(nodeId);
      const outDegree = graph.outDegree(nodeId);
      const degree = inDegree + outDegree;
      return {
        nodeId,
        degree,
        inDegree,
        outDegree,
        normalizedDegree: normalize(degree),
        rank: 0,
      };
    }

    const degree = graph.degree(nodeId);
    return { nodeId, degree, normalizedDegree: normalize(degree), rank: 0 };
  });

  degrees.sort((a, b) => b.degree - a.degree);
  degrees.forEach((node, index) => {
    node.rank = index + 1;
  });

  return degrees;
}

export function getTopNodesByDegree(
  graph: Graph,
  limit: number = 10,
): DegreeCentralityResult[] {
  return calculateDegreeCentrality(graph).slice(0, limit);
}

export function getDegreeStatistics(graph: Graph): {
  min: number;
  max: number;
  mean: number;
  median: number;
  stdDev: number;
} {
  const degrees = calculateDegreeCentrality(graph);
  const values = degrees.map((d) => d.degree).sort((a, b) => a - b);

  if (values.length === 0) {
    return { min: 0, max: 0, mean: 0, median: 0, stdDev: 0 };
  }

  // Safe min/max from pre-sorted array — avoids spread stack overflow on large graphs
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

export function addDegreeCentralityToGraph(graph: Graph): void {
  const degrees = calculateDegreeCentrality(graph);

  degrees.forEach((degreeInfo) => {
    if (!graph.hasNode(degreeInfo.nodeId)) return;

    graph.setNodeAttribute(degreeInfo.nodeId, "degree", degreeInfo.degree);
    graph.setNodeAttribute(
      degreeInfo.nodeId,
      "normalizedDegree",
      degreeInfo.normalizedDegree,
    );
    graph.setNodeAttribute(degreeInfo.nodeId, "degreeRank", degreeInfo.rank);

    if (degreeInfo.inDegree !== undefined) {
      graph.setNodeAttribute(
        degreeInfo.nodeId,
        "inDegree",
        degreeInfo.inDegree,
      );
    }
    if (degreeInfo.outDegree !== undefined) {
      graph.setNodeAttribute(
        degreeInfo.nodeId,
        "outDegree",
        degreeInfo.outDegree,
      );
    }
  });
}
