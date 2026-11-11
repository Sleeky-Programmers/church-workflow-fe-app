import { authenticatedFetch } from "@/lib/api";
import { cachedRequest, invalidateCache } from "@/lib/request-cache";

export interface PaymentMethod {
  id: string;
  code: string;
  name: string;
  isActive: boolean;
  sortOrder: number;
}

export interface PaymentMethodPreset {
  code: string;
  name: string;
}

// The API returns Mongoose docs keyed by `_id`; normalize to `id` so callers
// Have a stable identifier (matches the members/services convention).
function normalizePaymentMethod(raw: any): PaymentMethod {
  return {
    id: raw?._id ?? raw?.id,
    code: raw?.code,
    name: raw?.name,
    isActive: raw?.isActive,
    sortOrder: raw?.sortOrder ?? 0,
  };
}

export async function fetchPaymentMethods() {
  return cachedRequest("ref:payment-methods", async () => {
    const data = await authenticatedFetch<any[]>("/payment-methods");
    return data.map(normalizePaymentMethod);
  });
}

export async function fetchPaymentMethodPresets() {
  return authenticatedFetch<PaymentMethodPreset[]>("/payment-methods/presets");
}

export async function createPaymentMethod(payload: {
  code: string;
  sortOrder?: number;
}) {
  const created = await authenticatedFetch<any>("/payment-methods", {
    method: "POST",
    body: JSON.stringify(payload),
  });
  invalidateCache("ref:payment-methods");
  return normalizePaymentMethod(created);
}

export async function updatePaymentMethod(
  id: string,
  payload: Partial<Pick<PaymentMethod, "isActive" | "sortOrder">>,
) {
  const updated = await authenticatedFetch<any>(`/payment-methods/${id}`, {
    method: "PUT",
    body: JSON.stringify(payload),
  });
  invalidateCache("ref:payment-methods");
  return normalizePaymentMethod(updated);
}

export async function deletePaymentMethod(id: string) {
  invalidateCache("ref:payment-methods");
  return authenticatedFetch<{ message: string }>(`/payment-methods/${id}`, {
    method: "DELETE",
  });
}
