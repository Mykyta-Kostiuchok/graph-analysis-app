export interface Node {
  id: string;
  label?: string;
  x?: number;
  y?: number;
  size?: number;
  color?: string;
  [key: string]: any;
}

export interface Edge {
  id: string;
  source: string;
  target: string;
  weight?: number;
  [key: string]: any;
}

export interface GraphData {
  nodes: Node[];
  edges: Edge[];
  metadata?: {
    nodeCount: number;
    edgeCount: number;
    format: "csv" | "graphml" | "gexf";
    fileName: string;
  };
}
