"use client";

import { FileText, CheckCircle, AlertCircle, Info } from "lucide-react";

interface FilePreviewProps {
  file: File;
  validation: {
    valid: boolean;
    errors: string[];
    warnings: string[];
  };
}

export function FilePreview({ file, validation }: FilePreviewProps) {
  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  const getFileType = (fileName: string): string => {
    const ext = fileName.split(".").pop()?.toLowerCase() || "unknown";
    const typeMap: Record<string, string> = {
      json: "JSON",
      csv: "CSV",
      graphml: "GraphML",
      xml: "XML",
      txt: "Text",
    };
    return typeMap[ext] || ext.toUpperCase();
  };

  return (
    <div className="w-full border rounded-lg p-6">
      <div className="mb-4">
        <h2 className="text-xl font-bold flex items-center gap-2">
          <FileText className="h-5 w-5" />
          Informacje o pliku
        </h2>
      </div>
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-sm font-medium text-gray-500">Nazwa pliku</p>
            <p className="font-medium">{file.name}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">Rozmiar</p>
            <p>{formatFileSize(file.size)}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">Format</p>
            <p>{getFileType(file.name)}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">Typ</p>
            <p>{file.type || "Nie zdefiniowany"}</p>
          </div>
        </div>

        <div className="space-y-3">
          {validation.valid ? (
            <div className="flex items-center gap-2 p-3 bg-green-100 border border-green-300 rounded-md text-green-800">
              <CheckCircle className="h-5 w-5 flex-shrink-0" />
              <span>Plik przeszedł proces walidacji</span>
            </div>
          ) : (
            <div className="flex items-center gap-2 p-3 bg-red-100 border border-red-300 rounded-md text-red-800">
              <AlertCircle className="h-5 w-5 flex-shrink-0" />
              <span>Plik nie przeszedł procesu walidacji</span>
            </div>
          )}

          {validation.errors.length > 0 && (
            <div>
              <h4 className="font-medium text-red-800 flex items-center gap-2">
                <AlertCircle className="h-4 w-4" />
                Błędy ({validation.errors.length})
              </h4>
              <ul className="mt-2 space-y-1">
                {validation.errors.map((error, index) => (
                  <li key={index} className="text-sm text-red-700 ml-6">
                    • {error}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {validation.warnings.length > 0 && (
            <div>
              <h4 className="font-medium text-yellow-800 flex items-center gap-2">
                <Info className="h-4 w-4" />
                Ostrzeżenia ({validation.warnings.length})
              </h4>
              <ul className="mt-2 space-y-1">
                {validation.warnings.map((warning, index) => (
                  <li key={index} className="text-sm text-yellow-700 ml-6">
                    • {warning}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
