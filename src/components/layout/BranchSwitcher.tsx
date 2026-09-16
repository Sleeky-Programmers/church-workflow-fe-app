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

export function BranchSwitcher() {
  const { branches, activeBranchId, switchActiveBranch } = useUserStore();
  const [isSwitching, setIsSwitching] = useState(false);

  // Nothing to switch between for single-location churches - stay invisible.
  if (branches.length <= 1) return null;

  const activeBranch = branches.find((branch) => branch._id === activeBranchId);

  const handleSwitch = async (branchId: string) => {
    if (branchId === activeBranchId || isSwitching) return;

    setIsSwitching(true);
    try {
      await switchActiveBranch(branchId);
      // No shared query cache across the dashboard's data hooks - a full
      // reload is the only reliable way to guarantee every branch-scoped
      // view (members, attendance, services, ...) refetches under the
      // newly active branch instead of showing stale cross-branch data.
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
          className="hidden md:flex items-center gap-2"
          disabled={isSwitching}
        >
          <Building2 className="w-4 h-4" />
          <span className="max-w-[140px] truncate">
            {activeBranch?.name || "Select branch"}
          </span>
          <ChevronsUpDown className="w-4 h-4 opacity-50" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel>Branches</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {branches.map((branch) => (
          <DropdownMenuItem
            key={branch._id}
            onClick={() => handleSwitch(branch._id)}
            className="flex items-center justify-between"
          >
            <span className="truncate">{branch.name}</span>
            {branch._id === activeBranchId && (
              <Check className="w-4 h-4 shrink-0" />
            )}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
