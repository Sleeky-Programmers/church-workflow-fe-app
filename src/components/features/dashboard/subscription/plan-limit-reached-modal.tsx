"use client";

import { Check, Lock } from "lucide-react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
} from "@/components/ui/dialog";
import Heading from "@/components/ui/typography/Heading";
import { Text } from "@/components/ui/typography/Text";
import { toSentenceCase } from "@/lib/utils";

export interface PlanLimitReachedModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  limit: number;
  planName: string | null;
  /** Singular noun for the capped resource, e.g. "member" or "user". */
  resourceLabel: string;
  /** Plural noun, e.g. "members" or "users". */
  resourceLabelPlural: string;
  /** Display name of the next tier up, e.g. "Growth" - null once resolved if there is no higher plan. */
  nextPlanName?: string | null;
  /** True until the plans list has loaded - while true, the next-tier name/button are not guessed. */
  isNextPlanLoading?: boolean;
  /** Feature bullets for the next tier (from the plans list) - generic "Everything in X" lines are filtered by the caller. */
  features: string[];
  upgradeHref?: string;
}

export function PlanLimitReachedModal({
  open,
  onOpenChange,
  limit,
  planName,
  resourceLabel,
  resourceLabelPlural,
  nextPlanName,
  isNextPlanLoading = false,
  features,
  upgradeHref = "/dashboard/settings/billing",
}: PlanLimitReachedModalProps) {
  const router = useRouter();
  const planLabel = toSentenceCase(planName || "");
  const hasNextPlan = !isNextPlanLoading && !!nextPlanName;

  const description = isNextPlanLoading
    ? `You've reached your ${limit.toLocaleString()} ${resourceLabel} limit on the ${planLabel} plan. Upgrade to continue adding ${resourceLabelPlural} and unlock advanced features.`
    : hasNextPlan
      ? `You've reached your ${limit.toLocaleString()} ${resourceLabel} limit on the ${planLabel} plan. Upgrade to the ${nextPlanName} Plan to continue adding ${resourceLabelPlural} and unlock advanced features.`
      : `You've reached your ${limit.toLocaleString()} ${resourceLabel} limit on the ${planLabel} plan, and you're already on our highest available plan. Contact us to discuss a custom limit.`;

  const buttonLabel = isNextPlanLoading
    ? "Upgrade Plan"
    : hasNextPlan
      ? `Upgrade to ${nextPlanName}`
      : "Contact Us";

  const title = `${toSentenceCase(resourceLabel)} Limit Reached`;

  const handleUpgrade = () => {
    onOpenChange(false);
    router.push(upgradeHref);
  };

  // On the top plan (or when the next tier is sales-led) there's nothing to
  // Buy, so send them to the contact page instead.
  const handleContact = () => {
    onOpenChange(false);
    router.push("/contact");
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent showClose={false} className="sm:max-w-sm text-center">
        <DialogDescription className="sr-only">{title}</DialogDescription>

        <div className="flex flex-col items-center gap-4 py-2">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-amber-100">
            <Lock className="h-7 w-7 text-amber-500" />
          </div>

          <div className="space-y-1.5">
            <Heading level={4}>{title}</Heading>
            <Text variant="muted" className="text-sm">
              {description}
            </Text>
          </div>

          {features.length > 0 && (
            <div className="w-full space-y-2 rounded-lg bg-gray-50 p-3 text-left">
              {features.map((feature) => {
                return (
                  <div key={feature} className="flex items-center gap-2">
                    <Check className="h-4 w-4 shrink-0 text-green-500" />
                    <Text variant="default" className="text-sm">
                      {feature}
                    </Text>
                  </div>
                );
              })}
            </div>
          )}

          <div className="flex w-full gap-2 mt-2">
            <Button
              variant="outline"
              onClick={() => {
                return onOpenChange(false);
              }}
              className="flex-1"
            >
              Not Now
            </Button>
            <Button
              onClick={
                isNextPlanLoading
                  ? handleUpgrade
                  : hasNextPlan
                    ? handleUpgrade
                    : handleContact
              }
              className="flex-1"
            >
              {buttonLabel}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
