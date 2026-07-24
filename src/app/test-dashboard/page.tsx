"use client";

import { useMemo } from "react";
import { karateClubDataset } from "@/lib/datasets/karateClub";
import { computeNetworkMetrics } from "@/lib/graph/enrich-graph-data";
import { NetworkMetricsCards } from "@/components/graph/NetworkMetricsCards";

export default function TestDashboardPage() {
  const networkMetrics = useMemo(
    () => computeNetworkMetrics(karateClubDataset),
    [],
  );

  return (
    <div className="container py-8 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Dashboard metryk sieci</h1>
        <p className="text-gray-500 mt-1">
          Karate Club dataset ({karateClubDataset.nodes.length} węzłów,{" "}
          {karateClubDataset.edges.length} krawędzi)
        </p>
      </div>

      <NetworkMetricsCards metrics={networkMetrics} />
    </div>
  );
}
