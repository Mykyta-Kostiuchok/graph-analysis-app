"use client";

import { useEffect, useRef } from "react";
import * as d3 from "d3";
import { GraphData } from "@/types/graph";

interface GraphCanvasProps {
  graphData: GraphData;
  width?: number;
  height?: number;
}

export function GraphCanvas({
  graphData,
  width = 800,
  height = 600,
}: GraphCanvasProps) {
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (!svgRef.current || !graphData.nodes.length) return;

    // Cleaning SVG
    d3.select(svgRef.current).selectAll("*").remove();

    // Creating SVG
    const svg = d3
      .select(svgRef.current)
      .attr("width", width)
      .attr("height", height)
      .attr("viewBox", [0, 0, width, height])
      .attr("preserveAspectRatio", "xMidYMid meet");

    // Creating container for the graph
    const g = svg.append("g");

    // Extracting nodes and edges
    const nodes = graphData.nodes;
    const edges = graphData.edges;

    // Creating a map of node positions
    const nodePositions = new Map<string, { x: number; y: number }>();

    // Initializing random positions for nodes
    nodes.forEach((node) => {
      nodePositions.set(node.id, {
        x: Math.random() * width,
        y: Math.random() * height,
      });
    });

    // Creating lines for edges
    const link = g
      .append("g")
      .attr("class", "links")
      .selectAll("line")
      .data(edges)
      .enter()
      .append("line")
      .attr("stroke", "#999")
      .attr("stroke-opacity", 0.6)
      .attr("stroke-width", 1);

    // Creating nodes
    const node = g
      .append("g")
      .attr("class", "nodes")
      .selectAll("circle")
      .data(nodes)
      .enter()
      .append("circle")
      .attr("r", 8)
      .attr("fill", "#69b3a2")
      .attr("stroke", "#fff")
      .attr("stroke-width", 1.5)
      // No drag functionality yet
      .on("mouseover", function () {
        d3.select(this).attr("r", 10);
      })
      .on("mouseout", function () {
        d3.select(this).attr("r", 8);
      });

    // Adding labels
    const label = g
      .append("g")
      .attr("class", "labels")
      .selectAll("text")
      .data(nodes)
      .enter()
      .append("text")
      .attr("text-anchor", "middle")
      .attr("dy", -15)
      .attr("font-size", "10px")
      .attr("fill", "#000")
      .text((d) => d.label || d.id);

    // Function for updating positions
    function ticked() {
      link
        .attr("x1", (d) => nodePositions.get(d.source)?.x || 0)
        .attr("y1", (d) => nodePositions.get(d.source)?.y || 0)
        .attr("x2", (d) => nodePositions.get(d.target)?.x || 0)
        .attr("y2", (d) => nodePositions.get(d.target)?.y || 0);

      node
        .attr("cx", (d) => {
          const pos = nodePositions.get(d.id);
          return pos ? pos.x : 0;
        })
        .attr("cy", (d) => {
          const pos = nodePositions.get(d.id);
          return pos ? pos.y : 0;
        });

      label
        .attr("x", (d) => {
          const pos = nodePositions.get(d.id);
          return pos ? pos.x : 0;
        })
        .attr("y", (d) => {
          const pos = nodePositions.get(d.id);
          return pos ? pos.y : 0;
        });
    }

    // Simple animation of positions (temporarily)
    let animationRunning = true;
    const animationInterval = setInterval(() => {
      if (!animationRunning) return;

      // Simple update of positions
      nodes.forEach((node) => {
        const pos = nodePositions.get(node.id);
        if (pos) {
          // Add some random movement
          nodePositions.set(node.id, {
            x: Math.max(
              20,
              Math.min(width - 20, pos.x + (Math.random() - 0.5) * 2),
            ),
            y: Math.max(
              20,
              Math.min(height - 20, pos.y + (Math.random() - 0.5) * 2),
            ),
          });
        }
      });

      ticked();
    }, 100);

    // Cleaning up
    return () => {
      animationRunning = false;
      clearInterval(animationInterval);
    };
  }, [graphData, width, height]);

  return (
    <div className="border rounded-lg p-4 bg-white">
      <svg ref={svgRef} width="100%" height="100%" className="border rounded" />
    </div>
  );
}
