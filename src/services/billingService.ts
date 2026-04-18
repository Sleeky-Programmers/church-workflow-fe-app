import { authenticatedFetch } from "@/lib/api";
import { SubscriptionOverviewResponse, PaymentType } from "@/types";

export async function getSubscriptionOverview(): Promise<SubscriptionOverviewResponse> {
  return await authenticatedFetch(`/subscription/overview`, {
    method: "GET",
  });
}

export async function initializePayment(payload: PaymentType) {
  return await authenticatedFetch("/payment/initialize", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}
