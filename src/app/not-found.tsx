import Link from "next/link";

export default function NotFound() {
  return (
    <div className="u-container flex min-h-screen flex-col items-center justify-center py-32 text-center">
      <p className="u-eyebrow">404</p>
      <h1 className="mt-6 font-display text-[clamp(2.25rem,6vw,4rem)] leading-tight font-light text-cream-100">
        This page went cold.
      </h1>
      <p className="mt-5 max-w-sm text-base text-cream-200/60">
        The page you were after is not here. The coffee, however, still is.
      </p>
      <div className="mt-10 flex flex-wrap justify-center gap-4">
        <Link
          href="/"
          className="rounded-full bg-cream-100 px-8 py-4 text-xs font-semibold tracking-[0.18em] text-forest-950 uppercase transition-colors hover:bg-gold-400"
        >
          Back Home
        </Link>
        <Link
          href="/menu"
          className="rounded-full border border-cream-200/25 px-8 py-4 text-xs font-medium tracking-[0.18em] text-cream-200 uppercase transition-colors hover:border-cream-200/60"
        >
          See the Menu
        </Link>
      </div>
    </div>
  );
}
