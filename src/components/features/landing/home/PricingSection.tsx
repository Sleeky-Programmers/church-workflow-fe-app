import { getPlans } from "@/services/billingService";
import { FALLBACK_PLANS } from "@/lib/plans-fallback";
import PricingSectionClient from "./PricingSectionClient";

/**
 * Server Component so plan prices are present in the initial HTML for
 * crawlers and slow connections, instead of a client-side fetch that
 * briefly (or permanently, on API failure) shows no prices at all on the
 * site's highest-commercial-intent content. Falls back to a static
 * snapshot (see plans-fallback.ts) if the API is unreachable, so the page
 * never renders with no prices.
 */
export default async function PricingSection() {
  let plans = FALLBACK_PLANS;

  try {
    const data = await getPlans();
    if (data?.length) {
      plans = data;
    }
  } catch {
    // Falls back to FALLBACK_PLANS - this is a public marketing page and
    // must never be blocked by an API hiccup.
  }

  return <PricingSectionClient plans={plans} />;
}
