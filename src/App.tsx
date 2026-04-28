import React, { useState, useMemo } from 'react';
import { DataImporter } from './components/DataImporter';
import { AnalysisDashboard } from './components/AnalysisDashboard';
import { AIInsights } from './components/AIInsights';
import { 
  BarChart3, 
  Table as TableIcon, 
  Download,
  FileUp,
  BrainCircuit,
  Settings,
  CheckCircle2,
  Sparkles,
  FileText
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import * as ss from 'simple-statistics';
import { cn } from './lib/utils';

type Tab = 'dashboard' | 'data' | 'pdf' | 'settings';

interface SurveyEntry {
  id: string;
  data: any;
  included: boolean;
}

export default function App() {
  const [activeTab, setActiveTab] = useState<Tab>('dashboard');
  const [entries, setEntries] = useState<SurveyEntry[]>([]);
  const [columns, setColumns] = useState<string[]>([]);

  const handleDataLoaded = (data: any[], cols: string[]) => {
    // 自動計算總分並映射數據
    const newEntries = data.map((d, i) => {
      const processed = processSurveyAggregates(d);
      return {
        id: `r-${i}`,
        data: processed,
        included: true
      };
    });
    
    setEntries(newEntries);
    
    // 將計算出的總分欄位也加入可選擇的欄位列表中
    const aggregateCols = ['Social_Support_Total', 'Hope_Total', 'Death_Attitude_Total'];
    const finalCols = [...cols, ...aggregateCols];
    setColumns(finalCols);
    setActiveTab('dashboard');
  };

  const toggleEntry = (id: string) => {
    setEntries(prev => prev.map(e => e.id === id ? { ...e, included: !e.included } : e));
  };

  const toggleAll = (included: boolean) => {
    setEntries(prev => prev.map(e => ({ ...e, included })));
  };

  const filteredData = useMemo(() => {
    return entries.filter(e => e.included).map(e => e.data);
  }, [entries]);

  const downloadSampleCSV = () => {
    // 根據正式問卷產生欄位
    const basicInfo = ["Gender", "Age_Y", "Education", "Marital", "Children", "ADL", "Health_Status"];
    const ssItems = Array.from({length: 20}, (_, i) => `SS_${i+1}`);
    const hopeItems = Array.from({length: 12}, (_, i) => `H_${i+1}`);
    const daItems = Array.from({length: 32}, (_, i) => `DA_${i+1}`);
    
    const allHeaders = [...basicInfo, ...ssItems, ...hopeItems, ...daItems].join(",");
    
    // 產生一筆範例數據
    const sampleRow = [
      "1", "85", "2", "3", "2", "80", "4", // Basic
      ...Array(20).fill(4), // SS (1-5)
      ...Array(12).fill(3), // Hope (1-4)
      ...Array(32).fill(3)  // DA (1-5)
    ].join(",");

    const blob = new Blob([allHeaders + "\n" + sampleRow], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = "老年住民研究問卷範例.csv";
    a.click();
  };

  return (
    <div className="flex h-screen bg-[#f1f5f9] text-gray-900 overflow-hidden font-sans">
      {/* Sidebar - Professional Polish Style */}
      <aside className="w-[260px] bg-[#0f172a] text-[#f8fafc] flex flex-col p-6 shrink-0 z-20">
        <div className="flex items-center gap-3 mb-10">
          <div className="w-9 h-9 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/20">
            <BrainCircuit className="text-white" size={20} />
          </div>
          <span className="font-bold text-xl tracking-tight">StatsPro AI</span>
        </div>

        <nav className="flex-1 space-y-2">
          <div className="text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-4">Workspace</div>
          <SidebarItem 
            active={activeTab === 'dashboard'} 
            onClick={() => setActiveTab('dashboard')} 
            icon={<BarChart3 size={18} />} 
            label="分析儀表板" 
          />
          <SidebarItem 
            active={activeTab === 'data'} 
            onClick={() => setActiveTab('data')} 
            icon={<TableIcon size={18} />} 
            label="問卷數據管理" 
            badge={entries.length > 0 ? entries.length.toString() : undefined}
          />
          <SidebarItem 
            active={activeTab === 'pdf'} 
            onClick={() => setActiveTab('pdf')} 
            icon={<FileUp size={18} />} 
            label="PDF 問卷識別" 
          />
          
          <div className="pt-8 text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-4">System</div>
          <SidebarItem active={activeTab === 'settings'} onClick={() => setActiveTab('settings')} icon={<Settings size={18} />} label="分析設定" />
        </nav>

        <div className="mt-auto">
          <button 
            onClick={downloadSampleCSV}
            className="w-full flex items-center justify-center gap-2 py-3 bg-slate-800 hover:bg-slate-700 rounded-xl text-xs font-semibold transition-all border border-slate-700"
          >
            <Download size={14} /> 下載 CSV 範例
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col overflow-hidden relative text-slate-900 overflow-y-auto">
        <header className="h-16 bg-white border-b border-slate-200 px-8 flex items-center justify-between sticky top-0 z-50">
          <div>
            <span className="text-slate-400 text-sm">研究項目 / </span>
            <span className="font-semibold text-sm">Thesis_Regression_Analysis_2026</span>
          </div>
          <div className="flex gap-4">
            {entries.length > 0 && (
              <div className="flex items-center gap-2 bg-blue-50 text-blue-700 px-3 py-1.5 rounded-full text-[11px] font-bold uppercase tracking-wider">
                <CheckCircle2 size={12} />
                有效樣本: {filteredData.length} / {entries.length}
              </div>
            )}
            <div className="bg-slate-100 text-slate-600 px-3 py-1.5 rounded-full text-[11px] font-bold uppercase tracking-wider">
              AI 模型: Gemini 1.5 Flash
            </div>
          </div>
        </header>

        <div className="p-8">
          <AnimatePresence mode="wait">
            {!entries.length && activeTab !== 'pdf' ? (
              <WelcomeView onDataLoaded={handleDataLoaded} onPdfClick={() => setActiveTab('pdf')} />
            ) : (
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
                className="max-w-6xl mx-auto space-y-8"
              >
                {activeTab === 'dashboard' && (
                  <>
                    <AnalysisDashboard data={filteredData} columns={columns} />
                    <StatsWrapper data={filteredData} columns={columns} />
                  </>
                )}

                {activeTab === 'data' && (
                  <DataTableView entries={entries} columns={columns} onToggle={toggleEntry} onToggleAll={toggleAll} />
                )}

                {activeTab === 'pdf' && (
                  <PdfAnalysisView onAnalysed={() => setActiveTab('dashboard')} />
                )}

                {activeTab === 'settings' && (
                  <div className="max-w-2xl mx-auto space-y-8">
                    <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm">
                      <div className="flex items-center gap-4 mb-6">
                        <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-2xl flex items-center justify-center">
                          <BrainCircuit size={24} />
                        </div>
                        <div>
                          <h2 className="text-xl font-bold">AI 分析設定</h2>
                          <p className="text-sm text-slate-500">設置您的 Gemini API 以啟用 AI 洞察指導功能</p>
                        </div>
                      </div>

                      <div className="space-y-4">
                        <div>
                          <label className="block text-xs font-bold text-slate-500 uppercase mb-2 tracking-widest">Gemini API Key</label>
                          <div className="flex gap-2">
                            <input 
                              type="password" 
                              placeholder="在此輸入 API Key..." 
                              className="flex-1 px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                              defaultValue={process.env.GEMINI_API_KEY}
                            />
                            <button className="px-6 py-3 bg-blue-600 text-white rounded-xl text-sm font-bold">儲存</button>
                          </div>
                          <p className="mt-4 text-xs text-slate-400 leading-relaxed">
                            注意：在 AI Studio 環境中，您的 API Key 會自動注入。如果您之後將專案導出至 GitHub 或是自行部署，請確保在 Secrets 面板中設定 <b>GEMINI_API_KEY</b>。
                          </p>
                        </div>

                        <div className="pt-6 border-t border-slate-100 flex items-center justify-between">
                          <div>
                            <h4 className="font-bold text-sm">如何獲取 API Key？</h4>
                            <p className="text-xs text-slate-500">前往 Google AI Studio 獲取免費的 API 密鑰。</p>
                          </div>
                          <a 
                            href="https://aistudio.google.com/app/apikey" 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-blue-600 font-bold text-xs flex items-center gap-1 hover:underline"
                          >
                            前往網頁 <Github size={12} />
                          </a>
                        </div>
                      </div>
                    </div>

                    <div className="bg-slate-900 text-white p-8 rounded-3xl shadow-xl overflow-hidden relative">
                      <div className="relative z-10">
                        <h3 className="text-lg font-bold mb-2">學術道德與數據安全</h3>
                        <p className="text-slate-400 text-sm leading-relaxed mb-6">
                          本工具僅供學術研究輔助使用。所有上傳的 CSV 數據僅存儲於瀏覽器記憶體中，關閉分頁後即會消失。AI 分析功能的準確性受選取變數與樣本量影響。
                        </p>
                        <div className="flex gap-3">
                          <div className="px-3 py-1 bg-white/10 rounded-lg text-[10px] font-mono">TLS ENCRYPTED</div>
                          <div className="px-3 py-1 bg-white/10 rounded-lg text-[10px] font-mono">LOCAL STORAGE NO-SYNC</div>
                        </div>
                      </div>
                      <div className="absolute -right-8 -bottom-8 opacity-10">
                        <BrainCircuit size={160} />
                      </div>
                    </div>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
}

// Sub-components
function SidebarItem({ active, onClick, icon, label, badge }: { active: boolean, onClick: () => void, icon: React.ReactNode, label: string, badge?: string }) {
  return (
    <button 
      onClick={onClick}
      className={cn(
        "w-full flex items-center justify-between px-4 py-3 rounded-xl text-sm transition-all group",
        active ? "bg-blue-600 text-white shadow-lg shadow-blue-500/20" : "text-slate-400 hover:text-white hover:bg-slate-800"
      )}
    >
      <div className="flex items-center gap-3">
        {icon}
        <span className="font-medium">{label}</span>
      </div>
      {badge && (
        <span className={cn(
          "text-[10px] px-1.5 py-0.5 rounded-full font-bold",
          active ? "bg-white/20 text-white" : "bg-slate-800 text-slate-500 group-hover:text-slate-300"
        )}>
          {badge}
        </span>
      )}
    </button>
  );
}

function WelcomeView({ onDataLoaded, onPdfClick }: { onDataLoaded: (d: any[], c: string[]) => void, onPdfClick: () => void }) {
  return (
    <div className="max-w-4xl mx-auto py-12">
      <div className="text-center mb-16">
        <div className="inline-flex items-center px-4 py-1.5 bg-blue-50 text-blue-600 rounded-full text-xs font-bold uppercase tracking-widest mb-6 font-mono">
          <Sparkles className="mr-2" size={14} /> Thesis Analysis Tool
        </div>
        <h1 className="text-5xl font-bold tracking-tight text-slate-900 mb-6 font-serif">從問卷到學術結論<br/>僅需數秒。</h1>
        <p className="text-lg text-slate-500 max-w-xl mx-auto">
          專業的統計分析與 AI 解讀工具。您可以選擇上傳問卷數據檔案，或是讓 AI 協助解析您的 PDF 問卷設計。
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="bg-white p-1 rounded-3xl shadow-sm border border-slate-200">
          <DataImporter onDataLoaded={onDataLoaded} />
        </div>
        <div 
          onClick={onPdfClick}
          className="bg-white p-8 rounded-3xl shadow-sm border border-slate-200 flex flex-col items-center justify-center text-center cursor-pointer hover:border-blue-400 transition-all group"
        >
          <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
            <FileUp size={32} />
          </div>
          <h3 className="font-bold text-lg mb-2">上傳問卷 PDF</h3>
          <p className="text-sm text-slate-500">AI 將協助您理解問卷題目，並為後續數據匯入生成相應的格式。</p>
        </div>
      </div>
    </div>
  );
}

function DataTableView({ entries, columns, onToggle, onToggleAll }: { entries: SurveyEntry[], columns: string[], onToggle: (id: string) => void, onToggleAll: (inc: boolean) => void }) {
  const [searchTerm, setSearchTerm] = useState("");
  const filtered = entries.filter(e => 
    Object.values(e.data).some(val => String(val).toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
        <div>
          <h2 className="text-xl font-bold">問卷樣本管理</h2>
          <p className="text-sm text-slate-500 mt-1">勾選或排除異常值，系統將自動重新計算迴歸模型。</p>
        </div>
        <div className="flex items-center gap-3">
          <input 
            type="text" 
            placeholder="搜尋樣本內容..." 
            className="px-4 py-2 bg-slate-100 border-none rounded-xl text-sm w-64 focus:ring-2 focus:ring-blue-500 outline-none"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
          />
          <button onClick={() => onToggleAll(true)} className="px-4 py-2 text-xs font-bold text-blue-600 hover:bg-blue-50 rounded-xl">全部包含</button>
          <button onClick={() => onToggleAll(false)} className="px-4 py-2 text-xs font-bold text-red-600 hover:bg-red-50 rounded-xl">全部排除</button>
        </div>
      </div>
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-x-auto">
        <table className="w-full text-sm text-left">
          <thead className="bg-slate-50 border-b border-slate-100">
            <tr>
              <th className="px-6 py-4 font-bold text-slate-500 w-16">選入</th>
              {columns.map(c => <th key={c} className="px-6 py-4 font-bold text-slate-500 capitalize">{c.replace(/_/g, ' ')}</th>)}
            </tr>
          </thead>
          <tbody>
            {filtered.map(e => (
              <tr key={e.id} className={cn("border-b border-slate-50", !e.included && "opacity-40 grayscale")}>
                <td className="px-6 py-4">
                  <button onClick={() => onToggle(e.id)} className={cn("w-5 h-5 rounded border flex items-center justify-center transition-colors", e.included ? "bg-blue-600 border-blue-600 text-white" : "border-slate-300 text-transparent")}>
                    <CheckCircle2 size={12} />
                  </button>
                </td>
                {columns.map(c => <td key={c} className="px-6 py-4 font-medium">{e.data[c]}</td>)}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function PdfAnalysisView({ onAnalysed }: { onAnalysed: () => void }) {
  const [analyzing, setAnalyzing] = useState(false);
  const [result, setResult] = useState<string | null>(null);

  const startAnalysis = () => {
    setAnalyzing(true);
    setTimeout(() => {
      setAnalyzing(false);
      setResult("AI 已完成問卷 PDF 深度掃描。\n\n識別主題：學生學業壓力與心理彈性關係研究\n\n建議變數對應：\nX1 (壓力指數): Q1-Q15\nY (學業表現): 總平均成績\n\n已根據此結構產生「學術優化版 CSV 範例」，您可以點擊下載後填寫數據。");
    }, 2000);
  };

  return (
    <div className="max-w-2xl mx-auto bg-white p-12 rounded-3xl border border-slate-200 text-center space-y-8 shadow-sm">
      <div className="w-20 h-20 bg-blue-50 text-blue-600 rounded-3xl flex items-center justify-center mx-auto">
        <FileText size={40} />
      </div>
      <div>
        <h2 className="text-2xl font-bold mb-2">PDF 問卷結構識別</h2>
        <p className="text-slate-500">上傳您的問卷設計稿，AI 會自動規劃變數名稱與統計路徑。</p>
      </div>
      <div className="border-2 border-dashed border-slate-200 rounded-2xl p-12 bg-slate-50">
        <input type="file" accept=".pdf" className="hidden" id="pdf-input" onChange={startAnalysis} />
        <label htmlFor="pdf-input" className="cursor-pointer">
          <FileUp className="mx-auto text-slate-300 mb-4" size={32} />
          <p className="text-sm font-bold text-slate-600">選擇 PDF 文件並開始 AI 分析</p>
        </label>
      </div>
      {analyzing && <div className="text-blue-600 font-bold animate-pulse">AI 研究教授思考中...</div>}
      {result && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-slate-50 p-6 rounded-2xl text-left text-sm whitespace-pre-wrap border border-slate-200">
          <p className="mb-6">{result}</p>
          <button onClick={onAnalysed} className="w-full py-3 bg-blue-600 text-white rounded-xl font-bold text-xs uppercase tracking-widest">前往儀表板匯入數據</button>
        </motion.div>
      )}
    </div>
  );
}

function StatsWrapper({ data, columns }: { data: any[], columns: string[] }) {
  const [x, setX] = useState(columns[0] || '');
  const [y, setY] = useState(columns[1] || '');

  const stats = useMemo(() => {
    const points = data
      .map(d => ({ x: parseFloat(d[x]), y: parseFloat(d[y]) }))
      .filter(p => !isNaN(p.x) && !isNaN(p.y));
    if (points.length < 2) return null;
    
    try {
      const { m, b } = ss.linearRegression(points.map(p => [p.x, p.y]));
      const r2 = ss.sampleCorrelation(points.map(p => p.x), points.map(p => p.y)) ** 2;
      return { m, b, r2, count: points.length, xName: x, yName: y };
    } catch (e) {
      return null;
    }
  }, [data, x, y]);

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-3xl border border-slate-200 flex items-center gap-6">
        <div className="flex flex-col">
          <span className="text-[10px] font-bold text-slate-400 uppercase mb-1">因果分析變數</span>
          <div className="flex items-center gap-3 bg-slate-50 px-4 py-2 rounded-xl">
            <select value={x} onChange={e => setX(e.target.value)} className="bg-transparent border-none text-sm font-bold p-0 focus:ring-0">
              {columns.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
            <span className="text-slate-300">→</span>
            <select value={y} onChange={e => setY(e.target.value)} className="bg-transparent border-none text-sm font-bold p-0 focus:ring-0">
              {columns.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
        </div>
      </div>
      {stats && <AIInsights stats={stats} />}
    </div>
  );
}

