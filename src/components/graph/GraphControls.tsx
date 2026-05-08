'use client'

import { ZoomIn, ZoomOut, RotateCcw, Move, Info } from 'lucide-react'
import { useState } from 'react'

interface GraphControlsProps {
  onZoomIn: () => void
  onZoomOut: () => void
  onReset: () => void
  onFit: () => void
  showHelp?: boolean
}

export function GraphControls({ 
  onZoomIn, 
  onZoomOut, 
  onReset, 
  onFit,
  showHelp = true 
}: GraphControlsProps) {
  const [showInstructions, setShowInstructions] = useState(false)

  const instructions = [
    "Lewy przycisk myszy + przeciągnięcie węzła - przesunięcie węzła",
    "Kółko myszy - zmiana skali",
    "Prawy przycisk myszy + przeciągnięcie - przemieszczanie się po grafie",
    "Podwójne kliknięcie na tle - zresetuj skalę",
    "Klik po węźle - wybranie węzła"
  ]

  return (
    <div className="absolute top-4 right-4 flex flex-col gap-2 z-10">
      <div className="flex gap-2">
        <button
          onClick={onZoomIn}
          className="p-2 bg-white border rounded shadow hover:bg-gray-50"
          title="Powiększ"
        >
          <ZoomIn className="h-4 w-4" />
        </button>
        
        <button
          onClick={onZoomOut}
          className="p-2 bg-white border rounded shadow hover:bg-gray-50"
          title="Zmniejsz"
        >
          <ZoomOut className="h-4 w-4" />
        </button>
        
        <button
          onClick={onReset}
          className="p-2 bg-white border rounded shadow hover:bg-gray-50"
          title="Zresetuj"
        >
          <RotateCcw className="h-4 w-4" />
        </button>
        
        <button
          onClick={onFit}
          className="p-2 bg-white border rounded shadow hover:bg-gray-50"
          title="Dopasuj do rozmiaru"
        >
          <Move className="h-4 w-4" />
        </button>
        
        {showHelp && (
          <button
            onClick={() => setShowInstructions(!showInstructions)}
            className="p-2 bg-white border rounded shadow hover:bg-gray-50"
            title="Pomoc"
          >
            <Info className="h-4 w-4" />
          </button>
        )}
      </div>

      {showInstructions && (
        <div className="bg-white border rounded-lg shadow-lg p-3 w-64">
          <h3 className="font-bold mb-2">Zarządzanie grafem</h3>
          <ul className="text-sm space-y-1">
            {instructions.map((instruction, i) => (
              <li key={i}>{instruction}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}
