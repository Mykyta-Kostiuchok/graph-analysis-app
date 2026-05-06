"use client";

import { Download, Database, Users, Network } from "lucide-react";

interface DemoDataset {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  onClick: () => void;
}

interface DemoDatasetsProps {
  onLoadDemo: (datasetId: string) => void;
  isLoading?: boolean;
}

export function DemoDatasets({
  onLoadDemo,
  isLoading = false,
}: DemoDatasetsProps) {
  const datasets: DemoDataset[] = [
    {
      id: "karate",
      name: "Karate Club",
      description:
        "Sieć społecznościowa uniwersyteckiego klubu karate (34 węzły, 78 krawędzi)",
      icon: <Users className="h-5 w-5" />,
      onClick: () => onLoadDemo("karate"),
    },
    {
      id: "les-miserables",
      name: "Les Misérables",
      description:
        "Współwystępowanie postaci w powieści (77 węzłów, 254 krawędzie)",
      icon: <Database className="h-5 w-5" />,
      onClick: () => onLoadDemo("les-miserables"),
    },
    {
      id: "network-science",
      name: "Network Science",
      description: "Cytowania naukowych artykułów (379 węzłów, 914 krawędzi)",
      icon: <Network className="h-5 w-5" />,
      onClick: () => onLoadDemo("network-science"),
    },
  ];

  return (
    <div className="w-full border rounded-lg p-6">
      <div className="mb-4">
        <h2 className="text-xl font-bold flex items-center gap-2">
          <Download className="h-5 w-5" />
          Demo Datasets
        </h2>
      </div>
      <div className="space-y-4">
        <div className="grid gap-4 md:grid-cols-3">
          {datasets.map((dataset) => (
            <button
              key={dataset.id}
              className="border rounded-lg p-4 flex flex-col items-center justify-center text-center gap-2 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              onClick={dataset.onClick}
              disabled={isLoading}
            >
              {dataset.icon}
              <div className="font-medium">{dataset.name}</div>
              <div className="text-xs text-gray-500">{dataset.description}</div>
            </button>
          ))}
        </div>

        <div className="mt-4 text-center text-sm text-gray-500">
          Skorzystaj z przykładowych zbiorów danych, aby przetestować
          funkcjonalność
        </div>
      </div>
    </div>
  );
}
