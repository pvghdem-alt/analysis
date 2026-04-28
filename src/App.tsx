import React, { useState, useMemo, useEffect } from 'react';
import { DataImporter } from './components/DataImporter';
import { AnalysisDashboard } from './components/AnalysisDashboard';
import { AIInsights } from './components/AIInsights';
import { PdfAnalysisView } from './components/PdfAnalysisView';
import { 
  BarChart3, 
  Table as TableIcon, 
  Download,
  FileUp,
  BrainCircuit,
  Settings,
  CheckCircle2,
  Sparkles,
  Github
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import * as ss from 'simple-statistics';
import { cn, getColumnTitle, columnGroups } from './lib/utils';
import { processSurveyAggregates } from './lib/stats';
import { SurveyDetail } from './components/SurveyDetail';
import { db, handleFirestoreError, OperationType } from './lib/firebase';
import { collection, onSnapshot, setDoc, doc, deleteDoc } from 'firebase/firestore';

type Tab = 'dashboard' | 'data' | 'pdf';

interface SurveyEntry {
  id: string;
  data: any;
  included: boolean;
}

export default function App() {
  const [activeTab, setActiveTab] = useState<Tab>('dashboard');
  const [isApiModalOpen, setIsApiModalOpen] = useState(false);
  const [entries, setEntries] = useState<SurveyEntry[]>([]);
  const [columns, setColumns] = useState<string[]>([]);
  
  const [localUserId] = useState(() => {
    let id = localStorage.getItem('localUserId');
    if (!id) {
      id = 'user-' + Date.now() + '-' + Math.random().toString(36).substring(2, 9);
      localStorage.setItem('localUserId', id);
    }
    return id;
  });

  useEffect(() => {
    // Listen to Firebase surveys
    const q = collection(db, 'surveys');
    const unsub = onSnapshot(q, (snapshot) => {
      const loaded: SurveyEntry[] = [];
      const colSet = new Set<string>();
      
      snapshot.forEach(d => {
        const docData = d.data();
        loaded.push({ id: d.id, data: docData, included: true }); // we could store 'included' too, but kept local for now
        Object.keys(docData).forEach(k => {
           if (k !== 'createdAt' && k !== 'userId') {
             colSet.add(k);
           }
        });
      });
      
      setEntries(loaded);
      
      const aggregateCols = ['Social_Support_Total', 'Hope_Total', 'Death_Attitude_Total'];
      const rawCols = Array.from(colSet);
      
      const orderedCols: string[] = [];
      columnGroups.forEach(g => {
        g.options.forEach(opt => {
          if (rawCols.includes(opt) || aggregateCols.includes(opt)) {
            if(!orderedCols.includes(opt)) orderedCols.push(opt);
          }
        });
      });
      // push the rest
      const rest = rawCols.filter(c => !orderedCols.includes(c));
      const finalCols = [...orderedCols, ...rest];

      if(finalCols.length > 0) {
        setColumns(finalCols);
      }
    }, (error) => {
      console.warn("Firebase listener failed or unavailable. Continuing in local-only mode.", error);
    });

    return () => unsub();
  }, [localUserId]);

  const addLocalEntry = (id: string, processed: any) => {
    setEntries(prev => {
      if (prev.find(e => e.id === id)) return prev;
      return [...prev, { id, data: processed, included: true }];
    });
    setColumns(prev => {
      const colSet = new Set(prev);
      Object.keys(processed).forEach(k => {
        if (k !== 'createdAt' && k !== 'userId') colSet.add(k);
      });
      const aggregateCols = ['Social_Support_Total', 'Hope_Total', 'Death_Attitude_Total'];
      const rawCols = Array.from(colSet);
      
      const orderedCols: string[] = [];
      columnGroups.forEach(g => {
        g.options.forEach(opt => {
          if (rawCols.includes(opt) || aggregateCols.includes(opt)) {
            if(!orderedCols.includes(opt)) orderedCols.push(opt);
          }
        });
      });
      const rest = rawCols.filter(c => !orderedCols.includes(c));
      return [...orderedCols, ...rest];
    });
  };

  const handleDataLoaded = async (data: any[], cols: string[]) => {
    for (let i = 0; i < data.length; i++) {
      const processed = processSurveyAggregates(data[i]);
      processed.userId = localUserId;
      processed.createdAt = Date.now();
      const id = `r-${Date.now()}-${i}`;
      
      try {
        await setDoc(doc(db, 'surveys', id), processed);
      } catch (error) {
        console.warn("Firebase save failed, falling back to local state.", error);
        addLocalEntry(id, processed);
      }
    }
    setActiveTab('dashboard');
  };

  const handleDataExtracted = async (extractedData: any) => {
    let dataObj = Array.isArray(extractedData) ? extractedData[0] : extractedData;
    
    // flatten nested json objects just in case AI returns them
    const flatten = (obj: any): any => {
      return Object.keys(obj).reduce((acc: any, k: string) => {
        if (typeof obj[k] === 'object' && obj[k] !== null && !Array.isArray(obj[k])) Object.assign(acc, flatten(obj[k]));
        else acc[k] = obj[k];
        return acc;
      }, {});
    };
    dataObj = flatten(dataObj);

    const processed = processSurveyAggregates(dataObj);
    processed.userId = localUserId;
    processed.createdAt = Date.now();
    const id = `ai-${Date.now()}`;
    
    try {
      await setDoc(doc(db, 'surveys', id), processed);
    } catch(error) {
      console.warn("Firebase save failed, falling back to local state.", error);
      addLocalEntry(id, processed);
    }
  };

  const deleteEntry = async (id: string, e?: React.MouseEvent) => {
    e?.stopPropagation();
    try {
      await deleteDoc(doc(db, 'surveys', id));
    } catch(error) {
      console.warn("Firebase delete failed, falling back to local state.", error);
      setEntries(prev => prev.filter(en => en.id !== id));
    }
  };

  const updateEntry = async (id: string, updatedData: any) => {
    const processed = processSurveyAggregates(updatedData);
    processed.userId = localUserId;
    processed.createdAt = Date.now();
    try {
      await setDoc(doc(db, 'surveys', id), processed);
      // Local state will update via onSnapshot
    } catch(error) {
      console.warn("Firebase save failed, falling back to local state.", error);
      setEntries(prev => prev.map(e => e.id === id ? { ...e, data: processed } : e));
    }
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
    const basicInfo = [
      "Gender", "Age_Y", "Age_M", "Education", "Marital", "Children", 
      "Family_Visit", "Advance_Directive", "Income_Source", "Religion", 
      "Assistive_Device", "Chronic_Disease", "ADL", "Health_Status", 
      "Hope_Future", "Main_Supporter", "Move_In_Y", "Move_In_M"
    ];
    const ssItems = Array.from({length: 20}, (_, i) => `SS_${i+1}`);
    const hopeItems = Array.from({length: 12}, (_, i) => `H_${i+1}`);
    const daItems = Array.from({length: 32}, (_, i) => `DA_${i+1}`);
    
    const allHeaders = [...basicInfo, ...ssItems, ...hopeItems, ...daItems].join(",");
    
    const sampleRow = [
      "女", "85", "9", "大學", "已婚有偶", "2", "幾乎沒有", "未簽署", 
      "政府補助", "道教", "無", "無", "80", "普通", "較無希望", 
      "其他家人", "90", "5",
      ...Array(20).fill(4),
      ...Array(12).fill(3),
      ...Array(32).fill(3)
    ].join(",");

    const blob = new Blob([allHeaders + "\n" + sampleRow], { type: 'text/csv;charset=utf-8;' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = "老年住民研究問卷範例.csv";
    a.click();
  };

  return (
    <div className="flex h-screen bg-[#f1f5f9] text-gray-900 overflow-hidden font-sans">
      <aside className="w-[260px] bg-[#0f172a] text-[#f8fafc] flex flex-col p-6 shrink-0 z-20">
        <div className="flex items-center gap-3 mb-10">
          <div className="w-9 h-9 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/20">
            <BrainCircuit className="text-white" size={20} />
          </div>
          <span className="font-bold text-xl tracking-tight">問券統計分析</span>
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
            label="問卷自動識別" 
          />
          
          <div className="pt-8 text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-4">System</div>
          <SidebarItem 
            active={false} 
            onClick={() => setIsApiModalOpen(true)} 
            icon={<Settings size={18} />} 
            label="設定 API KEY" 
          />
        </nav>

        <div className="mt-auto space-y-4">
          <button 
            onClick={downloadSampleCSV}
            className="w-full flex items-center justify-center gap-2 py-3 bg-slate-800 hover:bg-slate-700 rounded-xl text-xs font-semibold transition-all border border-slate-700"
          >
            <Download size={14} /> 下載 CSV 範例
          </button>
        </div>
      </aside>

      <main className="flex-1 flex flex-col overflow-hidden relative text-slate-900 overflow-y-auto">
        <header className="h-16 bg-white border-b border-slate-200 px-8 flex items-center justify-between sticky top-0 z-50">
          <div>
            <span className="text-slate-400 text-sm">研究項目 / </span>
            <span className="font-semibold text-sm">Thesis_Regression_Analysis_2k26</span>
          </div>
          <div className="flex gap-4">
            {entries.length > 0 && (
              <div className="flex items-center gap-2 bg-blue-50 text-blue-700 px-3 py-1.5 rounded-full text-[11px] font-bold uppercase tracking-wider">
                <CheckCircle2 size={12} />
                有效樣本: {filteredData.length} / {entries.length}
              </div>
            )}
            <div className="bg-slate-100 text-slate-600 px-3 py-1.5 rounded-full text-[11px] font-bold uppercase tracking-wider">
              AI 模型: Gemini 3 Flash
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
                  <DataTableView entries={entries} columns={columns} onToggle={toggleEntry} onToggleAll={toggleAll} onDelete={deleteEntry} onUpdate={updateEntry} />
                )}

                {activeTab === 'pdf' && (
                  <PdfAnalysisView 
                    onDataExtracted={handleDataExtracted} 
                    onAnalysed={() => setActiveTab('data')} 
                  />
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>

      {/* API Key Modal */}
      <AnimatePresence>
        {isApiModalOpen && (
          <ApiKeyModal onClose={() => setIsApiModalOpen(false)} />
        )}
      </AnimatePresence>
    </div>
  );
}

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
          專業的統計分析與 AI 解讀工具。您可以選擇上傳問卷數據檔案，或是讓 AI 協助解析您拍攝的已填寫問卷。
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
          <h3 className="font-bold text-lg mb-2">AI 識別紙本問卷</h3>
          <p className="text-sm text-slate-500">拍攝已勾選的紙本問卷，AI 將自動提取數據並彙集成表。</p>
        </div>
      </div>
    </div>
  );
}

import { Trash2 } from 'lucide-react';

function DataTableView({ entries, columns, onToggle, onToggleAll, onDelete, onUpdate }: { entries: SurveyEntry[], columns: string[], onToggle: (id: string) => void, onToggleAll: (inc: boolean) => void, onDelete: (id: string, e?: React.MouseEvent) => void, onUpdate: (id: string, data: any) => void }) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedEntry, setSelectedEntry] = useState<SurveyEntry | null>(null);

  const filtered = entries.filter(e => 
    Object.values(e.data).some(val => String(val).toLowerCase().includes(searchTerm.toLowerCase()))
  );

  if (selectedEntry) {
    return <SurveyDetail entry={selectedEntry} onBack={() => setSelectedEntry(null)} onUpdate={(data) => onUpdate(selectedEntry.id, data)} />;
  }

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
            className="px-4 py-2 bg-slate-100 border-none rounded-xl text-sm w-64 focus:ring-2 focus:ring-blue-500 outline-none font-sans"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
          />
          <button onClick={() => onToggleAll(true)} className="px-4 py-2 text-xs font-bold text-blue-600 hover:bg-blue-50 rounded-xl">全部包含</button>
          <button onClick={() => onToggleAll(false)} className="px-4 py-2 text-xs font-bold text-red-600 hover:bg-red-50 rounded-xl">全部排除</button>
        </div>
      </div>
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-x-auto">
        <table className="w-full text-sm text-left">
          <thead className="bg-slate-50 border-b border-slate-100 sticky top-0">
            <tr>
              <th className="px-6 py-4 font-bold text-slate-500 w-16">選入</th>
              <th className="px-6 py-4 font-bold text-slate-500 w-16">選項</th>
              {columns.map(c => <th key={c} className="px-6 py-4 font-bold text-slate-500 whitespace-nowrap">{getColumnTitle(c)}</th>)}
            </tr>
          </thead>
          <tbody>
            {filtered.map(e => (
              <tr 
                key={e.id} 
                className={cn("border-b border-slate-50 hover:bg-slate-50/50 transition-colors cursor-pointer", !e.included && "opacity-40 grayscale bg-slate-100/30")}
                onClick={() => setSelectedEntry(e)}
              >
                <td className="px-6 py-4" onClick={(ev) => ev.stopPropagation()}>
                  <button onClick={() => onToggle(e.id)} className={cn("w-5 h-5 rounded border flex items-center justify-center transition-colors", e.included ? "bg-blue-600 border-blue-600 text-white" : "border-slate-300 text-transparent")}>
                    <CheckCircle2 size={12} />
                  </button>
                </td>
                <td className="px-6 py-4" onClick={(ev) => ev.stopPropagation()}>
                  <button onClick={(ev) => onDelete(e.id, ev)} className="text-red-500 hover:bg-red-50 p-2 rounded-xl transition-colors">
                    <Trash2 size={16} />
                  </button>
                </td>
                {columns.map(c => {
                  let val = e.data[c];
                  if (typeof val === 'object' && val !== null) {
                     val = Array.isArray(val) ? val.join(', ') : JSON.stringify(val);
                  }
                  return (
                    <td key={c} className="px-6 py-4 font-medium whitespace-nowrap">
                      {val ?? '-'}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function ApiKeyModal({ onClose }: { onClose: () => void }) {
  const [apiKey, setApiKey] = useState(localStorage.getItem('gemini_api_key') || '');
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    localStorage.setItem('gemini_api_key', apiKey);
    setSaved(true);
    setTimeout(() => {
      setSaved(false);
      onClose();
    }, 1000);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="w-full max-w-lg bg-white rounded-3xl shadow-2xl overflow-hidden"
      >
        <div className="p-8">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-2xl flex items-center justify-center">
                <BrainCircuit size={24} />
              </div>
              <div>
                <h2 className="text-xl font-bold text-slate-900">設定 API Key</h2>
                <p className="text-sm text-slate-500">輸入您的 Gemini API 密鑰</p>
              </div>
            </div>
            <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
            </button>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-2 tracking-widest">Gemini API Key</label>
              <div className="flex gap-2">
                <input 
                  type="password" 
                  placeholder="在此輸入 API Key..." 
                  className="flex-1 px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                  value={apiKey}
                  onChange={e => setApiKey(e.target.value)}
                />
                <button onClick={handleSave} className="px-6 py-3 bg-blue-600 hover:bg-blue-500 transition-colors text-white rounded-xl text-sm font-bold">
                  {saved ? '已儲存' : '儲存'}
                </button>
              </div>
              <p className="mt-4 text-xs text-slate-400 leading-relaxed">
                您的密鑰將安全地保存在瀏覽器本地存儲中。用於分析提取問卷內容。
              </p>
            </div>

            <div className="pt-6 border-t border-slate-100 flex items-center justify-between">
              <div>
                <h4 className="font-bold text-sm text-slate-900">如何獲取 API Key？</h4>
                <p className="text-xs text-slate-500">前往 Google AI Studio 免費獲取</p>
              </div>
              <a 
                href="https://aistudio.google.com/app/apikey" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-blue-600 font-bold text-xs flex items-center gap-1 hover:underline"
              >
                前往獲取 <Github size={12} />
              </a>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

function StatsWrapper({ data, columns }: { data: any[], columns: string[] }) {
  const [x, setX] = useState('');
  const [y, setY] = useState('');

  React.useEffect(() => {
    if (!x && columns.length > 0) setX(columns[0]);
    if (!y && columns.length > 1) setY(columns[1]);
  }, [columns]);

  const stats = useMemo(() => {
    if (!x || !y) return null;
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
      <div className="bg-white p-6 rounded-3xl border border-slate-200 flex items-center gap-6 shadow-sm">
        <div className="flex flex-col">
          <span className="text-[10px] font-bold text-slate-400 uppercase mb-1 tracking-widest">因果分析變數</span>
          <div className="flex items-center gap-3 bg-slate-50 px-4 py-2 rounded-xl border border-slate-100">
            <select value={x} onChange={e => setX(e.target.value)} className="bg-transparent border-none text-sm font-bold p-0 focus:ring-0 outline-none w-48">
              {columnGroups.map(group => {
                const opts = group.options.filter(c => columns.includes(c));
                if (opts.length === 0) return null;
                return (
                  <optgroup key={group.label} label={group.label}>
                    {opts.map(col => <option key={col} value={col}>{getColumnTitle(col)}</option>)}
                  </optgroup>
                );
              })}
              {columns.filter(c => !columnGroups.some(g => g.options.includes(c))).length > 0 && (
                <optgroup label="其他">
                   {columns.filter(c => !columnGroups.some(g => g.options.includes(c))).map(col => <option key={col} value={col}>{getColumnTitle(col)}</option>)}
                </optgroup>
              )}
            </select>
            <span className="text-slate-300">→</span>
            <select value={y} onChange={e => setY(e.target.value)} className="bg-transparent border-none text-sm font-bold p-0 focus:ring-0 outline-none w-48 text-blue-600">
               {columnGroups.map(group => {
                const opts = group.options.filter(c => columns.includes(c));
                if (opts.length === 0) return null;
                return (
                  <optgroup key={group.label} label={group.label}>
                    {opts.map(col => <option key={col} value={col}>{getColumnTitle(col)}</option>)}
                  </optgroup>
                );
              })}
              {columns.filter(c => !columnGroups.some(g => g.options.includes(c))).length > 0 && (
                <optgroup label="其他">
                   {columns.filter(c => !columnGroups.some(g => g.options.includes(c))).map(col => <option key={col} value={col}>{getColumnTitle(col)}</option>)}
                </optgroup>
              )}
            </select>
          </div>
        </div>
        <div className="ml-auto text-xs text-slate-400 font-serif italic text-right">
          系統將自動計算兩變數間的線性關係
        </div>
      </div>
      {stats && <AIInsights stats={stats} />}
    </div>
  );
}
