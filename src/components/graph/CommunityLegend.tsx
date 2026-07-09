"use client";

import { useState } from "react";

interface CommunityLegendProps {
  communities: number[];
  isVisible?: boolean;
  onToggle?: (isVisible: boolean) => void;
}

export function CommunityLegend({
  communities,
  isVisible = true,
  onToggle,
}: CommunityLegendProps) {
  const communityColors = [
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

  // No communities in the data at all—nothing to show in the legend
  if (communities.length === 0) {
    return null;
  }

  // user has chosen to hide the legend, show a button to toggle it back on
  if (!isVisible) {
    return (
      <button
        onClick={() => onToggle?.(true)}
        className="absolute top-4 left-4 bg-white border rounded-lg shadow-md p-2 text-sm hover:bg-gray-50 z-10"
        title="Show community legend"
      >
        Paleta kolorów
      </button>
    );
  }

  return (
    <div className="absolute top-4 left-4 bg-white border rounded-lg shadow-md p-3 z-10">
      <div className="flex justify-between items-center mb-2">
        <h3 className="font-medium text-sm">Communities</h3>
        <button
          onClick={() => onToggle?.(false)}
          className="text-gray-500 hover:text-gray-700 text-sm"
          title="Hide legend"
        >
          ✕
        </button>
      </div>

      <div className="space-y-1">
        {communities.map((communityId) => (
          <div key={communityId} className="flex items-center gap-2">
            <div
              className="w-3 h-3 rounded-full"
              style={{
                backgroundColor:
                  communityColors[communityId % communityColors.length],
              }}
            />
            <span className="text-xs">Community {communityId}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
