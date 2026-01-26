"use client";

import React, { useMemo, useState, useEffect } from "react";
import { Bell, Search, Star, User } from "lucide-react";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "../ui/breadcrumb";
import { usePathname, useRouter } from "next/navigation";
import { Input } from "../ui/input";
import { SidebarTrigger } from "../ui/sidebar";
import { Button } from "../ui/button";
import { Avatar, AvatarFallback } from "../ui/avatar";
import Link from "next/link";
import { Text } from "../ui/typography/Text";
import clsx from "clsx";
import { useFavoritesStore } from "@/stores/useFavoritesStore";

const STARRED_PAGES_KEY = "starred-pages";

export function Navbar() {
  const pathname = usePathname() || "/dashboard";
  const router = useRouter();

  const [search, setSearch] = useState("");
  const [starredPages, setStarredPages] = useState<string[]>([]);

  const { toggleFavorite, isFavorite } = useFavoritesStore();

  const starred = isFavorite(pathname);

  const pageLabel = useMemo(() => {
    const path = pathname.replace(/\/+$/, "");

    if (!path.startsWith("/dashboard")) return "Overview";

    const rest = path.replace(/^\/dashboard\/?/, "");
    if (!rest) return "Overview";

    return rest
      .split("/")[0]
      .replace(/[-_]+/g, " ")
      .replace(/\b\w/g, (c) => c.toUpperCase());
  }, [pathname]);

  useEffect(() => {
    const stored = localStorage.getItem(STARRED_PAGES_KEY);
    if (stored) setStarredPages(JSON.parse(stored));
  }, []);

  const isStarred = starredPages.includes(pathname);

  const toggleStar = () => {
    const updated = isStarred
      ? starredPages.filter((p) => p !== pathname)
      : [...starredPages, pathname];

    setStarredPages(updated);
    localStorage.setItem(STARRED_PAGES_KEY, JSON.stringify(updated));
  };

  const handleSearch = () => {
    if (!search.trim()) return;
    router.push(`/dashboard/search?q=${encodeURIComponent(search)}`);
    setSearch("");
  };

  return (
    <header className="w-full flex items-center h-16 gap-2 px-3 md:px-6 border-b">
      <div className="flex items-center gap-2 min-w-0">
        <SidebarTrigger className="-ml-1" />

        <Button
          size="icon"
          variant="ghost"
          aria-label="Star this page"
          onClick={() =>
            toggleFavorite({
              path: pathname,
              label: pageLabel,
            })
          }
          className={clsx(
            starred
              ? "bg-primary/15 text-primary hover:bg-primary/20"
              : "hover:bg-muted",
          )}
        >
          <Star className={clsx("w-4 h-4", starred && "fill-primary")} />
        </Button>

        <div className="hidden md:block min-w-0">
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink asChild>
                  <Link href="/dashboard">Dashboard</Link>
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
          onClick={handleSearch}
        >
          <Search className="w-4 h-4" />
        </Button>

        <div className="hidden sm:block">
          <Input
            leftIcon={<Search className="w-4 h-4" />}
            placeholder="Search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSearch()}
            className="w-48 md:w-64"
          />
        </div>

        <Link href="/dashboard/notification">
          <Button size="icon" variant="ghost" aria-label="Notifications">
            <Bell className="w-4 h-4" />
          </Button>
        </Link>

        <Link href="/dashboard/settings">
          <div className="flex items-center gap-2 cursor-pointer">
            <Avatar>
              <AvatarFallback>
                <User className="w-4 h-4 text-primary" />
              </AvatarFallback>
            </Avatar>
            <Text variant="default" className="hidden sm:block">
              John Doe
            </Text>
          </div>
        </Link>
      </div>
    </header>
  );
}
