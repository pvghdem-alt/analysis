import React, { useState, useCallback } from 'react';
import Papa from 'papaparse';
import { Upload, FileSpreadsheet, X } from 'lucide-react';
import { cn } from '@/src/lib/utils';

interface DataImporterProps {
  onDataLoaded: (data: any[], columns: string[]) => void;
}

export function DataImporter({ onDataLoaded }: DataImporterProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [fileName, setFileName] = useState<string | null>(null);

  const handleFile = (file: File) => {
    if (file && (file.type === 'text/csv' || file.name.endsWith('.csv'))) {
      setFileName(file.name);
      Papa.parse(file, {
        header: true,
        dynamicTyping: true,
        skipEmptyLines: true,
        complete: (results) => {
          if (results.data.length > 0) {
            const columns = Object.keys(results.data[0] as object);
            onDataLoaded(results.data, columns);
          }
        },
      });
    } else {
      alert('請上傳 CSV 格式的文件');
    }
  };

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    handleFile(file);
  }, []);

  return (
    <div
      onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
      onDragLeave={() => setIsDragging(false)}
      onDrop={onDrop}
      className={cn(
        "relative border-2 border-dashed rounded-xl p-8 transition-all duration-200 text-center",
        isDragging ? "border-black bg-gray-50" : "border-gray-200 hover:border-gray-400",
        fileName ? "bg-gray-50" : "bg-white"
      )}
    >
      <input
        type="file"
        accept=".csv"
        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
        onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
      />
      
      <div className="flex flex-col items-center gap-3">
        {fileName ? (
          <>
            <div className="w-12 h-12 bg-black text-white rounded-full flex items-center justify-center">
              <FileSpreadsheet size={24} />
            </div>
            <div>
              <p className="font-medium text-gray-900">{fileName}</p>
              <p className="text-sm text-gray-500">文件已成功載入</p>
            </div>
            <button 
              onClick={(e) => { e.stopPropagation(); setFileName(null); }}
              className="mt-2 text-xs text-red-500 hover:underline"
            >
              移除文件
            </button>
          </>
        ) : (
          <>
            <div className="w-12 h-12 bg-gray-100 text-gray-400 rounded-full flex items-center justify-center">
              <Upload size={24} />
            </div>
            <div>
              <p className="font-medium text-gray-900">點擊或拖拽 CSV 文件至此</p>
              <p className="text-sm text-gray-500">支持問卷導出的數據格式</p>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
