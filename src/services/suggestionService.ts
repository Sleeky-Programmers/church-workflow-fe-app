import { authenticatedFetch } from "@/lib/api";

export type SuggestionType =
  | "next_step"
  | "time_habit"
  | "neglected"
  | "pending_work"
  | "popular_for_role";

export interface Suggestion {
  id: string;
  type: SuggestionType;
  title: string;
  message: string;
  href: string;
  /** Places on screen this can appear beside, most specific first. */
  anchors?: string[];
  priority: number;
}

export interface UsageEvent {
  kind: "page" | "action";
  key: string;
  from?: string;
  seconds?: number;
}

export async function sendUsageEvents(events: UsageEvent[], keepalive = false) {
  if (!events.length) {
    return;
  }
  return authenticatedFetch<{ recorded: number }>("/suggestions/track", {
    method: "POST",
    body: JSON.stringify({ events }),
    keepalive,
  });
}

export async function fetchSuggestions(current?: string) {
  const query = current ? `?current=${encodeURIComponent(current)}` : "";
  return authenticatedFetch<{ suggestions: Suggestion[] }>(
    `/suggestions${query}`,
    { method: "GET" },
  );
}

export async function dismissSuggestion(suggestionId: string) {
  return authenticatedFetch<{ dismissed: boolean }>("/suggestions/dismiss", {
    method: "POST",
    body: JSON.stringify({ suggestionId }),
  });
}
