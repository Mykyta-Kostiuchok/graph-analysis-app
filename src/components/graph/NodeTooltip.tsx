"use client";

import { useState, useEffect } from "react";

interface NodeTooltipProps {
  node: {
    id: string;
    label?: string;
    [key: string]: any;
  } | null;
  x: number;
  y: number;
}

export function NodeTooltip({ node, x, y }: NodeTooltipProps) {
  if (!node) return null;

  return (
    <div
      className="absolute bg-white border rounded-lg shadow-lg p-3 pointer-events-none z-50"
      style={{
        left: x + 10,
        top: y + 10,
        minWidth: "200px",
      }}
    >
      <div className="font-bold text-lg mb-2">{node.label || node.id}</div>

      <div className="space-y-1 text-sm">
        {node.degree !== undefined && (
          <div>
            <span className="font-medium">Degree:</span> {node.degree}
          </div>
        )}
        {node.community !== undefined && (
          <div>
            <span className="font-medium">Community:</span> {node.community}
          </div>
        )}
        {node.pagerank !== undefined && (
          <div>
            <span className="font-medium">PageRank:</span>{" "}
            {node.pagerank.toFixed(4)}
          </div>
        )}
        {node.betweenness !== undefined && (
          <div>
            <span className="font-medium">Betweenness:</span>{" "}
            {node.betweenness.toFixed(2)}
          </div>
        )}
        {node.closeness !== undefined && (
          <div>
            <span className="font-medium">Closeness:</span>{" "}
            {node.closeness.toFixed(4)}
          </div>
        )}
      </div>
    </div>
  );
}
