"use client";

import { CheckCircle2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
} from "@/components/ui/dialog";
import Heading from "@/components/ui/typography/Heading";
import { Text } from "@/components/ui/typography/Text";
import { toSentenceCase } from "@/lib/utils";

export interface MemberLimitSuccessModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** "import" shows CSV-import copy ("Import Successful!"); "add" shows single-member copy ("Member Added!"). */
  context: "import" | "add";
  /** Number of members just added - only meaningful/shown for the "import" context. */
  addedCount?: number;
  current: number;
  limit: number;
  planName: string | null;
  daysRemaining?: number | null;
  /** Opens the Member Limit Reached modal (the "view plans" detail view) in the parent. */
  onViewUpgradePlans: () => void;
}

export function MemberLimitSuccessModal({
  open,
  onOpenChange,
  context,
  addedCount,
  current,
  limit,
  planName,
  daysRemaining,
  onViewUpgradePlans,
}: MemberLimitSuccessModalProps) {
  const planLabel = toSentenceCase(planName || "");
  const formattedLimit = limit.toLocaleString();
  const days = daysRemaining || 7;

  const title = context === "import" ? "Import Successful!" : "Member Added!";

  const message =
    context === "import" && addedCount
      ? `You've added ${addedCount.toLocaleString()} member${addedCount === 1 ? "" : "s"}. Your ${planLabel} plan supports ${formattedLimit} members. We've unlocked a ${days}-day Grace Period so you can experience full access to all members.`
      : `You now have ${current.toLocaleString()} members, which is over your ${planLabel} plan's ${formattedLimit} member limit. We've unlocked a ${days}-day Grace Period so you can experience full access to all members.`;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent showClose={false} className="sm:max-w-sm text-center">
        <DialogDescription className="sr-only">{title}</DialogDescription>

        <div className="flex flex-col items-center gap-4 py-2">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-green-100">
            <CheckCircle2 className="h-8 w-8 text-green-600" />
          </div>

          <div className="space-y-1.5">
            <Heading level={4}>{title}</Heading>
            <Text variant="muted" className="text-sm">
              {message}
            </Text>
          </div>

          <Button
            onClick={() => {
              return onOpenChange(false);
            }}
            className="w-full mt-2"
          >
            Got it
          </Button>

          <button
            type="button"
            onClick={onViewUpgradePlans}
            className="text-sm font-medium text-primary underline-offset-4 hover:underline"
          >
            View Upgrade Plans
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
