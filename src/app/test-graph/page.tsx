'use client'

import { useState, useRef } from 'react'
import { ForceSimulation, ForceSimulationHandle } from '@/components/graph/ForceSimulation'
import { GraphCanvas, GraphCanvasHandle } from '@/components/graph/GraphCanvas'
import { GraphControls } from '@/components/graph/GraphControls'
import { karateClubDataset } from '@/lib/datasets/karateClub'

export default function TestGraphPage() {
  const [selectedNode, setSelectedNode] = useState<any>(null)
  const canvasRef = useRef<GraphCanvasHandle>(null)
  const forceRef = useRef<ForceSimulationHandle>(null)

  const testData = karateClubDataset

  const handleNodeClick = (nodeId: string, nodeData: any) => {
    setSelectedNode(nodeData)
    console.log('Clicked node:', nodeData)
  }

  return (
    <div className="container py-8 space-y-8 relative">
      <h1 className="text-3xl font-bold">Тест визуализации графа</h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="relative">
          <h2 className="text-xl font-semibold mb-4">Базовая визуализация</h2>
          <GraphCanvas ref={canvasRef} graphData={testData} width={400} height={300} />
          <GraphControls
            onZoomIn={() => canvasRef.current?.zoomIn()}
            onZoomOut={() => canvasRef.current?.zoomOut()}
            onReset={() => canvasRef.current?.reset()}
            onFit={() => canvasRef.current?.fit()}
          />
        </div>

        <div className="relative">
          <h2 className="text-xl font-semibold mb-4">Z fizyczną symulacją</h2>
          <ForceSimulation
            ref={forceRef}
            graphData={testData}
            width={400}
            height={300}
            onNodeClick={handleNodeClick}
          />
          <GraphControls
            onZoomIn={() => forceRef.current?.zoomIn()}
            onZoomOut={() => forceRef.current?.zoomOut()}
            onReset={() => forceRef.current?.reset()}
            onFit={() => forceRef.current?.fit()}
          />
        </div>
      </div>

      {selectedNode && (
        <div className="mt-6 border rounded-lg p-4 bg-blue-50 max-w-2xl">
          <h3 className="font-bold text-lg mb-2">Informacje o węźle</h3>
          <div className="grid grid-cols-2 gap-2 text-sm">
            <div><span className="font-medium">ID:</span> {selectedNode.id}</div>
            <div><span className="font-medium">Label:</span> {selectedNode.label || 'N/A'}</div>
            {selectedNode.degree !== undefined && (
              <div><span className="font-medium">Degree:</span> {selectedNode.degree}</div>
            )}
            {selectedNode.community !== undefined && (
              <div><span className="font-medium">Community:</span> {selectedNode.community}</div>
            )}
            {selectedNode.pagerank !== undefined && (
              <div><span className="font-medium">PageRank:</span> {selectedNode.pagerank?.toFixed(4)}</div>
            )}
          </div>
        </div>
      )}

      <div className="text-sm text-gray-500 mt-8">
        <h3 className="font-medium mb-2">Cechy force-directed layout:</h3>
        <ul className="list-disc list-inside space-y-1">
          <li>Węzły z dużym degree są większe i bardziej zauważalne</li>
          <li>Colorowa kodowanie według społeczności</li>
          <li>Fizyczna symulacja sił odrzutu i przyciągania</li>
          <li>Drag & drop do przesuwania węzłów</li>
          <li>Zoom i pan do nawigacji</li>
        </ul>
      </div>
    </div>
  )
}