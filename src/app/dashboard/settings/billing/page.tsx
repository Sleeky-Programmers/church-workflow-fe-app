"use client";

import { useState } from "react";
import Heading from "@/components/ui/typography/Heading";
import { Text } from "@/components/ui/typography/Text";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Check } from "lucide-react";

const plans = [
  {
    name: "Starter",
    price: "₦0",
    period: "/month",
    features: [
      "Small teams",
      "Membership management",
      "Up to 3 users",
      "Up to 100 members",
      "Attendance tracking",
    ],
    isCurrent: true,
  },
  {
    name: "Growth",
    price: "₦20,000",
    period: "/month",
    features: [
      "Everything in Starter",
      "Up to 10 users",
      "Up to 500 members",
      "Custom roles & permissions",
    ],
    popular: true,
  },
  {
    name: "Expansion",
    price: "₦45,000",
    period: "/month",
    features: ["Everything in Growth", "Up to 25 users", "Up to 1,500 members"],
  },
  {
    name: "Enterprise",
    price: "₦100,000",
    period: "/month",
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
  const [billingType, setBillingType] = useState<"monthly" | "yearly">(
    "monthly",
  );

  return (
    <div className="space-y-8">
      <Heading level={2}>Billing & Plans</Heading>

      <div className="flex items-center justify-center gap-2">
        <Button
          onClick={() => setBillingType("monthly")}
          className={cn(
            "px-4 py-2 rounded-full text-sm",
            billingType === "monthly"
              ? "bg-muted text-foreground"
              : "text-muted-foreground",
          )}
        >
          Monthly
        </Button>

        <Button
          onClick={() => setBillingType("yearly")}
          className={cn(
            "px-4 py-2 rounded-full text-sm",
            billingType === "yearly"
              ? "bg-primary text-white"
              : "text-muted-foreground",
          )}
        >
          Yearly
        </Button>

        <Text className="text-xs text-muted-foreground ml-2">
          (Save up to 17%)
        </Text>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {plans.map((plan) => (
          <div
            key={plan.name}
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
                <span className="text-2xl font-bold">{plan.price}</span>
                <span className="text-sm text-muted-foreground ml-1">
                  {plan.period}
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
              {plan.isCurrent ? (
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
        ))}
      </div>
    </div>
  );
}
