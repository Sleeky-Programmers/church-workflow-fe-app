"use client";

import { BounceLoader } from "@/components/ui/BounceLoader";
import { useLoadingStore } from "@/stores/useLoadingStore";

export function GlobalLoader() {
  const isLoading = useLoadingStore((state) => state.isLoading);

  if (!isLoading) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-white/70 backdrop-blur-sm">
      <BounceLoader />
    </div>
  );
}
