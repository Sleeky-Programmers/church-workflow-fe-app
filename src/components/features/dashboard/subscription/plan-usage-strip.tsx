"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import { cn } from "@/lib/utils";
import { getMemberLimitStatus } from "@/services/memberService";
import { LimitUsage, MemberLimitStatus } from "@/types";

const formatUsage = (usage?: LimitUsage) => {
  if (!usage) {
    return "—";
  }
  const current = usage.current.toLocaleString();
  return usage.unlimited
    ? `${current} / Unlimited`
    : `${current} / ${usage.limit.toLocaleString()}`;
};

const tone = (usage?: LimitUsage) => {
  return usage?.isOverLimit || usage?.atLimit
    ? "text-red-600"
    : usage?.isNearLimit
      ? "text-amber-600"
      : "text-gray-900";
};

/**
 * Plan usage line for the dashboard, e.g.
 * "Members 87 / 100 · Guests 140 / 200".
 */
export function PlanUsageStrip({ className }: { className?: string }) {
  const [status, setStatus] = useState<MemberLimitStatus | null>(null);

  useEffect(() => {
    let cancelled = false;
    getMemberLimitStatus()
      .then((s) => {
        return !cancelled && setStatus(s);
      })
      .catch(() => {
        return !cancelled && setStatus(null);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  if (!status?.members || !status?.guests) {
    return null;
  }

  const { members, guests, frequentGuests = 0 } = status;
  const needsUpgrade =
    members.atLimit ||
    guests.atLimit ||
    members.isNearLimit ||
    guests.isNearLimit;

  return (
    <div
      className={cn(
        "flex flex-wrap items-center justify-between gap-2 rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm",
        className,
      )}
    >
      <p className="text-gray-600">
        Members{" "}
        <span className={cn("font-semibold", tone(members))}>
          {formatUsage(members)}
        </span>
        <span className="mx-2 text-gray-300">·</span>
        Guests{" "}
        <span className={cn("font-semibold", tone(guests))}>
          {formatUsage(guests)}
        </span>
        {frequentGuests > 0 && (
          <span className="block text-xs text-gray-500 sm:inline sm:ml-2">
            ({frequentGuests} frequent{" "}
            {frequentGuests === 1 ? "guest counts" : "guests count"} as{" "}
            {frequentGuests === 1 ? "a member" : "members"})
          </span>
        )}
      </p>
      {needsUpgrade && (
        <Link
          href="/dashboard/settings/billing"
          className="text-xs font-semibold text-primary-500 hover:underline"
        >
          Upgrade plan
        </Link>
      )}
    </div>
  );
}
