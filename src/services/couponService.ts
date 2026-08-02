import { authenticatedFetch } from "@/lib/api";
import { PlanType } from "@/lib/enums";
import { Coupon } from "@/types";

export async function validateCoupon(payload: {
  code: string;
  planType?: PlanType;
  churchId?: string;
}): Promise<Coupon> {
  return await authenticatedFetch<Coupon>("/coupon/validate", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}
