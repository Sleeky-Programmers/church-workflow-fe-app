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
  /** Stable reference (module-level export) — an inline arrow function will refetch on every render. */
  fetchStatus: () => Promise<PlanLimitStatus>;
  /** sessionStorage key used to remember this banner was dismissed; must be unique per resource. */
  dismissKey: string;
  /** Plural noun used in messaging, e.g. "members", "user seats". */
  resourceLabel: string;
  /** Limit noun used in messaging, e.g. "member limit", "user seat limit". */
  resourceLimitLabel: string;
  upgradeHref?: string;
  /** Extra classes for the outer wrapper — use this to add page-specific spacing (e.g. full-bleed pages need horizontal margin the caller's padded container already provides). */
  className?: string;
}

export function LimitBanner({
  fetchStatus,
  dismissKey,
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

  useEffect(() => {
    if (sessionStorage.getItem(dismissKey)) {
      setIsVisible(false);
    }
  }, [dismissKey]);

  const handleDismiss = () => {
    setIsVisible(false);
    sessionStorage.setItem(dismissKey, "true");
  };

  if (loading || !status || !isVisible) return null;

  const {
    current,
    limit,
    percentage,
    isOverLimit,
    isWithinGracePeriod,
    isNearLimit,
    daysRemaining,
    planName,
    gracePeriodEnds,
  } = status;

  if (!isNearLimit && !isOverLimit) return null;

  let bannerColor: BannerColor = "blue";
  let title = "";
  let message = "";

  if (isOverLimit && isWithinGracePeriod) {
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
  } else if (isOverLimit) {
    bannerColor = "red";
    title = "Limit Reached:";
    message = `Your ${toSentenceCase(planName || "")} plan has ${current} ${resourceLabel}, which has reached the ${limit} ${resourceLimitLabel}. Please upgrade now to continue.`;
  } else if (isNearLimit) {
    bannerColor = "amber";
    title = "Approaching Limit:";
    message = `You have ${current} out of ${limit} ${resourceLabel} (${Math.round(percentage)}%). Consider upgrading to avoid reaching the limit.`;
  }

  const Icon = isOverLimit ? MdError : isNearLimit ? MdWarning : MdInfo;

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
