import { create } from "zustand";
import { persist } from "zustand/middleware";

type FavoritePage = {
  path: string;
  label: string;
};

type FavoritesStore = {
  favorites: FavoritePage[];
  toggleFavorite: (page: FavoritePage) => void;
  isFavorite: (path: string) => boolean;
  clearFavorites: () => void;
};

export const useFavoritesStore = create<FavoritesStore>()(
  persist(
    (set, get) => {
      return {
        favorites: [],

        toggleFavorite: (page) => {
          const exists = get().favorites.some((fav) => {
            return fav.path === page.path;
          });

          set({
            favorites: exists
              ? get().favorites.filter((fav) => {
                  return fav.path !== page.path;
                })
              : [...get().favorites, page],
          });
        },

        isFavorite: (path) => {
          return get().favorites.some((fav) => {
            return fav.path === path;
          });
        },

        clearFavorites: () => {
          return set({ favorites: [] });
        },
      };
    },
    {
      name: "favorites-pages",
    },
  ),
);
