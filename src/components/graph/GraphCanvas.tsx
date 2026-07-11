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
import { getTopDegreeNodeIds } from "@/lib/graph/enrich-graph-data";

interface GraphCanvasProps {
  graphData: GraphData;
  width?: number;
  height?: number;
  maxLabels?: number;
}

export interface GraphCanvasHandle {
  zoomIn: () => void;
  zoomOut: () => void;
  reset: () => void;
  fit: () => void;
}

export const GraphCanvas = forwardRef<GraphCanvasHandle, GraphCanvasProps>(
  ({ graphData, width = 800, height = 600, maxLabels = 8 }, ref) => {
    const svgRef = useRef<SVGSVGElement>(null);
    const zoomRef = useRef<d3.ZoomBehavior<SVGSVGElement, unknown> | null>(
      null,
    );
    const gRef = useRef<SVGGElement | null>(null);
    const selectedNodeRef = useRef<string | null>(null);
    const topLabelIdsRef = useRef<Set<string>>(new Set());
    const [showLegend, setShowLegend] = useState(true);

    // Get unique communities
    const communities = [
      ...new Set(
        graphData.nodes
          .map((node) => (node as any).community)
          .filter((community) => community !== undefined && community !== null),
      ),
    ].sort((a, b) => a - b) as number[];

    // Default signature is displayed only for the top-N nodes by degree
    const getDefaultLabelOpacity = (nodeId: string) =>
      topLabelIdsRef.current.has(nodeId) ? 0.8 : 0;

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
    const highlightNode = (
      nodeId: string | null,
      edges: any[],
      nodes: any[],
    ) => {
      if (!svgRef.current) return;

      const svg = d3.select<SVGSVGElement, unknown>(svgRef.current);

      if (nodeId === null) {
        // Reset highlighting
        svg
          .selectAll(".links line")
          .attr("stroke-opacity", 0.6)
          .attr("stroke", "#999");

        svg
          .selectAll(".nodes circle")
          .attr("opacity", 1)
          .attr("stroke", "#fff")
          .attr("stroke-width", 1.5);

        svg
          .selectAll(".labels text")
          .attr("opacity", (d: any) => getDefaultLabelOpacity(d.id))
          .attr("font-weight", "normal");

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

      svg
        .selectAll(".labels text")
        .attr("opacity", 0.15)
        .attr("font-weight", "normal");

      // Find links connected to the selected node
      const connectedNodes = new Set<string>([nodeId]);
      const connectedLinks: string[] = [];

      edges.forEach((link) => {
        if (link.source === nodeId || link.target === nodeId) {
          connectedNodes.add(link.source);
          connectedNodes.add(link.target);
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

      // Highlight the labels
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
        return "#69b3a2"; // default color for nodes without a community
      }

      return colors[community % colors.length];
    };

    useEffect(() => {
      if (!svgRef.current || !graphData.nodes.length) return;

      const nodes = graphData.nodes.map((d) => ({ ...d }));
      const edges = graphData.edges.map((d) => ({ ...d }));

      // Top nodes by degree — their labels are displayed by default
      topLabelIdsRef.current = getTopDegreeNodeIds(graphData, maxLabels);

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

      const nodePositions = new Map<string, { x: number; y: number }>();

      nodes.forEach((node) => {
        nodePositions.set(node.id, {
          x: Math.random() * width,
          y: Math.random() * height,
        });
      });

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
        .on("click", (event, d) => {
          event.stopPropagation();

          // Switch the node selection
          if (selectedNodeRef.current === d.id) {
            selectedNodeRef.current = null;
            highlightNode(null, edges, nodes);
          } else {
            selectedNodeRef.current = d.id;
            highlightNode(d.id, edges, nodes);
          }
        })
        .on("mouseover", function (event, d: any) {
          if (!selectedNodeRef.current) {
            d3.select(this).attr("r", () => {
              const baseRadius = d.degree
                ? Math.max(8, Math.min(20, d.degree * 0.5 + 8))
                : 12;
              return baseRadius + 4;
            });

            // Show the label of the hovered node, even if it's not in the top
            g.selectAll(".labels text")
              .filter((l: any) => l.id === d.id)
              .attr("opacity", 0.9);
          }
        })
        .on("mouseout", function (event, d: any) {
          if (!selectedNodeRef.current) {
            d3.select(this).attr("r", () => {
              const baseRadius = d.degree
                ? Math.max(8, Math.min(20, d.degree * 0.5 + 8))
                : 12;
              return baseRadius;
            });

            // Return the label to its default visibility (top-N or hidden)
            g.selectAll(".labels text")
              .filter((l: any) => l.id === d.id)
              .attr("opacity", getDefaultLabelOpacity(d.id));
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
        .attr("opacity", (d) => getDefaultLabelOpacity((d as any).id))
        .text((d) => (d as any).label || d.id);

      function ticked() {
        link
          .attr("x1", (d: any) => nodePositions.get(d.source)?.x || 0)
          .attr("y1", (d: any) => nodePositions.get(d.source)?.y || 0)
          .attr("x2", (d: any) => nodePositions.get(d.target)?.x || 0)
          .attr("y2", (d: any) => nodePositions.get(d.target)?.y || 0);

        node
          .attr("cx", (d) => nodePositions.get(d.id)?.x || 0)
          .attr("cy", (d) => nodePositions.get(d.id)?.y || 0);

        label
          .attr("x", (d) => nodePositions.get(d.id)?.x || 0)
          .attr("y", (d) => nodePositions.get(d.id)?.y || 0);
      }

      // Reset selection when clicking on the background
      svg.on("click", () => {
        if (selectedNodeRef.current) {
          selectedNodeRef.current = null;
          highlightNode(null, edges, nodes);
        }
      });

      let animationRunning = true;
      const animationInterval = setInterval(() => {
        if (!animationRunning) return;

        nodes.forEach((node) => {
          const pos = nodePositions.get(node.id);
          if (pos) {
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

      return () => {
        animationRunning = false;
        clearInterval(animationInterval);
      };
    }, [graphData, width, height, maxLabels]);

    return (
      <div className="relative">
        <div
          className="border rounded-lg p-4 bg-white overflow-hidden"
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
  },
);

GraphCanvas.displayName = "GraphCanvas";
