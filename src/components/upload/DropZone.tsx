"use client";

import { useState, useRef, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { toast } from "react-hot-toast";
import { Upload, FileText, AlertCircle } from "lucide-react";

interface DropZoneProps {
  onFileUpload: (file: File) => void;
  isLoading?: boolean;
}

export function DropZone({ onFileUpload, isLoading = false }: DropZoneProps) {
  const [isDragActive, setIsDragActive] = useState(false);
  const [fileError, setFileError] = useState<string | null>(null);

  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      setFileError(null);

      if (acceptedFiles.length === 0) {
        setFileError("Plik nie został wybrany");
        return;
      }

      const file = acceptedFiles[0];

      // File validation
      const isValid = validateFile(file);
      if (!isValid.valid) {
        setFileError(isValid.error);
        toast.error(isValid.error);
        return;
      }

      onFileUpload(file);
    },
    [onFileUpload],
  );

  const { getRootProps, getInputProps, isDragReject } = useDropzone({
    onDrop,
    accept: {
      "application/json": [".json"],
      "text/csv": [".csv"],
      "application/xml": [".graphml", ".xml"],
      "text/plain": [".txt"],
    },
    maxSize: 10 * 1024 * 1024, // 10MB
    maxFiles: 1,
    onDragEnter: () => setIsDragActive(true),
    onDragLeave: () => setIsDragActive(false),
    onDragOver: () => setIsDragActive(true),
    onDropAccepted: () => setIsDragActive(false),
    onDropRejected: () => {
      setIsDragActive(false);
      setFileError("Nieobsługiwany format pliku lub plik jest zbyt duży");
      toast.error("Nieobsługiwany format pliku lub plik jest zbyt duży");
    },
  });

  const validateFile = (file: File): { valid: boolean; error: string } => {
    // Checking file size
    if (file.size > 10 * 1024 * 1024) {
      return { valid: false, error: "Plik jest zbyt duży (maksymalnie 10MB)" };
    }

    // Checking file format
    const validExtensions = [".json", ".csv", ".graphml", ".xml", ".txt"];
    const fileExtension = "." + file.name.split(".").pop()?.toLowerCase();

    if (!validExtensions.includes(fileExtension)) {
      return { valid: false, error: "Nieobsługiwany format pliku" };
    }

    return { valid: true, error: "" };
  };

  return (
    <div className="w-full max-w-2xl mx-auto border rounded-lg p-6">
      <div className="mb-4">
        <h2 className="text-xl font-bold flex items-center gap-2">
          <Upload className="h-5 w-5" />
          Prześlij graf
        </h2>
        <p className="text-gray-500">
          Przeciągnij plik lub kliknij, aby go wybrać
        </p>
      </div>
      <div className="space-y-6">
        <div
          {...getRootProps()}
          className={`
            border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-all
            ${
              isDragActive
                ? "border-blue-500 bg-blue-50"
                : "border-gray-300 hover:border-gray-400"
            }
            ${isDragReject ? "border-red-500 bg-red-50" : ""}
            ${isLoading ? "opacity-50 pointer-events-none" : ""}
          `}
        >
          <input {...getInputProps()} />

          <div className="space-y-4">
            <FileText className="mx-auto h-12 w-12 text-gray-400" />

            <div className="space-y-2">
              <p className="text-lg font-medium">
                {isDragActive ? "Upuść plik" : "Przeciągnij plik tutaj"}
              </p>
              <p className="text-sm text-gray-500">
                Obsługiwane formaty: JSON, CSV, GraphML, TXT
              </p>
              <p className="text-xs text-gray-400">Maksymalny rozmiar: 10MB</p>
            </div>

            <button
              className="mt-4 px-4 py-2 border rounded-md hover:bg-gray-50 disabled:opacity-50"
              disabled={isLoading}
            >
              {isLoading ? "Przesyłanie..." : "Wybierz plik"}
            </button>
          </div>
        </div>

        {fileError && (
          <div className="p-3 bg-red-100 border border-red-300 rounded-md flex items-center gap-2 text-red-800">
            <AlertCircle className="h-5 w-5 flex-shrink-0" />
            <span>{fileError}</span>
          </div>
        )}

        <div className="text-sm text-gray-500">
          <h3 className="font-medium mb-2">Wskazówki:</h3>
          <ul className="list-disc list-inside space-y-1">
            <li>JSON: obiekty z polami nodes i edges</li>
            <li>CSV: kolumny source i target</li>
            <li>GraphML: standardowy format grafów XML</li>
            <li>TXT: macierz sąsiedztwa</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
