import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { DishViewer } from "@/components/ar/DishViewer";
import { arItems, formatPrice } from "@/data/menu";
import { site } from "@/data/site";

interface DishPageProps {
  readonly params: Promise<{ slug: string }>;
}

/** Only dishes with a 3D model get a page; anything else is a 404. */
export const dynamicParams = false;

export function generateStaticParams(): { slug: string }[] {
  return arItems.map((item) => ({ slug: item.model.slug }));
}

function findDish(slug: string) {
  return arItems.find((item) => item.model.slug === slug);
}

export async function generateMetadata({ params }: DishPageProps): Promise<Metadata> {
  const dish = findDish((await params).slug);
  if (!dish) return {};
  const path = `/menu/${dish.model.slug}`;
  const description = `See the ${dish.name} in 3D and place it on your table in AR. ${dish.description}`;
  return {
    title: `${dish.name} in 3D`,
    description,
    alternates: { canonical: path },
    openGraph: {
      title: `${dish.name} · ${site.name}`,
      description,
      url: `${site.url}${path}`,
      images: [dish.model.photo],
    },
    twitter: { card: "summary_large_image", images: [dish.model.photo] },
  };
}

export default async function DishPage({ params }: DishPageProps) {
  const dish = findDish((await params).slug);
  if (!dish) notFound();

  return (
    <article className="u-container pt-28 pb-24 md:pt-36">
      <Link
        href="/menu"
        className="inline-flex items-center gap-2 text-xs tracking-[0.18em] text-cream-200/60 uppercase transition-colors hover:text-gold-300"
      >
        <span aria-hidden="true">←</span> Full menu
      </Link>

      <div className="mt-6 grid gap-10 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,1fr)] lg:items-center lg:gap-16">
        <DishViewer
          src={dish.model.src}
          poster={dish.model.photo}
          alt={dish.model.photoAlt}
          cameraOrbit={dish.model.cameraOrbit}
          cameraTarget={dish.model.cameraTarget}
        />

        <div>
          <p className="u-eyebrow">3D · AR · True size</p>
          <h1 className="mt-4 font-display text-[clamp(2.25rem,6vw,4rem)] leading-[1.04] font-light text-cream-100">
            {dish.name}
          </h1>
          <p className="mt-4 text-lg text-gold-400 tabular-nums">{formatPrice(dish.price, dish.from)}</p>
          <p className="mt-6 max-w-md text-base leading-relaxed text-cream-200/70">{dish.description}</p>

          <ol className="mt-10 space-y-4 border-t border-cream-200/10 pt-8 text-sm leading-relaxed text-cream-200/60">
            <li>
              <span className="mr-3 text-gold-400 tabular-nums">01</span>
              Tap <strong className="font-medium text-cream-100">View on your table</strong>.
            </li>
            <li>
              <span className="mr-3 text-gold-400 tabular-nums">02</span>
              Point your camera at the table and move the phone slowly until it finds the surface.
            </li>
            <li>
              <span className="mr-3 text-gold-400 tabular-nums">03</span>
              The dish appears at its real size — walk around it, then ask your server to order.
            </li>
          </ol>
        </div>
      </div>
    </article>
  );
}
