import { PlanType } from "@/lib/enums";
import { Plan } from "@/types";

/**
 * Snapshot of GET /subscription/plans, used only if that request fails
 * during server-side rendering — so the pricing page never renders with no
 * prices at all. Pulled from the live API on 2026-08-29; refresh this if
 * pricing changes, since it will silently go stale otherwise.
 */
export const FALLBACK_PLANS: Plan[] = [
  {
    type: PlanType.STARTER,
    name: "Starter",
    monthlyPrice: 0,
    yearlyPrice: 0,
    features: [
      "Small teams",
      "Membership management",
      "Up to 3 users",
      "Up to 100 members",
      "Attendance tracking",
    ],
    popular: false,
  },
  {
    type: PlanType.GROWTH,
    name: "Growth",
    monthlyPrice: 20000,
    yearlyPrice: 199200,
    features: [
      "Everything in Starter",
      "Up to 10 users",
      "Up to 500 members",
      "Custom roles & permissions",
    ],
    popular: true,
  },
  {
    type: PlanType.EXPANSION,
    name: "Expansion",
    monthlyPrice: 45000,
    yearlyPrice: 448200,
    features: ["Everything in Growth", "Up to 25 users", "Up to 1,500 members"],
    popular: false,
  },
  {
    type: PlanType.ENTERPRISE,
    name: "Enterprise",
    monthlyPrice: 100000,
    yearlyPrice: 996000,
    features: [
      "Everything in Expansion",
      "Priority support",
      "Unlimited users",
      "Advanced controls",
      "Unlimited members",
    ],
    popular: false,
  },
];
