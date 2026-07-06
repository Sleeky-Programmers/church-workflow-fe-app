import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { GoogleAnalytics } from "@/components/analytics/GoogleAnalytics";
import {
  OrganizationJsonLd,
  SoftwareApplicationJsonLd,
} from "@/components/seo/JsonLd";
import "./globals.css";

import { Toaster } from "@/components/ui/toaster";

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
      </head>
      <body>
        {children}
        <Toaster />
      </body>
    </html>
  );
}
