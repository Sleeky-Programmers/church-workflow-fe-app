import { PlanType } from "@/lib/enums";
import { Plan } from "@/types";

export const PLAN_ORDER = [
  PlanType.STARTER,
  PlanType.GROWTH,
  PlanType.EXPANSION,
  PlanType.ENTERPRISE,
];

/** Looks up the tier one above `currentPlanName` in the plans list - null if there isn't one (top tier / unknown plans list). */
export function getNextPlan(currentPlanName: string | null, plans: Plan[]) {
  const currentIndex = PLAN_ORDER.indexOf(
    (currentPlanName as PlanType) ?? PlanType.STARTER,
  );
  if (currentIndex === -1) return null;

  const nextType = PLAN_ORDER[currentIndex + 1];
  if (!nextType) return null;

  return plans.find((p) => p.type === nextType) ?? null;
}

const limitLine = (
  value: number | undefined,
  singular: string,
  plural: string,
) => {
  if (value === undefined || value === null || value === 0) return null;
  if (value === -1) return `Unlimited ${plural}`;
  if (value === 1) return `1 ${singular}`;
  return `Up to ${value.toLocaleString()} ${plural}`;
};

/** "Up to 500 members", "Up to 1,500 guests", ... from the plan's numeric limits. */
export function getPlanLimitLines(plan: Plan | null | undefined): string[] {
  if (!plan) return [];
  return [
    limitLine(plan.memberLimit, "member", "members"),
    limitLine(plan.guestLimit, "guest", "guests"),
    limitLine(plan.branchLimit, "branch", "branches"),
    limitLine(plan.userLimit, "user", "users"),
  ].filter((line): line is string => !!line);
}

/** Limit lines plus feature bullets, minus the generic "Everything in X" carry-over line. */
export function getUpgradeFeatures(plan: Plan | null | undefined) {
  return [
    ...getPlanLimitLines(plan),
    ...(plan?.features ?? []).filter(
      (feature) => !feature.toLowerCase().startsWith("everything in"),
    ),
  ];
}

/** Plans sold through sales (Enterprise): shown as "From ₦X / month" with Contact us. */
export const isContactSalesPlan = (plan: Plan | null | undefined) =>
  !!plan?.contactSales;

/** Where "Contact us" buttons go: the contact page lists WhatsApp, email and phone. */
export const CONTACT_SALES_HREF = "/contact";
