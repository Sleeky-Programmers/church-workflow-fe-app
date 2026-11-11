"use client";

import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";

import { flushUsage, trackPageVisit } from "@/lib/usage-tracker";

/**
 * Notes which dashboard pages a person opens (and what they open next) so
 * the app can offer helpful shortcuts. Renders nothing.
 */
export function UsageTracker() {
  const pathname = usePathname();
  const previous = useRef<{ path: string; at: number } | null>(null);

  useEffect(() => {
    if (!pathname?.startsWith("/dashboard")) {
      return;
    }

    const now = Date.now();
    const last = previous.current;
    const seconds = last ? (now - last.at) / 1000 : undefined;

    trackPageVisit(pathname, last?.path, last ? seconds : undefined);
    previous.current = { path: pathname, at: now };
  }, [pathname]);

  useEffect(() => {
    const onHide = () => {
      if (document.visibilityState === "hidden") {
        flushUsage(true);
      }
    };
    document.addEventListener("visibilitychange", onHide);
    return () => {
      return document.removeEventListener("visibilitychange", onHide);
    };
  }, []);

  return null;
}
