"use client";

import { Bell, User } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useMemo } from "react";

import { RouteConfig } from "@/config/routes";
import { useUserStore } from "@/stores/useUserStore";

import { Avatar, AvatarFallback } from "../ui/avatar";
import { Button } from "../ui/button";
import { SidebarTrigger } from "../ui/sidebar";

/**
 * The one top bar for small screens: menu button, where you are, and quick
 * links. It lives in the dashboard layout so every page and sub-page has it,
 * and stays pinned while the page scrolls. (The desktop navbar covers
 * larger screens.)
 */
export function MobileTopBar() {
  const pathname = usePathname() || RouteConfig.dashboard.home;
  const getUserFullName = useUserStore((state) => state.getUserFullName);
  const displayName = getUserFullName();

  const pageLabel = useMemo(() => {
    const rest = pathname.replace(/\/+$/, "").replace(/^\/dashboard\/?/, "");
    if (!rest) return "Overview";
    return rest
      .split("/")[0]
      .replace(/[-_]+/g, " ")
      .replace(/\b\w/g, (c) => c.toUpperCase());
  }, [pathname]);

  return (
    <header className="sticky top-0 z-40 flex h-14 items-center gap-2 border-b bg-white px-3 md:hidden">
      <SidebarTrigger className="-ml-1 h-9 w-9 shrink-0" />

      <h1 className="min-w-0 flex-1 truncate text-base font-semibold text-gray-900">
        {pageLabel}
      </h1>

      <Link href={RouteConfig.dashboard.notifications} className="shrink-0">
        <Button size="icon" variant="ghost" aria-label="Notifications">
          <Bell className="h-4 w-4" />
        </Button>
      </Link>

      <Link
        href={RouteConfig.dashboard.admin.root}
        aria-label="Your account"
        className="shrink-0"
      >
        <Avatar className="h-8 w-8">
          <AvatarFallback>
            {displayName.charAt(0).toUpperCase() || (
              <User className="h-4 w-4" />
            )}
          </AvatarFallback>
        </Avatar>
      </Link>
    </header>
  );
}
