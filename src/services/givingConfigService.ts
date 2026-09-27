import { authenticatedFetch } from "@/lib/api";

export interface GivingConfigStatus {
  hasDefaultCurrency: boolean;
  hasDefaultOfferingType: boolean;
  hasActivePaymentMethod: boolean;
}

export async function fetchGivingConfigStatus() {
  return authenticatedFetch<GivingConfigStatus>("/giving-config/status");
}
