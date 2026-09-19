"use client";

import { motion, type Variants } from "motion/react";
import type { ReactNode } from "react";

const EASE = [0.16, 1, 0.3, 1] as const;

export interface RevealProps {
  readonly children: ReactNode;
  /** Seconds of delay before this element begins. */
  readonly delay?: number;
  readonly className?: string;
  /** Distance in px the element travels up into place. */
  readonly distance?: number;
  readonly as?: "div" | "section" | "li" | "span";
}

/**
 * The project's single scroll-reveal primitive. Every fade-up on the site
 * routes through this so timing and easing stay identical everywhere.
 */
export function Reveal({
  children,
  delay = 0,
  className,
  distance = 28,
  as = "div",
}: RevealProps) {
  const Component = motion[as];

  return (
    <Component
      className={className}
      initial={{ opacity: 0, y: distance }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-12% 0px -12% 0px" }}
      transition={{ duration: 0.9, delay, ease: EASE }}
    >
      {children}
    </Component>
  );
}

/** Stagger container — pair with `revealChild` on each item. */
export const revealParent: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.08, delayChildren: 0.05 } },
};

export const revealChild: Variants = {
  hidden: { opacity: 0, y: 24 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.8, ease: EASE },
  },
};

export interface RevealTextProps {
  readonly text: string;
  readonly className?: string;
  readonly delay?: number;
}

/**
 * Masked line-by-line rise, used for the display headlines.
 * Splits on newlines only — words stay intact so text remains selectable
 * and screen readers get one coherent string per line.
 */
export function RevealLines({ text, className, delay = 0 }: RevealTextProps) {
  const lines = text.split("\n");

  return (
    <span className={className}>
      {lines.map((line, index) => (
        <span key={line} className="block overflow-hidden pb-[0.12em]">
          <motion.span
            className="block"
            initial={{ y: "110%" }}
            whileInView={{ y: "0%" }}
            viewport={{ once: true, margin: "-10% 0px" }}
            transition={{
              duration: 1,
              delay: delay + index * 0.09,
              ease: EASE,
            }}
          >
            {line}
          </motion.span>
        </span>
      ))}
    </span>
  );
}
