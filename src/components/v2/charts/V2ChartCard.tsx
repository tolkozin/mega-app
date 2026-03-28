"use client";

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CARD_SHADOW, FONT, PALETTE } from './v2-chart-utils';

/* Legend item */
export interface LegendItem {
  color: string;
  label: string;
  dash?: boolean;
  dot?: boolean;
}

function LegendDot({ item }: { item: LegendItem }) {
  return (
    <div className="flex items-center gap-1.5">
      {item.dash || item.dot ? (
        <svg width={20} height={4} viewBox="0 0 20 4">
          <line x1="0" y1="2" x2="20" y2="2"
            stroke={item.color} strokeWidth="2"
            strokeDasharray={item.dot ? '2 3' : item.dash ? '5 3' : '0'}
            strokeLinecap="round" />
        </svg>
      ) : (
        <span className="inline-block w-2.5 h-2.5 rounded-sm flex-shrink-0" style={{ background: item.color }} />
      )}
      <span className="text-[10.5px] text-[#9ca3af] truncate max-w-[100px]" style={{ fontFamily: FONT }}>{item.label}</span>
    </div>
  );
}

/* Floating Tooltip */
export function FloatingTooltip({ x, y, children }: { x: number; y: number; children: React.ReactNode }) {
  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 5, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.14 }}
        style={{
          position: 'fixed', left: x, top: y - 12,
          transform: 'translate(-50%, -100%)',
          background: 'linear-gradient(155deg, #0f2951, #0a1f3d)',
          borderRadius: 10, padding: '9px 13px',
          border: '1px solid rgba(123,163,240,0.2)',
          boxShadow: '0 8px 24px rgba(0,0,0,0.25)',
          pointerEvents: 'none', zIndex: 9999, fontFamily: FONT, minWidth: 120,
        }}
      >
        {children}
        <div style={{
          position: 'absolute', bottom: -5, left: '50%', transform: 'translateX(-50%)',
          borderLeft: '5px solid transparent', borderRight: '5px solid transparent',
          borderTop: '6px solid #0a1f3d',
        }} />
      </motion.div>
    </AnimatePresence>
  );
}

export function TipLabel({ children }: { children: React.ReactNode }) {
  return <div className="text-[10px] font-bold text-[#7BA3F0] mb-1.5" style={{ fontFamily: FONT }}>{children}</div>;
}

export function TipRow({ label, value, color = '#fff' }: { label: string; value: string; color?: string }) {
  return (
    <div className="flex justify-between gap-3.5 mb-0.5">
      <span className="text-[10px] text-[#7b8eb5]">{label}</span>
      <span className="text-[10.5px] font-bold tabular-nums" style={{ color }}>{value}</span>
    </div>
  );
}

/* Chart Card Wrapper */
export interface V2ChartCardProps {
  title: string;
  subtitle?: string;
  legend?: LegendItem[];
  badge?: string;
  badgeColor?: string;
  children: React.ReactNode;
  className?: string;
}

export function V2ChartCard({ title, subtitle, legend, badge, badgeColor = '#2163E7', children, className }: V2ChartCardProps) {
  return (
    <div
      className={`bg-white overflow-hidden ${className ?? ''}`}
      style={{ borderRadius: 16, boxShadow: CARD_SHADOW, fontFamily: FONT }}
    >
      {/* Header */}
      <div className="px-5 pt-4 pb-0 flex items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[13px] font-extrabold text-[#1a1a2e]">{title}</span>
            {badge && (
              <span
                className="rounded-full px-2 py-0.5 text-[9.5px] font-extrabold"
                style={{ background: badgeColor + '22', color: badgeColor }}
              >
                {badge}
              </span>
            )}
          </div>
          {subtitle && (
            <div className="text-[11px] text-[#9ca3af] mt-0.5">{subtitle}</div>
          )}
        </div>
        {legend && legend.length > 0 && (
          <div className="flex gap-x-3.5 gap-y-1 flex-wrap justify-end shrink min-w-0 max-w-[55%]">
            {legend.map(l => <LegendDot key={l.label} item={l} />)}
          </div>
        )}
      </div>
      {/* Content */}
      <div className="px-5 pt-3 pb-4">
        {children}
      </div>
    </div>
  );
}
