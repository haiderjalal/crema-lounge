/**
 * Single source of truth for brand + venue facts.
 * All values sourced from Crema Lounge's own Instagram profile and listings.
 */

export const site = {
  name: "Crema Lounge",
  legalName: "CREMA | Lounge",
  tagline: "Where Strangers Become Regulars",
  description:
    "A specialty coffee lounge in F-7 Markaz, Islamabad. Manual brews, all-day breakfast, and a room built for people who came for the coffee and stayed for the company.",
  url: "https://cremalounge.pk",
  instagram: "https://www.instagram.com/crema.loungef7/",
  instagramHandle: "@crema.loungef7",
  orderUrl: "https://www.foodpanda.pk/restaurant/l6yf/crema-lounge",
  address: {
    line1: "Lower Ground, Foliage Mall",
    line2: "F-7 Markaz",
    city: "Islamabad",
    country: "Pakistan",
  },
  mapsUrl:
    "https://www.google.com/maps/search/?api=1&query=Crema+Lounge+Foliage+Mall+F-7+Markaz+Islamabad",
  hours: [
    { days: "Monday — Thursday", time: "7:00 AM — 1:00 AM" },
    { days: "Friday — Sunday", time: "7:00 AM — 2:00 AM" },
  ],
  /** Their own line: "BREAKFAST 24/7 ALL DAY EVERYDAY", doors at 7am sharp. */
  breakfastNote: "Breakfast served all day, every day — from 7:00 AM sharp.",
} as const;

export interface Stat {
  readonly value: string;
  readonly label: string;
}

export const stats: readonly Stat[] = [
  { value: "7AM", label: "Doors open, breakfast on" },
  { value: "V60", label: "Manual brew bar" },
  { value: "F-7", label: "Foliage Mall, lower ground" },
] as const;

export interface Marquee {
  readonly items: readonly string[];
}

export const marqueeItems: readonly string[] = [
  "Espresso",
  "Spanish Latte",
  "V60 Pour Over",
  "Aeropress",
  "Breakfast All Day",
  "Lotus Cheesecake",
  "Game Nights",
  "Workshops",
] as const;
