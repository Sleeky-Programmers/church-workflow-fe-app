"use client";

import { useEffect, useState } from "react";
import Heading from "@/components/ui/typography/Heading";
import { Text, Span } from "@/components/ui/typography/Text";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { Check } from "lucide-react";
import { useRouter } from "next/navigation";
import {
  BillingCycle,
  PlanType,
  SubscriptionStatus,
  ChurchSubscriptionStatus,
} from "@/lib/enums";
import { Plan } from "@/types";
import { useToast } from "@/hooks/use-toast";

import { getSubscriptionOverview } from "@/services/billingService";

export default function BillingPage() {
  const [billingCycle, setBillingCycle] = useState<BillingCycle>(
    BillingCycle.MONTHLY,
  );
  const router = useRouter();
  const { toast } = useToast();
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
        toast({
          title: "Error",
          description: "Failed to fetch billing",
        });
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

  if (loading) {
    return <Text>Loading billing...</Text>;
  }

  return (
    <div className="space-y-10">
      <div className="flex flex-col items-center gap-3 text-center">
        <Heading level={2}>Billing & Plans</Heading>

        {churchStatus && <Badge variant="secondary">{churchStatus}</Badge>}
      </div>

      <div className="flex items-center justify-center gap-2">
        <Button
          variant="ghost"
          onClick={() => setBillingCycle(BillingCycle.MONTHLY)}
          className={cn(
            "px-4 py-2 rounded-full",
            billingCycle === BillingCycle.MONTHLY
              ? "bg-muted"
              : "text-muted-foreground",
          )}
        >
          Monthly
        </Button>

        <Button
          variant="ghost"
          onClick={() => setBillingCycle(BillingCycle.YEARLY)}
          className={cn(
            "px-4 py-2 rounded-full",
            billingCycle === BillingCycle.YEARLY
              ? "bg-primary text-white"
              : "text-muted-foreground",
          )}
        >
          Yearly
        </Button>

        <Text variant="muted" className="ml-2 text-xs">
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
                "relative rounded-xl border bg-background p-6 flex flex-col justify-between transition",
                plan.popular && "border-primary shadow-md",
              )}
            >
              {plan.popular && (
                <Badge className="absolute -top-3 left-1/2 -translate-x-1/2">
                  MOST POPULAR
                </Badge>
              )}

              <div className="space-y-4">
                <Heading level={4}>{plan.name}</Heading>

                <div className="flex items-end gap-1">
                  <Span className="text-2xl font-bold">
                    {formatPrice(getPrice(plan))}
                  </Span>
                  <Span variant="muted">
                    /{billingCycle === BillingCycle.MONTHLY ? "month" : "year"}
                  </Span>
                </div>

                <div className="space-y-2 pt-2">
                  {plan.features.map((feature) => (
                    <div key={feature} className="flex items-start gap-2">
                      <Check className="h-4 w-4 text-green-500 mt-[2px]" />
                      <Text variant="muted">{feature}</Text>
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
                    onClick={() =>
                      router.push(
                        `/dashboard/settings/billing/checkout?plan=${plan.type}&cycle=${billingCycle}`,
                      )
                    }
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
