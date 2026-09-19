/**
 * The community programme. Every entry below has actually run at Crema Lounge —
 * sourced from the venue's own posts.
 */

export interface CremaEvent {
  readonly title: string;
  readonly kind: string;
  readonly blurb: string;
  readonly image: string;
  readonly imageAlt: string;
}

export const events: readonly CremaEvent[] = [
  {
    title: "Offbeat Game Night",
    kind: "Monthly",
    blurb:
      "Karaoke editions, board games, and a room full of people who arrived as strangers. Slots go fast.",
    image: "/images/jenga-play.jpg",
    imageAlt: "Two guests playing giant Jenga at a Crema Lounge table",
  },
  {
    title: "Brush & Brunch",
    kind: "Workshop",
    blurb:
      "Paint through the afternoon with a plate in front of you. Materials and refreshments included.",
    image: "/images/workshop.jpg",
    imageAlt: "A long table set for a painting workshop at Crema Lounge",
  },
  {
    title: "Bloom & Hook",
    kind: "Workshop",
    blurb:
      "Beginner-friendly crochet. Small group, big energy — roses made, friendships formed, yarn mostly tamed.",
    image: "/images/interior-table.jpg",
    imageAlt: "Workshop table laid out with materials inside Crema Lounge",
  },
  {
    title: "Movie Nights",
    kind: "Seasonal",
    blurb:
      "The comfort-film session. Snacks and drinks covered, board games on the side, everyone welcome solo.",
    image: "/images/latte-jenga.jpg",
    imageAlt: "Two Crema lattes with heart latte art beside a Jenga tower",
  },
] as const;
