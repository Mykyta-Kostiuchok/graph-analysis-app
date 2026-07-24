"use client";

import {
  Circle,
  Waypoints,
  Gauge,
  Route,
  Activity,
  Users,
  Puzzle,
} from "lucide-react";
import { NetworkMetrics } from "@/types/metrics";

interface NetworkMetricsCardsProps {
  metrics: NetworkMetrics;
}

interface MetricCardProps {
  icon: React.ReactNode;
  accentClassName: string;
  label: string;
  value: string;
  caption?: string;
}

function MetricCard({
  icon,
  accentClassName,
  label,
  value,
  caption,
}: MetricCardProps) {
  return (
    <div className="border rounded-lg p-4 bg-white flex flex-col gap-2">
      <div
        className={`w-8 h-8 rounded-md flex items-center justify-center ${accentClassName}`}
      >
        {icon}
      </div>
      <div className="text-2xl md:text-3xl font-bold leading-none">{value}</div>
      <div className="text-sm text-gray-500">{label}</div>
      {caption && <div className="text-xs text-gray-400">{caption}</div>}
    </div>
  );
}

// Formats a 0-1 density fraction as a percentage, e.g. 0.174 -> "17.4%"
function formatDensity(density: number): string {
  return `${(density * 100).toFixed(1)}%`;
}

// Diameter can be Infinity (disconnected graph) or undefined (not computed / calc failed)
function formatDiameter(diameter: number | undefined): {
  value: string;
  caption?: string;
} {
  if (diameter === undefined) {
    return { value: "—", caption: "Not available" };
  }
  if (!Number.isFinite(diameter)) {
    return { value: "∞", caption: "Graph is disconnected" };
  }
  return { value: String(diameter), caption: "Longest shortest path" };
}

function formatAverageDegree(averageDegree: number): string {
  return averageDegree.toFixed(1);
}

// Modularity typically ranges roughly -0.5 to 1; can be undefined if
// community detection wasn't run or failed.
function formatModularity(modularity: number | undefined): {
  value: string;
  caption?: string;
} {
  if (modularity === undefined) {
    return { value: "—", caption: "Not available" };
  }
  return {
    value: modularity.toFixed(3),
    caption: "Community structure strength",
  };
}

export function NetworkMetricsCards({ metrics }: NetworkMetricsCardsProps) {
  const diameterInfo = formatDiameter(metrics.diameter);
  const modularityInfo = formatModularity(metrics.modularity);

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
      <MetricCard
        icon={<Circle className="h-4 w-4 text-blue-600" />}
        accentClassName="bg-blue-50"
        label="Nodes"
        value={metrics.nodeCount.toLocaleString()}
      />
      <MetricCard
        icon={<Waypoints className="h-4 w-4 text-green-600" />}
        accentClassName="bg-green-50"
        label="Edges"
        value={metrics.edgeCount.toLocaleString()}
      />
      <MetricCard
        icon={<Gauge className="h-4 w-4 text-purple-600" />}
        accentClassName="bg-purple-50"
        label="Density"
        value={formatDensity(metrics.density)}
        caption="Share of possible edges present"
      />
      <MetricCard
        icon={<Route className="h-4 w-4 text-orange-600" />}
        accentClassName="bg-orange-50"
        label="Diameter"
        value={diameterInfo.value}
        caption={diameterInfo.caption}
      />
      <MetricCard
        icon={<Activity className="h-4 w-4 text-teal-600" />}
        accentClassName="bg-teal-50"
        label="Average Degree"
        value={formatAverageDegree(metrics.averageDegree)}
        caption="Mean connections per node"
      />
      <MetricCard
        icon={<Users className="h-4 w-4 text-pink-600" />}
        accentClassName="bg-pink-50"
        label="Communities"
        value={metrics.communityCount?.toLocaleString() ?? "—"}
        caption="Detected via Louvain"
      />
      <MetricCard
        icon={<Puzzle className="h-4 w-4 text-indigo-600" />}
        accentClassName="bg-indigo-50"
        label="Modularity"
        value={modularityInfo.value}
        caption={modularityInfo.caption}
      />
    </div>
  );
}
