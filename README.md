# Crema Lounge

Marketing site for **CREMA | Lounge** — a specialty coffee lounge at Lower Ground, Foliage Mall, F-7 Markaz, Islamabad.

> Where Strangers Become Regulars

## Stack

| Concern | Choice |
| --- | --- |
| Framework | Next.js 16 (App Router, Turbopack) |
| Language | TypeScript, strict |
| Styling | Tailwind CSS v4 (`@theme` tokens) |
| Animation | `motion` (Framer Motion) |
| Smooth scroll | `lenis` |
| Type | Fraunces (display) · Inter (UI), via `next/font` |

Every route is statically prerendered.

## Commands

```bash
npm run dev
```

```bash
npm run build
```

```bash
npm run lint
```

## Brand tokens

Sampled from the venue's own identity — the forest-green logo ground, its cream
lettering, and the gold storefront neon. Defined once in `src/app/globals.css`
under `@theme`; never hardcode a hex in a component.

| Token | Value | Use |
| --- | --- | --- |
| `forest-950` | `#0f1d17` | Page shell |
| `forest-900` | `#16281f` | Alternating sections |
| `forest-700` | `#2e4a3e` | Logo ground |
| `cream-200` | `#efe6d6` | Body text |
| `cream-100` | `#f5efe2` | Headings |
| `gold-400` | `#f5c242` | Accent, CTAs, prices |

## Structure

```
src/
├── app/            routes, metadata, sitemap, robots
├── components/
│   ├── layout/     Navbar, Footer, SmoothScroll, MotionProvider
│   ├── sections/   one file per page section
│   └── shared/     Reveal primitives, Logo
└── data/           menu, events, site facts — the single source of truth
```

Copy, prices and venue facts live in `src/data/`. Sections read from there, so
a menu change is a one-file edit.

## Scroll behaviour

The homepage is built around scroll-linked motion rather than timed animation:

- **Hero** — 200vh section with a sticky stage; the storefront pulls back and
  dims while the headline parallaxes up.
- **Story** — counter-scrolling parallax crop beside line-by-line copy reveals.
- **Signature** — the image frame opens toward full-bleed at centre screen.
- **Events** — vertical scroll drives a horizontal card rail. Travel is
  **measured** from the track width, not hardcoded, so the last card always
  lands flush. Below `lg` it falls back to a native swipe row.
- **Gallery** — each tile drifts at its own rate.

Sections that overflow horizontally use `overflow-x: clip` rather than
`hidden`, because `hidden` would turn them into scroll containers and break
`position: sticky` for their descendants.

### Reduced motion

`MotionProvider` sets `reducedMotion="user"`, so Motion drops transform and
layout animations while keeping opacity — content fades in rather than flying,
and nothing is ever left invisible. Lenis is not initialised at all in that
case, and `globals.css` collapses CSS transitions to near-zero.

## Content sources

- **Menu** — 62 items across 17 sections, with prices in PKR, mirroring the
  venue's published listing.
- **Photography** — the venue's own images. The curated set ships in
  `public/images/`; the full scrape archive is kept in `.instagram-source/`
  (gitignored) so shots can be swapped without re-collecting.
- **Events** — every entry has actually run at the lounge.

## Before going live

- [ ] Point `site.url` in `src/data/site.ts` at the real domain (currently
      `https://cremalounge.pk`) — it drives canonicals, OG tags and the sitemap.
- [ ] Confirm opening hours in `site.hours`; these are a reasonable default,
      not confirmed by the venue.
- [ ] Re-export the logo as a transparent PNG/SVG if one exists. The current
      mark is the Instagram avatar, circle-cropped to hide its square ground.
- [ ] Add a real favicon and an OG image sized 1200×630.
