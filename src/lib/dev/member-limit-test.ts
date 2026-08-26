/**
 * DEV-ONLY test scaffolding for previewing the member plan-limit UI states
 * (80% "near limit", 100% "reached", and "over limit + grace period") without
 * needing real seeded member data.
 *
 * Usage — on /dashboard/membership, append one of:
 *   ?testLimit=near     → amber "Approaching Limit" banner (~82% of your real limit)
 *   ?testLimit=reached  → opens the "Member Limit Reached" modal (100% of your real limit)
 *   ?testLimit=grace    → opens the "Import Successful" grace-period modal (~327% of your real limit)
 *   ?testLimit=clear    → removes the override and restores real data
 *
 * Only the member count is faked — the plan name and its real member limit
 * are read from the account's actual subscription first, so "Upgrade to X"
 * always names the correct next tier instead of a hardcoded plan.
 *
 * The override persists in sessionStorage (per-tab) until cleared, so it
 * survives normal page interactions (add/import/refresh) for testing.
 *
 * Safe to delete: this file plus its call sites in membership/page.tsx
 * (the testLimit-resolving effect) have zero effect in production builds
 * and can be removed outright once you're done testing.
 */
import { PlanLimitStatus } from "@/types";

import { isDevLimitTestingEnabled } from "./dev-flags";

export { isDevLimitTestingEnabled };

const STORAGE_KEY = "__dev_member_limit_override";

export type MemberLimitTestScenario = "near" | "reached" | "grace" | "clear";

/** The account's real plan name + real member limit, used as the basis for a simulated scenario. */
export interface MemberLimitTestBase {
  planName: string | null;
  limit: number;
}

export function buildLimitTestStatus(
  scenario: Exclude<MemberLimitTestScenario, "clear">,
  base: MemberLimitTestBase,
): PlanLimitStatus {
  // Unlimited (-1) or unknown real limits can't be meaningfully simulated as
  // "80% full" — fall back to a synthetic 100 so the scenario still renders.
  const limit = base.limit > 0 ? base.limit : 100;
  const planName = base.planName ?? "STARTER";

  switch (scenario) {
    case "near":
      return {
        current: Math.round(limit * 0.82),
        limit,
        percentage: 82,
        isOverLimit: false,
        isNearLimit: true,
        planName,
        isWithinGracePeriod: false,
        gracePeriodEnds: null,
        daysRemaining: null,
      };

    case "reached":
      return {
        current: limit,
        limit,
        percentage: 100,
        isOverLimit: false,
        isNearLimit: false,
        planName,
        isWithinGracePeriod: false,
        gracePeriodEnds: null,
        daysRemaining: null,
      };

    case "grace":
      return {
        current: Math.round(limit * 3.27),
        limit,
        percentage: 100,
        isOverLimit: true,
        isNearLimit: false,
        planName,
        isWithinGracePeriod: true,
        gracePeriodEnds: new Date(
          Date.now() + 7 * 24 * 60 * 60 * 1000,
        ).toISOString(),
        daysRemaining: 7,
      };
  }
}

/**
 * Reads `testLimit` from the URL and stores/clears the matching override.
 * `base` must be the account's real plan name + member limit (fetched via
 * the un-overridden status endpoint) so the simulated scenario keeps the
 * real plan/limit and only fakes the member count.
 */
export function applyMemberLimitTestParam(
  searchParams: URLSearchParams,
  base: MemberLimitTestBase,
) {
  if (!isDevLimitTestingEnabled() || typeof window === "undefined") return;

  const scenario = searchParams.get(
    "testLimit",
  ) as MemberLimitTestScenario | null;
  if (!scenario) return;

  if (scenario === "clear") {
    sessionStorage.removeItem(STORAGE_KEY);
    return;
  }

  sessionStorage.setItem(
    STORAGE_KEY,
    JSON.stringify(buildLimitTestStatus(scenario, base)),
  );
}

export function getMemberLimitTestOverride(): PlanLimitStatus | null {
  if (!isDevLimitTestingEnabled() || typeof window === "undefined") return null;

  const raw = sessionStorage.getItem(STORAGE_KEY);
  if (!raw) return null;

  try {
    return JSON.parse(raw) as PlanLimitStatus;
  } catch {
    return null;
  }
}
