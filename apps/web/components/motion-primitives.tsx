"use client";

import { motion, type HTMLMotionProps } from "motion/react";
import { type CSSProperties, type ReactNode } from "react";
import { useReducedMotion } from "@/lib/use-reduced-motion";

const EASE = [0.22, 1, 0.36, 1] as const;

type RevealProps = Omit<
  HTMLMotionProps<"div">,
  "initial" | "animate" | "whileInView" | "viewport" | "transition" | "style"
> & {
  children: ReactNode;
  /** index-based stagger, multiplied by 80ms */
  index?: number;
  /** override base delay in ms */
  delay?: number;
  /** override duration in ms */
  duration?: number;
  style?: CSSProperties;
};

/**
 * Fade + slight rise on scroll-into-view. Fires once. Respects reduced motion
 * by skipping straight to the final state.
 */
export function Reveal({
  children,
  index = 0,
  delay,
  duration = 400,
  className,
  style,
  ...rest
}: RevealProps) {
  const reduced = useReducedMotion();
  const effectiveDelay = (delay ?? index * 80) / 1000;
  const effectiveDuration = duration / 1000;

  if (reduced) {
    return (
      <div className={className} style={style}>
        {children}
      </div>
    );
  }

  return (
    <motion.div
      className={className}
      style={style}
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: effectiveDuration, ease: EASE, delay: effectiveDelay }}
      {...rest}
    >
      {children}
    </motion.div>
  );
}

type HoverLiftProps = Omit<HTMLMotionProps<"div">, "whileHover" | "transition" | "style"> & {
  children: ReactNode;
  style?: CSSProperties;
};

/**
 * Subtle hover scale + lift, 200ms. No-op under reduced-motion.
 */
export function HoverLift({ children, className, style, ...rest }: HoverLiftProps) {
  const reduced = useReducedMotion();

  if (reduced) {
    return (
      <div className={className} style={style}>
        {children}
      </div>
    );
  }

  return (
    <motion.div
      className={className}
      style={style}
      whileHover={{ scale: 1.02, y: -2 }}
      transition={{ duration: 0.2, ease: EASE }}
      {...rest}
    >
      {children}
    </motion.div>
  );
}
