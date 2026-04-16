import { NextResponse } from 'next/server'
import { buildGraph, calculateMetrics } from '@/lib/algorithms'

export async function POST(request: Request) {
  try {
    const { nodes, edges } = await request.json()
    
    const graph = buildGraph(nodes, edges)
    const metrics = calculateMetrics(graph)
    
    return NextResponse.json({
      graph,
      metrics
    })
  } catch (error) {
    return NextResponse.json(
      { error: 'Error while constructing the graph' },
      { status: 500 }
    )
  }
}
