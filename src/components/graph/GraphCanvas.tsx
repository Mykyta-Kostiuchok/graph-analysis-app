"use client";

import { forwardRef, useEffect, useImperativeHandle, useRef } from "react";
import * as d3 from "d3";
import { GraphData } from "@/types/graph";

interface GraphCanvasProps {
  graphData: GraphData;
  width?: number;
  height?: number;
}

export interface GraphCanvasHandle {
  zoomIn: () => void;
  zoomOut: () => void;
  reset: () => void;
  fit: () => void;
}

export const GraphCanvas = forwardRef<GraphCanvasHandle, GraphCanvasProps>(
  ({ graphData, width = 800, height = 600 }, ref) => {
    const svgRef = useRef<SVGSVGElement>(null);
    const zoomRef = useRef<d3.ZoomBehavior<SVGSVGElement, unknown> | null>(null);
    const gRef = useRef<SVGGElement | null>(null);

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
        .attr("r", 8)
        .attr("fill", "#69b3a2")
        .attr("stroke", "#fff")
        .attr("stroke-width", 1.5)
        .on("mouseover", function () {
          d3.select(this).attr("r", 10);
        })
        .on("mouseout", function () {
          d3.select(this).attr("r", 8);
        });

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

      let animationRunning = true;
      const animationInterval = setInterval(() => {
        if (!animationRunning) return;

        nodes.forEach((node) => {
          const pos = nodePositions.get(node.id);
          if (pos) {
            nodePositions.set(node.id, {
              x: Math.max(20, Math.min(width - 20, pos.x + (Math.random() - 0.5) * 2)),
              y: Math.max(20, Math.min(height - 20, pos.y + (Math.random() - 0.5) * 2)),
            });
          }
        });

        ticked();
      }, 100);

      return () => {
        animationRunning = false;
        clearInterval(animationInterval);
      };
    }, [graphData, width, height]);

    return (
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
    );
  },
);

GraphCanvas.displayName = "GraphCanvas";