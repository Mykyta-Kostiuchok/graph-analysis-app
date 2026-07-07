'use client'

import { useRef } from 'react'
import { ForceSimulation, ForceSimulationHandle } from '@/components/graph/ForceSimulation'
import { GraphCanvas, GraphCanvasHandle } from '@/components/graph/GraphCanvas'
import { GraphControls } from '@/components/graph/GraphControls'
import { karateClubDataset } from '@/lib/datasets/karateClub'

export default function TestGraphPage() {
  const testData = karateClubDataset
  const canvasRef = useRef<GraphCanvasHandle>(null)
  const forceRef = useRef<ForceSimulationHandle>(null)

  return (
    <div className="container py-8 space-y-8">
      <h1 className="text-3xl font-bold">Test Graph Visualization</h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="relative">
          <h2 className="text-xl font-semibold mb-4">Basic visualization</h2>
          <GraphCanvas ref={canvasRef} graphData={testData} width={400} height={300} />
          <GraphControls
            onZoomIn={() => canvasRef.current?.zoomIn()}
            onZoomOut={() => canvasRef.current?.zoomOut()}
            onReset={() => canvasRef.current?.reset()}
            onFit={() => canvasRef.current?.fit()}
          />
        </div>

        <div className="relative">
          <h2 className="text-xl font-semibold mb-4">With physical simulation</h2>
          <ForceSimulation ref={forceRef} graphData={testData} width={400} height={300} />
          <GraphControls
            onZoomIn={() => forceRef.current?.zoomIn()}
            onZoomOut={() => forceRef.current?.zoomOut()}
            onReset={() => forceRef.current?.reset()}
            onFit={() => forceRef.current?.fit()}
          />
        </div>
      </div>
    </div>
  )
}