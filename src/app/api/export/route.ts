import { NextResponse } from 'next/server'
import { exportToCSV } from '@/lib/exportUtils'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const data = searchParams.get('data')
    
    if (!data) {
      return NextResponse.json(
        { error: 'No data to export' },
        { status: 400 }
      )
    }

    const csvContent = exportToCSV(JSON.parse(data))
    
    return new Response(csvContent, {
      headers: {
        'Content-Type': 'text/csv;charset=utf-8',
        'Content-Disposition': 'attachment; filename="metrics.csv"'
      }
    })
  } catch (error) {
    return NextResponse.json(
      { error: 'Export error' },
      { status: 500 }
    )
  }
}
