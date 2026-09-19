"use client";

import Image from "next/image";
import Link from "next/link";
import { useRef } from "react";
import { motion, useScroll, useTransform, useReducedMotion } from "motion/react";
import { site } from "@/data/site";

/**
 * The scroll-scrubbed opening.
 *
 * The section is 200vh tall with a sticky 100vh stage inside it. As the first
 * viewport of scroll is consumed, the neon storefront pulls back and dims while
 * the headline lifts and fades — so the whole first screen is driven by scroll
 * position rather than by a timed animation.
 */
export function Hero() {
  const sectionRef = useRef<HTMLElement>(null);
  const reduceMotion = useReducedMotion();

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end start"],
  });

  // Image: starts overscaled and centred, pulls back and darkens on scroll.
  const imageScale = useTransform(scrollYProgress, [0, 1], [1.18, 1]);
  const imageOpacity = useTransform(scrollYProgress, [0, 0.85], [1, 0.25]);

  // Copy: parallaxes up faster than the image and clears out before the fold.
  const copyY = useTransform(scrollYProgress, [0, 1], ["0%", "-55%"]);
  const copyOpacity = useTransform(scrollYProgress, [0, 0.45], [1, 0]);

  const veilOpacity = useTransform(scrollYProgress, [0, 1], [0.55, 0.9]);
  const cueOpacity = useTransform(scrollYProgress, [0, 0.12], [1, 0]);

  const still = reduceMotion ?? false;

  return (
    <section
      ref={sectionRef}
      className="relative h-[200vh]"
      aria-label="Introduction"
    >
      <div className="sticky top-0 h-screen overflow-hidden">
        {/* Storefront neon at night — the venue's own photograph. */}
        <motion.div
          className="absolute inset-0"
          style={
            still
              ? undefined
              : { scale: imageScale, opacity: imageOpacity }
          }
        >
          <Image
            src="/images/hero-neon-night.jpg"
            alt="The illuminated Crema Lounge sign outside the F-7 Markaz entrance at night"
            fill
            priority
            sizes="100vw"
            className="object-cover object-center"
          />
        </motion.div>

        {/* Readability veil, deepened toward the bottom of the frame. */}
        <motion.div
          className="absolute inset-0 bg-gradient-to-b from-forest-950/70 via-forest-950/40 to-forest-950"
          style={still ? undefined : { opacity: veilOpacity }}
        />

        {/* Second, horizontal veil so the headline always sits on a dark
            field — the neon sign in the plate falls right behind the copy. */}
        <div className="absolute inset-0 bg-gradient-to-r from-forest-950/85 via-forest-950/55 to-forest-950/10" />

        <div className="u-grain absolute inset-0" />

        {/* Copy */}
        <motion.div
          className="relative flex h-full items-center"
          style={still ? undefined : { y: copyY, opacity: copyOpacity }}
        >
          <div className="u-container">
            <div className="max-w-3xl">
              <motion.p
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.9, delay: 0.5 }}
                className="u-eyebrow"
              >
                F-7 Markaz · Islamabad
              </motion.p>

              <h1 className="mt-6 font-display text-[clamp(2.5rem,7.6vw,5.75rem)] leading-[0.95] font-light text-cream-100">
                {["Where strangers", "become regulars."].map((line, index) => (
                  <span
                    key={line}
                    className="block overflow-hidden pb-[0.08em]"
                  >
                    <motion.span
                      className="block"
                      initial={{ y: "110%" }}
                      animate={{ y: "0%" }}
                      transition={{
                        duration: 1.3,
                        delay: 0.65 + index * 0.12,
                        ease: [0.16, 1, 0.3, 1],
                      }}
                    >
                      {index === 1 ? (
                        <>
                          become{" "}
                          <em className="font-normal text-gold-400 italic">
                            regulars.
                          </em>
                        </>
                      ) : (
                        line
                      )}
                    </motion.span>
                  </span>
                ))}
              </h1>

              <motion.p
                initial={{ opacity: 0, y: 18 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 1, delay: 1.05 }}
                className="mt-7 max-w-lg text-base leading-relaxed text-cream-200/70 sm:text-lg"
              >
                Specialty coffee, an all-day kitchen and a room that fills up
                with people who came for the espresso and stayed for the table.
              </motion.p>

              <motion.div
                initial={{ opacity: 0, y: 18 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 1, delay: 1.2 }}
                className="mt-9 flex flex-wrap items-center gap-4"
              >
                <Link
                  href="/menu"
                  className="group relative overflow-hidden rounded-full bg-cream-100 px-8 py-4 text-xs font-semibold tracking-[0.18em] text-forest-950 uppercase transition-colors duration-500 hover:text-forest-950"
                >
                  <span className="relative z-10">See the Menu</span>
                  <span className="absolute inset-0 -translate-x-full bg-gold-400 transition-transform duration-600 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:translate-x-0" />
                </Link>
                <a
                  href={site.mapsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="rounded-full border border-cream-200/25 px-8 py-4 text-xs font-medium tracking-[0.18em] text-cream-200 uppercase transition-colors duration-400 hover:border-cream-200/60"
                >
                  Find Us
                </a>
              </motion.div>
            </div>
          </div>
        </motion.div>

        {/* Scroll cue */}
        <motion.div
          style={still ? undefined : { opacity: cueOpacity }}
          className="absolute inset-x-0 bottom-8 flex justify-center"
        >
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.6, duration: 1 }}
            className="flex flex-col items-center gap-3"
          >
            <span className="text-[0.625rem] tracking-[0.3em] text-cream-200/50 uppercase">
              Scroll
            </span>
            <span className="relative h-10 w-px overflow-hidden bg-cream-200/20">
              <motion.span
                className="absolute inset-x-0 top-0 h-4 bg-gold-400"
                animate={{ y: [-16, 40] }}
                transition={{
                  duration: 1.9,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
              />
            </span>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
