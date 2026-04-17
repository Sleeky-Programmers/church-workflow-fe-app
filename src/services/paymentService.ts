import { authenticatedFetch } from "@/lib/api";
import { BillingCycle, PlanType, PaymentProvider } from "@/lib/enums";

export async function initializePayment(payload: {
  plan: PlanType;
  billingCycle: BillingCycle;
  provider: PaymentProvider.PAYSTACK | PaymentProvider.FLUTTERWAVE;
  promoCode?: string;
  autoRenew?: boolean;
}) {
  return await authenticatedFetch("/payment/initialize", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}
