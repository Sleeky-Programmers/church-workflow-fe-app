import { create } from "zustand";

type CommandPaletteStore = {
  open: boolean;
  setOpen: (open: boolean) => void;
  toggle: () => void;
};

export const useCommandPaletteStore = create<CommandPaletteStore>()((set) => {
  return {
    open: false,
    setOpen: (open) => {
      return set({ open });
    },
    toggle: () => {
      return set((state) => {
        return { open: !state.open };
      });
    },
  };
});
