import React, { useState } from 'react';
import { GoogleGenAI, Type } from "@google/genai";
import { FileUp, Loader2, CheckCircle2, AlertCircle } from 'lucide-react';
import { motion } from 'motion/react';
import { cn } from '../lib/utils';

interface PdfAnalysisViewProps {
  onDataExtracted: (data: any) => void;
  onAnalysed: () => void;
}

export function PdfAnalysisView({ onDataExtracted, onAnalysed }: PdfAnalysisViewProps) {
  const [analyzing, setAnalyzing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setAnalyzing(true);
    setError(null);
    setSuccess(false);

    try {
      const reader = new FileReader();
      reader.onload = async () => {
        const base64Data = (reader.result as string).split(',')[1];
        await performAiExtraction(base64Data, file.type);
      };
      reader.readAsDataURL(file);
    } catch (err) {
      setError("檔案讀取失敗");
      setAnalyzing(false);
    }
  };

  const performAiExtraction = async (base64Data: string, mimeType: string) => {
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
      
      const prompt = `
        你是一位專業的數據錄入專家。請識別這張問卷圖片或PDF中被落筆或打鉤的選項，並將其轉換為 JSON 格式。
        請嚴格遵守以下欄位名稱與格式，若無法辨識請回傳空字串或null：
        
        基本資料：
        - Gender: "男" 或 "女"
        - Age_Y: 民國年份 (數字字串)
        - Age_M: 月份 (數字字串)
        - Education: 勾選的程度 (如: "不識字", "國小", "國中", "高中(職)", "專科", "大學")
        - Marital: 勾選的狀態 (如: "未婚", "已婚有偶", "已婚喪偶", "離婚", "分居")
        - Children: 填寫的子女人數 (數字字串)
        - Family_Visit: (如 "幾乎沒有", "偶爾", "有時", "經常")
        - Advance_Directive: (如 "未簽署", "已簽署", "不知道/不清楚")
        - Income_Source: (如 "退休金", "積蓄", "子女提供", "政府補助", 及其它文字)
        - Religion: (如 "無", "道教", "佛教", "基督教", "天主教", 及其它文字)
        - Assistive_Device: (如 "無", "拐杖", "輪椅", "助行器")
        - Chronic_Disease: 勾選的慢性病 (若勾選多項目請用逗號隔開)
        - ADL: 分數數字
        - Health_Status: 選項 (如 "非常好", "好", "普通", "不好", "非常不好")
        - Hope_Future: (如 "非常有希望", "有希望", "普通", "較無希望", "完全沒希望")
        - Main_Supporter: (如 "配偶", "子女", "其他家人", "朋友", "機構工作人員", "志工")
        - Move_In_Y: 民國滿幾年入住 (數字字串)
        - Move_In_M: 月份 (數字字串)
        
        量表部分 (請直接輸出實際被圈選的數字分數)：
        - SS_1 到 SS_20: 社會支持量表的選項 (1-5)
        - H_1 到 H_12: 希望量表的選項 (1-4)
        - DA_1 到 DA_32: 死亡態度量表的選項 (1-5)
        
        請僅輸出 JSON 對象，不要包含 Markdown 格式等任何多餘文字。
      `;

      const response = await ai.models.generateContent({
        model: "gemini-3.1-pro-preview",
        contents: {
          parts: [
            { inlineData: { data: base64Data, mimeType: mimeType } },
            { text: prompt }
          ]
        },
        config: {
          responseMimeType: "application/json"
        }
      });

      const extractedData = JSON.parse(response.text);
      onDataExtracted(extractedData);
      setSuccess(true);
      setTimeout(() => onAnalysed(), 1500);
    } catch (err) {
      console.error("AI Extraction Error:", err);
      setError("AI 解析失敗，請確保圖片清晰且 API Key 正確。");
    } finally {
      setAnalyzing(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto bg-white p-12 rounded-3xl border border-slate-200 text-center space-y-8 shadow-sm">
      <div className="w-20 h-20 bg-blue-50 text-blue-600 rounded-3xl flex items-center justify-center mx-auto">
        <FileUp size={40} />
      </div>
      <div>
        <h2 className="text-2xl font-bold mb-2">上傳紙本問卷照</h2>
        <p className="text-slate-500">拍照或掃描已填寫的問卷，AI 會自動識別勾選內容並匯入系統。</p>
      </div>

      <div className={cn(
        "border-2 border-dashed rounded-2xl p-12 bg-slate-50 transition-all",
        analyzing ? "border-blue-500 bg-blue-50" : "border-slate-200"
      )}>
        <input 
          type="file" 
          accept="image/*,application/pdf" 
          className="hidden" 
          id="pdf-upload" 
          onChange={handleFileUpload}
          disabled={analyzing}
        />
        <label htmlFor="pdf-upload" className="cursor-pointer group">
          {analyzing ? (
            <div className="space-y-4">
              <Loader2 className="mx-auto text-blue-600 animate-spin" size={48} />
              <p className="text-blue-600 font-bold uppercase tracking-widest text-xs">AI 正在識別勾選項目...</p>
            </div>
          ) : success ? (
            <div className="space-y-4">
              <CheckCircle2 className="mx-auto text-emerald-500" size={48} />
              <p className="text-emerald-600 font-bold uppercase tracking-widest text-xs">解析成功！正在匯入數據...</p>
            </div>
          ) : (
            <div className="space-y-4">
              <FileUp className="mx-auto text-slate-300 group-hover:text-blue-400 transition-colors" size={48} />
              <p className="text-sm font-bold text-slate-600">點擊選擇相片或 PDF</p>
              <p className="text-xs text-slate-400">支援問卷第 1~7 頁之內容識別</p>
            </div>
          ) }
        </label>
      </div>

      {error && (
        <div className="flex items-center gap-2 text-red-500 bg-red-50 p-4 rounded-xl text-sm justify-center">
          <AlertCircle size={16} />
          {error}
        </div>
      )}

      <div className="pt-8 border-t border-slate-100 flex items-center justify-center gap-8 opacity-40 grayscale">
        <div className="text-[10px] font-mono">OCR HANDWRITING</div>
        <div className="text-[10px] font-mono">VISION RECOGNITION</div>
        <div className="text-[10px] font-mono">AUTO-LABELING</div>
      </div>
    </div>
  );
}
