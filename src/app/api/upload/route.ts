import { NextResponse } from 'next/server'
import { parseFile, getFileType } from '@/lib/parsers'

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

    // Проверяем тип файла
    const fileType = getFileType(file.name)
    if (!fileType) {
      return NextResponse.json(
        { error: 'Unsupported file format. Supported formats: CSV, GraphML, GEXF' },
        { status: 400 }
      )
    }

    const parsedData = await parseFile(file)
    
    return NextResponse.json({
      success: true,
      data: parsedData,
      fileType: fileType
    })
  } catch (error) {
    console.error('Upload error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Error uploading file' },
      { status: 500 }
    )
  }
}

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'
