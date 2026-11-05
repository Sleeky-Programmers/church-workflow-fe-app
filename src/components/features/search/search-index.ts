import {
  CalendarCheck2,
  FileText,
  Gift,
  PackagePlus,
  UserPlus,
  type LucideIcon,
} from "lucide-react";

import { NAV_ITEMS } from "@/components/layout/Admin-layout/admin-sidebar";
import { hasAccessLevel } from "@/lib/access-control";
import { SidebarData } from "@/lib/data";
import type { SectionPermission, UserChurchRole } from "@/stores/useUserStore";

type AccessLevel = SectionPermission["accessLevel"];

export type SearchIndexEntry = {
  id: string;
  label: string;
  href: string;
  keywords: string[];
  kind: "page" | "setting" | "action";
  /** Parent label shown as a hint, e.g. "CW Members" or "Settings". */
  parent?: string;
  /** Module section(s) gating this entry; any one of them grants access. */
  section?: string | string[];
  level?: AccessLevel;
  // Sidebar icons are a mix of lucide components and imported SVGs.
  icon?: unknown;
};

/**
 * Which permission section guards each sidebar route. Mirrors the
 * `@RequirePermissions` sections on the matching backend controllers;
 * routes not listed here (overview, reports, settings) are open to every
 * signed-in admin.
 */
const SECTION_BY_PREFIX: Array<[prefix: string, section: string | string[]]> = [
  ["/dashboard/membership", "MEMBERS"],
  ["/dashboard/attendance", "ATTENDANCE"],
  ["/dashboard/departments", "DEPARTMENTS"],
  ["/dashboard/teams", "SMALL_TEAMS"],
  ["/dashboard/events", "EVENTS"],
  ["/dashboard/requests", "REQUESTS"],
  ["/dashboard/finance", ["GIVING", "GIVING_AND_EXPENSES"]],
  ["/dashboard/asset-management", "ASSETS"],
];

function sectionFor(href: string) {
  return SECTION_BY_PREFIX.find(
    ([prefix]) => href === prefix || href.startsWith(`${prefix}/`),
  )?.[1];
}

/** Extra words people type for a page that aren't in its label. */
const EXTRA_KEYWORDS: Record<string, string[]> = {
  "/dashboard": ["home", "overview", "dashboard"],
  "/dashboard/membership/dashboard": ["members", "membership"],
  "/dashboard/membership/attention-center": ["follow up", "pastoral", "care"],
  "/dashboard/membership/members": ["people", "guests", "directory"],
  "/dashboard/membership/settings": ["membership settings", "titles"],
  "/dashboard/attendance": ["services", "headcount", "check in"],
  "/dashboard/departments": ["units", "hod"],
  "/dashboard/teams": ["small groups", "cell", "home groups"],
  "/dashboard/events": ["calendar", "reminders", "programs"],
  "/dashboard/requests": ["requisitions", "approvals"],
  "/dashboard/finance": ["giving", "offering", "tithe", "expenses", "money"],
  "/dashboard/asset-management": ["assets", "inventory", "equipment"],
  "/dashboard/reports": ["analytics", "export"],
  "/dashboard/settings": ["admin", "settings"],
  "/dashboard/activity-log": ["audit", "history", "logs"],
  "/dashboard/settings/profile": ["church info", "profile"],
  "/dashboard/settings/users": ["admins", "invite", "team"],
  "/dashboard/settings/roles": ["permissions", "access"],
  "/dashboard/settings/branches": ["campus", "locations"],
  "/dashboard/settings/configurations": ["offering types", "payment methods"],
  "/dashboard/settings/preferences": ["theme", "notifications"],
  "/dashboard/settings/account": ["password", "security"],
  "/dashboard/settings/billing": ["subscription", "plan", "payment"],
};

function words(label: string) {
  return label
    .toLowerCase()
    .split(/[^a-z0-9]+/)
    .filter(Boolean);
}

function buildPages(): SearchIndexEntry[] {
  const entries: SearchIndexEntry[] = [];
  const seen = new Set<string>();

  const push = (entry: SearchIndexEntry) => {
    if (seen.has(entry.href)) return;
    seen.add(entry.href);
    entries.push(entry);
  };

  const sidebarItems = [...SidebarData.pages, ...SidebarData.footer];
  for (const item of sidebarItems) {
    // "Logout" lives in the sidebar footer but isn't a page to jump to.
    if (item.url.startsWith("/auth")) continue;
    const children = (item as { children?: Array<{ title: string; url: string }> })
      .children;

    if (children?.length) {
      for (const child of children) {
        push({
          id: `page:${child.url}`,
          label: child.title === "Dashboard" ? `${item.title} Dashboard` : child.title,
          href: child.url,
          parent: item.title,
          keywords: [
            ...words(item.title),
            ...words(child.title),
            ...(EXTRA_KEYWORDS[child.url] ?? []),
          ],
          kind: "page",
          section: sectionFor(child.url),
          level: "VIEW",
          icon: item.icon,
        });
      }
      continue;
    }

    push({
      id: `page:${item.url}`,
      label: item.title,
      href: item.url,
      keywords: [...words(item.title), ...(EXTRA_KEYWORDS[item.url] ?? [])],
      kind: "page",
      section: sectionFor(item.url),
      level: "VIEW",
      icon: item.icon,
    });
  }

  for (const item of NAV_ITEMS) {
    push({
      id: `setting:${item.href}`,
      label: item.label,
      href: item.href,
      parent: "Settings",
      keywords: [
        "settings",
        ...words(item.label),
        ...(EXTRA_KEYWORDS[item.href] ?? []),
      ],
      kind: "setting",
      icon: item.icon,
    });
  }

  return entries;
}

const ACTIONS: SearchIndexEntry[] = [
  {
    id: "action:add-member",
    label: "Add member",
    href: "/dashboard/membership/members",
    keywords: ["new member", "add guest", "register", "create member"],
    kind: "action",
    section: "MEMBERS",
    level: "MANAGE",
    icon: UserPlus satisfies LucideIcon,
  },
  {
    id: "action:record-giving",
    label: "Record giving",
    href: "/dashboard/finance/giving/new",
    keywords: ["offering", "tithe", "donation", "new giving", "batch"],
    kind: "action",
    section: "GIVING",
    level: "MANAGE",
    icon: Gift satisfies LucideIcon,
  },
  {
    id: "action:mark-attendance",
    label: "Mark attendance",
    href: "/dashboard/attendance",
    keywords: ["attendance", "headcount", "check in", "service"],
    kind: "action",
    section: "ATTENDANCE",
    level: "MANAGE",
    icon: CalendarCheck2 satisfies LucideIcon,
  },
  {
    id: "action:add-asset",
    label: "Add asset",
    href: "/dashboard/asset-management",
    keywords: ["new asset", "equipment", "inventory"],
    kind: "action",
    section: "ASSETS",
    level: "MANAGE",
    icon: PackagePlus satisfies LucideIcon,
  },
];

const STATIC_INDEX: SearchIndexEntry[] = [...buildPages(), ...ACTIONS];

export const FALLBACK_ICON = FileText;

function canSee(entry: SearchIndexEntry, role: UserChurchRole | null | undefined) {
  if (!entry.section) return true;
  const sections = Array.isArray(entry.section) ? entry.section : [entry.section];
  return sections.some((s) => hasAccessLevel(role, s, entry.level ?? "VIEW"));
}

/** Pages, settings and quick actions the given role is allowed to open. */
export function getSearchIndex(role: UserChurchRole | null | undefined) {
  return STATIC_INDEX.filter((entry) => canSee(entry, role));
}

/**
 * Rank static entries for a query: label prefix > word prefix in the
 * label > label contains > keyword match. Every query term must match
 * somewhere. An empty query returns nothing (the palette shows Recent
 * and a short default list instead).
 */
export function filterSearchIndex(
  entries: SearchIndexEntry[],
  rawQuery: string,
  limit = 8,
): SearchIndexEntry[] {
  const query = rawQuery.trim().toLowerCase();
  if (!query) return [];
  const terms = query.split(/\s+/).filter(Boolean);

  const scored: Array<{ entry: SearchIndexEntry; score: number }> = [];
  for (const entry of entries) {
    const label = entry.label.toLowerCase();
    const haystack = [label, entry.parent?.toLowerCase() ?? "", ...entry.keywords].join(" ");
    if (!terms.every((t) => haystack.includes(t))) continue;

    let score = 1;
    if (label === query) score = 5;
    else if (label.startsWith(query)) score = 4;
    else if (words(label).some((w) => w.startsWith(terms[0]))) score = 3;
    else if (label.includes(query)) score = 2;
    scored.push({ entry, score });
  }

  return scored
    .sort((a, b) => b.score - a.score || a.entry.label.localeCompare(b.entry.label))
    .slice(0, limit)
    .map((s) => s.entry);
}
