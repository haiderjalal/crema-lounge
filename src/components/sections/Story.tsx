"use client";

import Image from "next/image";
import { useRef } from "react";
import { motion, useScroll, useTransform, useReducedMotion } from "motion/react";
import { Reveal, RevealLines } from "@/components/shared/Reveal";
import { stats } from "@/data/site";

/**
 * The room. Sticky image column with a counter-scrolling parallax crop,
 * beside copy that reveals line by line.
 */
export function Story() {
  const sectionRef = useRef<HTMLElement>(null);
  const reduceMotion = useReducedMotion();

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start end", "end start"],
  });

  // The image drifts within its frame as the section passes the viewport.
  const imageY = useTransform(scrollYProgress, [0, 1], ["-8%", "8%"]);
  const imageScale = useTransform(scrollYProgress, [0, 0.5, 1], [1.12, 1.02, 1.12]);

  const still = reduceMotion ?? false;

  return (
    <section
      id="story"
      ref={sectionRef}
      className="u-grain relative scroll-mt-24 overflow-hidden bg-forest-950 py-28 md:py-40"
    >
      <div className="u-container">
        <div className="grid items-center gap-14 lg:grid-cols-12 lg:gap-20">
          {/* Image */}
          <div className="lg:col-span-6">
            <Reveal distance={40}>
              <div className="relative aspect-[4/5] overflow-hidden rounded-sm">
                <motion.div
                  className="absolute inset-[-10%]"
                  style={still ? undefined : { y: imageY, scale: imageScale }}
                >
                  <Image
                    src="/images/storefront.jpg"
                    alt="The Crema Lounge entrance and pavement seating at Foliage Mall, F-7 Markaz"
                    fill
                    sizes="(min-width: 1024px) 45vw, 100vw"
                    className="object-cover"
                  />
                </motion.div>
                <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-forest-950/50 to-transparent" />
              </div>
            </Reveal>
          </div>

          {/* Copy */}
          <div className="lg:col-span-6">
            <Reveal>
              <p className="u-eyebrow">The Room</p>
            </Reveal>

            <h2 className="mt-7 font-display text-[clamp(2rem,4.6vw,3.5rem)] leading-[1.06] font-light text-cream-100">
              <RevealLines
                text={"A lower-ground room\nthat keeps people\nlonger than planned."}
                delay={0.08}
              />
            </h2>

            <Reveal delay={0.15}>
              <div className="u-rule mt-10" />
            </Reveal>

            <Reveal delay={0.2}>
              <p className="mt-9 text-base leading-[1.75] text-cream-200/70">
                We opened under Foliage Mall with a short brief: pull good
                espresso, cook properly all day, and leave enough room for the
                conversation to go on. The bar runs pour-over and Aeropress
                alongside the machine. The kitchen starts at seven and does not
                stop.
              </p>
            </Reveal>

            <Reveal delay={0.28}>
              <p className="mt-6 text-base leading-[1.75] text-cream-200/70">
                Most weeks there is something on — a game night, a crochet
                workshop, a film. People arrive on their own and leave having
                met someone. That is the whole idea.
              </p>
            </Reveal>

            <Reveal delay={0.36}>
              <dl className="mt-14 grid grid-cols-3 gap-6 border-t border-cream-200/10 pt-9">
                {stats.map((stat) => (
                  <div key={stat.label}>
                    <dt className="font-display text-2xl text-gold-400 sm:text-3xl">
                      {stat.value}
                    </dt>
                    <dd className="mt-2 text-[0.6875rem] leading-snug tracking-[0.12em] text-cream-200/50 uppercase">
                      {stat.label}
                    </dd>
                  </div>
                ))}
              </dl>
            </Reveal>
          </div>
        </div>
      </div>
    </section>
  );
}
