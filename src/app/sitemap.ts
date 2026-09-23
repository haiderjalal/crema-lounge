import type { MetadataRoute } from "next";
import { arItems } from "@/data/menu";
import { site } from "@/data/site";

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();

  return [
    { url: site.url, lastModified: now, changeFrequency: "monthly", priority: 1 },
    {
      url: `${site.url}/menu`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.9,
    },
    ...arItems.map((item) => ({
      url: `${site.url}/menu/${item.model.slug}`,
      lastModified: now,
      changeFrequency: "monthly" as const,
      priority: 0.7,
    })),
  ];
}
