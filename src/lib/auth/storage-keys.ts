/**
 * LocalStorage keys (outside the core auth/onboarding keys handled by
 * clearAuthSession) that hold session- or user-scoped data and must be
 * wiped whenever a session ends, so one user's data never leaks into the
 * next session on a shared device.
 */
export const SESSION_SCOPED_STORAGE_KEYS = [
  "auth-storage", // UseAuthStore
  "user-profile-storage", // UseUserStore
  "favorites-pages", // UseFavoritesStore
  "recent-pages", // UseRecentStore
  "checkout:selected-plan", // Plan-selection
  "dashboard:events",
];
