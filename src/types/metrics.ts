export interface NodeMetrics {
  nodeId: string;
  degree: number;
  normalizedDegree: number;
  degreeRank: number;
  inDegree?: number;
  outDegree?: number;
  betweenness?: number;
  normalizedBetweenness?: number;
  betweennessRank?: number;
  closeness?: number;
  normalizedCloseness?: number;
  closenessRank?: number;
  pagerank?: number;
  pagerankRank?: number;
  community?: number;
}

export interface NetworkMetrics {
  nodeCount: number;
  edgeCount: number;
  density: number;
  averageDegree: number;
  diameter?: number;
  averagePathLength?: number;
  clusteringCoefficient?: number;
  degreeDistribution: {
    min: number;
    max: number;
    mean: number;
    median: number;
    stdDev: number;
  };
  communityCount?: number;
  modularity?: number;
}

export interface DegreeDistributionPoint {
  degree: number;
  count: number;
  frequency: number;
}

export interface NodeMetrics {
  nodeId: string;
  degree: number;
  normalizedDegree: number;
  degreeRank: number;
  inDegree?: number;
  outDegree?: number;
  betweenness?: number;
  normalizedBetweenness?: number;
  betweennessRank?: number;
  closeness?: number;
  normalizedCloseness?: number;
  closenessRank?: number;
  pagerank?: number;
  community?: number;
  [key: string]: any;
}
