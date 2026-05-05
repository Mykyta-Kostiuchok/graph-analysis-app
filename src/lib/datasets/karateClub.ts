import { GraphData } from '@/types/graph'

// Zachary's Karate Club dataset
// Nodes represent members of a university karate club
// Edges represent interactions between members outside the club
export const karateClubDataset: GraphData = {
  nodes: Array.from({ length: 34 }, (_, i) => ({ 
    id: `node_${i}`, 
    label: `Member ${i}` 
  })),
  edges: [
    // Original edges from Zachary's study (1977)
    { id: "e0", source: "node_0", target: "node_1" },
    { id: "e1", source: "node_0", target: "node_2" },
    { id: "e2", source: "node_0", target: "node_3" },
    { id: "e3", source: "node_0", target: "node_4" },
    { id: "e4", source: "node_0", target: "node_5" },
    { id: "e5", source: "node_0", target: "node_6" },
    { id: "e6", source: "node_0", target: "node_7" },
    { id: "e7", source: "node_0", target: "node_8" },
    { id: "e8", source: "node_0", target: "node_10" },
    { id: "e9", source: "node_0", target: "node_11" },
    { id: "e10", source: "node_0", target: "node_12" },
    { id: "e11", source: "node_0", target: "node_13" },
    { id: "e12", source: "node_0", target: "node_17" },
    { id: "e13", source: "node_0", target: "node_19" },
    { id: "e14", source: "node_0", target: "node_21" },
    { id: "e15", source: "node_0", target: "node_31" },
    { id: "e16", source: "node_1", target: "node_2" },
    { id: "e17", source: "node_1", target: "node_3" },
    { id: "e18", source: "node_1", target: "node_7" },
    { id: "e19", source: "node_1", target: "node_13" },
    { id: "e20", source: "node_1", target: "node_17" },
    { id: "e21", source: "node_1", target: "node_19" },
    { id: "e22", source: "node_1", target: "node_21" },
    { id: "e23", source: "node_1", target: "node_30" },
    { id: "e24", source: "node_2", target: "node_3" },
    { id: "e25", source: "node_2", target: "node_7" },
    { id: "e26", source: "node_2", target: "node_8" },
    { id: "e27", source: "node_2", target: "node_9" },
    { id: "e28", source: "node_2", target: "node_13" },
    { id: "e29", source: "node_2", target: "node_27" },
    { id: "e30", source: "node_2", target: "node_28" },
    { id: "e31", source: "node_2", target: "node_32" },
    { id: "e32", source: "node_3", target: "node_7" },
    { id: "e33", source: "node_3", target: "node_12" },
    { id: "e34", source: "node_3", target: "node_13" },
    { id: "e35", source: "node_4", target: "node_6" },
    { id: "e36", source: "node_4", target: "node_10" },
    { id: "e37", source: "node_5", target: "node_6" },
    { id: "e38", source: "node_5", target: "node_10" },
    { id: "e39", source: "node_5", target: "node_16" },
    { id: "e40", source: "node_6", target: "node_16" },
    { id: "e41", source: "node_8", target: "node_30" },
    { id: "e42", source: "node_8", target: "node_32" },
    { id: "e43", source: "node_8", target: "node_33" },
    { id: "e44", source: "node_9", target: "node_33" },
    { id: "e45", source: "node_13", target: "node_33" },
    { id: "e46", source: "node_14", target: "node_32" },
    { id: "e47", source: "node_14", target: "node_33" },
    { id: "e48", source: "node_15", target: "node_32" },
    { id: "e49", source: "node_15", target: "node_33" },
    { id: "e50", source: "node_18", target: "node_32" },
    { id: "e51", source: "node_18", target: "node_33" },
    { id: "e52", source: "node_19", target: "node_33" },
    { id: "e53", source: "node_20", target: "node_32" },
    { id: "e54", source: "node_20", target: "node_33" },
    { id: "e55", source: "node_22", target: "node_32" },
    { id: "e56", source: "node_22", target: "node_33" },
    { id: "e57", source: "node_23", target: "node_25" },
    { id: "e58", source: "node_23", target: "node_27" },
    { id: "e59", source: "node_23", target: "node_29" },
    { id: "e60", source: "node_23", target: "node_32" },
    { id: "e61", source: "node_23", target: "node_33" },
    { id: "e62", source: "node_24", target: "node_25" },
    { id: "e63", source: "node_24", target: "node_27" },
    { id: "e64", source: "node_24", target: "node_31" },
    { id: "e65", source: "node_25", target: "node_31" },
    { id: "e66", source: "node_26", target: "node_29" },
    { id: "e67", source: "node_26", target: "node_33" },
    { id: "e68", source: "node_27", target: "node_33" },
    { id: "e69", source: "node_28", target: "node_31" },
    { id: "e70", source: "node_28", target: "node_33" },
    { id: "e71", source: "node_29", target: "node_32" },
    { id: "e72", source: "node_29", target: "node_33" },
    { id: "e73", source: "node_30", target: "node_32" },
    { id: "e74", source: "node_30", target: "node_33" },
    { id: "e75", source: "node_31", target: "node_32" },
    { id: "e76", source: "node_31", target: "node_33" },
    { id: "e77", source: "node_32", target: "node_33" }
  ]
}

// Save as JSON file function
export function getKarateClubAsJSON(): string {
  return JSON.stringify(karateClubDataset, null, 2)
}

// Save as CSV file function (edges only)
export function getKarateClubAsCSV(): string {
  const header = "source,target\n"
  const edges = karateClubDataset.edges
    .map(edge => `${edge.source},${edge.target}`)
    .join('\n')
  return header + edges
}
