import mixpanel from "mixpanel-browser";

let initialized = false;
let recording = false;

// Routes whose sessions get recorded by Session Replay. Recording is scoped
// (rather than site-wide) to keep the monthly replay quota spent on the
// conversion-critical flow - the public marketing pages get event tracking
// via trackEvent/autocapture but not full replay.
// "/" matches only the exact home route; every other entry also matches its
// sub-paths (e.g. "/dashboard" covers "/dashboard/settings/...").
const RECORDED_PATHS = ["/auth/signup", "/onboarding", "/dashboard"];

function isPathRecorded(pathname: string): boolean {
  return RECORDED_PATHS.some(
    (path) => pathname === path || pathname.startsWith(`${path}/`),
  );
}

export function initMixpanel() {
  if (initialized || typeof window === "undefined") return;

  const token = process.env.NEXT_PUBLIC_MIXPANEL_TOKEN;
  if (!token) return;

  mixpanel.init(token, {
    persistence: "localStorage",
    // App Router route changes are tracked manually via AnalyticsPageView.
    track_pageview: false,
    debug: process.env.NODE_ENV !== "production",
    // Only needed if the Mixpanel project uses EU data residency - set to
    // https://api-eu.mixpanel.com in that case. Defaults to Mixpanel's own
    // US host when unset.
    ...(process.env.NEXT_PUBLIC_MIXPANEL_API_HOST
      ? { api_host: process.env.NEXT_PUBLIC_MIXPANEL_API_HOST }
      : {}),
    // Recording is started/stopped manually per route (see
    // syncSessionRecording) rather than sampled automatically here, so it
    // stays scoped to RECORDED_PATHS. Input values are still masked by
    // default (record_mask_inputs) to avoid capturing passwords/PII typed
    // into forms on the routes that are recorded.
    record_sessions_percent: 0,
    record_min_ms: 0,
    // Auto-captures clicks/submits/pageviews without manual trackEvent calls,
    // so replay sessions are paired with a corresponding event trail.
    autocapture: true,
  });
  initialized = true;
}

/**
 * Starts or stops Session Replay to match RECORDED_PATHS for the current
 * route. Call on initial mount and on every client-side route change.
 */
export function syncSessionRecording(pathname: string) {
  if (!initialized) return;

  const shouldRecord = isPathRecorded(pathname);

  if (shouldRecord && !recording) {
    mixpanel.start_session_recording();
    recording = true;
  } else if (!shouldRecord && recording) {
    mixpanel.stop_session_recording();
    recording = false;
  }
}

export function trackMixpanelEvent(
  name: string,
  props?: Record<string, string | number | boolean | undefined>,
) {
  if (!initialized) return;
  mixpanel.track(name, props);
}

interface MixpanelUserTraits {
  /** Maps to Mixpanel's reserved $name - shown as the profile/session label in the dashboard. */
  name?: string;
  /** Maps to Mixpanel's reserved $email. */
  email?: string;
  /** Maps to Mixpanel's reserved $avatar - shown next to the name in Session Replay/People. */
  avatarUrl?: string;
  /** Any other properties are sent as-is (e.g. role, church name). */
  [key: string]: string | number | boolean | undefined;
}

export function identifyMixpanelUser(id: string, traits?: MixpanelUserTraits) {
  if (!initialized) return;
  mixpanel.identify(id);

  if (!traits) return;

  const { name, email, avatarUrl, ...rest } = traits;
  mixpanel.people.set({
    ...(name ? { $name: name } : {}),
    ...(email ? { $email: email } : {}),
    ...(avatarUrl ? { $avatar: avatarUrl } : {}),
    ...rest,
  });
}

export function resetMixpanel() {
  if (!initialized) return;
  mixpanel.reset();
}
