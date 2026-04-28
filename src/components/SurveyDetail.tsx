import React, { useState, useEffect } from 'react';
import { ArrowLeft, CheckCircle2, Edit2, Save, X } from 'lucide-react';
import { cn } from '../lib/utils';

export function SurveyDetail({ entry, onBack, onUpdate }: { entry: any, onBack: () => void, onUpdate?: (data: any) => void }) {
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState<any>({});

  useEffect(() => {
    setEditData(entry.data || {});
  }, [entry]);

  const handleSave = () => {
    onUpdate?.(editData);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditData(entry.data || {});
    setIsEditing(false);
  };

  const updateField = (key: string, val: any) => {
    setEditData(prev => ({ ...prev, [key]: val }));
  };

  const formatVal = (val: any) => {
    if (val === undefined || val === null) return '-';
    if (Array.isArray(val)) return val.join(', ');
    if (typeof val === 'object') return JSON.stringify(val);
    return String(val);
  };

  const renderField = (label: string, key: string, colSpan: boolean = false) => (
    <div className={cn("space-y-1", colSpan && "col-span-2")}>
      <span className="text-slate-500 block">{label}</span>
      {isEditing ? (
        <input 
          type="text" 
          value={formatVal(editData[key]) === '-' ? '' : formatVal(editData[key])} 
          onChange={(e) => updateField(key, e.target.value)}
          className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-lg text-sm focus:ring-2 disabled:bg-slate-50 focus:ring-blue-500 outline-none"
        />
      ) : (
        <span className="font-semibold block">{formatVal(editData[key])}</span>
      )}
    </div>
  );

  const renderBasicInfo = () => (
    <div className="space-y-6">
      <h3 className="font-bold text-lg border-b pb-2">第一部分：【基本資料】</h3>
      
      <div className="grid grid-cols-2 gap-y-4 gap-x-8 text-sm">
        {renderField("1. 性別：", "Gender")}
        {renderField("2. 年齡(民國年)：", "Age_Y")}
        {renderField("2. 年齡(月)：", "Age_M")}
        {renderField("3. 教育程度：", "Education")}
        {renderField("4. 婚姻狀況：", "Marital")}
        {renderField("5. 子女人數：", "Children")}
        {renderField("6. 家人是否定期探訪：", "Family_Visit")}
        {renderField("7. 簽署預立醫療決定：", "Advance_Directive")}
        {renderField("8. 經濟來源：", "Income_Source")}
        {renderField("9. 宗教信仰：", "Religion")}
        {renderField("10. 使用輔具狀況：", "Assistive_Device")}
        {renderField("11. 目前有無罹患慢性病：", "Chronic_Disease", true)}
        {renderField("12. ADL：", "ADL")}
        {renderField("13. 自覺健康狀況：", "Health_Status")}
        {renderField("14. 對未來生活是否保有希望與期待：", "Hope_Future")}
        {renderField("15. 平時主要提供您支持的人為：", "Main_Supporter")}
        {renderField("16. 入住機構時間(民國年)：", "Move_In_Y")}
        {renderField("16. 入住機構時間(月)：", "Move_In_M")}
      </div>
    </div>
  );

  const renderScaleTable = (title: string, prefix: string, count: number, maxScore: number, headers: string[]) => (
    <div className="space-y-6">
      <h3 className="font-bold text-lg border-b pb-2">{title}</h3>
      <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white">
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
              const val = editData[qId];
              return (
                <tr key={qId} className="border-b border-slate-100 hover:bg-slate-50">
                  <td className="px-4 py-3 text-left text-slate-400">{idx + 1}</td>
                  {Array.from({ length: maxScore }).map((_, optIdx) => {
                    const score = optIdx + 1;
                    const isSelected = val === score || String(val) === String(score);
                    return (
                      <td key={score} className="px-2 py-3">
                        <div className="flex justify-center">
                          <button 
                            disabled={!isEditing}
                            onClick={() => isEditing && updateField(qId, score)}
                            className={cn(
                              "w-6 h-6 rounded-full border flex items-center justify-center text-xs transition-colors",
                              isSelected 
                                ? "bg-blue-600 text-white border-blue-600 font-bold" 
                                : "border-slate-300 text-slate-400 bg-white hover:border-blue-400",
                              !isEditing && !isSelected && "opacity-50 cursor-not-allowed hidden md:flex",
                              !isEditing && isSelected && "opacity-100",
                              isEditing && "cursor-pointer hover:bg-blue-50"
                            )}>
                            {score}
                          </button>
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
        <div className="flex items-center gap-2">
          {isEditing ? (
            <>
              <button onClick={handleCancel} className="flex items-center gap-2 text-slate-500 hover:bg-slate-100 px-4 py-2 rounded-xl text-sm font-bold transition-colors">
                <X size={16} /> 取消
              </button>
              <button onClick={handleSave} className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl text-sm font-bold transition-colors shadow-sm">
                <Save size={16} /> 儲存
              </button>
            </>
          ) : (
            <button onClick={() => setIsEditing(true)} className="flex items-center gap-2 bg-slate-100 hover:bg-slate-200 text-slate-700 px-4 py-2 rounded-xl text-sm font-bold transition-colors">
              <Edit2 size={16} /> 編輯
            </button>
          )}
        </div>
      </div>
      
      <div className="p-8 overflow-y-auto space-y-12 bg-slate-50/50">
        <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm">
          {renderBasicInfo()}
        </div>

        <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm">
          <div className="mb-4">
            <span className="text-slate-500 text-sm">社會支持量表題項 1 - 20。</span>
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
