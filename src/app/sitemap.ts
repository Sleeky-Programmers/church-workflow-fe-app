import type { MetadataRoute } from "next";
import { BASE_URL } from "@/lib/seo";

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: BASE_URL,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 1,
    },
    // Add more public, indexable pages here as they are created
    // (do not list /auth, /dashboard, /checkout, /payment, /onboarding — these are noindexed)
  ];
}
