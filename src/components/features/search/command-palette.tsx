"use client";

import * as DialogPrimitive from "@radix-ui/react-dialog";
import { Command as CommandPrimitive } from "cmdk";
import {
  ArrowRight,
  Boxes,
  History,
  Layers,
  Loader2,
  Package,
  Search,
  ShieldUser,
  User as UserIcon,
  Users,
  X,
  type LucideIcon,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";

import {
  CommandGroup,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command";
import { DialogOverlay, DialogPortal } from "@/components/ui/dialog";
import {
  GLOBAL_SEARCH_MIN_LENGTH,
  useGlobalSearch,
} from "@/hooks/use-global-search";
import { cn } from "@/lib/utils";
import { useCommandPaletteStore } from "@/stores/useCommandPaletteStore";
import { useUserStore } from "@/stores/useUserStore";

import {
  FALLBACK_ICON,
  filterSearchIndex,
  getSearchIndex,
  type SearchIndexEntry,
} from "./search-index";

/* ------------------------------------------------------------------ */
/* Recent queries (per user, localStorage, best-effort)                */
/* ------------------------------------------------------------------ */

const RECENT_LIMIT = 5;
const recentKey = (userId: string) => `cw-search-recent:${userId}`;

function readRecent(userId: string | null): string[] {
  if (!userId) return [];
  try {
    const raw = window.localStorage.getItem(recentKey(userId));
    const parsed: unknown = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed)
      ? parsed.filter((q): q is string => typeof q === "string").slice(0, RECENT_LIMIT)
      : [];
  } catch {
    return [];
  }
}

function writeRecent(userId: string | null, query: string): string[] {
  if (!userId) return [];
  const next = [
    query,
    ...readRecent(userId).filter((q) => q.toLowerCase() !== query.toLowerCase()),
  ].slice(0, RECENT_LIMIT);
  try {
    window.localStorage.setItem(recentKey(userId), JSON.stringify(next));
  } catch {
    // Storage full or blocked (private mode): recents are a convenience only.
  }
  return next;
}

/* ------------------------------------------------------------------ */
/* Helpers                                                             */
/* ------------------------------------------------------------------ */

/** "⌘K" on Apple platforms, "Ctrl K" elsewhere. Resolved after mount to avoid hydration mismatches. */
export function useModKeyLabel() {
  const [label, setLabel] = useState("Ctrl K");
  useEffect(() => {
    const platform =
      (navigator as Navigator & { userAgentData?: { platform?: string } })
        .userAgentData?.platform ||
      navigator.platform ||
      navigator.userAgent;
    if (/mac|iphone|ipad|ipod/i.test(platform)) setLabel("⌘K");
  }, []);
  return label;
}

function isIconComponent(icon: unknown): icon is LucideIcon {
  return (
    typeof icon === "function" ||
    (typeof icon === "object" && icon !== null && "render" in icon)
  );
}

function EntryIcon({ icon }: { icon: unknown }) {
  const Icon = isIconComponent(icon) ? icon : FALLBACK_ICON;
  return <Icon className="text-muted-foreground" />;
}

function isTypingTarget(el: EventTarget | null) {
  if (!(el instanceof HTMLElement)) return false;
  const tag = el.tagName;
  return (
    tag === "INPUT" ||
    tag === "TEXTAREA" ||
    tag === "SELECT" ||
    el.isContentEditable
  );
}

const withSearch = (path: string, q: string) =>
  `${path}?${new URLSearchParams({ search: q })}`;

const DEFAULT_PAGE_COUNT = 6;

/* ------------------------------------------------------------------ */
/* Palette                                                             */
/* ------------------------------------------------------------------ */

export function CommandPalette() {
  const router = useRouter();
  const open = useCommandPaletteStore((s) => s.open);
  const setOpen = useCommandPaletteStore((s) => s.setOpen);
  const toggle = useCommandPaletteStore((s) => s.toggle);
  const churchRole = useUserStore((s) => s.user?.churchRole);
  const userId = useUserStore((s) => s.user?._id ?? null);

  const [input, setInput] = useState("");
  const [recent, setRecent] = useState<string[]>([]);

  const search = useGlobalSearch(input, open);
  const trimmed = input.trim();

  // Global shortcuts: Ctrl/Cmd+K toggles anywhere; "/" opens unless the
  // user is typing somewhere or another dialog already has focus.
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key.toLowerCase() === "k" && (e.metaKey || e.ctrlKey) && !e.altKey) {
        e.preventDefault();
        toggle();
        return;
      }
      if (
        e.key === "/" &&
        !e.metaKey &&
        !e.ctrlKey &&
        !e.altKey &&
        !e.defaultPrevented &&
        !useCommandPaletteStore.getState().open &&
        !isTypingTarget(e.target) &&
        !isTypingTarget(document.activeElement) &&
        !document.querySelector('[role="dialog"][data-state="open"]')
      ) {
        e.preventDefault();
        setOpen(true);
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [setOpen, toggle]);

  // Load recents when opening; clear the input when closing.
  useEffect(() => {
    if (open) setRecent(readRecent(userId));
    else setInput("");
  }, [open, userId]);

  const index = useMemo(() => getSearchIndex(churchRole), [churchRole]);
  const navEntries = useMemo(() => index.filter((e) => e.kind !== "action"), [index]);
  const actionEntries = useMemo(() => index.filter((e) => e.kind === "action"), [index]);

  const pages = useMemo(
    () =>
      trimmed
        ? filterSearchIndex(navEntries, trimmed, 8)
        : navEntries.filter((e) => e.kind === "page").slice(0, DEFAULT_PAGE_COUNT),
    [navEntries, trimmed],
  );
  const actions = useMemo(
    () => (trimmed ? filterSearchIndex(actionEntries, trimmed, 4) : actionEntries),
    [actionEntries, trimmed],
  );
  const recentMatches = useMemo(
    () =>
      trimmed
        ? recent.filter(
            (q) =>
              q.toLowerCase().includes(trimmed.toLowerCase()) &&
              q.toLowerCase() !== trimmed.toLowerCase(),
          )
        : recent,
    [recent, trimmed],
  );

  const results = search.results;
  const q = search.query;
  const recordCount =
    (results?.members?.length ?? 0) +
    (results?.departments?.length ?? 0) +
    (results?.smallTeams?.length ?? 0) +
    (results?.assets?.length ?? 0) +
    (results?.users?.length ?? 0);
  const totalCount = pages.length + actions.length + recordCount;

  const go = useCallback(
    (href: string) => {
      if (trimmed) setRecent(writeRecent(userId, trimmed));
      setOpen(false);
      router.push(href);
    },
    [router, setOpen, trimmed, userId],
  );

  const statusText = !trimmed
    ? ""
    : search.isLoading
      ? `${pages.length + actions.length} pages and actions, searching records…`
      : totalCount === 0
        ? `No results for ${trimmed}`
        : `${totalCount} result${totalCount === 1 ? "" : "s"}`;

  const showEmpty = !!trimmed && !search.isLoading && totalCount === 0;
  const tooShort = !!trimmed && trimmed.length < GLOBAL_SEARCH_MIN_LENGTH;

  return (
    <DialogPrimitive.Root open={open} onOpenChange={setOpen}>
      <DialogPortal>
        <DialogOverlay />
        <DialogPrimitive.Content
          aria-describedby="command-palette-description"
          className={cn(
            "fixed z-50 flex flex-col overflow-hidden bg-background shadow-lg outline-none",
            // Full screen on phones, centered panel from sm up.
            "inset-0 sm:inset-auto sm:left-1/2 sm:top-[12vh] sm:w-[calc(100%-2rem)] sm:max-w-xl sm:-translate-x-1/2 sm:rounded-lg sm:border",
            "data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
          )}
        >
          <DialogPrimitive.Title className="sr-only">Search</DialogPrimitive.Title>
          <DialogPrimitive.Description id="command-palette-description" className="sr-only">
            Search pages, settings, members, departments, small teams, assets and users.
          </DialogPrimitive.Description>

          <CommandPrimitive
            shouldFilter={false}
            loop
            label="Global search"
            className="flex min-h-0 flex-1 flex-col text-popover-foreground [&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:font-medium [&_[cmdk-group-heading]]:text-muted-foreground [&_[cmdk-item]]:px-2 [&_[cmdk-item]]:py-2.5"
          >
            <div className="flex items-center gap-2 border-b px-3" cmdk-input-wrapper="">
              <Search className="h-5 w-5 shrink-0 opacity-50" />
              <CommandPrimitive.Input
                value={input}
                onValueChange={setInput}
                maxLength={60}
                placeholder="Search pages, members, departments…"
                className="flex h-12 w-full bg-transparent text-base outline-none placeholder:text-muted-foreground sm:text-sm"
              />
              {search.isLoading && (
                <Loader2 className="h-4 w-4 shrink-0 animate-spin text-muted-foreground" aria-hidden />
              )}
              <DialogPrimitive.Close
                className="rounded-sm p-1 text-muted-foreground hover:text-foreground sm:hidden"
                aria-label="Close search"
              >
                <X className="h-5 w-5" />
              </DialogPrimitive.Close>
              <kbd className="hidden rounded border bg-muted px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground sm:inline-block">
                Esc
              </kbd>
            </div>

            <div aria-live="polite" role="status" className="sr-only">
              {statusText}
            </div>

            <CommandList className="max-h-none min-h-0 flex-1 sm:max-h-[min(60vh,480px)]">
              {recentMatches.length > 0 && (
                <CommandGroup heading="Recent">
                  {recentMatches.map((rq) => (
                    <CommandItem
                      key={`recent:${rq}`}
                      value={`recent:${rq}`}
                      onSelect={() => setInput(rq)}
                    >
                      <History className="text-muted-foreground" />
                      <span className="truncate">{rq}</span>
                    </CommandItem>
                  ))}
                </CommandGroup>
              )}

              {pages.length > 0 && (
                <CommandGroup heading="Pages">
                  {pages.map((entry) => (
                    <StaticItem key={entry.id} entry={entry} onSelect={go} />
                  ))}
                </CommandGroup>
              )}

              {actions.length > 0 && (
                <CommandGroup heading="Actions">
                  {actions.map((entry) => (
                    <StaticItem key={entry.id} entry={entry} onSelect={go} />
                  ))}
                </CommandGroup>
              )}

              {results?.members && results.members.length > 0 && (
                <>
                  <CommandSeparator />
                  <CommandGroup heading="Members">
                    {results.members.map((m) => (
                      <RecordItem
                        key={`member:${m._id}`}
                        value={`member:${m._id}`}
                        icon={UserIcon}
                        title={m.fullName}
                        subtitle={[m.phoneNumber, m.membershipStatus].filter(Boolean).join(" · ")}
                        onSelect={() => go(`/dashboard/membership/members/${m._id}`)}
                      />
                    ))}
                    <SeeAllItem
                      label="members"
                      q={q}
                      onSelect={() => go(withSearch("/dashboard/membership/members", q))}
                    />
                  </CommandGroup>
                </>
              )}

              {results?.departments && results.departments.length > 0 && (
                <CommandGroup heading="Departments">
                  {results.departments.map((d) => (
                    <RecordItem
                      key={`department:${d._id}`}
                      value={`department:${d._id}`}
                      icon={Layers}
                      title={d.name}
                      onSelect={() => go(`/dashboard/departments/${d._id}`)}
                    />
                  ))}
                  <SeeAllItem
                    label="departments"
                    q={q}
                    onSelect={() => go(withSearch("/dashboard/departments", q))}
                  />
                </CommandGroup>
              )}

              {results?.smallTeams && results.smallTeams.length > 0 && (
                <CommandGroup heading="Small teams">
                  {results.smallTeams.map((t) => (
                    <RecordItem
                      key={`team:${t._id}`}
                      value={`team:${t._id}`}
                      icon={Users}
                      title={t.name}
                      // No small-team detail route yet: open the list filtered by name.
                      onSelect={() => go(withSearch("/dashboard/teams", t.name))}
                    />
                  ))}
                </CommandGroup>
              )}

              {results?.assets && results.assets.length > 0 && (
                <CommandGroup heading="Assets">
                  {results.assets.map((a) => (
                    <RecordItem
                      key={`asset:${a._id}`}
                      value={`asset:${a._id}`}
                      icon={Package}
                      title={a.name}
                      subtitle={[a.tag, a.category].filter(Boolean).join(" · ")}
                      onSelect={() => go(`/dashboard/asset-management/${a._id}`)}
                    />
                  ))}
                  <SeeAllItem
                    label="assets"
                    q={q}
                    onSelect={() => go(withSearch("/dashboard/asset-management", q))}
                  />
                </CommandGroup>
              )}

              {results?.users && results.users.length > 0 && (
                <CommandGroup heading="Users">
                  {results.users.map((u) => (
                    <RecordItem
                      key={`user:${u._id}`}
                      value={`user:${u._id}`}
                      icon={ShieldUser}
                      title={u.name}
                      subtitle={u.email}
                      onSelect={() => go(`/dashboard/settings/users/${u._id}`)}
                    />
                  ))}
                  {/* No "See all" here: the user-management page has no ?search= support yet. */}
                </CommandGroup>
              )}

              {search.isLoading && (
                <CommandPrimitive.Loading>
                  <div className="flex items-center gap-2 px-4 py-3 text-sm text-muted-foreground">
                    <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
                    Searching records…
                  </div>
                </CommandPrimitive.Loading>
              )}

              {search.error && !search.isLoading && (
                <p className="px-4 py-3 text-sm text-muted-foreground">
                  Couldn&apos;t search records right now. Pages and actions still work.
                </p>
              )}

              {search.partial && !search.isLoading && (
                <p className="px-4 py-2 text-xs text-muted-foreground">
                  Some sections took too long and may be missing results.
                </p>
              )}

              {tooShort && pages.length === 0 && actions.length === 0 && (
                <p className="px-4 py-6 text-center text-sm text-muted-foreground">
                  Type at least {GLOBAL_SEARCH_MIN_LENGTH} characters to search records.
                </p>
              )}

              {showEmpty && !tooShort && (
                <div className="flex flex-col items-center gap-1 px-4 py-10 text-center">
                  <Boxes className="h-6 w-6 text-muted-foreground" aria-hidden />
                  <p className="text-sm font-medium">No results for “{trimmed}”</p>
                  <p className="text-xs text-muted-foreground">
                    Try a name, phone number, asset tag or page name.
                  </p>
                </div>
              )}
            </CommandList>

            <div className="hidden items-center gap-4 border-t px-3 py-2 text-[11px] text-muted-foreground sm:flex">
              <span>
                <kbd className="font-sans">↑↓</kbd> to navigate
              </span>
              <span>
                <kbd className="font-sans">↵</kbd> to open
              </span>
              <span>
                <kbd className="font-sans">Esc</kbd> to close
              </span>
            </div>
          </CommandPrimitive>
        </DialogPrimitive.Content>
      </DialogPortal>
    </DialogPrimitive.Root>
  );
}

/* ------------------------------------------------------------------ */
/* Items                                                               */
/* ------------------------------------------------------------------ */

function StaticItem({
  entry,
  onSelect,
}: {
  entry: SearchIndexEntry;
  onSelect: (href: string) => void;
}) {
  return (
    <CommandItem value={entry.id} onSelect={() => onSelect(entry.href)}>
      <EntryIcon icon={entry.icon} />
      <span className="truncate">{entry.label}</span>
      {entry.parent && (
        <span className="ml-auto shrink-0 text-xs text-muted-foreground">{entry.parent}</span>
      )}
    </CommandItem>
  );
}

function RecordItem({
  value,
  icon: Icon,
  title,
  subtitle,
  onSelect,
}: {
  value: string;
  icon: LucideIcon;
  title: string;
  subtitle?: string;
  onSelect: () => void;
}) {
  return (
    <CommandItem value={value} onSelect={onSelect}>
      <Icon className="text-muted-foreground" />
      <div className="flex min-w-0 flex-col">
        <span className="truncate">{title}</span>
        {subtitle && <span className="truncate text-xs text-muted-foreground">{subtitle}</span>}
      </div>
    </CommandItem>
  );
}

function SeeAllItem({
  label,
  q,
  onSelect,
}: {
  label: string;
  q: string;
  onSelect: () => void;
}) {
  return (
    <CommandItem value={`see-all:${label}`} onSelect={onSelect} className="text-muted-foreground">
      <ArrowRight />
      <span className="truncate">
        See all {label} matching “{q}”
      </span>
    </CommandItem>
  );
}
