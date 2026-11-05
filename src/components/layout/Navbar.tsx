"use client";

import { Bell, Search, Star, User } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useMemo } from "react";

import { RouteConfig } from "@/config/routes";
import { useModKeyLabel } from "@/components/features/search/command-palette";
import { useIsMobile } from "@/hooks/use-mobile";
import { useFavoritesStore } from "@/stores/useFavoritesStore";
import { useCommandPaletteStore } from "@/stores/useCommandPaletteStore";
import { useUserStore } from "@/stores/useUserStore";

import { Avatar, AvatarFallback } from "../ui/avatar";
import { BranchSwitcher } from "./BranchSwitcher";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "../ui/breadcrumb";
import { Button } from "../ui/button";
import { SidebarTrigger } from "../ui/sidebar";
import { Text } from "../ui/typography/Text";

export function Navbar() {
  const pathname = usePathname() || RouteConfig.dashboard.home;
  const isMobile = useIsMobile();
  const openPalette = useCommandPaletteStore((s) => s.setOpen);
  const modKeyLabel = useModKeyLabel();

  const { toggleFavorite, isFavorite } = useFavoritesStore();
  const { user, getUserFullName, fetchUserData } = useUserStore();
  const starred = isFavorite(pathname);

  // Fetch user data if not already loaded
  useEffect(() => {
    fetchUserData();
  }, [fetchUserData]);

  const pageLabel = useMemo(() => {
    const path = pathname.replace(/\/+$/, "");
    if (!path.startsWith("/dashboard")) return "Overview";
    const rest = path.replace(/^\/dashboard\/?/, "");
    if (!rest) return "Overview";
    return rest
      .split("/")[0]
      .replace(/[-_]+/g, " ")
      .replace(/\b\w/g, (c: string) => c.toUpperCase());
  }, [pathname]);

  const displayName = getUserFullName();

  if (isMobile) return null;

  return (
    <header className="w-full hidden md:flex flex items-center h-16 gap-2 px-3 md:px-6 border-b">
      <div className="flex items-center gap-2 min-w-0">
        <SidebarTrigger className="-ml-1" />
        <Button
          size="icon"
          variant={starred ? "starred" : "ghost"}
          aria-label="Star this page"
          onClick={() =>
            toggleFavorite({
              path: pathname,
              label: pageLabel,
            })
          }
        >
          <Star className="w-4 h-4" fill={starred ? "currentColor" : "none"} />
        </Button>
        <div className="hidden md:block min-w-0">
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink asChild>
                  <Link href={RouteConfig.dashboard.home}>Dashboard</Link>
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage>{pageLabel}</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>
      </div>

      <div className="ml-auto flex items-center gap-3">
        <Button
          size="icon"
          variant="ghost"
          className="sm:hidden"
          aria-label="Open search"
          onClick={() => openPalette(true)}
        >
          <Search className="w-4 h-4" />
        </Button>

        <button
          type="button"
          onClick={() => openPalette(true)}
          aria-label="Search (opens the command palette)"
          aria-keyshortcuts="Control+K Meta+K /"
          className="hidden sm:flex h-10 w-48 md:w-64 items-center gap-2 rounded-md border border-input bg-transparent px-3 text-sm text-muted-foreground shadow-sm transition-colors hover:bg-accent/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <Search className="w-4 h-4 shrink-0" />
          <span className="flex-1 truncate text-left">Search…</span>
          <kbd className="pointer-events-none hidden md:inline-flex select-none items-center rounded border bg-muted px-1.5 py-0.5 font-sans text-[10px] font-medium text-muted-foreground">
            {modKeyLabel}
          </kbd>
        </button>

        <BranchSwitcher />

        <Link href={RouteConfig.dashboard.notifications}>
          <Button size="icon" variant="ghost" aria-label="Notifications">
            <Bell className="w-4 h-4" />
          </Button>
        </Link>

        <Link href={RouteConfig.dashboard.admin.root}>
          <Button variant="ghost" className="flex items-center gap-2 p-0">
            <Avatar>
              <AvatarFallback>
                {displayName.charAt(0).toUpperCase() || (
                  <User className="w-4 h-4" />
                )}
              </AvatarFallback>
            </Avatar>
            <Text variant="default" className="hidden sm:block">
              {displayName}
            </Text>
          </Button>
        </Link>
      </div>
    </header>
  );
}
