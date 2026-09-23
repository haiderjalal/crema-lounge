import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { MenuBoard } from "@/components/sections/MenuBoard";
import { Reveal, RevealLines } from "@/components/shared/Reveal";
import { arItems, formatPrice, menu } from "@/data/menu";
import { site } from "@/data/site";

export const metadata: Metadata = {
  title: "Menu",
  description:
    "The full Crema Lounge menu — espresso and manual brews, all-day breakfast, paninis, pasta, salads and the house cheesecake. F-7 Markaz, Islamabad.",
  alternates: { canonical: "/menu" },
  openGraph: {
    title: `Menu · ${site.name}`,
    description:
      "Espresso, V60 and Aeropress, all-day breakfast, and the house cheesecake — the full menu at Crema Lounge, F-7 Markaz.",
    url: `${site.url}/menu`,
    images: ["/images/latte-jenga.jpg"],
  },
};

const itemCount = menu.reduce(
  (total, category) => total + category.items.length,
  0,
);

export default function MenuPage() {
  return (
    <>
      <header className="relative overflow-hidden pt-36 pb-16 md:pt-48 md:pb-20">
        <div className="absolute inset-0 -z-10">
          <Image
            src="/images/latte-jenga.jpg"
            alt=""
            aria-hidden="true"
            fill
            priority
            sizes="100vw"
            className="object-cover object-center opacity-25"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-forest-950/80 via-forest-950/90 to-forest-950" />
        </div>
        <div className="u-grain absolute inset-0 -z-10" />

        <div className="u-container">
          <Reveal>
            <p className="u-eyebrow">
              {itemCount} items · {menu.length} sections
            </p>
          </Reveal>
          <h1 className="mt-6 font-display text-[clamp(2.5rem,7vw,5rem)] leading-[1.02] font-light text-cream-100">
            <RevealLines text={"The Menu"} delay={0.06} />
          </h1>
          <Reveal delay={0.16}>
            <p className="mt-7 max-w-lg text-base leading-relaxed text-cream-200/65">
              Pulled on the bar, cooked in the kitchen, baked in house. Prices
              in PKR and inclusive of tax.
            </p>
          </Reveal>
        </div>
      </header>

      {/* Dishes with a true-scale 3D model — the QR codes on the tables land here. */}
      <section aria-labelledby="ar-heading" className="u-container pb-16">
        <div className="flex items-baseline gap-6">
          <h2 id="ar-heading" className="u-eyebrow">
            See it on your table
          </h2>
          <span className="u-rule flex-1" aria-hidden="true" />
        </div>
        <ul className="mt-6 grid gap-5 md:grid-cols-2">
          {arItems.map((item) => (
            <li key={item.model.slug}>
              <Link
                href={`/menu/${item.model.slug}`}
                className="group grid grid-cols-[7.5rem_1fr] overflow-hidden rounded-2xl border border-cream-200/10 bg-forest-900 transition-colors hover:border-gold-400/40 sm:grid-cols-[10rem_1fr]"
              >
                <div className="relative aspect-[4/5]">
                  <Image
                    src={item.model.photo}
                    alt={item.model.photoAlt}
                    fill
                    sizes="160px"
                    className="object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                </div>
                <div className="flex flex-col justify-center gap-2 p-5">
                  <h3 className="font-display text-xl text-cream-100">{item.name}</h3>
                  <p className="text-sm text-gold-400 tabular-nums">
                    {formatPrice(item.price, item.from)}
                  </p>
                  <span className="mt-2 inline-flex w-fit items-center gap-2 rounded-full bg-gold-400 px-4 py-2 text-[0.6875rem] font-semibold tracking-[0.16em] text-forest-950 uppercase">
                    View in 3D &amp; AR
                  </span>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      </section>

      <MenuBoard />
    </>
  );
}
