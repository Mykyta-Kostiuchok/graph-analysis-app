'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'react-hot-toast'
import { DropZone } from '@/components/upload/DropZone'
import { FilePreview } from '@/components/upload/FilePreview'
import { DemoDatasets } from '@/components/upload/DemoDatasets'
import { Loader2, Upload } from 'lucide-react'

export default function UploadPage() {
  const router = useRouter()
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [fileValidation, setFileValidation] = useState({
    valid: true,
    errors: [] as string[],
    warnings: [] as string[]
  })

  const handleFileUpload = async (file: File) => {
    setSelectedFile(file)
    
    // Валидация файла
    const validation = validateFile(file)
    setFileValidation(validation)
    
    if (!validation.valid) {
      toast.error('Файл не прошел валидацию')
      return
    }
    
    toast.success('Файл готов к загрузке')
  }

  const validateFile = (file: File) => {
    const errors: string[] = []
    const warnings: string[] = []
    
    // Проверка размера
    if (file.size > 10 * 1024 * 1024) {
      errors.push('Файл слишком большой (максимум 10MB)')
    }
    
    // Проверка формата
    const validExtensions = ['.json', '.csv', '.graphml', '.xml', '.txt']
    const fileExtension = '.' + file.name.split('.').pop()?.toLowerCase()
    
    if (!validExtensions.includes(fileExtension)) {
      errors.push('Неподдерживаемый формат файла')
    }
    
    // Проверка имени файла
    if (file.name.length > 100) {
      warnings.push('Имя файла слишком длинное')
    }
    
    return {
      valid: errors.length === 0,
      errors,
      warnings
    }
  }

  const handleProcessFile = async () => {
    if (!selectedFile) return
    
    setIsLoading(true)
    
    try {
      const formData = new FormData()
      formData.append('file', selectedFile)
      
      const response = await fetch('/api/graph', {
        method: 'POST',
        body: formData
      })
      
      const result = await response.json()
      
      if (result.success) {
        // Сохраняем результат в sessionStorage для передачи на страницу графа
        sessionStorage.setItem('graphData', JSON.stringify(result))
        router.push('/graph')
      } else {
        toast.error(result.error || 'Ошибка обработки файла')
      }
    } catch (error) {
      toast.error('Ошибка при отправке файла')
      console.error('Upload error:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleLoadDemo = async (datasetId: string) => {
    setIsLoading(true)
    
    try {
      const response = await fetch(`/api/datasets/${datasetId}`)
      const result = await response.json()
      
      if (result.success) {
        sessionStorage.setItem('graphData', JSON.stringify(result))
        router.push('/graph')
      } else {
        toast.error(result.error || 'Ошибка загрузки демо датасета')
      }
    } catch (error) {
      toast.error('Ошибка при загрузке демо датасета')
      console.error('Demo load error:', error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="container py-8 space-y-8">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Анализ графов</h1>
        <p className="text-gray-500">
          Загрузите свой граф или выберите демо датасет для анализа
        </p>
      </div>

      <div className="grid gap-8">
        <DropZone 
          onFileUpload={handleFileUpload} 
          isLoading={isLoading}
        />

        {selectedFile && (
          <FilePreview 
            file={selectedFile} 
            validation={fileValidation}
          />
        )}

        <DemoDatasets 
          onLoadDemo={handleLoadDemo} 
          isLoading={isLoading}
        />

        {selectedFile && fileValidation.valid && (
          <div className="border rounded-lg p-6">
            <div className="flex flex-col sm:flex-row gap-4 justify-between items-center">
              <div className="text-sm text-gray-500">
                Готово к обработке: {selectedFile.name}
              </div>
              <button 
                onClick={handleProcessFile}
                disabled={isLoading}
                className="w-full sm:w-auto px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Обработка...
                  </>
                ) : (
                  <>
                    <Upload className="mr-2 h-4 w-4" />
                    Обработать граф
                  </>
                )}
              </button>
            </div>
          </div>
        )}
      </div>

      {isLoading && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-xl flex items-center gap-4">
            <Loader2 className="h-6 w-6 animate-spin" />
            <div>
              <p className="font-medium">Обработка графа...</p>
              <p className="text-sm text-gray-500">
                Это может занять несколько секунд
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
