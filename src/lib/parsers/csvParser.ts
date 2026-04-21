import Papa from 'papaparse'
import { ParsedFile } from '@/types/upload'

export async function parseCSV(file: File): Promise<ParsedFile> {
  try {
    // Convert File to text for PapaParse
    const text = await file.text()

    // Provide the generic so result.data is Record<string, any>[] instead of unknown[]
    const result = Papa.parse<Record<string, any>>(text, {
      header: true,
      skipEmptyLines: true,
      delimiter: ',',
      transform: (value) => {
        if (value !== '' && !isNaN(Number(value))) {
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
  const hasHeader = config.hasHeader ?? true

  // Use the generic matching the header mode:
  const result = hasHeader
    ? Papa.parse<Record<string, any>>(text, {
        header: true,
        skipEmptyLines: true,
        delimiter: config.delimiter || ','
      })
    : Papa.parse<string[]>(text, {
        header: false,
        skipEmptyLines: true,
        delimiter: config.delimiter || ','
      })

  const headers = hasHeader
    ? result.meta.fields || config.columns || []
    : config.columns || []

  return {
    data: result.data,
    headers,
    rowCount: result.data.length,
    fileType: 'csv',
    fileName: file.name,
    fileSize: file.size
  }
}