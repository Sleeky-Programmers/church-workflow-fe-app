"use client";

import { X } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { MdError, MdInfo, MdWarning } from "react-icons/md";

import { Button } from "@/components/ui/button";
import { cn, toSentenceCase } from "@/lib/utils";
import { PlanLimitStatus } from "@/types";

type BannerColor = "blue" | "red" | "amber";

const bannerStyles: Record<BannerColor, string> = {
  blue: "border-blue-200 bg-blue-50",
  red: "border-red-200 bg-red-50",
  amber: "border-amber-200 bg-amber-50",
};

const iconColors: Record<BannerColor, string> = {
  blue: "text-primary-500",
  red: "text-red-500",
  amber: "text-amber-500",
};

export interface LimitBannerProps {
  /** Stable reference (module-level export) - an inline arrow function will refetch on every render. */
  fetchStatus: () => Promise<PlanLimitStatus>;
  /**
   * @deprecated No longer used. Dismissing only hides the banner until the
   * page is reloaded or the user navigates away, so it isn't remembered.
   */
  dismissKey?: string;
  /** Plural noun used in messaging, e.g. "members", "user seats". */
  resourceLabel: string;
  /** Limit noun used in messaging, e.g. "member limit", "user seat limit". */
  resourceLimitLabel: string;
  upgradeHref?: string;
  /** Extra classes for the outer wrapper - use this to add page-specific spacing (e.g. full-bleed pages need horizontal margin the caller's padded container already provides). */
  className?: string;
}

export function LimitBanner({
  fetchStatus,
  resourceLabel,
  resourceLimitLabel,
  upgradeHref = "/dashboard/settings/billing",
  className,
}: LimitBannerProps) {
  const router = useRouter();
  const [isVisible, setIsVisible] = useState(true);
  const [status, setStatus] = useState<PlanLimitStatus | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    (async () => {
      try {
        const data = await fetchStatus();
        if (isMounted) setStatus(data);
      } catch (err) {
        console.error("Failed to fetch limit status:", err);
      } finally {
        if (isMounted) setLoading(false);
      }
    })();

    return () => {
      isMounted = false;
    };
  }, [fetchStatus]);

  // Dismissing is temporary: the banner lives in component state only, so it
  // shows again after a reload or when the user comes back to the page.
  const handleDismiss = () => setIsVisible(false);

  if (loading || !status || !isVisible) return null;

  const {
    current,
    limit,
    percentage,
    isWithinGracePeriod,
    isNearLimit,
    daysRemaining,
    planName,
    gracePeriodEnds,
  } = status;

  // Work it out from the counts: some status endpoints report `isOverLimit`
  // when the limit is merely reached. Reaching it is a warning (amber); only
  // going past it is an error (red).
  const hasLimit = limit > 0;
  const exceeded = hasLimit && current > limit;
  const atLimit = hasLimit && current === limit;
  const plan = toSentenceCase(planName || "");

  if (!isNearLimit && !atLimit && !exceeded) return null;

  let bannerColor: BannerColor = "blue";
  let title = "";
  let message = "";

  if (exceeded && isWithinGracePeriod) {
    bannerColor = "blue";
    title = "Action Required:";
    const formattedDate = gracePeriodEnds
      ? new Date(gracePeriodEnds).toLocaleDateString("en-US", {
          month: "long",
          day: "numeric",
          year: "numeric",
        })
      : "soon";
    message = `Your ${daysRemaining || 7}-day grace period to manage over-limit ${resourceLabel} ends on ${formattedDate}. Upgrade to prevent dashboard restrictions.`;
  } else if (exceeded) {
    bannerColor = "red";
    title = "Over Limit:";
    message = `Your ${plan} plan has ${current} ${resourceLabel}, which is over the ${limit} ${resourceLimitLabel}. Upgrade now to keep adding ${resourceLabel}.`;
  } else if (atLimit) {
    bannerColor = "amber";
    title = "Limit Reached:";
    message = `You're using all ${limit} ${resourceLabel} on your ${plan} plan. Upgrade to add more.`;
  } else if (isNearLimit) {
    bannerColor = "amber";
    title = "Approaching Limit:";
    message = `You have ${current} out of ${limit} ${resourceLabel} (${Math.round(percentage)}%). Consider upgrading to avoid reaching the limit.`;
  }

  const Icon =
    bannerColor === "red"
      ? MdError
      : bannerColor === "amber"
        ? MdWarning
        : MdInfo;

  return (
    <div
      className={cn(
        "flex flex-col gap-3 rounded-lg border px-4 py-3 sm:flex-row sm:items-center",
        bannerStyles[bannerColor],
        className,
      )}
    >
      <div className="flex flex-1 items-start gap-3">
        <Icon
          className={`${iconColors[bannerColor]} mt-0.5 shrink-0 sm:mt-0`}
          size={22}
        />
        <p className="flex-1 text-sm text-gray-700">
          <span className="font-semibold">{title}</span> {message}
        </p>
      </div>

      <div className="flex items-center gap-3 self-stretch sm:self-auto">
        <Button
          onClick={() => router.push(upgradeHref)}
          variant={bannerColor === "red" ? "destructive" : "default"}
          className="flex-1 sm:flex-none"
        >
          Upgrade Now
        </Button>

        <button
          onClick={handleDismiss}
          className="shrink-0 text-gray-400 hover:text-gray-600"
          aria-label="Dismiss"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
