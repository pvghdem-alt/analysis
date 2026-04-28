import React from 'react';
import { ArrowLeft, CheckCircle2 } from 'lucide-react';
import { cn } from '../lib/utils';

export function SurveyDetail({ entry, onBack }: { entry: any, onBack: () => void }) {
  const data = entry.data || {};

  const formatVal = (val: any) => {
    if (val === undefined || val === null) return '-';
    if (Array.isArray(val)) return val.join(', ');
    if (typeof val === 'object') return JSON.stringify(val);
    return String(val);
  };

  const renderBasicInfo = () => (
    <div className="space-y-6">
      <h3 className="font-bold text-lg border-b pb-2">第一部分：【基本資料】</h3>
      
      <div className="grid grid-cols-2 gap-y-4 gap-x-8 text-sm">
        <div className="space-y-1">
          <span className="text-slate-500">1. 性別：</span>
          <span className="font-semibold">{formatVal(data.Gender)}</span>
        </div>
        <div className="space-y-1">
          <span className="text-slate-500">2. 年齡：</span>
          <span className="font-semibold">民國 {formatVal(data.Age_Y)} 年 {formatVal(data.Age_M)} 月</span>
        </div>
        <div className="space-y-1">
          <span className="text-slate-500">3. 教育程度：</span>
          <span className="font-semibold">{formatVal(data.Education)}</span>
        </div>
        <div className="space-y-1">
          <span className="text-slate-500">4. 婚姻狀況：</span>
          <span className="font-semibold">{formatVal(data.Marital)}</span>
        </div>
        <div className="space-y-1">
          <span className="text-slate-500">5. 子女人數：</span>
          <span className="font-semibold">{formatVal(data.Children)}</span>
        </div>
        <div className="space-y-1">
          <span className="text-slate-500">6. 家人是否定期探訪：</span>
          <span className="font-semibold">{formatVal(data.Family_Visit)}</span>
        </div>
        <div className="space-y-1">
          <span className="text-slate-500">7. 簽署預立醫療決定：</span>
          <span className="font-semibold">{formatVal(data.Advance_Directive)}</span>
        </div>
        <div className="space-y-1">
          <span className="text-slate-500">8. 經濟來源：</span>
          <span className="font-semibold">{formatVal(data.Income_Source)}</span>
        </div>
        <div className="space-y-1">
          <span className="text-slate-500">9. 宗教信仰：</span>
          <span className="font-semibold">{formatVal(data.Religion)}</span>
        </div>
        <div className="space-y-1">
          <span className="text-slate-500">10. 使用輔具狀況：</span>
          <span className="font-semibold">{formatVal(data.Assistive_Device)}</span>
        </div>
        <div className="space-y-1 col-span-2">
          <span className="text-slate-500">11. 目前有無罹患慢性病：</span>
          <span className="font-semibold">{formatVal(data.Chronic_Disease)}</span>
        </div>
        <div className="space-y-1">
          <span className="text-slate-500">12. ADL：</span>
          <span className="font-semibold">{formatVal(data.ADL)} 分</span>
        </div>
        <div className="space-y-1">
          <span className="text-slate-500">13. 自覺健康狀況：</span>
          <span className="font-semibold">{formatVal(data.Health_Status)}</span>
        </div>
        <div className="space-y-1">
          <span className="text-slate-500">14. 對未來生活是否保有希望與期待：</span>
          <span className="font-semibold">{formatVal(data.Hope_Future)}</span>
        </div>
        <div className="space-y-1">
          <span className="text-slate-500">15. 平時主要提供您支持的人為：</span>
          <span className="font-semibold">{formatVal(data.Main_Supporter)}</span>
        </div>
        <div className="space-y-1">
          <span className="text-slate-500">16. 入住機構時間：</span>
          <span className="font-semibold">民國 {formatVal(data.Move_In_Y)} 年 {formatVal(data.Move_In_M)} 月</span>
        </div>
      </div>
    </div>
  );

  const renderScaleTable = (title: string, prefix: string, count: number, maxScore: number, headers: string[]) => (
    <div className="space-y-6">
      <h3 className="font-bold text-lg border-b pb-2">{title}</h3>
      <div className="overflow-x-auto rounded-xl border border-slate-200">
        <table className="w-full text-sm text-center">
          <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-medium">
            <tr>
              <th className="px-4 py-3 text-left w-12">題號</th>
              {headers.map((h, i) => <th key={i} className="px-2 py-3 font-medium min-w-[60px]">{h}</th>)}
            </tr>
          </thead>
          <tbody>
            {Array.from({ length: count }).map((_, idx) => {
              const qId = `${prefix}_${idx + 1}`;
              const val = data[qId];
              return (
                <tr key={qId} className="border-b border-slate-100 hover:bg-slate-50">
                  <td className="px-4 py-3 text-left text-slate-400">{idx + 1}</td>
                  {Array.from({ length: maxScore }).map((_, optIdx) => {
                    const score = optIdx + 1;
                    const isSelected = val === score || String(val) === String(score);
                    return (
                      <td key={score} className="px-2 py-3">
                        <div className="flex justify-center">
                          <div className={cn(
                            "w-6 h-6 rounded-full border flex items-center justify-center text-xs transition-colors",
                            isSelected 
                              ? "bg-blue-600 text-white border-blue-600 font-bold" 
                              : "border-slate-300 text-slate-400 bg-white"
                          )}>
                            {score}
                          </div>
                        </div>
                      </td>
                    );
                  })}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );

  return (
    <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden flex flex-col h-full max-h-[800px]">
      <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between sticky top-0 bg-white z-10 shadow-sm">
        <div className="flex items-center gap-4">
          <button 
            onClick={onBack}
            className="w-10 h-10 rounded-full hover:bg-slate-100 flex items-center justify-center text-slate-500 transition-colors"
          >
            <ArrowLeft size={20} />
          </button>
          <div>
            <h2 className="text-xl font-bold">問卷詳細紀錄</h2>
            <p className="text-sm text-slate-500">樣本 ID: {entry.id}</p>
          </div>
        </div>
        <div className="flex items-center gap-2 bg-blue-50 text-blue-700 px-4 py-2 rounded-xl text-sm font-bold">
          <CheckCircle2 size={16} /> 紀錄已儲存
        </div>
      </div>
      
      <div className="p-8 overflow-y-auto space-y-12 bg-slate-50/50">
        <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm">
          {renderBasicInfo()}
        </div>

        <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm">
          <div className="mb-4">
            <span className="text-slate-500 text-sm">社會支持量表題項 1 - 20。若您需要的話，以下各種的社會支持您是否能經常獲得？</span>
          </div>
          {renderScaleTable("第二部分：【社會支持量表】", "SS", 20, 5, ["從來沒有", "很少時候", "有些時候", "大部分時候", "全部時候"])}
        </div>

        <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm">
          {renderScaleTable("第三部分：【希望量表】", "H", 12, 4, ["非常不同意", "不同意", "同意", "非常同意"])}
        </div>

        <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm">
          {renderScaleTable("第四部分：【死亡態度量表】", "DA", 32, 5, ["非常不同意", "不同意", "普通", "部分同意", "非常同意"])}
        </div>
      </div>
    </div>
  );
}
