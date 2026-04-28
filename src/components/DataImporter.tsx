import React, { useState, useCallback } from 'react';
import Papa from 'papaparse';
import { Upload, FileSpreadsheet, X } from 'lucide-react';
import { cn } from '../lib/utils';

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
        "relative border-2 border-dashed rounded-3xl p-12 transition-all duration-300 text-center",
        isDragging ? "border-blue-500 bg-blue-50/50" : "border-slate-200 hover:border-slate-300 bg-white",
        fileName ? "bg-slate-50" : ""
      )}
    >
      <input
        type="file"
        accept=".csv"
        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
        onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
      />
      
      <div className="flex flex-col items-center gap-4">
        {fileName ? (
          <>
            <div className="w-16 h-16 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center shadow-sm">
              <FileSpreadsheet size={32} />
            </div>
            <div>
              <p className="font-bold text-slate-900">{fileName}</p>
              <p className="text-xs text-slate-500 mt-1 uppercase tracking-widest font-mono">FILE LOADED SUCCESSFULLY</p>
            </div>
            <button 
              onClick={(e) => { e.stopPropagation(); setFileName(null); }}
              className="mt-2 text-xs font-bold text-red-500 hover:bg-red-50 px-3 py-1 rounded-lg transition-colors flex items-center gap-1"
            >
              <X size={12} /> 重新上傳
            </button>
          </>
        ) : (
          <>
            <div className="w-16 h-16 bg-slate-50 text-slate-400 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
              <Upload size={32} />
            </div>
            <div>
              <p className="font-bold text-slate-900 text-lg">匯入研究數據</p>
              <p className="text-sm text-slate-500 max-w-[200px] mx-auto mt-2 leading-relaxed">
                點擊或拖拽 CSV 文件至此開始分析
              </p>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
