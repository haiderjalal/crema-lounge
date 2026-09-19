"use client";

import { MotionConfig } from "motion/react";
import type { ReactNode } from "react";

/**
 * `reducedMotion="user"` makes Motion drop transform and layout animations
 * for visitors who ask for reduced motion, while still allowing opacity —
 * so content fades in rather than flying, and nothing is left invisible.
 * This covers every `motion` element on the site in one place.
 */
export function MotionProvider({ children }: { children: ReactNode }) {
  return <MotionConfig reducedMotion="user">{children}</MotionConfig>;
}
