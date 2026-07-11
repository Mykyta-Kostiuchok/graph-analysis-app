import { GraphData } from "@/types/graph";
import { buildGraph } from "@/lib/algorithms/graphBuilder";
import { calculateAllMetrics } from "@/lib/algorithms/metrics";

// Enriches the graph data with metrics calculated for each node.
// Metrics include degree, betweenness, closeness, pagerank, and community (via Louvain).
// Returns a new GraphData object with these metrics merged into the nodes.
export function enrichGraphDataWithMetrics(graphData: GraphData): GraphData {
  const { graph } = buildGraph(graphData);
  const { nodeMetrics } = calculateAllMetrics(graph);
  const metricsById = new Map(nodeMetrics.map((m) => [m.nodeId, m]));

  return {
    ...graphData,
    nodes: graphData.nodes.map((node) => {
      const metrics = metricsById.get(node.id);
      if (!metrics) return node;
      
      return {
        ...node,
        degree: metrics.degree,
        degreeRank: metrics.degreeRank,
        ...(metrics.community !== undefined && {
          community: metrics.community,
        }),
        ...(metrics.pagerank !== undefined && {
          pagerank: metrics.pagerank,
        }),
        ...(metrics.betweenness !== undefined && {
          betweenness: metrics.betweenness,
        }),
        ...(metrics.closeness !== undefined && {
          closeness: metrics.closeness,
        }),
      };
    }),
  };
}

// Returns a Set of node ids with the highest degree (top-N) —
// used to determine which nodes to show labels for by default.
export function getTopDegreeNodeIds(
  graphData: GraphData,
  maxLabels: number,
): Set<string> {
  const sorted = [...graphData.nodes].sort(
    (a, b) => ((b as any).degree ?? 0) - ((a as any).degree ?? 0),
  );
  return new Set(sorted.slice(0, maxLabels).map((n) => n.id));
}
