import { GraphData, Node } from "@/types/graph";

export function detectCommunities(graphData: GraphData): Map<string, number> {
  const { nodes, edges } = graphData;

  // build adjacency list for neighbors
  const neighbors = new Map<string, string[]>();
  nodes.forEach((n) => neighbors.set(n.id, []));

  edges.forEach((e) => {
    neighbors.get(e.source)?.push(e.target);
    neighbors.get(e.target)?.push(e.source);
  });

  // Initialize: each node has its own unique label
  const labels = new Map<string, string>();
  nodes.forEach((n) => labels.set(n.id, n.id));

  const maxIterations = 100;
  const nodeIds = nodes.map((n) => n.id);

  for (let iter = 0; iter < maxIterations; iter++) {
    let changed = false;

    // Shuffle the order of node traversal for better convergence
    const shuffled = [...nodeIds].sort(() => Math.random() - 0.5);

    for (const nodeId of shuffled) {
      const neighborIds = neighbors.get(nodeId) || [];
      if (neighborIds.length === 0) continue;

      // Count the frequency of labels among neighbors
      const labelCounts = new Map<string, number>();
      neighborIds.forEach((neighborId) => {
        const label = labels.get(neighborId)!;
        labelCounts.set(label, (labelCounts.get(label) || 0) + 1);
      });

      // Find the label(s) with the maximum frequency
      let maxCount = 0;
      let candidates: string[] = [];
      labelCounts.forEach((count, label) => {
        if (count > maxCount) {
          maxCount = count;
          candidates = [label];
        } else if (count === maxCount) {
          candidates.push(label);
        }
      });

      // If equal, we select a candidate at random (reduces variability)
      const newLabel = candidates[Math.floor(Math.random() * candidates.length)];

      if (newLabel !== labels.get(nodeId)) {
        labels.set(nodeId, newLabel);
        changed = true;
      }
    }

    if (!changed) break;
  }

  // renumber the labels to the compact integers 0, 1, 2, ...
  const uniqueLabels = [...new Set(labels.values())];
  const labelToIndex = new Map<string, number>();
  uniqueLabels.forEach((label, index) => labelToIndex.set(label, index));

  const result = new Map<string, number>();
  labels.forEach((label, nodeId) => {
    result.set(nodeId, labelToIndex.get(label)!);
  });

  return result;
}

/**
 * Returns a new GraphData with a `community` field set on each node (if it wasn't already set in the original data).
 */
export function withDetectedCommunities(graphData: GraphData): GraphData {
  const hasExistingCommunities = graphData.nodes.some(
    (n) => (n as any).community !== undefined && (n as any).community !== null,
  );

  if (hasExistingCommunities) {
    return graphData;
  }

  const communityMap = detectCommunities(graphData);

  return {
    ...graphData,
    nodes: graphData.nodes.map((node) => ({
      ...node,
      community: communityMap.get(node.id),
    })),
  };
}