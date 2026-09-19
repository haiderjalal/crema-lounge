"use client";

import { Reveal, RevealLines } from "@/components/shared/Reveal";
import { site } from "@/data/site";

export function Visit() {
  return (
    <section
      id="visit"
      className="u-grain relative scroll-mt-24 overflow-hidden bg-forest-950 py-28 md:py-40"
    >
      <div className="u-container">
        <div className="grid gap-16 lg:grid-cols-12 lg:gap-20">
          <div className="lg:col-span-5">
            <Reveal>
              <p className="u-eyebrow">Visit</p>
            </Reveal>
            <h2 className="mt-6 font-display text-[clamp(2rem,4.6vw,3.5rem)] leading-[1.06] font-light text-cream-100">
              <RevealLines text={"Lower ground,\nFoliage Mall."} delay={0.08} />
            </h2>
            <Reveal delay={0.2}>
              <p className="mt-8 max-w-sm text-base leading-relaxed text-cream-200/65">
                {site.breakfastNote} Walk in, or reserve the long table for a
                workshop or a private evening.
              </p>
            </Reveal>
            <Reveal delay={0.28}>
              <a
                href={site.mapsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="group mt-10 inline-flex items-center gap-3 rounded-full bg-gold-400 px-8 py-4 text-xs font-semibold tracking-[0.18em] text-forest-950 uppercase transition-colors duration-400 hover:bg-gold-300"
              >
                Get Directions
                <span className="transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:translate-x-1">
                  →
                </span>
              </a>
            </Reveal>
          </div>

          <div className="lg:col-span-7 lg:pt-4">
            <dl className="grid gap-px overflow-hidden rounded-sm bg-cream-200/10 sm:grid-cols-2">
              <Reveal className="bg-forest-950 p-8" delay={0.05}>
                <dt className="text-[0.625rem] tracking-[0.22em] text-cream-200/45 uppercase">
                  Address
                </dt>
                <dd className="mt-4 font-display text-lg leading-snug text-cream-100">
                  {site.address.line1}
                  <br />
                  {site.address.line2}
                  <br />
                  {site.address.city}
                </dd>
              </Reveal>

              <Reveal className="bg-forest-950 p-8" delay={0.12}>
                <dt className="text-[0.625rem] tracking-[0.22em] text-cream-200/45 uppercase">
                  Hours
                </dt>
                <dd className="mt-4 space-y-3">
                  {site.hours.map((entry) => (
                    <div key={entry.days}>
                      <p className="text-sm text-cream-200/60">{entry.days}</p>
                      <p className="font-display text-lg text-cream-100 tabular-nums">
                        {entry.time}
                      </p>
                    </div>
                  ))}
                </dd>
              </Reveal>

              <Reveal className="bg-forest-950 p-8" delay={0.19}>
                <dt className="text-[0.625rem] tracking-[0.22em] text-cream-200/45 uppercase">
                  Order In
                </dt>
                <dd className="mt-4">
                  <a
                    href={site.orderUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-display text-lg text-cream-100 underline decoration-gold-400/40 underline-offset-[6px] transition-colors hover:text-gold-300"
                  >
                    Delivery across Islamabad
                  </a>
                </dd>
              </Reveal>

              <Reveal className="bg-forest-950 p-8" delay={0.26}>
                <dt className="text-[0.625rem] tracking-[0.22em] text-cream-200/45 uppercase">
                  Follow
                </dt>
                <dd className="mt-4">
                  <a
                    href={site.instagram}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-display text-lg text-cream-100 underline decoration-gold-400/40 underline-offset-[6px] transition-colors hover:text-gold-300"
                  >
                    {site.instagramHandle}
                  </a>
                </dd>
              </Reveal>
            </dl>
          </div>
        </div>
      </div>
    </section>
  );
}
