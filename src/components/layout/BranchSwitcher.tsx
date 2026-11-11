"use client";

import { Check, ChevronsUpDown, Building2 } from "lucide-react";
import { useState } from "react";

import { useUserStore } from "@/stores/useUserStore";

import { Button } from "../ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";

export function BranchSwitcher({ fullWidth = false }: { fullWidth?: boolean }) {
  const { branches, activeBranchId, switchActiveBranch } = useUserStore();
  const [isSwitching, setIsSwitching] = useState(false);

  // Nothing to switch between for single-location churches - stay invisible.
  if (branches.length <= 1) {
    return null;
  }

  const activeBranch = branches.find((branch) => {
    return branch._id === activeBranchId;
  });

  const handleSwitch = async (branchId: string) => {
    if (branchId === activeBranchId || isSwitching) {
      return;
    }

    setIsSwitching(true);
    try {
      await switchActiveBranch(branchId);
      // No shared query cache across the dashboard's data hooks - a full
      // Reload is the only reliable way to guarantee every branch-scoped
      // View (members, attendance, services, ...) refetches under the
      // Newly active branch instead of showing stale cross-branch data.
      window.location.reload();
    } finally {
      setIsSwitching(false);
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          className={
            fullWidth
              ? "flex h-9 w-full items-center justify-between gap-2 px-3 text-sm"
              : "hidden md:flex items-center gap-2"
          }
          disabled={isSwitching}
        >
          <Building2 className="w-4 h-4 shrink-0" />
          <span
            className={
              fullWidth
                ? "min-w-0 flex-1 truncate text-left"
                : "max-w-[140px] truncate"
            }
          >
            {activeBranch?.name || "Select branch"}
          </span>
          <ChevronsUpDown className="w-4 h-4 shrink-0 opacity-50" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align={fullWidth ? "start" : "end"}
        className={
          fullWidth
            ? "w-[var(--radix-dropdown-menu-trigger-width)] min-w-56"
            : "w-56"
        }
      >
        <DropdownMenuLabel>Branches</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {branches.map((branch) => {
          return (
            <DropdownMenuItem
              key={branch._id}
              onClick={() => {
                return handleSwitch(branch._id);
              }}
              className="flex items-center justify-between"
            >
              <span className="truncate">{branch.name}</span>
              {branch._id === activeBranchId && (
                <Check className="w-4 h-4 shrink-0" />
              )}
            </DropdownMenuItem>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
