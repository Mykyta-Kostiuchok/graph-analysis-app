import Papa from 'papaparse'
import { ParsedFile } from '@/types/upload'

export async function parseCSV(file: File): Promise<ParsedFile> {
  try {
    // Convert File to text for PapaParse
    const text = await file.text()
    
    // Парсим CSV
    const result = Papa.parse(text, {
      header: true,           // Use the first row as headings
      skipEmptyLines: true,   // Skip empty lines
      delimiter: ',',         // Separator
      transform: (value) => {
        // Convert numbers automatically
        if (!isNaN(Number(value)) && value !== '') {
          return Number(value)
        }
        return value
      }
    })

    // Validate the result
    if (result.errors.length > 0) {
      console.warn('CSV parsing warnings:', result.errors)
    }

    return {
      data: result.data,
      headers: result.meta.fields || [],
      rowCount: result.data.length,
      fileType: 'csv',
      fileName: file.name,
      fileSize: file.size
    }
  } catch (error) {
    throw new Error(`Ошибка парсинга CSV: ${error instanceof Error ? error.message : 'Неизвестная ошибка'}`)
  }
}

// Alternative function for parsing with custom settings
export async function parseCSVWithConfig(
  file: File,
  config: {
    delimiter?: string
    hasHeader?: boolean
    columns?: string[]
  } = {}
): Promise<ParsedFile> {
  const text = await file.text()
  
  const result = Papa.parse(text, {
    header: config.hasHeader ?? true,
    skipEmptyLines: true,
    delimiter: config.delimiter || ',',
    ...(config.columns && { columns: config.columns })
  })

  return {
    data: result.data,
    headers: Array.isArray(result.data[0]) 
      ? config.columns || []
      : Object.keys(result.data[0] || {}),
    rowCount: result.data.length,
    fileType: 'csv',
    fileName: file.name,
    fileSize: file.size
  }
}
