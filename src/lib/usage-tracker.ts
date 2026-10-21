import { sendUsageEvents, type UsageEvent } from "@/services/suggestionService";

// Usage is batched and sent quietly in the background. A failure here must
// never affect the page, so every path swallows its errors.
const FLUSH_DELAY_MS = 8000;
const MAX_QUEUE = 20;

let queue: UsageEvent[] = [];
let timer: ReturnType<typeof setTimeout> | null = null;

function hasSession(): boolean {
  try {
    return typeof window !== "undefined" && !!localStorage.getItem("accessToken");
  } catch {
    return false;
  }
}

export function flushUsage(keepalive = false) {
  if (timer) {
    clearTimeout(timer);
    timer = null;
  }
  if (!queue.length || !hasSession()) {
    queue = [];
    return;
  }

  const batch = queue.slice(0, MAX_QUEUE);
  queue = queue.slice(MAX_QUEUE);
  sendUsageEvents(batch, keepalive)?.catch(() => undefined);
}

function enqueue(event: UsageEvent) {
  if (!hasSession()) return;
  queue.push(event);
  if (queue.length >= MAX_QUEUE) {
    flushUsage();
    return;
  }
  if (!timer) {
    timer = setTimeout(() => flushUsage(), FLUSH_DELAY_MS);
  }
}

export function trackPageVisit(path: string, from?: string, seconds?: number) {
  enqueue({
    kind: "page",
    key: path,
    ...(from ? { from } : {}),
    ...(seconds ? { seconds: Math.min(Math.round(seconds), 3600) } : {}),
  });
}

/**
 * Records that the person completed something meaningful (marked attendance,
 * confirmed giving...). Keys must match the list the server knows about.
 */
export function trackAction(key: string) {
  enqueue({ kind: "action", key });
}
