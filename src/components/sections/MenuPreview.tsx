"use client";

import Link from "next/link";
import { motion } from "motion/react";
import {
  Reveal,
  RevealLines,
  revealChild,
  revealParent,
} from "@/components/shared/Reveal";
import { formatPrice, menu, signatureItemNames } from "@/data/menu";
import type { MenuItem } from "@/data/menu";

interface PreviewEntry {
  readonly item: MenuItem;
  readonly category: string;
}

/** Resolve the hand-picked signature names against the real menu once. */
function getSignatureEntries(): readonly PreviewEntry[] {
  const entries: PreviewEntry[] = [];

  for (const name of signatureItemNames) {
    for (const category of menu) {
      const item = category.items.find((candidate) => candidate.name === name);
      if (item) {
        entries.push({ item, category: category.name });
        break;
      }
    }
  }

  return entries;
}

export function MenuPreview() {
  const entries = getSignatureEntries();

  return (
    <section className="u-grain relative overflow-hidden bg-forest-900 py-28 md:py-40">
      <div className="u-container">
        <div className="flex flex-wrap items-end justify-between gap-8">
          <div>
            <Reveal>
              <p className="u-eyebrow">The Counter</p>
            </Reveal>
            <h2 className="mt-6 font-display text-[clamp(2rem,4.6vw,3.5rem)] leading-[1.06] font-light text-cream-100">
              <RevealLines text={"What people\norder twice."} delay={0.08} />
            </h2>
          </div>

          <Reveal delay={0.2}>
            <Link
              href="/menu"
              className="group inline-flex items-center gap-3 text-xs font-medium tracking-[0.18em] text-cream-200 uppercase"
            >
              <span className="border-b border-cream-200/30 pb-1 transition-colors group-hover:border-gold-400">
                Full Menu
              </span>
              <span className="text-gold-400 transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:translate-x-1.5">
                →
              </span>
            </Link>
          </Reveal>
        </div>

        <motion.ul
          variants={revealParent}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-10% 0px" }}
          className="mt-16 grid gap-x-16 gap-y-1 md:grid-cols-2"
        >
          {entries.map(({ item, category }) => (
            <motion.li
              key={item.name}
              variants={revealChild}
              className="group border-b border-cream-200/10 py-6"
            >
              <div className="flex items-baseline gap-4">
                <h3 className="font-display text-xl text-cream-100 transition-colors duration-400 group-hover:text-gold-300 sm:text-2xl">
                  {item.name}
                </h3>
                <span
                  className="h-px min-w-6 flex-1 self-end bg-cream-200/15"
                  aria-hidden="true"
                />
                <span className="shrink-0 font-display text-base text-gold-400 tabular-nums">
                  {formatPrice(item.price, item.from)}
                </span>
              </div>
              <p className="mt-2.5 max-w-md text-sm leading-relaxed text-cream-200/55">
                {item.description}
              </p>
              <p className="mt-2 text-[0.625rem] tracking-[0.2em] text-cream-200/35 uppercase">
                {category}
              </p>
            </motion.li>
          ))}
        </motion.ul>
      </div>
    </section>
  );
}
