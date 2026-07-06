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

type PlanDisplay = {
  label: string;
  monthlyPrice: string;
  yearlyPrice: string;
  features: string[];
};

const PLAN_DISPLAY: Record<string, PlanDisplay> = {
  GROWTH: {
    label: "Growth",
    monthlyPrice: "₦20,000",
    yearlyPrice: "₦16,600",
    features: [
      "Up to 10 users",
      "Up to 500 members",
      "Custom roles & permissions",
    ],
  },
  EXPANSION: {
    label: "Expansion",
    monthlyPrice: "₦45,000",
    yearlyPrice: "₦37,350",
    features: ["Up to 25 users", "Up to 1,500 members", "Everything in Growth"],
  },
  ENTERPRISE: {
    label: "Enterprise",
    monthlyPrice: "₦100,000",
    yearlyPrice: "₦83,000",
    features: [
      "Unlimited users",
      "Unlimited members",
      "Priority support",
      "Advanced controls",
    ],
  },
};

export default function CheckoutPage() {
  const router = useRouter();
  const [plan, setPlan] = useState<SelectedPlan | null>(null);
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
          `${process.env.NEXT_PUBLIC_API_BASE_URL}/subscription`,
          {
            headers: { Authorization: `Bearer ${token}` },
          },
        );

        if (response.ok) {
          const data = await response.json();
          const isActivePaidPlan =
            data?.plan !== "STARTER" && data?.status === "ACTIVE";

          if (isActivePaidPlan) {
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

  const planDisplay = plan ? PLAN_DISPLAY[plan.plan] : null;
  const price = plan
    ? plan.billingCycle === "MONTHLY"
      ? planDisplay?.monthlyPrice
      : planDisplay?.yearlyPrice
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
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/payment/initialize`,
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

  if (!plan || !planDisplay) {
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
              {planDisplay.label} Plan
            </span>
            <span className="text-[#0C5FB3] font-black text-lg">
              {price}
              <span className="text-xs text-gray-400 font-normal"> / mo</span>
            </span>
          </div>

          <div className="text-xs text-gray-500 font-medium uppercase tracking-wide">
            {plan.billingCycle === "YEARLY"
              ? "Billed yearly · Save 17%"
              : "Billed monthly"}
          </div>

          <div className="flex flex-col gap-2 pt-1">
            {planDisplay.features.map((feature) => (
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
              <Loader />
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
