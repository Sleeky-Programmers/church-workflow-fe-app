"use client";

import { useEffect, useState } from "react";
import Heading from "@/components/ui/typography/Heading";
import { Text, Span } from "@/components/ui/typography/Text";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Check } from "lucide-react";
import { Plan } from "@/types";
import {
  BillingCycle,
  PlanType,
  SubscriptionStatus,
  ChurchSubscriptionStatus,
} from "@/lib/enums";

import { getSubscriptionOverview } from "@/services/billingService";

export default function BillingPage() {
  const [billingCycle, setBillingCycle] = useState<BillingCycle>(
    BillingCycle.MONTHLY,
  );

  const [plans, setPlans] = useState<Plan[]>([]);
  const [currentPlan, setCurrentPlan] = useState<PlanType | null>(null);
  const [subscriptionStatus, setSubscriptionStatus] =
    useState<SubscriptionStatus | null>(null);
  const [churchStatus, setChurchStatus] =
    useState<ChurchSubscriptionStatus | null>(null);

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchBilling() {
      try {
        const data = await getSubscriptionOverview();

        setPlans(data.plans);
        setCurrentPlan(data.currentPlan);
        setSubscriptionStatus(data.subscriptionStatus);
        setChurchStatus(data.churchStatus);
        setBillingCycle(data.billingCycle);
      } catch (err) {
        console.error("Failed to fetch billing:", err);
      } finally {
        setLoading(false);
      }
    }

    fetchBilling();
  }, []);

  const formatPrice = (price: number) => `₦${price.toLocaleString()}`;

  const getPrice = (plan: Plan) => {
    return billingCycle === BillingCycle.MONTHLY
      ? plan.monthlyPrice
      : plan.yearlyPrice;
  };

  // const handleUpgrade = async (plan: PlanType) => {
  //   try {
  //     await upgradePlan({
  //       plan,
  //       billingCycle,
  //     });

  //     // 🔥 Refetch after upgrade
  //     const data = await getBillingOverview(churchId);

  //     setCurrentPlan(data.currentPlan);
  //     setSubscriptionStatus(data.subscriptionStatus);
  //     setChurchStatus(data.churchStatus);
  //   } catch (err) {
  //     console.error("Upgrade failed:", err);
  //   }
  // };

  if (loading) {
    return <div>Loading billing...</div>;
  }

  return (
    <div className="space-y-8">
      <Heading level={2}>Billing & Plans</Heading>

      <div className="flex justify-center">
        <div className="px-3 py-1 rounded-full text-xs bg-muted text-muted-foreground">
          {churchStatus}
        </div>
      </div>

      <div className="flex items-center justify-center gap-2">
        <Button
          variant="ghost"
          onClick={() => setBillingCycle(BillingCycle.MONTHLY)}
          className={cn(
            "px-4 py-2 rounded-full text-sm",
            billingCycle === BillingCycle.MONTHLY
              ? "bg-muted"
              : "text-muted-foreground",
          )}
        >
          Monthly
        </Button>

        <Button
          onClick={() => setBillingCycle(BillingCycle.YEARLY)}
          className={cn(
            "px-4 py-2 rounded-full text-sm",
            billingCycle === BillingCycle.YEARLY
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
        {plans.map((plan) => {
          const isCurrent =
            plan.type === currentPlan &&
            subscriptionStatus === SubscriptionStatus.ACTIVE;

          return (
            <div
              key={plan.type}
              className={cn(
                "relative rounded-xl border p-6 flex flex-col justify-between",
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
                  <Span className="text-2xl font-bold">
                    {formatPrice(getPrice(plan))}
                  </Span>
                  <Span className="text-sm ml-1">
                    /{billingCycle === BillingCycle.MONTHLY ? "month" : "year"}
                  </Span>
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
                    // onClick={() => handleUpgrade(plan.type)}
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
