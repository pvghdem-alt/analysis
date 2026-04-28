import React, { useMemo } from 'react';
import { 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  Line,
  ComposedChart,
  Scatter
} from 'recharts';
import { performLinearRegression, DataPoint } from '../lib/stats';
import { cn, getColumnTitle } from '../lib/utils';

interface AnalysisDashboardProps {
  data: any[];
  columns: string[];
}

export function AnalysisDashboard({ data, columns }: AnalysisDashboardProps) {
  const [xVar, setXVar] = React.useState(columns[0] || '');
  const [yVar, setYVar] = React.useState(columns[1] || '');

  const stats = useMemo(() => {
    if (!xVar || !yVar) return null;
    
    const points: DataPoint[] = data
      .map(d => ({
        x: parseFloat(d[xVar]),
        y: parseFloat(d[yVar])
      }))
      .filter(p => !isNaN(p.x) && !isNaN(p.y));

    if (points.length < 2) return null;

    const result = performLinearRegression(points);
    const minX = Math.min(...points.map(p => p.x));
    const maxX = Math.max(...points.map(p => p.x));
    
    const lineData = [
      { x: minX, lineY: result.line(minX) },
      { x: maxX, lineY: result.line(maxX) }
    ];

    return {
      points,
      lineData,
      m: result.m,
      b: result.b,
      r2: result.r2,
      count: points.length
    };
  }, [data, xVar, yVar]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
      {/* Stats Summary Panel */}
      <div className="lg:col-span-4 space-y-6">
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
          <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-4">Variable Mapping</div>
          <div className="space-y-4">
            <div className="bg-slate-50 p-4 rounded-2xl flex flex-col gap-1">
              <label className="text-[10px] font-bold text-slate-400 uppercase">Independent (X)</label>
              <select 
                value={xVar} 
                onChange={(e) => setXVar(e.target.value)}
                className="bg-transparent border-none p-0 font-bold text-sm focus:ring-0 cursor-pointer"
              >
                {columns.map(col => <option key={col} value={col}>{getColumnTitle(col)}</option>)}
              </select>
            </div>
            <div className="bg-slate-50 p-4 rounded-2xl flex flex-col gap-1">
              <label className="text-[10px] font-bold text-slate-400 uppercase">Dependent (Y)</label>
              <select 
                value={yVar} 
                onChange={(e) => setYVar(e.target.value)}
                className="bg-transparent border-none p-0 font-bold text-sm focus:ring-0 cursor-pointer text-blue-600"
              >
                {columns.map(col => <option key={col} value={col}>{getColumnTitle(col)}</option>)}
              </select>
            </div>
          </div>
        </div>

        {stats && (
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm divide-y divide-slate-100">
             <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-4">Regression Summary</div>
             <StatRow label="R-Squared" value={stats.r2.toFixed(4)} highlight />
             <StatRow label="Slope (m)" value={stats.m.toFixed(4)} />
             <StatRow label="Intercept (b)" value={stats.b.toFixed(4)} />
             <StatRow label="Sample Size" value={stats.count.toString()} valueColor="text-emerald-600" />
          </div>
        )}
      </div>

      {/* Chart Panel */}
      <div className="lg:col-span-8 bg-white p-8 rounded-3xl border border-slate-200 shadow-sm min-h-[500px] flex flex-col">
        <div className="flex items-center justify-between mb-8">
          <h3 className="font-bold text-slate-800">線性迴歸模型可視化</h3>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-slate-900 opacity-40" />
              <span className="text-[10px] font-bold text-slate-400 uppercase">樣本點</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-6 h-0.5 bg-blue-600" />
              <span className="text-[10px] font-bold text-slate-400 uppercase">趨勢線</span>
            </div>
          </div>
        </div>
        
        <div className="flex-1 min-h-[400px]">
          {stats ? (
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={stats.points} margin={{ top: 10, right: 10, bottom: 20, left: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis 
                  type="number" 
                  dataKey="x" 
                  name={getColumnTitle(xVar)} 
                  stroke="#94a3b8"
                  fontSize={11}
                  tickLine={false}
                  axisLine={false}
                  dy={10}
                />
                <YAxis 
                  type="number" 
                  dataKey="y" 
                  name={getColumnTitle(yVar)} 
                  stroke="#94a3b8"
                  fontSize={11}
                  tickLine={false}
                  axisLine={false}
                  dx={-10}
                />
                <Tooltip 
                  contentStyle={{ 
                    borderRadius: '16px', 
                    border: 'none', 
                    boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)',
                    fontSize: '12px',
                    fontWeight: 'bold'
                  }} 
                />
                <Scatter name="Data Points" data={stats.points} fill="#0f172a" fillOpacity={0.2} radius={3} />
                <Line 
                  data={stats.lineData} 
                  type="monotone" 
                  dataKey="lineY" 
                  stroke="#2563eb" 
                  strokeWidth={3} 
                  dot={false}
                  activeDot={false}
                />
              </ComposedChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-full flex items-center justify-center text-slate-400 font-medium italic italic">
              請選擇有效變數來生成統計圖表
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function StatRow({ label, value, highlight, valueColor }: { label: string, value: string, highlight?: boolean, valueColor?: string }) {
  return (
    <div className="flex items-center justify-between py-4">
      <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">{label}</span>
      <span className={cn(
        "font-mono text-lg font-bold",
        highlight ? "text-blue-600" : (valueColor || "text-slate-800")
      )}>
        {value}
      </span>
    </div>
  );
}
