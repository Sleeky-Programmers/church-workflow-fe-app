import type { Metadata } from "next";
import { Raleway } from "next/font/google";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/layout/Sidebar";
import "./globals.css";
import { Navbar } from "@/components/layout/Navbar";

const raleway = Raleway({
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Church on Cloud",
  description: "Your Church workflow processes all in one place.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${raleway.className}`}>
        <SidebarProvider>
          <AppSidebar />

          <SidebarInset>
            <Navbar />
            <div className="p-4 md:p-6">{children}</div>
          </SidebarInset>
        </SidebarProvider>
      </body>
    </html>
  );
}
