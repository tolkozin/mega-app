"use client";

import { motion, useReducedMotion } from "framer-motion";

const orbs = [
  {
    bg: "radial-gradient(circle, rgba(33,99,231,0.06) 0%, transparent 70%)",
    size: 600,
    top: "-20%",
    left: "-10%",
    x: [0, 40, 0],
    y: [0, 30, 0],
    dur: 12,
  },
  {
    bg: "radial-gradient(circle, rgba(33,99,231,0.04) 0%, transparent 70%)",
    size: 500,
    bottom: "-10%",
    right: "-5%",
    x: [0, -30, 0],
    y: [0, -20, 0],
    dur: 16,
  },
  {
    bg: "radial-gradient(circle, rgba(90,62,227,0.04) 0%, transparent 70%)",
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
    </div>
  );
}
