"use client";

import { useState, useEffect } from "react";
import { ForceSimulation } from "@/components/graph/ForceSimulation";
import { NodeTooltip } from "@/components/graph/NodeTooltip";
import { GraphData } from "@/types/graph";

export default function GraphPage() {
  const [graphData, setGraphData] = useState<GraphData | null>(null);
  const [selectedNode, setSelectedNode] = useState<any>(null);
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    // Loading data from sessionStorage
    const storedData = sessionStorage.getItem("graphData");
    if (storedData) {
      try {
        const parsed = JSON.parse(storedData);
        if (parsed.graph) {
          setGraphData(parsed.graph);
        }
      } catch (error) {
        console.error("Error parsing graph data:", error);
      }
    }
  }, []);

  const handleNodeClick = (nodeId: string) => {
    if (graphData) {
      const node = graphData.nodes.find((n) => n.id === nodeId);
      if (node) {
        setSelectedNode(node);
      }
    }
  };

  const handleMouseMove = (event: React.MouseEvent) => {
    setTooltipPosition({ x: event.clientX, y: event.clientY });
  };

  if (!graphData) {
    return (
      <div className="container py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Граф не найден</h1>
          <p className="text-gray-500">
            Proszę załadować graf na stronie ładowania
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="container py-8" onMouseMove={handleMouseMove}>
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Wizualizacja grafu</h1>
        <p className="text-gray-500">
          Węzły: {graphData.nodes.length} | Żebra: {graphData.edges.length}
        </p>
      </div>

      <div className="relative">
        <ForceSimulation graphData={graphData} onNodeClick={handleNodeClick} />

        {selectedNode && (
          <NodeTooltip
            node={selectedNode}
            x={tooltipPosition.x}
            y={tooltipPosition.y}
          />
        )}
      </div>

      <div className="mt-4 text-sm text-gray-500">
        <p>• Przeciągaj węzły, aby zmienić ich pozycje</p>
        <p>• Użyj kółka myszy, aby powiększyć lub pomniejszyć</p>
        <p>• Kliknij w węzeł, aby wyświetlić szczegóły</p>
      </div>
    </div>
  );
}
