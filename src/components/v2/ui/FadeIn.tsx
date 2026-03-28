"use client";

/**
 * v2 FadeIn — Animated wrapper for cards, charts, and sections.
 *
 * Usage:
 *   <FadeIn delay={0.1}>
 *     <PlotlyChart ... />
 *   </FadeIn>
 *
 * Supports staggered children via `delay` prop.
 */

import { motion, type Variants } from "framer-motion";

interface FadeInProps {
  children: React.ReactNode;
  /** Delay before animation starts (seconds) */
  delay?: number;
  /** Animation direction */
  direction?: "up" | "down" | "left" | "right" | "none";
  /** Distance of initial offset in px */
  distance?: number;
  /** Duration of animation in seconds */
  duration?: number;
  /** CSS class */
  className?: string;
}

const getVariants = (direction: string, distance: number): Variants => {
  const offsets: Record<string, { x?: number; y?: number }> = {
    up: { y: distance },
    down: { y: -distance },
    left: { x: distance },
    right: { x: -distance },
    none: {},
  };
  const offset = offsets[direction] ?? {};

  return {
    hidden: { opacity: 0, ...offset },
    visible: { opacity: 1, x: 0, y: 0 },
  };
};

export function FadeIn({
  children,
  delay = 0,
  direction = "up",
  distance = 16,
  duration = 0.4,
  className,
}: FadeInProps) {
  const variants = getVariants(direction, distance);

  return (
    <motion.div
      variants={variants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-40px" }}
      transition={{
        duration,
        delay,
        ease: [0.25, 0.1, 0.25, 1],
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

/**
 * Stagger container — wrap multiple FadeIn children for sequential animation.
 *
 * Usage:
 *   <StaggerGroup>
 *     <FadeIn><Card /></FadeIn>
 *     <FadeIn><Card /></FadeIn>
 *   </StaggerGroup>
 */
export function StaggerGroup({
  children,
  stagger = 0.08,
  className,
}: {
  children: React.ReactNode;
  stagger?: number;
  className?: string;
}) {
  return (
    <motion.div
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-40px" }}
      transition={{ staggerChildren: stagger }}
      className={className}
    >
      {children}
    </motion.div>
  );
}
