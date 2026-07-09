"use client";

import {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from "react";
import * as d3 from "d3";
import { GraphData } from "@/types/graph";
import { CommunityLegend } from "./CommunityLegend";

interface ForceSimulationProps {
  graphData: GraphData;
  width?: number;
  height?: number;
  onNodeClick?: (nodeId: string, nodeData: any) => void;
}

export interface ForceSimulationHandle {
  zoomIn: () => void;
  zoomOut: () => void;
  reset: () => void;
  fit: () => void;
}

export const ForceSimulation = forwardRef<
  ForceSimulationHandle,
  ForceSimulationProps
>(({ graphData, width = 800, height = 600, onNodeClick }, ref) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const zoomRef = useRef<d3.ZoomBehavior<SVGSVGElement, unknown> | null>(null);
  const gRef = useRef<SVGGElement | null>(null);
  const selectedNodeRef = useRef<string | null>(null);
  const [showLegend, setShowLegend] = useState(true);

  // Get unique communities
  const communities = [
    ...new Set(
      graphData.nodes
        .map((node) => (node as any).community)
        .filter((community) => community !== undefined && community !== null),
    ),
  ].sort((a, b) => a - b) as number[];

  useImperativeHandle(ref, () => ({
    zoomIn: () => {
      if (!svgRef.current || !zoomRef.current) return;
      d3.select<SVGSVGElement, unknown>(svgRef.current)
        .transition()
        .duration(200)
        .call(zoomRef.current.scaleBy, 1.3);
    },
    zoomOut: () => {
      if (!svgRef.current || !zoomRef.current) return;
      d3.select<SVGSVGElement, unknown>(svgRef.current)
        .transition()
        .duration(200)
        .call(zoomRef.current.scaleBy, 1 / 1.3);
    },
    reset: () => {
      if (!svgRef.current || !zoomRef.current) return;
      d3.select<SVGSVGElement, unknown>(svgRef.current)
        .transition()
        .duration(300)
        .call(zoomRef.current.transform, d3.zoomIdentity);
    },
    fit: () => {
      if (!svgRef.current || !gRef.current || !zoomRef.current) return;
      const bounds = gRef.current.getBBox();
      if (!bounds.width || !bounds.height) return;

      const scale = Math.min(
        0.9 / Math.max(bounds.width / width, bounds.height / height),
        8,
      );
      const translateX = width / 2 - scale * (bounds.x + bounds.width / 2);
      const translateY = height / 2 - scale * (bounds.y + bounds.height / 2);

      d3.select<SVGSVGElement, unknown>(svgRef.current)
        .transition()
        .duration(400)
        .call(
          zoomRef.current.transform,
          d3.zoomIdentity.translate(translateX, translateY).scale(scale),
        );
    },
  }));

  // Function to highlight a node and its connected edges
  const highlightNode = (nodeId: string | null, links: any[], nodes: any[]) => {
    if (!svgRef.current) return;

    const svg = d3.select<SVGSVGElement, unknown>(svgRef.current);

    if (nodeId === null) {
      // Reset highlighting - return everything to its normal state
      svg
        .selectAll(".links line")
        .attr("stroke-opacity", 0.6)
        .attr("stroke", "#999");

      svg
        .selectAll(".nodes circle")
        .attr("opacity", 1)
        .attr("stroke", "#fff")
        .attr("stroke-width", 1.5);

      svg.selectAll(".labels text").attr("opacity", 0.8);

      return;
    }

    // Dim all nodes and links
    svg
      .selectAll(".links line")
      .attr("stroke-opacity", 0.1)
      .attr("stroke", "#999");

    svg
      .selectAll(".nodes circle")
      .attr("opacity", 0.3)
      .attr("stroke", "#fff")
      .attr("stroke-width", 1.5);

    svg.selectAll(".labels text").attr("opacity", 0.3);

    // Find all links connected to the selected node
    const connectedNodes = new Set<string>([nodeId]);
    const connectedLinks: string[] = [];

    links.forEach((link) => {
      if (link.source.id === nodeId || link.target.id === nodeId) {
        connectedNodes.add(link.source.id);
        connectedNodes.add(link.target.id);
        connectedLinks.push(link.id);
      }
    });

    // Highlight connected nodes
    svg
      .selectAll(".nodes circle")
      .filter((d: any) => connectedNodes.has(d.id))
      .attr("opacity", 1)
      .attr("stroke", "#ff0000")
      .attr("stroke-width", 2);

    // Highlight connected links
    svg
      .selectAll(".links line")
      .filter((d: any) => connectedLinks.includes(d.id))
      .attr("stroke-opacity", 1)
      .attr("stroke", "#ff0000")
      .attr("stroke-width", 2);

    // Highlight labels of connected nodes
    svg
      .selectAll(".labels text")
      .filter((d: any) => connectedNodes.has(d.id))
      .attr("opacity", 1)
      .attr("font-weight", "bold");
  };

  // Color palette for communities
  const getCommunityColor = (community: number | undefined) => {
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
      "#1f77b4",
    ];

    if (community === undefined || community === null) {
      return "#1f77b4"; // default color for nodes without a community
    }

    return colors[community % colors.length];
  };

  useEffect(() => {
    if (!svgRef.current || !graphData.nodes.length) return;

    const nodes = graphData.nodes.map((d) => ({ ...d }));
    const edges = graphData.edges.map((d) => ({ ...d }));

    const svg = d3.select<SVGSVGElement, unknown>(svgRef.current);
    svg.selectAll("*").remove();

    svg
      .attr("width", width)
      .attr("height", height)
      .attr("viewBox", [0, 0, width, height])
      .attr("preserveAspectRatio", "xMidYMid meet")
      .classed("cursor-move", true);

    const g = svg.append<SVGGElement>("g");
    gRef.current = g.node();

    const zoom = d3
      .zoom<SVGSVGElement, unknown>()
      .scaleExtent([0.1, 8])
      .on("zoom", (event) => {
        g.attr("transform", event.transform);
      });

    zoomRef.current = zoom;
    svg.call(zoom);
    svg.on("dblclick.zoom", () => {
      svg.transition().duration(300).call(zoom.transform, d3.zoomIdentity);
    });

    const simulation = d3
      .forceSimulation(nodes as d3.SimulationNodeDatum[])
      .force(
        "link",
        d3
          .forceLink(edges)
          .id((d: any) => d.id)
          .distance(50)
          .strength(1),
      )
      .force("charge", d3.forceManyBody().strength(-300).distanceMax(200))
      .force("center", d3.forceCenter(width / 2, height / 2))
      .force("collision", d3.forceCollide().radius(25).strength(0.7))
      .alphaDecay(0.02)
      .velocityDecay(0.4);

    const link = g
      .append("g")
      .attr("class", "links")
      .selectAll("line")
      .data(edges)
      .enter()
      .append("line")
      .attr("stroke", "#999")
      .attr("stroke-opacity", 0.6)
      .attr("stroke-width", (d) => Math.sqrt((d as any).weight || 1));

    const node = g
      .append("g")
      .attr("class", "nodes")
      .selectAll("circle")
      .data(nodes)
      .enter()
      .append("circle")
      .attr("r", (d) => {
        const degree = (d as any).degree;
        return degree ? Math.max(8, Math.min(20, degree * 0.5 + 8)) : 12;
      })
      .attr("fill", (d) => getCommunityColor((d as any).community))
      .attr("stroke", "#fff")
      .attr("stroke-width", 1.5)
      .call(drag(simulation) as any)
      .on("click", (event, d) => {
        event.stopPropagation();

        // Switch the node selection
        if (selectedNodeRef.current === d.id) {
          // If clicked on an already selected node - remove selection
          selectedNodeRef.current = null;
          highlightNode(null, edges, nodes);
          if (onNodeClick) onNodeClick(d.id, null);
        } else {
          // Select a new node
          selectedNodeRef.current = d.id;
          highlightNode(d.id, edges, nodes);
          if (onNodeClick) onNodeClick(d.id, d);
        }
      })
      .on("mouseover", function (event, d) {
        if (!selectedNodeRef.current) {
          d3.select(this)
            .attr("r", (d: any) => {
              const baseRadius = (d as any).degree
                ? Math.max(8, Math.min(20, (d as any).degree * 0.5 + 8))
                : 12;
              return baseRadius + 4;
            })
            .attr("stroke", "#000")
            .attr("stroke-width", 2);
        }
      })
      .on("mouseout", function (event, d) {
        if (!selectedNodeRef.current) {
          d3.select(this)
            .attr("r", (d: any) => {
              const baseRadius = (d as any).degree
                ? Math.max(8, Math.min(20, (d as any).degree * 0.5 + 8))
                : 12;
              return baseRadius;
            })
            .attr("stroke", "#fff")
            .attr("stroke-width", 1.5);
        }
      });

    const label = g
      .append("g")
      .attr("class", "labels")
      .selectAll("text")
      .data(nodes)
      .enter()
      .append("text")
      .attr("text-anchor", "middle")
      .attr("dy", -20)
      .attr("font-size", "10px")
      .attr("fill", "#000")
      .attr("pointer-events", "none")
      .attr("opacity", 0.8)
      .text((d) => (d as any).label || d.id);

    function ticked() {
      link
        .attr("x1", (d) => (d.source as any).x)
        .attr("y1", (d) => (d.source as any).y)
        .attr("x2", (d) => (d.target as any).x)
        .attr("y2", (d) => (d.target as any).y);

      node.attr("cx", (d) => (d as any).x).attr("cy", (d) => (d as any).y);
      label.attr("x", (d) => (d as any).x).attr("y", (d) => (d as any).y);
    }

    simulation.on("tick", ticked);

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

    // Reset selection when clicking on the background
    svg.on("click", () => {
      if (selectedNodeRef.current) {
        selectedNodeRef.current = null;
        highlightNode(null, edges, nodes);
        if (onNodeClick) onNodeClick("", null);
      }
    });

    return () => {
      simulation.stop();
    };
  }, [graphData, width, height, onNodeClick]);

  return (
    <div className="relative">
      <div
        className="border rounded-lg p-2 bg-white overflow-hidden"
        style={{ width, height }}
      >
        <svg
          ref={svgRef}
          width={width}
          height={height}
          className="border rounded"
        />
      </div>

      {/* Community Legend */}
      <CommunityLegend
        communities={communities}
        isVisible={showLegend}
        onToggle={setShowLegend}
      />
    </div>
  );
});

ForceSimulation.displayName = "ForceSimulation";
