import { PlanType } from "@/lib/enums";
import { Plan } from "@/types";

export const PLAN_ORDER = [
  PlanType.STARTER,
  PlanType.GROWTH,
  PlanType.EXPANSION,
  PlanType.ENTERPRISE,
];

/** Looks up the tier one above `currentPlanName` in the plans list — null if there isn't one (top tier / unknown plans list). */
export function getNextPlan(currentPlanName: string | null, plans: Plan[]) {
  const currentIndex = PLAN_ORDER.indexOf(
    (currentPlanName as PlanType) ?? PlanType.STARTER,
  );
  if (currentIndex === -1) return null;

  const nextType = PLAN_ORDER[currentIndex + 1];
  if (!nextType) return null;

  return plans.find((p) => p.type === nextType) ?? null;
}

/** Feature bullets for a plan, minus the generic "Everything in X" carry-over line. */
export function getUpgradeFeatures(plan: Plan | null | undefined) {
  return (plan?.features ?? []).filter(
    (feature) => !feature.toLowerCase().startsWith("everything in"),
  );
}
