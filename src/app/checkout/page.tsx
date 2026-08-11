"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getAccessToken } from "@/lib/auth/session";
import {
  getSelectedPlan,
  clearSelectedPlan,
  SelectedPlan,
} from "@/lib/plan-selection";
import { RouteConfig } from "@/config/routes";
import { Loader } from "@/components/ui/loader";
import { Text } from "@/components/ui/typography/Text";
import Heading from "@/components/ui/typography/Heading";
import { Button } from "@/components/ui/button";
import { Check } from "lucide-react";
import { getPlans } from "@/services/billingService";
import { Plan } from "@/types";

const formatPrice = (price: number) => `₦${price.toLocaleString()}`;

export default function CheckoutPage() {
  const router = useRouter();
  const [plan, setPlan] = useState<SelectedPlan | null>(null);
  const [planDetails, setPlanDetails] = useState<Plan | null>(null);
  const [promoCode, setPromoCode] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const token = getAccessToken();
    if (!token) {
      router.replace(RouteConfig.auth.signIn);
      return;
    }

    const selected = getSelectedPlan();
    if (!selected || selected.plan === "STARTER") {
      router.replace(RouteConfig.home);
      return;
    }

    const checkSubscription = async () => {
      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/subscription/overview`,
          {
            headers: { Authorization: `Bearer ${token}` },
          },
        );

        if (response.ok) {
          const data = await response.json();
          // Only block a no-op re-purchase of the plan already active — a
          // genuine plan change (upgrade/downgrade) still proceeds to checkout.
          const isSamePlanActive =
            data?.currentPlan === selected.plan &&
            data?.subscriptionStatus === "ACTIVE";

          if (isSamePlanActive) {
            clearSelectedPlan();
            router.replace(RouteConfig.dashboard.home);
            return;
          }
        }
      } catch {
        // fails silently — payment API will catch it
      }

      setPlan(selected);
    };

    checkSubscription();
  }, [router]);

  useEffect(() => {
    getPlans()
      .then((plans) => {
        const match = plans.find((p) => p.type === plan?.plan);
        if (match) setPlanDetails(match);
      })
      .catch(() => setPlanDetails(null));
  }, [plan]);

  // The actual amount charged today — always the real total for the chosen
  // cycle, never a monthly-equivalent, since this is the payment confirmation.
  const price =
    plan && planDetails
      ? plan.billingCycle === "MONTHLY"
        ? planDetails.monthlyPrice
        : planDetails.yearlyPrice
      : null;

  const handleCheckout = async () => {
    if (!plan) {
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const token = getAccessToken();
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/payment/initialize`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            plan: plan.plan,
            billingCycle: plan.billingCycle,
            provider: "paystack",
            autoRenew: true,
            ...(promoCode.trim() ? { promoCode: promoCode.trim() } : {}),
          }),
        },
      );

      const data = await response.json();

      if (!response.ok) {
        if (
          response.status === 400 &&
          data?.message?.includes("Active paid subscription")
        ) {
          setError(
            "You already have an active subscription. Visit your dashboard to manage it.",
          );
          return;
        }
        setError(
          data?.message || "Failed to initialize payment. Please try again.",
        );
        return;
      }

      const authorizationUrl =
        data?.data?.authorization_url || data?.authorization_url;

      if (!authorizationUrl) {
        setError("Payment initialization failed. Please try again.");
        return;
      }

      clearSelectedPlan();
      window.location.href = authorizationUrl;
    } catch {
      setError("An unexpected error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleChangePlan = () => {
    router.push(`${RouteConfig.home}#pricing`);
  };

  if (!plan || !planDetails) {
    return (
      <div className="min-h-screen flex items-center justify-center gap-3">
        <Loader />
        <Text variant="muted">Loading your plan...</Text>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4 py-16">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-sm border border-gray-200 p-8 flex flex-col gap-6">
        <div className="flex flex-col gap-1">
          <Heading level={2} className="text-2xl font-black text-gray-900">
            Complete Your Order
          </Heading>
          <Text variant="muted" className="text-sm">
            Review your selected plan before proceeding to payment.
          </Text>
        </div>

        <div className="rounded-xl border border-[#0C5FB3] bg-[#0C5FB3]/5 p-5 flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <span className="font-bold text-gray-900 text-base">
              {planDetails.name} Plan
            </span>
            <span className="text-[#0C5FB3] font-black text-lg">
              {formatPrice(price ?? 0)}
              <span className="text-xs text-gray-400 font-normal">
                {" "}
                / {plan.billingCycle === "MONTHLY" ? "mo" : "yr"}
              </span>
            </span>
          </div>

          <div className="text-xs text-gray-500 font-medium uppercase tracking-wide">
            {plan.billingCycle === "YEARLY"
              ? "Billed yearly · Save up to 17%"
              : "Billed monthly"}
          </div>

          <div className="flex flex-col gap-2 pt-1">
            {planDetails.features.map((feature) => (
              <div key={feature} className="flex items-center gap-2">
                <Check size={13} className="text-green-600 shrink-0" />
                <Text variant="muted" className="text-xs">
                  {feature}
                </Text>
              </div>
            ))}
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <label className="text-sm font-medium text-gray-700">
            Promo Code{" "}
            <span className="text-gray-400 font-normal">(optional)</span>
          </label>
          <input
            type="text"
            value={promoCode}
            onChange={(e) => setPromoCode(e.target.value)}
            placeholder="Enter promo code"
            className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm outline-none focus:border-[#0C5FB3] transition-colors"
          />
        </div>

        {error && (
          <div className="rounded-lg bg-red-50 border border-red-200 px-4 py-3">
            <Text variant="muted" className="text-red-600 text-sm">
              {error}
            </Text>
          </div>
        )}

        <Button
          onClick={handleCheckout}
          disabled={isLoading}
          className="w-full py-6 rounded-[8px]"
        >
          {isLoading ? (
            <span className="flex items-center gap-2">
              <Loader size="w-5 h-5" showShadow={false} />
              Redirecting to payment...
            </span>
          ) : (
            "Proceed to Payment"
          )}
        </Button>

        <button
          onClick={handleChangePlan}
          className="text-center text-sm text-gray-400 hover:text-gray-600 transition-colors"
        >
          Change plan
        </button>
      </div>
    </div>
  );
}
