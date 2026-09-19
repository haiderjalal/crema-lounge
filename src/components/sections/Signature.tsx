"use client";

import Image from "next/image";
import Link from "next/link";
import { useRef } from "react";
import { motion, useScroll, useTransform, useReducedMotion } from "motion/react";

/**
 * Full-bleed cinematic break on the house cheesecake.
 *
 * The image frame opens outward as the section scrolls through: it starts
 * inset with rounded corners and expands toward full-bleed at centre screen,
 * which reads as the page "opening up" around the dish.
 */
export function Signature() {
  const sectionRef = useRef<HTMLElement>(null);
  const reduceMotion = useReducedMotion();

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start end", "end start"],
  });

  const frameInset = useTransform(
    scrollYProgress,
    [0, 0.5, 1],
    ["8%", "0%", "8%"],
  );
  const radius = useTransform(scrollYProgress, [0, 0.5, 1], ["2rem", "0rem", "2rem"]);
  const imageScale = useTransform(scrollYProgress, [0, 0.5, 1], [1.25, 1.05, 1.25]);
  const copyY = useTransform(scrollYProgress, [0, 1], ["28%", "-28%"]);

  const still = reduceMotion ?? false;

  return (
    <section
      ref={sectionRef}
      aria-label="House cheesecake"
      className="relative h-[130vh] bg-forest-950"
    >
      <div className="sticky top-0 flex h-screen items-center overflow-hidden">
        <motion.div
          className="absolute inset-0 overflow-hidden"
          style={
            still
              ? undefined
              : {
                  left: frameInset,
                  right: frameInset,
                  borderRadius: radius,
                }
          }
        >
          <motion.div
            className="absolute inset-0"
            style={still ? undefined : { scale: imageScale }}
          >
            <Image
              src="/images/signature-cheesecake.jpg"
              alt="A slice of the house cheesecake on a stoneware plate in warm light"
              fill
              sizes="100vw"
              className="object-cover object-center"
            />
          </motion.div>
          <div className="absolute inset-0 bg-gradient-to-r from-forest-950/85 via-forest-950/45 to-transparent" />
        </motion.div>

        <motion.div
          className="relative w-full"
          style={still ? undefined : { y: copyY }}
        >
          <div className="u-container">
            <div className="max-w-md">
              <p className="u-eyebrow">The One They Come Back For</p>
              <h2 className="mt-6 font-display text-[clamp(2.25rem,5.5vw,4rem)] leading-[1.02] font-light text-cream-50">
                The Crema
                <br />
                <em className="font-normal text-gold-400 italic">Cheesecake</em>
              </h2>
              <p className="mt-7 text-base leading-relaxed text-cream-100/80">
                Set slow on a proper biscuit base. It sold out, it came back,
                and it has not left the counter since — served exclusively at
                F-7.
              </p>
              <Link
                href="/menu#desserts"
                className="group mt-9 inline-flex items-center gap-3 text-xs font-medium tracking-[0.18em] text-cream-50 uppercase"
              >
                <span className="border-b border-gold-400/50 pb-1 transition-colors group-hover:border-gold-400">
                  View Desserts
                </span>
                <span className="text-gold-400 transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:translate-x-1.5">
                  →
                </span>
              </Link>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
