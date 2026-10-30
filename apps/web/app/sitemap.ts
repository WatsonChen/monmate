import type { MetadataRoute } from "next";
import { contentDate } from "./lib/content-dates";

const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL ?? "https://www.monmate.tw").replace(/\/$/, "");

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: `${siteUrl}/`, lastModified: contentDate("/"), changeFrequency: "weekly", priority: 1 },
    { url: `${siteUrl}/pricing`, lastModified: contentDate("/pricing"), changeFrequency: "monthly", priority: 0.8 },
    { url: `${siteUrl}/scenarios/school`, lastModified: contentDate("/scenarios/school"), changeFrequency: "monthly", priority: 0.7 },
    { url: `${siteUrl}/scenarios/seminar`, lastModified: contentDate("/scenarios/seminar"), changeFrequency: "monthly", priority: 0.7 },
    { url: `${siteUrl}/scenarios/excel-list`, lastModified: contentDate("/scenarios/excel-list"), changeFrequency: "monthly", priority: 0.7 },
    { url: `${siteUrl}/scenarios/brand-event`, lastModified: contentDate("/scenarios/brand-event"), changeFrequency: "monthly", priority: 0.7 },
    { url: `${siteUrl}/scenarios/community`, lastModified: contentDate("/scenarios/community"), changeFrequency: "monthly", priority: 0.7 },
    { url: `${siteUrl}/guides/offline-check-in`, lastModified: contentDate("/guides/offline-check-in"), changeFrequency: "monthly", priority: 0.6 },
    { url: `${siteUrl}/guides/export-attendance-report`, lastModified: contentDate("/guides/export-attendance-report"), changeFrequency: "monthly", priority: 0.6 },
    { url: `${siteUrl}/cases/elementary-school`, lastModified: contentDate("/cases/elementary-school"), changeFrequency: "monthly", priority: 0.6 },
    { url: `${siteUrl}/privacy`, lastModified: contentDate("/privacy"), changeFrequency: "yearly", priority: 0.3 },
    { url: `${siteUrl}/refund`, lastModified: contentDate("/refund"), changeFrequency: "yearly", priority: 0.3 }
  ];
}
