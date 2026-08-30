import type { Metadata } from "next";

export const BASE_URL =
  process.env.NEXT_PUBLIC_BASE_URL || "https://churchworkflow.com";
export const SITE_NAME = "Church Workflow";

// Vercel sets VERCEL_ENV to "production" | "preview" | "development".
// Falls back to NODE_ENV for non-Vercel builds so staging/local never gets indexed.
export const IS_PRODUCTION = process.env.VERCEL_ENV
  ? process.env.VERCEL_ENV === "production"
  : process.env.NODE_ENV === "production";

const DEFAULT_KEYWORDS = [
  "church management software",
  "church management software Nigeria",
  "church administration software",
  "church workflow system",
  "church operations management tool",
  "church administration platform",
  "church accounting software",
  "church member management system",
  "church communication software",
  "church volunteer management software",
  "ministry management software",
  // Free / small-church tier — honest, low-competition, high-intent terms
  // the Starter plan genuinely satisfies (100 members, 3 users, membership +
  // attendance + small teams).
  "free church management software",
  "small church management software",
  "church management software for small churches",
  "cell group management app",
  "house church software",
  "free church attendance tracker",
  "church planting software",
  // Industry terms
  "ChMS",
  "church management system",
  // Feature-specific long-tail
  "church attendance tracking app",
  "church database software",
  "church department management",
  "church service scheduling software",
  "church check-in software",
  // Local
  "church management software Lagos",
  "church software for Nigerian pastors",
  "church management app Nigeria",
  "church management software Africa",
];

interface SeoProps {
  title: string;
  description: string;
  keywords?: string[];
  path?: string;
  ogImage?: string;
  /** Set true for pages that should not be indexed (auth, checkout, dashboard, etc). */
  noIndex?: boolean;
}

export function generateSeoMetadata({
  title,
  description,
  keywords = DEFAULT_KEYWORDS,
  path = "",
  ogImage = "/opengraph-image.png",
  noIndex = false,
}: SeoProps): Metadata {
  const url = `${BASE_URL}${path}`;

  return {
    title,
    description,
    keywords: keywords.join(", "),
    alternates: {
      canonical: url,
    },
    robots: noIndex
      ? { index: false, follow: false }
      : { index: true, follow: true },
    openGraph: {
      title,
      description,
      url,
      siteName: SITE_NAME,
      type: "website",
      images: [
        {
          url: `${BASE_URL}${ogImage}`,
          width: 1200,
          height: 630,
          alt: title,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [`${BASE_URL}${ogImage}`],
    },
  };
}
