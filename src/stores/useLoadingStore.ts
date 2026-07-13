import { create } from "zustand";

type LoadingState = {
  activeRequests: number;
  isLoading: boolean;
  startRequest: () => void;
  endRequest: () => void;
};

export const useLoadingStore = create<LoadingState>((set) => ({
  activeRequests: 0,
  isLoading: false,
  startRequest: () => {
    set((state) => {
      const activeRequests = state.activeRequests + 1;
      return { activeRequests, isLoading: true };
    });
  },
  endRequest: () => {
    set((state) => {
      const activeRequests = Math.max(0, state.activeRequests - 1);
      return { activeRequests, isLoading: activeRequests > 0 };
    });
  },
}));
