"use client";

import { useMemo, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { formatPrice, menu, menuGroups } from "@/data/menu";
import type { MenuGroup } from "@/data/menu";

type Filter = MenuGroup | "All";

const filters: readonly Filter[] = ["All", ...menuGroups] as const;

export function MenuBoard() {
  const [active, setActive] = useState<Filter>("All");

  const categories = useMemo(
    () =>
      active === "All"
        ? menu
        : menu.filter((category) => category.group === active),
    [active],
  );

  return (
    <>
      {/* Filter rail — sticks under the fixed navbar. */}
      <div className="sticky top-[68px] z-30 border-y border-cream-200/10 bg-forest-950/85 backdrop-blur-xl">
        <div className="u-container">
          <div
            role="tablist"
            aria-label="Filter menu by section"
            className="flex gap-2 overflow-x-auto py-4"
          >
            {filters.map((filter) => {
              const selected = active === filter;
              return (
                <button
                  key={filter}
                  type="button"
                  role="tab"
                  aria-selected={selected}
                  onClick={() => setActive(filter)}
                  className={`relative shrink-0 rounded-full px-5 py-2.5 text-xs font-medium tracking-[0.14em] uppercase transition-colors duration-300 ${
                    selected
                      ? "text-forest-950"
                      : "text-cream-200/60 hover:text-cream-100"
                  }`}
                >
                  {selected && (
                    <motion.span
                      layoutId="menu-filter-pill"
                      className="absolute inset-0 rounded-full bg-gold-400"
                      transition={{
                        type: "spring",
                        stiffness: 420,
                        damping: 36,
                      }}
                    />
                  )}
                  <span className="relative z-10">{filter}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      <div className="u-container py-20 md:py-28">
        <AnimatePresence mode="wait">
          <motion.div
            key={active}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
            className="space-y-24"
          >
            {categories.map((category) => (
              <section
                key={category.id}
                id={category.id}
                className="scroll-mt-40"
              >
                <div className="flex items-baseline gap-6">
                  <h2 className="font-display text-[clamp(1.75rem,3.6vw,2.75rem)] font-light text-cream-100">
                    {category.name}
                  </h2>
                  <span className="u-rule flex-1" aria-hidden="true" />
                  <span className="text-[0.625rem] tracking-[0.2em] text-cream-200/35 uppercase">
                    {category.group}
                  </span>
                </div>

                <ul className="mt-9 grid gap-x-16 md:grid-cols-2">
                  {category.items.map((item, index) => (
                    <motion.li
                      key={item.name}
                      initial={{ opacity: 0, y: 14 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true, margin: "-4% 0px" }}
                      transition={{
                        duration: 0.6,
                        delay: Math.min(index, 6) * 0.04,
                        ease: [0.16, 1, 0.3, 1],
                      }}
                      className="group border-b border-cream-200/10 py-5"
                    >
                      <div className="flex items-baseline gap-4">
                        <h3 className="text-base font-medium text-cream-100 transition-colors duration-300 group-hover:text-gold-300">
                          {item.name}
                        </h3>
                        <span
                          className="h-px min-w-5 flex-1 self-end bg-cream-200/12"
                          aria-hidden="true"
                        />
                        <span className="shrink-0 text-sm text-gold-400 tabular-nums">
                          {formatPrice(item.price, item.from)}
                        </span>
                      </div>
                      <p className="mt-2 max-w-md text-sm leading-relaxed text-cream-200/50">
                        {item.description}
                      </p>
                    </motion.li>
                  ))}
                </ul>
              </section>
            ))}
          </motion.div>
        </AnimatePresence>
      </div>
    </>
  );
}
