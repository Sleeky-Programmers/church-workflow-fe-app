import type { Metadata } from "next";
import "./globals.css";

import { Inter } from "next/font/google";

import { GoogleAnalytics } from "@/components/analytics/GoogleAnalytics";
import {
  OrganizationJsonLd,
  SoftwareApplicationJsonLd,
} from "@/components/seo/JsonLd";
import { Toaster } from "@/components/ui/toaster";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: process.env.NEXT_PUBLIC_APP_NAME,
  description: "Your Church workflow processes all in one place.",
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
        {children}
        <Toaster />
      </body>
    </html>
  );
}
