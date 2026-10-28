"use client";

import { Check } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import Heading from "@/components/ui/typography/Heading";
import { Text } from "@/components/ui/typography/Text";
import { RouteConfig } from "@/config/routes";
import { PlanType, SubscriptionStatus } from "@/lib/enums";
import { getAccessToken } from "@/lib/auth/session";
import { saveSelectedPlan } from "@/lib/plan-selection";
import { getCurrentPlan } from "@/services/billingService";
import { CurrentPlanResponse, Plan } from "@/types";

type BillingCycle = "monthly" | "yearly";

const formatPrice = (price: number) => `₦${price.toLocaleString()}`;

interface PricingSectionClientProps {
  plans: Plan[];
}

export default function PricingSectionClient({
  plans,
}: PricingSectionClientProps) {
  const [billing, setBilling] = useState<BillingCycle>("yearly");
  const [loadingPlan, setLoadingPlan] = useState<string | null>(null);
  const [currentPlan, setCurrentPlan] = useState<CurrentPlanResponse | null>(
    null,
  );
  const router = useRouter();

  // Only logged-in visitors have a subscription to reflect - fails silently
  // so an anonymous visitor or a fetch hiccup never blocks the public page.
  useEffect(() => {
    if (!getAccessToken()) {
      return;
    }
    getCurrentPlan()
      .then(setCurrentPlan)
      .catch(() => setCurrentPlan(null));
  }, []);

  const isCurrentPlan = (plan: Plan) =>
    currentPlan?.type === plan.type &&
    currentPlan?.status === SubscriptionStatus.ACTIVE;

  const handleGetStarted = (planKey: string) => {
    if (loadingPlan) {
      return;
    }
    setLoadingPlan(planKey);

    if (planKey === "STARTER") {
      const token = getAccessToken();
      if (token) {
        router.push(RouteConfig.dashboard.home);
      } else {
        router.push(RouteConfig.auth.signUp);
      }
      return;
    }

    const token = getAccessToken();

    // Already on an active paid plan - send them to the dashboard's
    // plan-change-aware checkout instead of the new-subscriber checkout.
    const isActivePaidPlan =
      currentPlan?.status === SubscriptionStatus.ACTIVE &&
      currentPlan?.type !== PlanType.STARTER;

    if (token && isActivePaidPlan && currentPlan?.type !== planKey) {
      router.push(
        `/dashboard/settings/billing/checkout?plan=${planKey}&cycle=${billing.toUpperCase()}`,
      );
      return;
    }

    saveSelectedPlan({
      plan: planKey,
      billingCycle: billing.toUpperCase() as "MONTHLY" | "YEARLY",
    });

    if (token) {
      router.push(RouteConfig.checkout);
    } else {
      router.push(RouteConfig.auth.signUp);
    }
  };

  // Yearly billing is shown as its monthly-equivalent (yearly total / 12) so
  // the two toggle states are visually comparable at a glance - the actual
  // yearly total is still what gets charged, just not the headline number.
  const getDisplayPrice = (plan: Plan) =>
    billing === "monthly"
      ? plan.monthlyPrice
      : Math.round(plan.yearlyPrice / 12);

  return (
    <section id="pricing" className="relative w-full">
      <img
        loading="lazy"
        decoding="async"
        src="/landing-page/light-blue.png"
        alt=""
        aria-hidden="true"
        className="absolute inset-0 w-full h-full object-fill pointer-events-none select-none"
      />

      <div className="relative z-10 py-20 px-6">
        <img
          loading="lazy"
          decoding="async"
          src="/assets/icons/star.svg"
          alt=""
          aria-hidden="true"
          width={28}
          height={28}
          className="absolute top-12 left-14 select-none pointer-events-none"
        />

        <div className="max-w-3xl mx-auto text-center mb-10">
          <Heading
            level={2}
            className="text-4xl md:text-5xl font-black text-gray-900"
          >
            <span className="relative inline-block text-[#0C5FB3]">
              Flexible Plans
              <img
                loading="lazy"
                decoding="async"
                src="/assets/icons/wave.svg"
                alt=""
                aria-hidden="true"
                className="absolute -bottom-1 left-0 w-full h-auto"
              />
            </span>{" "}
            for Every Church
          </Heading>

          <Text variant="muted" className="mt-4 max-w-md mx-auto">
            Choose a plan that fits your church size and administrative needs.
          </Text>
        </div>

        <div className="flex items-center justify-center gap-3 mb-12">
          <div className="flex items-center bg-gray-200 rounded-full p-1 shadow-sm border border-gray-200">
            <button
              onClick={() => setBilling("monthly")}
              className={`px-5 py-1.5 rounded-full text-sm font-medium transition-all ${
                billing === "monthly"
                  ? "bg-[#0C5FB3] text-[#ffff] shadow"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              Monthly
            </button>
            <button
              onClick={() => setBilling("yearly")}
              className={`px-5 py-1.5 rounded-full text-sm font-medium transition-all ${
                billing === "yearly"
                  ? "bg-[#0C5FB3] text-[#ffff] shadow"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              Yearly
            </button>
          </div>
          <span className="text-xs text-gray-500 font-medium">
            {billing === "yearly" ? "Save up to 17%" : ""}
          </span>
        </div>

        <div className="max-w-6xl mx-auto grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-5 items-stretch">
          {plans.map((plan) => (
            <div
              key={plan.type}
              className={`relative flex flex-col h-full rounded-2xl bg-[#ffffff] px-5 py-6 gap-5 ${
                plan.popular
                  ? "border-2 border-[#0C5FB3] shadow-xl"
                  : "border border-gray-200 shadow-sm"
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <span className="inline-block whitespace-nowrap bg-[#0C5FB3] text-[#ffff] text-[10px] font-bold uppercase tracking-wider px-3 py-1 rounded-full">
                    Most Popular
                  </span>
                </div>
              )}

              <div className="flex flex-col gap-1">
                <Text variant="label" className="text-gray-800">
                  {plan.name}
                </Text>
                <div className="flex items-baseline gap-1.5 flex-wrap">
                  {billing === "yearly" && (
                    <span className="text-sm text-gray-400 line-through">
                      {formatPrice(plan.monthlyPrice)}
                    </span>
                  )}
                  <span className="text-2xl font-black text-gray-900">
                    {formatPrice(getDisplayPrice(plan))}
                  </span>
                  <span className="text-xs text-gray-400">/ month</span>
                </div>
                {billing === "yearly" && (
                  <span className="text-[11px] text-gray-400">
                    billed annually
                  </span>
                )}
              </div>

              <div className="flex flex-col gap-2.5 flex-1">
                {plan.features.map((feature) => (
                  <div key={feature} className="flex items-start gap-2">
                    <Check
                      size={14}
                      className="text-green-600 mt-0.5 shrink-0"
                    />
                    <Text variant="muted" className="text-xs leading-snug">
                      {feature}
                    </Text>
                  </div>
                ))}
              </div>

              {isCurrentPlan(plan) ? (
                <button
                  disabled
                  className="w-full rounded-lg mt-auto py-2 px-4 text-sm font-semibold text-gray-500 bg-gray-100 cursor-not-allowed flex items-center justify-center gap-1.5"
                >
                  <Check size={14} />
                  Current Plan
                </button>
              ) : (
                <button
                  onClick={() => handleGetStarted(plan.type)}
                  disabled={loadingPlan !== null}
                  className="w-full rounded-lg mt-auto py-2 px-4 text-sm font-semibold text-[#0C5FB3] bg-[#0C5FB3]/10 cursor-pointer hover:bg-[#0C5FB3]/20 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loadingPlan === plan.type
                    ? "Redirecting..."
                    : plan.type === "STARTER"
                      ? "Get Started Free"
                      : "Get Started"}
                </button>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
