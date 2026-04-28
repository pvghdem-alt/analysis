import * as ss from 'simple-statistics';

export interface DataPoint {
  x: number;
  y: number;
}

export function extractDataPoints(data: any[], xVar: string, yVar: string) {
  const points: DataPoint[] = [];
  const xEncoder: Record<string, number> = {};
  const yEncoder: Record<string, number> = {};
  let xCount = 0;
  let yCount = 0;

  for (const d of data) {
    let xl = d[xVar];
    let yl = d[yVar];
    
    if (xl === undefined || xl === null || xl === '') continue;
    if (yl === undefined || yl === null || yl === '') continue;

    let x = parseFloat(xl);
    if (isNaN(x)) {
      const sx = String(xl);
      if (xEncoder[sx] === undefined) xEncoder[sx] = xCount++;
      x = xEncoder[sx];
    }

    let y = parseFloat(yl);
    if (isNaN(y)) {
      const sy = String(yl);
      if (yEncoder[sy] === undefined) yEncoder[sy] = yCount++;
      y = yEncoder[sy];
    }

    points.push({ x, y, xLabel: xl, yLabel: yl } as DataPoint & { xLabel: any, yLabel: any });
  }

  return { points, xEncoder, yEncoder };
}

export function performLinearRegression(data: DataPoint[]) {
  const pairs = data.map(d => [d.x, d.y]);
  const regression = ss.linearRegression(pairs);
  const line = ss.linearRegressionLine(regression);
  
  const xValues = data.map(d => d.x);
  const yValues = data.map(d => d.y);
  const r2 = ss.sampleCorrelation(xValues, yValues) ** 2;

  return {
    m: regression.m,
    b: regression.b,
    r2: r2,
    line
  };
}

/**
 * 自動加總量表分數
 * 識別規則: 
 * - SS_1 ~ SS_20 -> 社會支持總分
 * - H_1 ~ H_12 -> 希望總分
 * - DA_1 ~ DA_32 -> 死亡態度總分
 */
export function processSurveyAggregates(row: any) {
  const categories = {
    Social_Support_Total: { prefix: 'SS_', count: 20 },
    Hope_Total: { prefix: 'H_', count: 12 },
    Death_Attitude_Total: { prefix: 'DA_', count: 32 }
  };

  const aggregates: any = {};

  for (const [key, config] of Object.entries(categories)) {
    let sum = 0;
    let validCount = 0;
    for (let i = 1; i <= config.count; i++) {
        const val = parseFloat(row[`${config.prefix}${i}`]);
        if (!isNaN(val)) {
            sum += val;
            validCount++;
        }
    }
    if (validCount > 0) aggregates[key] = sum;
  }

  return { ...row, ...aggregates };
}
