"use client";

import { motion, useReducedMotion } from "framer-motion";

/* TODO: replace placeholder data with real reviews */

const avatarGradients = [
  "linear-gradient(135deg, #3B82F6, #8B5CF6)",
  "linear-gradient(135deg, #10B981, #3B82F6)",
  "linear-gradient(135deg, #F59E0B, #EF4444)",
];

export function RatingWidget() {
  const prefersReduced = useReducedMotion();

  return (
    <motion.div
      initial={prefersReduced ? false : { opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: 0.8, duration: 0.5 }}
      className="inline-flex flex-col gap-3 rounded-2xl border border-[#3B82F6]/30 px-5 py-4 md:px-6 md:py-5"
      style={{
        background: "rgba(15,23,42,0.95)",
        backdropFilter: "blur(20px)",
        boxShadow: "0 8px 32px rgba(59,130,246,0.15)",
      }}
    >
      {/* Stars + rating */}
      <div className="flex items-center gap-3">
        <div className="flex gap-0.5">
          {[1, 2, 3, 4, 5].map((s) => (
            <svg
              key={s}
              className="w-4 h-4"
              viewBox="0 0 20 20"
              fill={s <= 4 ? "#F59E0B" : "none"}
              stroke="#F59E0B"
              strokeWidth={1.5}
            >
              <path d="M10 2l2.09 5.26L18 8.27l-4 3.87.94 5.88L10 15.77l-4.94 2.25.94-5.88-4-3.87 5.91-1.01L10 2z" />
            </svg>
          ))}
        </div>
        {/* TODO: update with real data */}
        <span className="text-lg font-bold text-[#F8FAFC]">4.8</span>
        <span className="text-xs text-[#94A3B8]">/ 5.0</span>
      </div>

      {/* TODO: update with real data */}
      <span className="text-xs text-[#94A3B8]">Based on 127 founder reviews</span>

      <div className="h-px w-full" style={{ background: "rgba(51,65,85,0.5)" }} />

      {/* Avatar stack + quote */}
      <div className="flex items-center gap-2">
        <div className="flex -space-x-2">
          {avatarGradients.map((g, i) => (
            <div
              key={i}
              className="w-7 h-7 rounded-full border-2 border-[#0F172A]"
              style={{ background: g }}
            />
          ))}
        </div>
        {/* TODO: update with real data */}
        <span className="text-xs text-[#64748B]">+124</span>
      </div>

      {/* TODO: replace with real testimonials */}
      <p className="text-xs italic text-[#CBD5E1] line-clamp-2 max-w-[260px]">
        &ldquo;Revenue Map saved me 3 weeks of spreadsheet work and helped me close my pre-seed round.&rdquo;
      </p>
      <span className="text-[11px] text-[#64748B]">— Alex M., SaaS Founder</span>
    </motion.div>
  );
}
