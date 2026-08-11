import mixpanel from "mixpanel-browser";

let initialized = false;

export function initMixpanel() {
  if (initialized || typeof window === "undefined") return;

  const token = process.env.NEXT_PUBLIC_MIXPANEL_TOKEN;
  if (!token) return;

  mixpanel.init(token, {
    persistence: "localStorage",
    // App Router route changes are tracked manually via AnalyticsPageView.
    track_pageview: false,
    debug: process.env.NODE_ENV !== "production",
    // Only needed if the Mixpanel project uses EU data residency — set to
    // https://api-eu.mixpanel.com in that case. Defaults to Mixpanel's own
    // US host when unset.
    ...(process.env.NEXT_PUBLIC_MIXPANEL_API_HOST
      ? { api_host: process.env.NEXT_PUBLIC_MIXPANEL_API_HOST }
      : {}),
    // Record every session (public landing pages + authenticated dashboard
    // alike) so the full visitor -> signed-in-user journey shows up in
    // Mixpanel's Session Replay. Input values are still masked by default
    // (record_mask_inputs) to avoid capturing passwords/PII typed into forms.
    record_sessions_percent: 100,
    record_min_ms: 0,
    // Auto-captures clicks/submits/pageviews without manual trackEvent calls,
    // so replay sessions are paired with a corresponding event trail.
    autocapture: true,
  });
  initialized = true;
}

export function trackMixpanelEvent(
  name: string,
  props?: Record<string, string | number | boolean | undefined>,
) {
  if (!initialized) return;
  mixpanel.track(name, props);
}

export function identifyMixpanelUser(
  id: string,
  traits?: Record<string, string | number | boolean | undefined>,
) {
  if (!initialized) return;
  mixpanel.identify(id);
  if (traits) mixpanel.people.set(traits);
}

export function resetMixpanel() {
  if (!initialized) return;
  mixpanel.reset();
}
