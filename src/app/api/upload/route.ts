import { NextResponse } from 'next/server'
import { parseFile } from '@/lib/parsers'

export async function POST(request: Request) {
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File
    
    if (!file) {
      return NextResponse.json(
        { error: 'File not provided' },
        { status: 400 }
      )
    }

    const parsedData = await parseFile(file)
    
    return NextResponse.json({
      success: true,
      data: parsedData
    })
  } catch (error) {
    return NextResponse.json(
      { error: 'Error loading the file' },
      { status: 500 }
    )
  }
}
