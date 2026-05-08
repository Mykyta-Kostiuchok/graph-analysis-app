"use client";

import { useEffect, useRef } from "react";
import * as d3 from "d3";
import { GraphData } from "@/types/graph";

interface ForceSimulationProps {
  graphData: GraphData;
  width?: number;
  height?: number;
  onNodeClick?: (nodeId: string, nodeData: any) => void;
}

export function ForceSimulation({
  graphData,
  width = 800,
  height = 600,
  onNodeClick,
}: ForceSimulationProps) {
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (!svgRef.current || !graphData.nodes.length) return;

    // Clear SVG
    d3.select(svgRef.current).selectAll("*").remove();

    // Create SVG
    const svg = d3
      .select(svgRef.current)
      .attr("width", width)
      .attr("height", height)
      .attr("viewBox", [0, 0, width, height])
      .attr("preserveAspectRatio", "xMidYMid meet")
      .classed("cursor-move", true);

    // Create group for zoom
    const g = svg.append("g");

    // Set up zoom
    const zoom = d3
      .zoom<SVGSVGElement, unknown>()
      .scaleExtent([0.1, 8])
      .on("zoom", (event) => {
        g.attr("transform", event.transform);
      });

    svg.call(zoom as any);

    // Create force simulation
    const simulation = d3
      .forceSimulation(graphData.nodes as d3.SimulationNodeDatum[])
      .force(
        "link",
        d3
          .forceLink(graphData.edges)
          .id((d: any) => d.id)
          .distance(50)
          .strength(1),
      )
      .force("charge", d3.forceManyBody().strength(-300).distanceMax(200))
      .force("center", d3.forceCenter(width / 2, height / 2))
      .force("collision", d3.forceCollide().radius(25).strength(0.7))
      .alphaDecay(0.02)
      .velocityDecay(0.4);

    // Create lines for edges
    const link = g
      .append("g")
      .attr("class", "links")
      .selectAll("line")
      .data(graphData.edges)
      .enter()
      .append("line")
      .attr("stroke", "#999")
      .attr("stroke-opacity", 0.6)
      .attr("stroke-width", (d) => Math.sqrt((d as any).weight || 1));

    // Create nodes
    const node = g
      .append("g")
      .attr("class", "nodes")
      .selectAll("circle")
      .data(graphData.nodes)
      .enter()
      .append("circle")
      .attr("r", (d) => {
        // The size of the node depends on the degree, if any
        const degree = (d as any).degree;
        return degree ? Math.max(8, Math.min(20, degree * 0.5 + 8)) : 12;
      })
      .attr("fill", (d) => {
        // Colors by communities if available
        const community = (d as any).community;
        const colors = [
          "#ff7f0e",
          "#2ca02c",
          "#d62728",
          "#9467bd",
          "#8c564b",
          "#e377c2",
          "#7f7f7f",
          "#bcbd22",
          "#17becf",
        ];
        if (community !== undefined && community >= 0) {
          return colors[community % colors.length];
        }
        return "#1f77b4";
      })
      .attr("stroke", "#fff")
      .attr("stroke-width", 1.5)
      .call(drag(simulation) as any)
      .on("click", (event, d) => {
        if (onNodeClick) onNodeClick(d.id, d);
      })
      .on("mouseover", function (event, d) {
        d3.select(this)
          .attr("r", (d: any) => {
            const baseRadius = (d as any).degree
              ? Math.max(8, Math.min(20, (d as any).degree * 0.5 + 8))
              : 12;
            return baseRadius + 4;
          })
          .attr("stroke", "#000")
          .attr("stroke-width", 2);
      })
      .on("mouseout", function (event, d) {
        d3.select(this)
          .attr("r", (d: any) => {
            const baseRadius = (d as any).degree
              ? Math.max(8, Math.min(20, (d as any).degree * 0.5 + 8))
              : 12;
            return baseRadius;
          })
          .attr("stroke", "#fff")
          .attr("stroke-width", 1.5);
      });

    // Add labels
    const label = g
      .append("g")
      .attr("class", "labels")
      .selectAll("text")
      .data(graphData.nodes)
      .enter()
      .append("text")
      .attr("text-anchor", "middle")
      .attr("dy", -20)
      .attr("font-size", "10px")
      .attr("fill", "#000")
      .attr("pointer-events", "none")
      .attr("opacity", 0.8)
      .text((d) => {
        // Show only ID or label
        return (d as any).label || d.id;
      });

    // Function to update positions
    function ticked() {
      link
        .attr("x1", (d) => (d.source as any).x)
        .attr("y1", (d) => (d.source as any).y)
        .attr("x2", (d) => (d.target as any).x)
        .attr("y2", (d) => (d.target as any).y);

      node.attr("cx", (d) => (d as any).x).attr("cy", (d) => (d as any).y);

      label.attr("x", (d) => (d as any).x).attr("y", (d) => (d as any).y);
    }

    // Start the simulation
    simulation.on("tick", ticked);

    // Drag function
    function drag(
      simulation: d3.Simulation<d3.SimulationNodeDatum, undefined>,
    ) {
      function dragstarted(event: any, d: any) {
        if (!event.active) simulation.alphaTarget(0.3).restart();
        d.fx = d.x;
        d.fy = d.y;
      }

      function dragged(event: any, d: any) {
        d.fx = event.x;
        d.fy = event.y;
      }

      function dragended(event: any, d: any) {
        if (!event.active) simulation.alphaTarget(0);
        d.fx = null;
        d.fy = null;
      }

      return d3
        .drag()
        .on("start", dragstarted)
        .on("drag", dragged)
        .on("end", dragended);
    }

    // Clear on unmount
    return () => {
      simulation.stop();
    };
  }, [graphData, width, height, onNodeClick]);

  return (
    <div className="border rounded-lg p-2 bg-white overflow-hidden">
      <svg ref={svgRef} width="100%" height="100%" className="border rounded" />
    </div>
  );
}
