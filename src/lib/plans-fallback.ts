import { PlanType } from "@/lib/enums";
import { Plan } from "@/types";

/**
 * Snapshot of GET /subscription/plans, used only if that request fails
 * during server-side rendering - so the pricing page never renders with no
 * prices at all. Mirrors backend/src/modules/subscription/plan-defaults.ts
 * (pricing update of 2026-11-05); refresh this if pricing changes, since it
 * will silently go stale otherwise.
 */
export const FALLBACK_PLANS: Plan[] = [
  {
    type: PlanType.STARTER,
    name: "Starter",
    monthlyPrice: 0,
    yearlyPrice: 0,
    features: ["Membership management", "Attendance tracking", "Small teams"],
    popular: false,
    memberLimit: 100,
    guestLimit: 200,
    userLimit: 3,
    branchLimit: 1,
    customRolesEnabled: false,
    contactSales: false,
  },
  {
    type: PlanType.GROWTH,
    name: "Growth",
    monthlyPrice: 5000,
    yearlyPrice: 50000,
    features: [
      "Everything in Starter",
      "Multiple branches",
      "Custom roles & permissions",
    ],
    popular: true,
    memberLimit: 500,
    guestLimit: 1500,
    userLimit: 10,
    branchLimit: 5,
    customRolesEnabled: true,
    contactSales: false,
  },
  {
    type: PlanType.EXPANSION,
    name: "Expansion",
    monthlyPrice: 10000,
    yearlyPrice: 100000,
    features: ["Everything in Growth", "Room for larger and multi-site churches"],
    popular: false,
    memberLimit: 1500,
    guestLimit: 6000,
    userLimit: 25,
    branchLimit: 25,
    customRolesEnabled: true,
    contactSales: false,
  },
  {
    type: PlanType.ENTERPRISE,
    name: "Enterprise",
    monthlyPrice: 50000,
    yearlyPrice: 500000,
    features: ["Everything in Expansion", "Custom onboarding", "Priority support"],
    popular: false,
    memberLimit: -1,
    guestLimit: -1,
    userLimit: -1,
    branchLimit: -1,
    customRolesEnabled: true,
    contactSales: true,
  },
];
