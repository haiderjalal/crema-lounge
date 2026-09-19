"use client";

import { motion } from "motion/react";
import { marqueeItems } from "@/data/site";

/**
 * Gold ribbon between the hero and the story.
 * Two identical tracks translate by exactly -50% of the pair, so the seam
 * never shows regardless of content width.
 */
export function Marquee() {
  const track = [...marqueeItems, ...marqueeItems];

  return (
    <section
      aria-hidden="true"
      className="relative overflow-hidden border-y border-cream-200/10 bg-forest-900 py-5"
    >
      <motion.div
        className="flex w-max gap-10 whitespace-nowrap"
        animate={{ x: ["0%", "-50%"] }}
        transition={{ duration: 38, repeat: Infinity, ease: "linear" }}
      >
        {track.map((item, index) => (
          <span key={`${item}-${index}`} className="flex items-center gap-10">
            <span className="font-display text-lg tracking-wide text-cream-200/85 italic sm:text-xl">
              {item}
            </span>
            <span className="text-sm text-gold-400/70">✦</span>
          </span>
        ))}
      </motion.div>
    </section>
  );
}
