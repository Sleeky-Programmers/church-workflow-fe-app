import type { Metadata } from "next";

export const BASE_URL = "https://churchworkflow.com";
export const SITE_NAME = "Church Workflow";

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
