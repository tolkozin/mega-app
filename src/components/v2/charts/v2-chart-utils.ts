/* SVG Geometry Helpers for v2 Charts */

/** Catmull-Rom → cubic bezier smooth path */
export function smooth(pts: [number,number][], tension = 0.18): string {
  if (pts.length < 2) return '';
  let d = `M${pts[0][0].toFixed(1)},${pts[0][1].toFixed(1)}`;
  for (let i = 0; i < pts.length - 1; i++) {
    const p0 = pts[Math.max(i-1, 0)];
    const p1 = pts[i];
    const p2 = pts[i+1];
    const p3 = pts[Math.min(i+2, pts.length-1)];
    const cp1x = p1[0] + (p2[0] - p0[0]) * tension;
    const cp1y = p1[1] + (p2[1] - p0[1]) * tension;
    const cp2x = p2[0] - (p3[0] - p1[0]) * tension;
    const cp2y = p2[1] - (p3[1] - p1[1]) * tension;
    d += ` C${cp1x.toFixed(1)},${cp1y.toFixed(1)} ${cp2x.toFixed(1)},${cp2y.toFixed(1)} ${p2[0].toFixed(1)},${p2[1].toFixed(1)}`;
  }
  return d;
}

/** Close smooth curve into filled area */
export function areaPath(pts: [number,number][], baseY: number): string {
  const line = smooth(pts);
  const first = pts[0], last = pts[pts.length-1];
  return `${line} L${last[0].toFixed(1)},${baseY} L${first[0].toFixed(1)},${baseY} Z`;
}

/** Rounded-top rectangle */
export function roundedTopBar(x: number, y: number, w: number, h: number, r = 4): string {
  const safe = Math.min(r, Math.abs(h)/2, w/2);
  if (h === 0) return '';
  return `M${x},${y+Math.abs(h)} V${y+safe} Q${x},${y} ${x+safe},${y} H${x+w-safe} Q${x+w},${y} ${x+w},${y+safe} V${y+Math.abs(h)} Z`;
}

/** Map value to y coordinate */
export function makeYMapper(yMin: number, yMax: number, baseY: number, plotH: number) {
  const range = yMax - yMin || 1;
  return (v: number) => baseY - ((v - yMin) / range) * plotH;
}

/** Pad range for nice axis */
export function padRange(vals: number[], padPct = 0.12): [number, number] {
  const min = Math.min(...vals);
  const max = Math.max(...vals);
  const pad = (max - min) * padPct || Math.abs(max) * padPct || 10;
  return [Math.min(min, 0) - (min < 0 ? pad * 0.5 : 0), max + pad];
}

/** Format axis tick */
export function fmtTick(v: number, unit: '$'|'%'|''= '', dp = 0): string {
  const abs = Math.abs(v);
  const prefix = v < 0 ? (unit === '$' ? '−$' : '−') : (unit === '$' ? '$' : '');
  const suffix = unit === '%' ? '%' : '';
  if (abs >= 1_000_000) return `${prefix}${(abs/1_000_000).toFixed(1)}M${suffix}`;
  if (abs >= 1_000) return `${prefix}${(abs/1_000).toFixed(dp)}k${suffix}`;
  return `${prefix}${abs.toFixed(dp)}${suffix}`;
}

export function fmtK(v: number, decimals = 0): string {
  if (Math.abs(v) >= 1e6) return `${v < 0 ? '−' : ''}$${(Math.abs(v)/1e6).toFixed(1)}M`;
  if (Math.abs(v) >= 1e3) return `${v < 0 ? '−' : ''}$${(Math.abs(v)/1e3).toFixed(decimals)}k`;
  return `${v < 0 ? '−$' : '$'}${Math.abs(v).toFixed(0)}`;
}

export function fmtNum(v: number): string {
  return v.toLocaleString();
}

export function fmtPct(v: number, dp = 1): string {
  return `${v >= 0 ? '' : '−'}${Math.abs(v).toFixed(dp)}%`;
}

export const CARD_SHADOW = '0 1px 3px rgba(0,0,0,0.04), 0 6px 20px rgba(0,0,0,0.06)';

export const PALETTE = {
  blue: '#2163E7',
  dkBlue: '#1650b0',
  ltBlue: '#7BA3F0',
  paleBlue: '#BDD0F8',
  green: '#10B981',
  red: '#EF4444',
  amber: '#F59E0B',
  purple: '#7C3AED',
  teal: '#0891B2',
  gray: '#6b7280',
  muted: '#9ca3af',
  grid: '#f0f1f7',
  axis: '#c4c9d8',
  text: '#1a1a2e',
  bg: '#f8f9fc',
};

export const FONT = 'Lato, sans-serif';
