"use client";

import { ChevronDown, CornerDownRight } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { ComponentType, useState } from "react";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import { logout } from "@/lib/auth/logout";
import { SidebarData } from "@/lib/data";
import { ActiveTab } from "@/lib/enums";
import { cn } from "@/lib/utils";
import { useFavoritesStore } from "@/stores/useFavoritesStore";

import { BranchSwitcher } from "./BranchSwitcher";
import { SuggestionAnchor } from "@/components/features/dashboard/suggestion-anchor";

import { Span, Text } from "../ui/typography/Text";

export const normalizeIcon = (
  icon: any,
): ComponentType<{ className?: string }> => {
  // If it's already a valid component, return it
  if (
    typeof icon === "function" ||
    (typeof icon === "object" && icon?.render)
  ) {
    return icon;
  }

  // If it's an object with src (like from require/import)
  if (icon?.src || typeof icon === "object") {
    return ({ className }) => (
      <Image
        src={icon.src || icon}
        alt="icon"
        width={16}
        height={16}
        className={className}
      />
    );
  }

  // Fallback component
  return () => <span className="w-4 h-4" />;
};

export function AppSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<ActiveTab>(ActiveTab.FAVOURITES);
  const { favorites } = useFavoritesStore();
  const { isMobile, setOpenMobile } = useSidebar();

  const isActive = (url: string) => {
    if (!url) return false;
    const normalize = (p: string | null | undefined) =>
      p ? p.replace(/\/+$/, "").replace(/^$/, "") : "";
    const current = normalize(pathname);
    const target = normalize(url);
    return current === target;
  };

  const handleNavigate = () => {
    if (isMobile) {
      setOpenMobile(false);
    }
  };

  const handleLogout = async () => {
    // Clear localStorage session
    await logout();

    // Navigate to login page
    router.push("/auth/login");

    // Close mobile sidebar if open
    if (isMobile) {
      setOpenMobile(false);
    }
  };

  const comingSoonTitles: string[] = [];

  const mainPages = SidebarData.pages.filter(
    (p) => !comingSoonTitles.includes(p.title),
  );

  const comingSoonPages = SidebarData.pages.filter((p) =>
    comingSoonTitles.includes(p.title),
  );

  // A module is "active" when the current path lives under it, e.g.
  // /dashboard/membership/... highlights the Membership parent item.
  const isModuleActive = (page: (typeof SidebarData.pages)[number]) =>
    Boolean(page.url) && pathname.startsWith(page.url);

  const [openModules, setOpenModules] = useState<Record<string, boolean>>({});

  const toggleModule = (title: string) =>
    setOpenModules((prev) => ({ ...prev, [title]: !prev[title] }));

  return (
    <Sidebar>
      <SidebarContent>
        <SidebarHeader>
          <div className="px-2 sm:px-4 py-2 sm:py-3">
            <Link
              href="/"
              onClick={handleNavigate}
              className="flex items-center"
            >
              <Image
                src="/assets/logo/horizontal/main.png"
                alt="Church Workflow"
                width={160}
                height={48}
                priority
              />
            </Link>
          </div>

          {/* The desktop navbar carries the switcher; on mobile it lives here in the drawer. */}
          <div className="px-2 md:hidden">
            <BranchSwitcher fullWidth />
          </div>

          <SidebarMenu className="grid grid-cols-2 gap-2 sm:gap-3">
            <SidebarMenuItem>
              <SidebarMenuButton
                isActive={activeTab === ActiveTab.FAVOURITES}
                onClick={() => setActiveTab(ActiveTab.FAVOURITES)}
              >
                <Text
                  variant={
                    activeTab === ActiveTab.FAVOURITES ? "tab" : "tabInactive"
                  }
                >
                  Favourites
                </Text>
              </SidebarMenuButton>
            </SidebarMenuItem>

            <SidebarMenuItem>
              <SidebarMenuButton
                isActive={activeTab === ActiveTab.RECENT}
                onClick={() => setActiveTab(ActiveTab.RECENT)}
              >
                <Text
                  variant={
                    activeTab === ActiveTab.RECENT ? "tab" : "tabInactive"
                  }
                >
                  Recent
                </Text>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarHeader>

        {activeTab === ActiveTab.FAVOURITES && (
          <SidebarGroup>
            <SidebarGroupLabel>Favourites</SidebarGroupLabel>

            <SidebarGroupContent>
              {favorites.length === 0 ? (
                <Text variant="muted" className="px-3 py-2">
                  No starred pages yet
                </Text>
              ) : (
                <SidebarMenu>
                  {favorites.map((fav) => {
                    const active = isActive(fav.path);

                    return (
                      <SidebarMenuItem key={fav.path}>
                        <SidebarMenuButton asChild isActive={active}>
                          <Link
                            href={fav.path}
                            className="flex items-center gap-2"
                            onClick={handleNavigate}
                          >
                            <Span
                              variant={active ? "menuActive" : "menuInactive"}
                            >
                              •
                            </Span>
                            <Text variant="default">{fav.label}</Text>
                          </Link>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    );
                  })}
                </SidebarMenu>
              )}
            </SidebarGroupContent>
          </SidebarGroup>
        )}

        <SidebarGroup>
          <SidebarGroupLabel>Pages</SidebarGroupLabel>

          <SidebarGroupContent>
            <SidebarMenu>
              {mainPages.map((page) => {
                const hasChildren =
                  Array.isArray(page.children) && page.children.length > 0;
                const moduleActive = isModuleActive(page);
                const expanded = openModules[page.title] ?? moduleActive;
                const Icon = normalizeIcon(page.icon);

                return (
                  <SidebarMenuItem key={page.title}>
                    <SuggestionAnchor
                      id={[
                        `nav:${page.url}`,
                        ...(page.children ?? []).map((c) => `nav:${c.url}`),
                      ]}
                    >
                      <SidebarMenuButton
                        asChild={!hasChildren}
                        isActive={
                          hasChildren ? moduleActive : isActive(page.url)
                        }
                        onClick={
                          hasChildren
                            ? (e) => {
                                e.preventDefault();
                                toggleModule(page.title);
                              }
                            : undefined
                        }
                      >
                        {hasChildren ? (
                          <button
                            type="button"
                            className="flex w-full items-center gap-2"
                            aria-expanded={expanded}
                          >
                            <Icon className="h-4 w-4 text-primary" />
                            <Text variant="default">{page.title}</Text>
                            <ChevronDown
                              className={cn(
                                "ml-auto h-4 w-4 shrink-0 text-primary transition-transform",
                                expanded && "rotate-180",
                              )}
                            />
                          </button>
                        ) : (
                          <Link
                            href={page.url}
                            className="flex items-center gap-2"
                            onClick={handleNavigate}
                          >
                            <Icon className="h-4 w-4 text-primary" />
                            <Text variant="default">{page.title}</Text>
                          </Link>
                        )}
                      </SidebarMenuButton>
                    </SuggestionAnchor>

                    {hasChildren && expanded && (
                      <ul className="mx-3.5 flex min-w-0 translate-x-px flex-col gap-1 border-l border-sidebar-border px-2.5 py-0.5">
                        {(page.children ?? []).map((child) => {
                          const childActive = isActive(child.url);

                          return (
                            <li key={child.url}>
                              <SuggestionAnchor
                                id={`nav:${child.url}`}
                                weight={2}
                              >
                                <Link
                                  href={child.url}
                                  onClick={handleNavigate}
                                  data-active={childActive}
                                  className={cn(
                                    "flex h-8 min-w-0 -translate-x-px items-center gap-2 rounded-md px-2 text-sm outline-none transition-colors hover:bg-sidebar-accent hover:text-primary",
                                    childActive &&
                                      "bg-sidebar-accent font-medium text-primary",
                                    !childActive && "text-sidebar-foreground",
                                  )}
                                >
                                  <CornerDownRight
                                    className={cn(
                                      "h-4 w-4 shrink-0 transition-colors",
                                      moduleActive
                                        ? "text-primary"
                                        : "text-sidebar-foreground",
                                    )}
                                  />
                                  <span className="truncate">
                                    {child.title}
                                  </span>
                                </Link>
                              </SuggestionAnchor>
                            </li>
                          );
                        })}
                      </ul>
                    )}
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {comingSoonPages.length > 0 && (
          <SidebarGroup>
            <SidebarGroupLabel>Coming Soon Pages</SidebarGroupLabel>

            <SidebarGroupContent>
              <SidebarMenu>
                {comingSoonPages.map((page) => {
                  const Icon = normalizeIcon(page.icon);

                  return (
                    <SidebarMenuItem key={page.title}>
                      <div className="flex items-center gap-2 px-3 py-2 opacity-50 cursor-not-allowed">
                        <Icon className="h-4 w-4" />
                        <Text variant="default">{page.title}</Text>
                      </div>
                    </SidebarMenuItem>
                  );
                })}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        )}

        {/* <SidebarFooter className="mt-auto">
          <SidebarMenu>
            {SidebarData.footer.map((page) => (
              <SidebarMenuItem key={page.title}>
                <SidebarMenuButton asChild isActive={isActive(page.url)}>
                  <Link href={page.url} onClick={handleNavigate}>
                    <page.icon />
                    <Text>{page.title}</Text>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarFooter> */}
        <SidebarFooter className="mt-auto">
          <SidebarMenu>
            {SidebarData.footer.map((page) => (
              <SidebarMenuItem key={page.title}>
                {page.title === "Logout" ? (
                  <SidebarMenuButton asChild isActive={false}>
                    <button
                      onClick={handleLogout}
                      className="flex items-center gap-2 w-full"
                    >
                      <page.icon />
                      <Text>{page.title}</Text>
                    </button>
                  </SidebarMenuButton>
                ) : (
                  <SidebarMenuButton asChild isActive={isActive(page.url)}>
                    <Link href={page.url} onClick={handleNavigate}>
                      <page.icon />
                      <Text>{page.title}</Text>
                    </Link>
                  </SidebarMenuButton>
                )}
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarFooter>
      </SidebarContent>
    </Sidebar>
  );
}
