import type { MetadataRoute } from "next";

const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL ?? "https://www.monmate.tw").replace(/\/$/, "");

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  return [
    { url: `${siteUrl}/`, lastModified: now, changeFrequency: "weekly", priority: 1 },
    { url: `${siteUrl}/pricing`, lastModified: now, changeFrequency: "monthly", priority: 0.8 },
    { url: `${siteUrl}/scenarios/school`, lastModified: now, changeFrequency: "monthly", priority: 0.7 },
    { url: `${siteUrl}/scenarios/seminar`, lastModified: now, changeFrequency: "monthly", priority: 0.7 },
    { url: `${siteUrl}/scenarios/excel-list`, lastModified: now, changeFrequency: "monthly", priority: 0.7 },
    { url: `${siteUrl}/cases/elementary-school`, lastModified: now, changeFrequency: "monthly", priority: 0.6 },
    { url: `${siteUrl}/privacy`, lastModified: now, changeFrequency: "yearly", priority: 0.3 },
    { url: `${siteUrl}/refund`, lastModified: now, changeFrequency: "yearly", priority: 0.3 }
  ];
}
