import type { Metadata } from "next";
import Image from "next/image";
import { MenuBoard } from "@/components/sections/MenuBoard";
import { Reveal, RevealLines } from "@/components/shared/Reveal";
import { menu } from "@/data/menu";
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

      <MenuBoard />
    </>
  );
}
