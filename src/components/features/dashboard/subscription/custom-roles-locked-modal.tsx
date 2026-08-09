"use client";

import { Lock } from "lucide-react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
} from "@/components/ui/dialog";
import Heading from "@/components/ui/typography/Heading";
import { Text } from "@/components/ui/typography/Text";

export interface CustomRolesLockedModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Display name of the next tier that unlocks custom roles, e.g. "Growth" — null once resolved if there is no higher plan. */
  nextPlanName?: string | null;
  /** True until the plans list has loaded — while true, the next-tier name/button are not guessed. */
  isNextPlanLoading?: boolean;
  upgradeHref?: string;
}

export function CustomRolesLockedModal({
  open,
  onOpenChange,
  nextPlanName,
  isNextPlanLoading = false,
  upgradeHref = "/dashboard/settings/billing",
}: CustomRolesLockedModalProps) {
  const router = useRouter();
  const hasNextPlan = !isNextPlanLoading && !!nextPlanName;

  const description = isNextPlanLoading
    ? "Create specific permissions for your team. Available on a higher plan."
    : hasNextPlan
      ? `Create specific permissions for your team. Available on the ${nextPlanName} plan.`
      : "Create specific permissions for your team. You're already on our highest available plan.";

  const buttonLabel = isNextPlanLoading
    ? "Upgrade Plan"
    : hasNextPlan
      ? `Upgrade to ${nextPlanName}`
      : "No Upgrade Available";

  const handleUpgrade = () => {
    onOpenChange(false);
    router.push(upgradeHref);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent showClose={false} className="sm:max-w-sm text-center">
        <DialogDescription className="sr-only">
          Unlock Custom Roles
        </DialogDescription>

        <div className="flex flex-col items-center gap-4 py-2">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-gray-100">
            <Lock className="h-7 w-7 text-gray-500" />
          </div>

          <div className="space-y-1.5">
            <Heading level={4}>Unlock Custom Roles</Heading>
            <Text variant="muted" className="text-sm">
              {description}
            </Text>
          </div>

          <Button
            onClick={hasNextPlan ? handleUpgrade : undefined}
            disabled={!hasNextPlan}
            className="w-full mt-2"
          >
            {buttonLabel}
          </Button>

          <button
            type="button"
            onClick={handleUpgrade}
            className="text-sm font-medium text-primary underline-offset-4 hover:underline"
          >
            View Upgrade Plans
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
