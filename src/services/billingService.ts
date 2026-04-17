import { authenticatedFetch } from "@/lib/api";
import {
  BillingCycle,
  PlanType,
  SubscriptionStatus,
  ChurchSubscriptionStatus,
} from "@/lib/enums";

export type Plan = {
  type: PlanType;
  name: string;
  monthlyPrice: number;
  yearlyPrice: number;
  features: string[];
  popular?: boolean;
};

export type SubscriptionOverviewResponse = {
  plans: Plan[];
  currentPlan: PlanType;
  subscriptionStatus: SubscriptionStatus;
  churchStatus: ChurchSubscriptionStatus;
  billingCycle: BillingCycle;
};

export async function getSubscriptionOverview(): Promise<SubscriptionOverviewResponse> {
  return await authenticatedFetch(`/subscription/overview`, {
    method: "GET",
  });
}

export async function initializePayment(payload: {
  plan: PlanType;
  billingCycle: BillingCycle;
  provider: "PAYSTACK" | "FLUTTERWAVE";
  promoCode?: string;
  autoRenew?: boolean;
}) {
  return await authenticatedFetch("/payment/initialize", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}
