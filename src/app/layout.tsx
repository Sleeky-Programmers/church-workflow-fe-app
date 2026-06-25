import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { GoogleAnalytics } from "@/components/analytics/GoogleAnalytics";
import {
  OrganizationJsonLd,
  SoftwareApplicationJsonLd,
} from "@/components/seo/JsonLd";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://churchworkflow.com"),
  title: {
    default: "Church Management Software in Nigeria | Church Workflow",
    template: "%s | Church Workflow",
  },
  description:
    "Church Workflow is a church administration software for managing members, communication, finance, and operations efficiently.",
  keywords: [
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
  ],
  robots: {
    index: true,
    follow: true,
  },
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
        <GoogleAnalytics />
        {children}
      </body>
    </html>
  );
}
