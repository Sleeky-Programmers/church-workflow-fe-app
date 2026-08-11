"use client";

import { Check } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Loader } from "@/components/ui/loader";
import Heading from "@/components/ui/typography/Heading";
import { Span, Text } from "@/components/ui/typography/Text";
import { useToast } from "@/hooks/use-toast";
import {
  BillingCycle,
  ChurchSubscriptionStatus,
  PlanType,
  SubscriptionStatus,
} from "@/lib/enums";
import { cn } from "@/lib/utils";
import { getSubscriptionOverview } from "@/services/billingService";
import { Plan } from "@/types";

const PLAN_ORDER = [
  PlanType.STARTER,
  PlanType.GROWTH,
  PlanType.EXPANSION,
  PlanType.ENTERPRISE,
];

export default function BillingPage() {
  const [billingCycle, setBillingCycle] = useState<BillingCycle>(
    BillingCycle.YEARLY,
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

  // Yearly billing is shown as its monthly-equivalent (yearly total / 12)
  // for an apples-to-apples comparison with the monthly toggle — the actual
  // yearly total is what gets charged, surfaced at checkout instead.
  const getPrice = (plan: Plan) => {
    return billingCycle === BillingCycle.MONTHLY
      ? plan.monthlyPrice
      : Math.round(plan.yearlyPrice / 12);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16 gap-2">
        <Loader />
        <Text variant="default">Loading billing plans...</Text>
      </div>
    );
  }

  return (
    <div className="space-y-10">
      <div className="flex flex-col items-center gap-3 text-center">
        <Heading level={6}>Choose your plan</Heading>
      </div>

      <div className="flex items-center justify-center gap-2">
        <Button
          variant="ghost"
          onClick={() => setBillingCycle(BillingCycle.MONTHLY)}
          className={`px-4 py-2 rounded-full ${billingCycle === BillingCycle.MONTHLY ? "bg-primary text-white-600" : "text-muted-foreground"}`}
        >
          Monthly
        </Button>

        <Button
          variant="ghost"
          onClick={() => setBillingCycle(BillingCycle.YEARLY)}
          className={`px-4 py-2 rounded-full ${billingCycle === BillingCycle.YEARLY ? "bg-primary text-white-600" : "text-muted-foreground"}`}
        >
          Yearly
        </Button>

        <Text variant="muted" className="ml-2 text-xs">
          (Save up to 17%)
        </Text>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6">
        {plans.map((plan) => {
          const isCurrent =
            plan.type === currentPlan &&
            subscriptionStatus === SubscriptionStatus.ACTIVE;

          const isActivePaidPlan =
            !!currentPlan &&
            currentPlan !== PlanType.STARTER &&
            subscriptionStatus === SubscriptionStatus.ACTIVE;

          const actionLabel = isActivePaidPlan
            ? PLAN_ORDER.indexOf(plan.type) > PLAN_ORDER.indexOf(currentPlan)
              ? "Upgrade"
              : "Downgrade"
            : "Get Started";

          return (
            <div
              key={plan.type}
              className={cn(
                "relative rounded-xl border bg-background p-6 flex flex-col justify-between transition",
                plan.popular && "border-primary shadow-md",
              )}
            >
              {plan.popular && (
                <Badge
                  shape="pill"
                  className="absolute -top-3 left-1/2 -translate-x-1/2"
                >
                  MOST POPULAR
                </Badge>
              )}

              <div className="space-y-4">
                <Heading level={4}>{plan.name}</Heading>

                <div className="flex items-end gap-1">
                  <Span className="text-2xl font-bold">
                    {formatPrice(getPrice(plan))}
                  </Span>
                  <Span variant="muted">/month</Span>
                </div>
                {billingCycle === BillingCycle.YEARLY && (
                  <Text variant="muted" className="text-xs">
                    billed annually
                  </Text>
                )}

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
                    {actionLabel}
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
