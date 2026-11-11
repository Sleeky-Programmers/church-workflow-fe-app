import { useAuthStore } from "@/stores/useAuthStore";
import { useFavoritesStore } from "@/stores/useFavoritesStore";
import { useRecentStore } from "@/stores/useRecentStore";
import { useUserStore } from "@/stores/useUserStore";
import { clearSelectedPlan } from "@/lib/plan-selection";
import { clearAuthSession } from "./session";
import { SESSION_SCOPED_STORAGE_KEYS } from "./storage-keys";

/**
 * Full logout: clears auth tokens/profile/onboarding state, resets every
 * persisted zustand store, and removes any other session-scoped
 * localStorage entries so nothing from this session survives.
 */
export async function logout(): Promise<void> {
  clearAuthSession();
  clearSelectedPlan();

  useAuthStore.getState().logout();
  useUserStore.getState().clearUserData();
  useFavoritesStore.getState().clearFavorites();
  useRecentStore.getState().clearRecents();

  if (typeof window !== "undefined") {
    SESSION_SCOPED_STORAGE_KEYS.forEach((key) => {
      return window.localStorage.removeItem(key);
    });
  }
}
