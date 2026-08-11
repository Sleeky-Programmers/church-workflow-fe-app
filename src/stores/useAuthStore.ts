import { create } from "zustand";
import { persist } from "zustand/middleware";
import { identifyMixpanelUser, resetMixpanel } from "@/lib/mixpanel";

type User = {
  id: string;
  name: string;
  email: string;
  role?: string;
};

type AuthStore = {
  user: User | null;
  isAuthenticated: boolean;
  setUser: (user: User | null) => void;
  logout: () => void;
};

export const useAuthStore = create<AuthStore>()(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: false,
      setUser: (user) => {
        if (user) {
          identifyMixpanelUser(user.id, {
            name: user.name,
            email: user.email,
            role: user.role,
          });
        }
        set({
          user,
          isAuthenticated: !!user,
        });
      },
      logout: () => {
        resetMixpanel();
        set({
          user: null,
          isAuthenticated: false,
        });
      },
    }),
    {
      name: "auth-storage",
    },
  ),
);
