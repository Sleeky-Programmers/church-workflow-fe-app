"use client";

import { ArrowRight, Lightbulb, X } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

import { cn } from "@/lib/utils";

import { useSuggestions } from "./suggestions-context";

const HOME = "/dashboard";

/**
 * Fallback home for suggestions that have no matching spot on screen (the
 * ones that do appear as bubbles beside their action). On the dashboard home
 * they show as cards; elsewhere as a slim strip.
 */
export function SuggestionsStrip() {
  const pathname = usePathname();
  const ctx = useSuggestions();
  const isHome = pathname === HOME;

  const visible = (ctx?.fallback ?? []).slice(0, isHome ? 4 : 2);
  if (!ctx || !visible.length) {
    return null;
  }

  return (
    <section
      aria-label="Suggestions for you"
      className={cn("mb-4", isHome ? "space-y-2" : "space-y-1.5")}
    >
      {isHome && (
        <div className="flex items-center gap-2 text-sm font-semibold text-gray-700">
          <Lightbulb className="h-4 w-4 text-amber-500" />
          Suggested for you
        </div>
      )}

      <div
        className={cn(
          isHome
            ? "grid gap-3 sm:grid-cols-2 xl:grid-cols-4"
            : "flex flex-col gap-1.5",
        )}
      >
        {visible.map((s) => {
          return (
            <div
              key={s.id}
              className={cn(
                "group relative flex items-center gap-3 rounded-2xl border border-blue-100 bg-white shadow-sm",
                isHome ? "p-4" : "px-4 py-2",
              )}
            >
              <Link href={s.href} className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold text-gray-900">
                  {s.title}
                </p>
                <p
                  className={cn(
                    "text-xs text-gray-500",
                    isHome ? "mt-0.5" : "truncate",
                  )}
                >
                  {s.message}
                </p>
              </Link>

              <Link
                href={s.href}
                aria-label={`Open ${s.title}`}
                className="shrink-0 rounded-full p-1.5 text-primary-600 hover:bg-blue-50"
              >
                <ArrowRight className="h-4 w-4" />
              </Link>
              <button
                type="button"
                onClick={() => {
                  return ctx.dismiss(s.id);
                }}
                aria-label="Dismiss suggestion"
                className="shrink-0 rounded-full p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          );
        })}
      </div>
    </section>
  );
}
