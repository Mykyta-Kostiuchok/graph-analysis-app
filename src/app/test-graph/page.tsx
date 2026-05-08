'use client'

import { useState, useRef } from 'react'
import { ForceSimulation } from '@/components/graph/ForceSimulation'
import { GraphCanvas } from '@/components/graph/GraphCanvas' 
import { GraphControls } from '@/components/graph/GraphControls'
import { karateClubDataset } from '@/lib/datasets/karateClub'

export default function TestGraphPage() {
  // Using an existing dataset
  const testData = karateClubDataset

  return (
    <div className="container py-8 space-y-8">
      <h1 className="text-3xl font-bold">Test Graph Visualization</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div>
          <h2 className="text-xl font-semibold mb-4">Basic visualization</h2>
          <GraphCanvas graphData={testData} width={400} height={300} />
        </div>
        
        <div>
          <h2 className="text-xl font-semibold mb-4">With physical simulation</h2>
          <ForceSimulation graphData={testData} width={400} height={300} />
        </div>
      </div>
    </div>
  )
}
