"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { AnimatePresence, motion, useScroll, useMotionValueEvent } from "motion/react";
import { Logo } from "@/components/shared/Logo";
import { site } from "@/data/site";

interface NavLink {
  readonly href: string;
  readonly label: string;
}

const links: readonly NavLink[] = [
  { href: "/#story", label: "The Room" },
  { href: "/menu", label: "Menu" },
  { href: "/#events", label: "Events" },
  { href: "/#visit", label: "Visit" },
] as const;

export function Navbar() {
  const [condensed, setCondensed] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const { scrollY } = useScroll();

  useMotionValueEvent(scrollY, "change", (latest) => {
    setCondensed(latest > 40);
  });

  // Lock the page behind the mobile sheet.
  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [menuOpen]);

  return (
    <>
      <motion.header
        initial={{ y: -80, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.8, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
        className="fixed inset-x-0 top-0 z-50"
      >
        <div
          className={`transition-all duration-500 ${
            condensed
              ? "border-b border-cream-200/10 bg-forest-950/80 backdrop-blur-xl"
              : "border-b border-transparent"
          }`}
        >
          <nav
            aria-label="Primary"
            className="u-container flex items-center justify-between py-4"
          >
            <Link
              href="/"
              className="flex items-center gap-3"
              aria-label={`${site.name} — home`}
            >
              <Logo size={condensed ? 36 : 42} priority />
              <span className="hidden text-sm font-medium tracking-[0.3em] text-cream-200 uppercase sm:block">
                Crema
              </span>
            </Link>

            <ul className="hidden items-center gap-9 md:flex">
              {links.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="group relative text-sm text-cream-200/75 transition-colors hover:text-cream-100"
                  >
                    {link.label}
                    <span className="absolute -bottom-1.5 left-0 h-px w-0 bg-gold-400 transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:w-full" />
                  </Link>
                </li>
              ))}
            </ul>

            <div className="flex items-center gap-3">
              <a
                href={site.orderUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="hidden rounded-full border border-gold-400/40 px-5 py-2.5 text-xs font-medium tracking-[0.15em] text-gold-300 uppercase transition-all duration-400 hover:border-gold-400 hover:bg-gold-400 hover:text-forest-950 sm:block"
              >
                Order
              </a>

              <button
                type="button"
                onClick={() => setMenuOpen((open) => !open)}
                aria-expanded={menuOpen}
                aria-controls="mobile-nav"
                aria-label={menuOpen ? "Close menu" : "Open menu"}
                className="flex h-10 w-10 flex-col items-center justify-center gap-[5px] md:hidden"
              >
                <span
                  className={`h-px w-5 bg-cream-200 transition-transform duration-400 ${
                    menuOpen ? "translate-y-[3px] rotate-45" : ""
                  }`}
                />
                <span
                  className={`h-px w-5 bg-cream-200 transition-transform duration-400 ${
                    menuOpen ? "-translate-y-[3px] -rotate-45" : ""
                  }`}
                />
              </button>
            </div>
          </nav>
        </div>
      </motion.header>

      <AnimatePresence>
        {menuOpen && (
          <motion.div
            id="mobile-nav"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4 }}
            className="fixed inset-0 z-40 bg-forest-950/97 backdrop-blur-2xl md:hidden"
          >
            <ul className="flex h-full flex-col justify-center gap-2 px-8">
              {links.map((link, index) => (
                <motion.li
                  key={link.href}
                  initial={{ opacity: 0, y: 24 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{
                    delay: 0.1 + index * 0.07,
                    duration: 0.6,
                    ease: [0.16, 1, 0.3, 1],
                  }}
                >
                  <Link
                    href={link.href}
                    onClick={() => setMenuOpen(false)}
                    className="block py-3 font-display text-4xl text-cream-100"
                  >
                    {link.label}
                  </Link>
                </motion.li>
              ))}
              <motion.li
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4, duration: 0.6 }}
                className="mt-8"
              >
                <a
                  href={site.orderUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-block rounded-full bg-gold-400 px-8 py-3.5 text-xs font-semibold tracking-[0.15em] text-forest-950 uppercase"
                >
                  Order Online
                </a>
              </motion.li>
            </ul>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
