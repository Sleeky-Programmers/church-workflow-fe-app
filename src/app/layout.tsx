import type { Metadata } from "next";
import "./globals.css";
import Header from "@/components/features/landing/layout/header";
import Footer from "@/components/features/landing/layout/footer";

export const metadata: Metadata = {
  title: "Church Workflow",
  description: "Your Church workflow processes all in one place.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="overflow-x-hidden">
      <body>
        <Header />
        {children}
        <Footer />
      </body>
    </html>
  );
}
