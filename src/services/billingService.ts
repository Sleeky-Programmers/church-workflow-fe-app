import { apiFetch, authenticatedFetch } from "@/lib/api";
import { BillingCycle, PlanType } from "@/lib/enums";
import {
  Plan,
  CurrentPlanResponse,
  SubscriptionOverviewResponse,
  PaymentType,
  PlanChangePreview,
} from "@/types";

export async function getSubscriptionOverview(): Promise<SubscriptionOverviewResponse> {
  return await authenticatedFetch(`/subscription/overview`, {
    method: "GET",
  });
}

// Public endpoint - no auth required, used on the marketing pricing page.
export async function getPlans(): Promise<Plan[]> {
  return await apiFetch<Plan[]>(`/subscription/plans`, {
    method: "GET",
  });
}

export async function getCurrentPlan(): Promise<CurrentPlanResponse> {
  return await authenticatedFetch<CurrentPlanResponse>(
    `/subscription/current-plan`,
    { method: "GET" },
  );
}

export async function getPlanChangePreview(
  plan: PlanType,
  billingCycle: BillingCycle,
): Promise<PlanChangePreview> {
  const params = new URLSearchParams({ plan, billingCycle });
  return await authenticatedFetch<PlanChangePreview>(
    `/subscription/plan-change-preview?${params.toString()}`,
    { method: "GET" },
  );
}

export async function initializePayment(payload: PaymentType) {
  return await authenticatedFetch("/payment/initialize", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}
