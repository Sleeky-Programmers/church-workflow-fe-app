// stores/useUserStore.ts
import { create } from "zustand";
import { persist } from "zustand/middleware";

import { getMyBranches, getMyChurch, switchBranch } from "@/lib/api";
import { getCurrentUserProfile } from "@/lib/auth/session";
import { getProfile } from "@/services/userServices";
import { identifyMixpanelUser } from "@/lib/mixpanel";

export type SectionPermission = {
  moduleSection: string;
  accessLevel: "NO_ACCESS" | "VIEW" | "MANAGE" | "FULL_ACCESS";
};

export type UserChurchRole = {
  _id: string;
  roleName: string;
  type: string;
  permissions: SectionPermission[];
};

export type User = {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string | null;
  title: string | null;
  profileImage: string | null;
  isVerified: boolean;
  churchRole: UserChurchRole;
  createdAt: string;
  updatedAt: string;
};

export type Church = {
  _id: string;
  name: string;
  alias: string;
  address: string;
  country: string;
  state: string;
  defaultCurrency: string;
  logoUrl: string | null;
  location?: string;
};

export type Branch = {
  _id: string;
  name: string;
  alias: string | null;
  isHQ: boolean;
  isActive: boolean;
};

type UserStore = {
  // State
  user: User | null;
  church: Church | null;
  branches: Branch[];
  activeBranchId: string | null;
  accessScope: "BRANCH" | "ORG_WIDE" | null;
  isLoading: boolean;
  error: string | null;
  lastFetched: number | null;

  // Actions
  fetchUserData: (forceRefresh?: boolean) => Promise<void>;
  updateUser: (updatedUser: Partial<User>) => void;
  updateChurch: (updatedChurch: Partial<Church>) => void;
  setUser: (user: User | null) => void;
  setChurch: (church: Church | null) => void;
  switchActiveBranch: (branchId: string) => Promise<void>;
  clearUserData: () => void;
  getUserFullName: () => string;
  getUserChurchRole: () => string;
};

// Cache duration (5 minutes)
const CACHE_DURATION = 5 * 60 * 1000;

export const useUserStore = create<UserStore>()(
  persist(
    (set, get) => ({
      // Initial state
      user: null,
      church: null,
      branches: [],
      activeBranchId: null,
      accessScope: null,
      isLoading: false,
      error: null,
      lastFetched: null,

      // Fetch user data from API
      fetchUserData: async (forceRefresh = false) => {
        const { lastFetched, isLoading } = get();
        const now = Date.now();

        // Return cached data if it's still valid and not forcing refresh
        if (
          !forceRefresh &&
          lastFetched &&
          now - lastFetched < CACHE_DURATION &&
          !isLoading
        ) {
          return;
        }

        // Prevent multiple simultaneous requests
        if (isLoading) return;

        set({ isLoading: true, error: null });

        try {
          const [userData, churchData, branchData] = await Promise.all([
            getProfile() as any,
            getMyChurch(),
            getMyBranches().catch(() => null),
          ]);

          set({
            user: userData,
            church: churchData,
            branches: branchData?.branches || [],
            activeBranchId: branchData?.activeBranchId || null,
            accessScope: branchData?.accessScope || null,
            isLoading: false,
            lastFetched: now,
            error: null,
          });

          // Enrich the Mixpanel profile beyond the basic name/email set at
          // login, so recordings in the dashboard are easy to identify by
          // full name, role, and church — not just an anonymous session id.
          if (userData) {
            const fullName =
              [userData.firstName, userData.lastName]
                .filter(Boolean)
                .join(" ") || undefined;

            identifyMixpanelUser(userData._id, {
              name: fullName,
              email: userData.email,
              avatarUrl: userData.profileImage || undefined,
              role: userData.churchRole?.roleName,
              church: churchData?.name,
            });
          }
        } catch (error: any) {
          set({
            error: error.message || "Failed to load profile",
            isLoading: false,
          });
        }
      },

      // Update user data locally (after successful API update)
      updateUser: (updatedUser: Partial<User>) => {
        set((state) => ({
          user: state.user ? { ...state.user, ...updatedUser } : null,
        }));
      },

      // Update church data locally (after successful API update)
      updateChurch: (updatedChurch: Partial<Church>) => {
        set((state) => ({
          church: state.church ? { ...state.church, ...updatedChurch } : null,
        }));
      },

      // Set user directly
      setUser: (user) => set({ user }),

      // Set church directly
      setChurch: (church) => set({ church }),

      // Switch the active branch: reissues tokens scoped to the new branch,
      // then refetches branch-scoped profile state so every view reflects it.
      switchActiveBranch: async (branchId: string) => {
        const tokens = await switchBranch(branchId);
        localStorage.setItem("accessToken", tokens.accessToken);
        localStorage.setItem("refreshToken", tokens.refreshToken);

        set({ activeBranchId: branchId });
        await get().fetchUserData(true);
      },

      // Clear all user data (e.g., on logout)
      clearUserData: () => {
        set({
          user: null,
          church: null,
          branches: [],
          activeBranchId: null,
          accessScope: null,
          error: null,
          lastFetched: null,
        });
      },

      // Helper function to get full name
      getUserFullName: () => {
        const { user } = get();
        if (user?.firstName && user?.lastName) {
          return `${user.firstName} ${user.lastName}`;
        }
        if (user?.firstName) return user.firstName;
        if (user?.lastName) return user.lastName;
        return "User";
      },

      // Helper function to get church role
      getUserChurchRole: () => {
        const { user } = get();
        return user?.churchRole?.roleName || "Member";
      },
    }),
    {
      name: "user-profile-storage",
      // Only persist these fields
      partialize: (state) => ({
        user: state.user,
        church: state.church,
        branches: state.branches,
        activeBranchId: state.activeBranchId,
        accessScope: state.accessScope,
        lastFetched: state.lastFetched,
      }),
    },
  ),
);
