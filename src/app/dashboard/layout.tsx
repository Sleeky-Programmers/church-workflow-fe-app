import type { Metadata } from "next";
import { DashboardGuard } from "@/components/auth/dashboard-guard";
import { SuggestionsProvider } from "@/components/features/dashboard/suggestions-context";
import { SuggestionsStrip } from "@/components/features/dashboard/suggestions-strip";
import { UsageTracker } from "@/components/layout/usage-tracker";
import { Navbar } from "@/components/layout/Navbar";
import { RecentTracker } from "@/components/layout/recent-tracker";
import { AppSidebar } from "@/components/layout/Sidebar";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";

export const metadata: Metadata = {
  title: process.env.NEXT_PUBLIC_APP_NAME || "Dashboard",
  description: "Your Church workflow processes all in one place.",
  robots: {
    index: false,
    follow: false,
  },
};

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <DashboardGuard>
      <SuggestionsProvider>
        <SidebarProvider>
          <RecentTracker />
          <UsageTracker />

          <div className="relative flex min-h-screen w-full bg-gray-50">
            <AppSidebar />

            <SidebarInset className="min-w-0">
              <Navbar />
              <main className="min-w-0 w-full p-3 sm:p-4 md:p-6">
                <SuggestionsStrip />
                {children}
              </main>
            </SidebarInset>
          </div>
        </SidebarProvider>
      </SuggestionsProvider>
    </DashboardGuard>
  );
}
