import type { MetadataRoute } from "next";
import { BASE_URL, IS_PRODUCTION } from "@/lib/seo";

export default function robots(): MetadataRoute.Robots {
  if (!IS_PRODUCTION) {
    return {
      rules: {
        userAgent: "*",
        disallow: "/",
      },
    };
  }

  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: [
        "/dashboard",
        "/dashboard/",
        "/checkout",
        "/payment",
        "/onboarding",
      ],
    },
    sitemap: `${BASE_URL}/sitemap.xml`,
  };
}
