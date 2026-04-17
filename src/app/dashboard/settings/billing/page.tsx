"use client";

import { useState } from "react";
import Heading from "@/components/ui/typography/Heading";
import { Text } from "@/components/ui/typography/Text";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Check } from "lucide-react";

import {
  BillingCycle,
  PlanType,
  SubscriptionStatus,
  ChurchSubscriptionStatus,
} from "@/lib/enums";

type Plan = {
  type: PlanType;
  name: string;
  monthlyPrice: number;
  yearlyPrice: number;
  features: string[];
  popular?: boolean;
};

const plans: Plan[] = [
  {
    type: PlanType.STARTER,
    name: "Starter",
    monthlyPrice: 0,
    yearlyPrice: 0,
    features: [
      "Small teams",
      "Membership management",
      "Up to 3 users",
      "Up to 100 members",
      "Attendance tracking",
    ],
  },
  {
    type: PlanType.GROWTH,
    name: "Growth",
    monthlyPrice: 20000,
    yearlyPrice: 20000 * 12 * 0.83, // ~17% discount
    features: [
      "Everything in Starter",
      "Up to 10 users",
      "Up to 500 members",
      "Custom roles & permissions",
    ],
    popular: true,
  },
  {
    type: PlanType.EXPANSION,
    name: "Expansion",
    monthlyPrice: 45000,
    yearlyPrice: 45000 * 12 * 0.83,
    features: ["Everything in Growth", "Up to 25 users", "Up to 1,500 members"],
  },
  {
    type: PlanType.ENTERPRISE,
    name: "Enterprise",
    monthlyPrice: 100000,
    yearlyPrice: 100000 * 12 * 0.83,
    features: [
      "Everything in Expansion",
      "Priority support",
      "Unlimited users",
      "Advanced controls",
      "Unlimited members",
    ],
  },
];

export default function BillingPage() {
  const [billingCycle, setBillingCycle] = useState<BillingCycle>(
    BillingCycle.MONTHLY,
  );

  const currentPlan = PlanType.STARTER;
  const subscriptionStatus = SubscriptionStatus.ACTIVE;
  const churchStatus = ChurchSubscriptionStatus.ACTIVE;

  const formatPrice = (price: number) => `₦${price.toLocaleString()}`;

  const getPrice = (plan: Plan) => {
    return billingCycle === BillingCycle.MONTHLY
      ? plan.monthlyPrice
      : Math.round(plan.yearlyPrice);
  };

  return (
    <div className="space-y-8">
      <Heading level={2}>Billing & Plans</Heading>

      <div className="flex justify-center">
        <div className="px-3 py-1 rounded-full text-xs bg-muted text-muted-foreground">
          {churchStatus}
        </div>
      </div>

      <div className="flex items-center justify-center gap-2">
        <button
          onClick={() => setBillingCycle(BillingCycle.MONTHLY)}
          className={cn(
            "px-4 py-2 rounded-full text-sm",
            billingCycle === BillingCycle.MONTHLY
              ? "bg-muted text-foreground"
              : "text-muted-foreground",
          )}
        >
          Monthly
        </button>

        <button
          onClick={() => setBillingCycle(BillingCycle.YEARLY)}
          className={cn(
            "px-4 py-2 rounded-full text-sm",
            billingCycle === BillingCycle.YEARLY
              ? "bg-primary text-white"
              : "text-muted-foreground",
          )}
        >
          Yearly
        </button>

        <Text className="text-xs text-muted-foreground ml-2">
          (Save up to 17%)
        </Text>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {plans.map((plan) => {
          const isCurrent =
            plan.type === currentPlan &&
            subscriptionStatus === SubscriptionStatus.ACTIVE;

          return (
            <div
              key={plan.type}
              className={cn(
                "relative rounded-xl border bg-background p-6 flex flex-col justify-between",
                plan.popular && "border-primary shadow-md",
              )}
            >
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary text-white text-xs px-3 py-1 rounded-full">
                  MOST POPULAR
                </div>
              )}

              <div className="space-y-4">
                <Text className="text-lg font-semibold">{plan.name}</Text>

                <div>
                  <span className="text-2xl font-bold">
                    {formatPrice(getPrice(plan))}
                  </span>
                  <span className="text-sm text-muted-foreground ml-1">
                    /{billingCycle === BillingCycle.MONTHLY ? "month" : "year"}
                  </span>
                </div>

                <div className="space-y-2">
                  {plan.features.map((feature) => (
                    <div key={feature} className="flex items-center gap-2">
                      <Check className="h-4 w-4 text-green-500" />
                      <Text className="text-sm text-muted-foreground">
                        {feature}
                      </Text>
                    </div>
                  ))}
                </div>
              </div>

              <div className="mt-6">
                {isCurrent ? (
                  <Button disabled className="w-full">
                    Current Plan
                  </Button>
                ) : (
                  <Button
                    variant={plan.popular ? "default" : "outline"}
                    className="w-full"
                  >
                    Upgrade
                  </Button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
