import type { Metadata, Viewport } from "next";
import "./globals.css";

import { Inter } from "next/font/google";

import { Suspense } from "react";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { AnalyticsPageView } from "@/components/analytics/AnalyticsPageView";
import { GoogleAnalytics } from "@/components/analytics/GoogleAnalytics";
import { Mixpanel } from "@/components/analytics/Mixpanel";
import {
  OrganizationJsonLd,
  SoftwareApplicationJsonLd,
} from "@/components/seo/JsonLd";
import { Toaster } from "@/components/ui/toaster";
import { BASE_URL, IS_PRODUCTION, SITE_NAME } from "@/lib/seo";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const appName = process.env.NEXT_PUBLIC_APP_NAME || SITE_NAME;

export const metadata: Metadata = {
  metadataBase: new URL(BASE_URL),
  title: {
    default: appName,
    template: `%s | ${SITE_NAME}`,
  },
  description: "Your Church workflow processes all in one place.",
  robots: {
    index: IS_PRODUCTION,
    follow: IS_PRODUCTION,
    googleBot: {
      index: IS_PRODUCTION,
      follow: IS_PRODUCTION,
    },
  },
  ...(process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION
    ? {
        verification: {
          google: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION,
        },
      }
    : {}),
  formatDetection: {
    telephone: false,
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#0C5FB3",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`overflow-x-hidden ${inter.variable}`}>
      <head>
        <OrganizationJsonLd />
        <SoftwareApplicationJsonLd />
        <GoogleAnalytics />
      </head>
      <body>
        <Mixpanel />
        <Suspense fallback={null}>
          <AnalyticsPageView />
        </Suspense>
        {children}
        <Toaster />
        <SpeedInsights />
      </body>
    </html>
  );
}
