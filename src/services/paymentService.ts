import { apiFetch, authenticatedFetch } from "@/lib/api";
import { BillingCycle, PaymentProvider, PlanType } from "@/lib/enums";
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

export interface ManualVerifyResponse {
  status: string;
  reference: string;
  amount: number;
  metadata?: {
    plan?: string;
    billingCycle?: string;
    churchId?: string;
    promoCode?: string;
  };
  message?: string;
}

export async function manualVerifyPayment(
  reference: string,
  provider: "PAYSTACK" | "FLUTTERWAVE",
  transactionId?: string,
): Promise<ManualVerifyResponse> {
  const body: any = {
    reference,
    provider: provider.toLowerCase(),
  };

  // Only include transactionId if provided (Flutterwave)
  if (transactionId) {
    body.transactionId = transactionId;
  }

  const response = await authenticatedFetch<ManualVerifyResponse>(
    "/payment/verify",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    },
  );
  return response;
}

// Used by the public post-payment landing page for visitors who return from
// The gateway without an active session - no auth required.
export async function publicVerifyPayment(
  reference: string,
  provider: "PAYSTACK" | "FLUTTERWAVE",
  transactionId?: string,
): Promise<ManualVerifyResponse> {
  const body: any = {
    reference,
    provider: provider.toLowerCase(),
  };

  if (transactionId) {
    body.transactionId = transactionId;
  }

  return await apiFetch<ManualVerifyResponse>("/payment/verify/public", {
    method: "POST",
    body: JSON.stringify(body),
  });
}
