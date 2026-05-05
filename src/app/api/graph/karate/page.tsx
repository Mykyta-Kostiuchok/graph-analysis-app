'use client'

import { useState, useEffect } from 'react'

export default function KarateClubTest() {
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        const response = await fetch('/api/datasets/karate')
        const result = await response.json()
        
        if (result.success) {
          setData(result)
        } else {
          setError(result.error)
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error')
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  if (loading) return <div className="p-4">Loading Karate Club dataset...</div>
  if (error) return <div className="p-4 text-red-500">Error: {error}</div>

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Zachary's Karate Club Dataset</h1>
      
      {data && (
        <div className="space-y-4">
          <div className="bg-blue-50 p-4 rounded">
            <h2 className="text-xl font-semibold">Dataset Info</h2>
            <p><strong>Description:</strong> {data.description}</p>
            <p><strong>Nodes:</strong> {data.stats.nodeCount}</p>
            <p><strong>Edges:</strong> {data.stats.edgeCount}</p>
            <p><strong>Is Directed:</strong> {data.stats.isDirected ? 'Yes' : 'No'}</p>
            <p><strong>Is Connected:</strong> {data.stats.isConnected ? 'Yes' : 'No'}</p>
          </div>

          <div className="bg-green-50 p-4 rounded">
            <h2 className="text-xl font-semibold">Network Metrics</h2>
            <p><strong>Average Degree:</strong> {data.metrics.networkMetrics.averageDegree.toFixed(2)}</p>
            <p><strong>Density:</strong> {data.metrics.networkMetrics.density.toFixed(4)}</p>
            <p><strong>Modularity:</strong> {data.metrics.networkMetrics.modularity?.toFixed(4)}</p>
          </div>

          <div className="bg-yellow-50 p-4 rounded">
            <h2 className="text-xl font-semibold">Top Nodes by Degree</h2>
            <ul className="list-disc pl-5">
              {data.metrics.nodeMetrics
                .slice(0, 5)
                .map((node: any, index: number) => (
                  <li key={node.nodeId}>
                    #{index + 1} {node.nodeId}: degree {node.degree} 
                    {node.community !== undefined && ` (community ${node.community})`}
                  </li>
                ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  )
}
