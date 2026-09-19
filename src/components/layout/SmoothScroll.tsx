"use client";

import { useEffect } from "react";
import Lenis from "lenis";

/**
 * Inertial scrolling for the whole document.
 * Opted out entirely when the visitor prefers reduced motion — the page
 * then scrolls natively, and every scroll-linked animation degrades with it.
 */
export function SmoothScroll(): null {
  useEffect(() => {
    const prefersReduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    );
    if (prefersReduced.matches) return;

    const lenis = new Lenis({
      duration: 1.1,
      easing: (t: number) => 1 - Math.pow(1 - t, 4),
      smoothWheel: true,
      touchMultiplier: 1.6,
    });

    let frame = 0;
    const raf = (time: number): void => {
      lenis.raf(time);
      frame = requestAnimationFrame(raf);
    };
    frame = requestAnimationFrame(raf);

    return () => {
      cancelAnimationFrame(frame);
      lenis.destroy();
    };
  }, []);

  return null;
}
