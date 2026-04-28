import React, { useState } from 'react';
import { GoogleGenAI } from "@google/genai";
import { Brain, Sparkles, Loader2, BookOpen } from 'lucide-react';

interface AIInsightsProps {
  stats: {
    m: number;
    b: number;
    r2: number;
    count: number;
    xName: string;
    yName: string;
  };
}

export function AIInsights({ stats }: AIInsightsProps) {
  const [insight, setInsight] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const generateInsight = async () => {
    setLoading(true);
    try {
      const storedKey = localStorage.getItem('gemini_api_key');
      const envKey = typeof process !== 'undefined' ? process.env.GEMINI_API_KEY : undefined;
      const finalApiKey = storedKey || envKey;
      
      if (!finalApiKey) {
        throw new Error("請先至「分析設定」頁面輸入您的 Gemini API Key！");
      }

      const ai = new GoogleGenAI({ apiKey: finalApiKey });
      const prompt = `
        你是一位專業的學術論文指導教授。請針對以下線性迴歸分析結果提供專業的解釋。
        分析數據：
        - 自變量 (X): ${stats.xName}
        - 因變量 (Y): ${stats.yName}
        - 斜率 (Slope): ${stats.m.toFixed(4)}
        - 截距 (Intercept): ${stats.b.toFixed(4)}
        - 決定係數 (R-squared): ${stats.r2.toFixed(4)}
        - 樣本數 (n): ${stats.count}

        請提供以下三個部分的分析：
        1. 統計含義解釋：解釋自變量與因變量的相關性強度與方向。
        2. 研究意義：這項發現對學術研究可能意味著什麼？
        3. 建議寫作段落：提供一段可以直接用於論文的中文學術描述。
        
        請用繁體中文回答，口吻應具備學術嚴謹性。
      `;

      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: prompt,
      });

      setInsight(response.text || "無法生成洞察");
    } catch (error) {
      console.error("AI Error:", error);
      setInsight("生成失敗，請檢查 API Key 設置。");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mt-12 bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
      <div className="bg-gradient-to-r from-emerald-50 to-teal-50 p-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-emerald-100 text-emerald-600 rounded-lg">
            <Brain size={20} />
          </div>
          <div>
            <h3 className="font-serif text-lg font-medium text-gray-900">AI 學術洞察助理</h3>
            <p className="text-xs text-gray-500 font-mono">POWERED BY GEMINI AI</p>
          </div>
        </div>
        <button
          onClick={generateInsight}
          disabled={loading}
          className="flex items-center gap-2 bg-black text-white px-4 py-2 rounded-xl hover:bg-gray-800 transition-colors disabled:opacity-50 text-sm font-medium"
        >
          {loading ? <Loader2 className="animate-spin" size={18} /> : <Sparkles size={18} />}
          {loading ? "分析中..." : "開始 AI 分析"}
        </button>
      </div>

      <div className="p-6">
        {insight ? (
          <div className="prose prose-sm max-w-none prose-slate">
            <div className="flex items-start gap-3 mb-4">
              <BookOpen size={18} className="text-emerald-600 mt-1" />
              <div className="whitespace-pre-wrap text-gray-700 leading-relaxed font-sans text-base">
                {insight}
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center py-12 text-gray-400 italic font-serif">
            點擊上方按鈕，讓 AI 為您的統計結果撰寫論文草稿
          </div>
        )}
      </div>
    </div>
  );
}
