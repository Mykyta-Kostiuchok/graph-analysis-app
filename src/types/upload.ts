export interface ParsedFile {
  data: Record<string, any>[] | any[][]
  headers: string[]
  rowCount: number
  fileType: 'csv' | 'graphml' | 'gexf'
  fileName: string
  fileSize: number
}

export interface UploadResult {
  success: boolean
  data?: ParsedFile
  error?: string
}
