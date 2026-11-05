import { create } from "zustand";

type CommandPaletteStore = {
  open: boolean;
  setOpen: (open: boolean) => void;
  toggle: () => void;
};

export const useCommandPaletteStore = create<CommandPaletteStore>()((set) => ({
  open: false,
  setOpen: (open) => set({ open }),
  toggle: () => set((state) => ({ open: !state.open })),
}));
