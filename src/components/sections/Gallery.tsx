"use client";

import Image from "next/image";
import { useRef } from "react";
import { motion, useScroll, useTransform, useReducedMotion } from "motion/react";
import { Reveal } from "@/components/shared/Reveal";
import { site } from "@/data/site";

interface Shot {
  readonly src: string;
  readonly alt: string;
  readonly aspect: string;
  /** Parallax strength; higher values drift further as the grid scrolls. */
  readonly drift: number;
}

const shots: readonly Shot[] = [
  {
    src: "/images/latte-jenga.jpg",
    alt: "Two Crema mugs with heart latte art beside a Jenga tower",
    aspect: "aspect-[4/5]",
    drift: 40,
  },
  {
    src: "/images/pancake.jpg",
    alt: "A stack of pancakes latticed with chocolate and dusted with sugar",
    aspect: "aspect-[3/4]",
    drift: -55,
  },
  {
    src: "/images/iced-coffee.jpg",
    alt: "Three iced coffees on a stone table at Crema Lounge",
    aspect: "aspect-square",
    drift: 30,
  },
  {
    src: "/images/interior-table.jpg",
    alt: "A long table laid out inside the lounge before an event",
    aspect: "aspect-[4/5]",
    drift: -35,
  },
  {
    src: "/images/workshop.jpg",
    alt: "Guests painting together at a Crema Lounge workshop table",
    aspect: "aspect-[3/4]",
    drift: 48,
  },
  {
    src: "/images/storefront.jpg",
    alt: "The Crema Lounge frontage and pavement seating in daylight",
    aspect: "aspect-square",
    drift: -28,
  },
] as const;

/** Each tile drifts at its own rate as the grid crosses the viewport. */
function GalleryTile({ shot, index }: { shot: Shot; index: number }) {
  const ref = useRef<HTMLLIElement>(null);
  const reduceMotion = useReducedMotion();

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });

  const y = useTransform(scrollYProgress, [0, 1], [shot.drift, -shot.drift]);
  const still = reduceMotion ?? false;

  return (
    <motion.li
      ref={ref}
      style={still ? undefined : { y }}
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ once: true, margin: "-5% 0px" }}
      transition={{ duration: 1, delay: (index % 3) * 0.08 }}
      className="group"
    >
      <div className={`relative ${shot.aspect} overflow-hidden rounded-sm`}>
        <Image
          src={shot.src}
          alt={shot.alt}
          fill
          sizes="(min-width: 768px) 32vw, 90vw"
          className="object-cover transition-transform duration-[1400ms] ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-[1.06]"
        />
        <div className="pointer-events-none absolute inset-0 bg-forest-950/25 transition-opacity duration-700 group-hover:opacity-0" />
      </div>
    </motion.li>
  );
}

export function Gallery() {
  return (
    <section className="u-grain relative overflow-hidden bg-forest-900 py-28 md:py-40">
      <div className="u-container">
        <div className="flex flex-wrap items-end justify-between gap-6">
          <Reveal>
            <p className="u-eyebrow">In the Room</p>
          </Reveal>
          <Reveal delay={0.1}>
            <a
              href={site.instagram}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs tracking-[0.18em] text-cream-200/60 uppercase transition-colors hover:text-gold-400"
            >
              {site.instagramHandle}
            </a>
          </Reveal>
        </div>

        <ul className="mt-14 grid grid-cols-2 gap-4 md:grid-cols-3 md:gap-6">
          {shots.map((shot, index) => (
            <GalleryTile key={shot.src} shot={shot} index={index} />
          ))}
        </ul>
      </div>
    </section>
  );
}
