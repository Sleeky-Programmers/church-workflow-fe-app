import type { MetadataRoute } from "next";
import { BASE_URL } from "@/lib/seo";

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date();

  return [
    {
      url: BASE_URL,
      lastModified,
      changeFrequency: "weekly",
      priority: 1,
    },
    {
      url: `${BASE_URL}/features`,
      lastModified,
      changeFrequency: "monthly",
      priority: 0.8,
    },
    {
      url: `${BASE_URL}/pricing`,
      lastModified,
      changeFrequency: "monthly",
      priority: 0.8,
    },
    {
      url: `${BASE_URL}/church-management-software`,
      lastModified,
      changeFrequency: "monthly",
      priority: 0.7,
    },
    {
      url: `${BASE_URL}/church-administration-software`,
      lastModified,
      changeFrequency: "monthly",
      priority: 0.7,
    },
    {
      url: `${BASE_URL}/church-management-software-nigeria`,
      lastModified,
      changeFrequency: "monthly",
      priority: 0.7,
    },
    // Add more public, indexable pages here as they are created
    // (do not list /auth, /dashboard, /checkout, /payment, /onboarding — these are noindexed)
  ];
}
