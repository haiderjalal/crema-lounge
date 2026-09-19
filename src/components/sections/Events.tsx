"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { motion, useScroll, useTransform, useReducedMotion } from "motion/react";
import { Reveal, RevealLines } from "@/components/shared/Reveal";
import { events } from "@/data/events";
import { site } from "@/data/site";

/**
 * Horizontal rail driven by vertical scroll.
 *
 * On large screens the section is tall and the card track translates on X as
 * the page scrolls, giving a sideways read without hijacking the wheel. Below
 * `lg` it falls back to a normal swipeable row, which is the better mobile
 * interaction anyway.
 */
export function Events() {
  const sectionRef = useRef<HTMLElement>(null);
  const trackRef = useRef<HTMLUListElement>(null);
  const reduceMotion = useReducedMotion();

  /**
   * How far the track must travel so the last card finishes flush with the
   * right edge. Measured rather than guessed — a hardcoded percentage
   * over- or under-shoots as soon as the card count or viewport changes.
   */
  const [travel, setTravel] = useState(0);

  useEffect(() => {
    const measure = (): void => {
      const track = trackRef.current;
      if (!track) return;
      const overflow = track.scrollWidth - window.innerWidth;
      setTravel(Math.max(overflow, 0));
    };

    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, []);

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end end"],
  });

  const trackX = useTransform(scrollYProgress, [0.12, 0.92], [0, -travel]);
  const still = reduceMotion ?? false;

  return (
    <section
      id="events"
      ref={sectionRef}
      className="relative scroll-mt-24 overflow-x-clip bg-forest-950 lg:h-[200vh]"
    >
      <div className="lg:sticky lg:top-0 lg:flex lg:h-screen lg:flex-col lg:justify-center">
        <div className="u-container pt-28 pb-12 lg:pt-0 lg:pb-16">
          <div className="flex flex-wrap items-end justify-between gap-8">
            <div>
              <Reveal>
                <p className="u-eyebrow">What&rsquo;s On</p>
              </Reveal>
              <h2 className="mt-6 font-display text-[clamp(2rem,4.6vw,3.5rem)] leading-[1.06] font-light text-cream-100">
                <RevealLines
                  text={"Come alone.\nLeave with people."}
                  delay={0.08}
                />
              </h2>
            </div>
            <Reveal delay={0.2}>
              <a
                href={site.instagram}
                target="_blank"
                rel="noopener noreferrer"
                className="group inline-flex items-center gap-3 text-xs font-medium tracking-[0.18em] text-cream-200 uppercase"
              >
                <span className="border-b border-cream-200/30 pb-1 transition-colors group-hover:border-gold-400">
                  Next Dates on Instagram
                </span>
                <span className="text-gold-400 transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:translate-x-1.5">
                  →
                </span>
              </a>
            </Reveal>
          </div>
        </div>

        {/* Mobile / tablet: native horizontal scroll. Desktop: scroll-driven. */}
        <div className="overflow-x-auto pb-28 lg:overflow-visible lg:pb-0">
          <motion.ul
            ref={trackRef}
            style={still ? undefined : { x: trackX }}
            className="flex w-max gap-6 px-5 lg:gap-8 lg:px-10"
          >
            {events.map((event, index) => (
              <motion.li
                key={event.title}
                initial={{ opacity: 0, y: 32 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-8% 0px" }}
                transition={{
                  duration: 0.8,
                  delay: index * 0.07,
                  ease: [0.16, 1, 0.3, 1],
                }}
                className="group w-[78vw] max-w-sm shrink-0 sm:w-[54vw] lg:w-[26rem]"
              >
                <div className="relative aspect-[4/5] overflow-hidden rounded-sm">
                  <Image
                    src={event.image}
                    alt={event.imageAlt}
                    fill
                    sizes="(min-width: 1024px) 26rem, 78vw"
                    className="object-cover transition-transform duration-[1200ms] ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-forest-950 via-forest-950/25 to-transparent" />

                  <div className="absolute inset-x-0 bottom-0 p-7">
                    <span className="inline-block rounded-full border border-gold-400/40 px-3.5 py-1.5 text-[0.625rem] tracking-[0.18em] text-gold-300 uppercase">
                      {event.kind}
                    </span>
                    <h3 className="mt-4 font-display text-2xl text-cream-50">
                      {event.title}
                    </h3>
                    <p className="mt-2.5 text-sm leading-relaxed text-cream-200/65">
                      {event.blurb}
                    </p>
                  </div>
                </div>
              </motion.li>
            ))}
          </motion.ul>
        </div>
      </div>
    </section>
  );
}
