import { authenticatedFetch } from "@/lib/api";
import { BillingCycle, PlanType, PaymentProvider } from "@/lib/enums";
import { InitializePaymentResponse } from "@/types";
export async function initializePayment(payload: {
  plan: PlanType;
  billingCycle: BillingCycle;
  provider: PaymentProvider;
  promoCode?: string;
  autoRenew?: boolean;
}): Promise<InitializePaymentResponse> {
  return await authenticatedFetch("/payment/initialize", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}
