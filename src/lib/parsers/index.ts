import { parseCSV } from './csvParser'
import { parseGraphML } from './graphmlParser'
import { parseGEXF } from './gexfParser'
import { ParsedFile } from '@/types/upload'
import { GraphData } from '@/types/graph'

export async function parseFile(file: File): Promise<ParsedFile | GraphData> {
  const fileName = file.name.toLowerCase()
  
  try {
    if (fileName.endsWith('.csv')) {
      return await parseCSV(file)
    } else if (fileName.endsWith('.graphml')) {
      return await parseGraphML(file)
    } else if (fileName.endsWith('.gexf')) {
      return await parseGEXF(file)
    } else {
      throw new Error('Unsupported file format. Supported formats: CSV, GraphML, GEXF')
    }
  } catch (error) {
    throw new Error(`File parsing error ${file.name}: ${error instanceof Error ? error.message : 'Unknown error'}`)
  }
}

export function getFileType(fileName: string): 'csv' | 'graphml' | 'gexf' | null {
  const name = fileName.toLowerCase()
  if (name.endsWith('.csv')) return 'csv'
  if (name.endsWith('.graphml')) return 'graphml'
  if (name.endsWith('.gexf')) return 'gexf'
  return null
}
