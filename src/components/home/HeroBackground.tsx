"use client";

import { motion, useReducedMotion } from "framer-motion";

const orbs = [
  {
    bg: "radial-gradient(circle, rgba(59,130,246,0.15) 0%, transparent 70%)",
    size: 600,
    top: "-20%",
    left: "-10%",
    x: [0, 40, 0],
    y: [0, 30, 0],
    dur: 12,
  },
  {
    bg: "radial-gradient(circle, rgba(16,185,129,0.12) 0%, transparent 70%)",
    size: 500,
    bottom: "-10%",
    right: "-5%",
    x: [0, -30, 0],
    y: [0, -20, 0],
    dur: 16,
  },
  {
    bg: "radial-gradient(circle, rgba(139,92,246,0.08) 0%, transparent 70%)",
    size: 400,
    top: "30%",
    right: "10%",
    x: [0, 20, 0],
    y: [0, 40, 0],
    dur: 20,
  },
];

export function HeroBackground() {
  const prefersReduced = useReducedMotion();

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {orbs.map((orb, i) => (
        <motion.div
          key={i}
          className="absolute rounded-full"
          style={{
            width: orb.size,
            height: orb.size,
            background: orb.bg,
            top: orb.top,
            left: orb.left,
            bottom: orb.bottom,
            right: orb.right,
          }}
          animate={
            prefersReduced
              ? {}
              : {
                  x: orb.x,
                  y: orb.y,
                }
          }
          transition={{
            duration: orb.dur,
            repeat: Infinity,
            repeatType: "reverse",
            ease: "easeInOut",
          }}
        />
      ))}
      {/* Dot grid overlay */}
      <div
        className="absolute inset-0"
        style={{
          backgroundImage:
            "radial-gradient(circle, rgba(148,163,184,0.06) 1px, transparent 1px)",
          backgroundSize: "24px 24px",
        }}
      />
    </div>
  );
}
