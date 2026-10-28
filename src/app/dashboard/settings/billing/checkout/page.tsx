"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";

import BillingCheckout from "@/components/features/dashboard/admin/BillingCheckout";
import {
  getSubscriptionOverview,
  getPlanChangePreview,
} from "@/services/billingService";
import { useToast } from "@/hooks/use-toast";
import { Plan, PlanChangePreview } from "@/types";
import { PlanType, BillingCycle, SubscriptionStatus } from "@/lib/enums";
import { Loader } from "@/components/ui/loader";

export default function CheckoutPage() {
  const params = useSearchParams();
  const { toast } = useToast();

  const plan = params.get("plan") as PlanType;
  const requestedCycle = params.get("cycle") as BillingCycle;

  const [plans, setPlans] = useState<Plan[]>([]);
  const [currentPlan, setCurrentPlan] = useState<PlanType | null>(null);
  const [subscriptionStatus, setSubscriptionStatus] =
    useState<SubscriptionStatus | null>(null);
  const [currentBillingCycle, setCurrentBillingCycle] =
    useState<BillingCycle | null>(null);
  const [preview, setPreview] = useState<PlanChangePreview | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchPlans() {
      try {
        const data = await getSubscriptionOverview();
        setPlans(data.plans);
        setCurrentPlan(data.currentPlan);
        setSubscriptionStatus(data.subscriptionStatus);
        setCurrentBillingCycle(data.billingCycle);
      } catch (err) {
        toast({
          title: "Error",
          description: "Failed to load subscription plans",
        });
      } finally {
        setLoading(false);
      }
    }

    fetchPlans();
  }, [toast]);

  const selectedPlan = plans.find((plans) => plans.type === plan);

  // A plan change while a paid plan is already active must keep the
  // existing billing cycle - the remaining time carries over, the cycle doesn't switch mid-change.
  const isPlanChange =
    !!selectedPlan &&
    subscriptionStatus === SubscriptionStatus.ACTIVE &&
    currentPlan !== null &&
    currentPlan !== PlanType.STARTER &&
    currentPlan !== selectedPlan.type;

  const effectiveCycle =
    isPlanChange && currentBillingCycle ? currentBillingCycle : requestedCycle;

  useEffect(() => {
    if (!selectedPlan || selectedPlan.type === PlanType.STARTER) {
      return;
    }

    getPlanChangePreview(selectedPlan.type, effectiveCycle)
      .then(setPreview)
      .catch(() => setPreview(null));
  }, [selectedPlan, effectiveCycle]);

  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center py-16">
        <Loader />
      </div>
    );
  }

  if (!selectedPlan) {
    return <div className="p-6 text-red-500">Invalid plan selected.</div>;
  }

  if (selectedPlan.type === PlanType.STARTER) {
    return <div className="p-6">This plan is free. No payment required.</div>;
  }

  if (
    currentPlan === selectedPlan.type &&
    subscriptionStatus === SubscriptionStatus.ACTIVE
  ) {
    return (
      <div className="p-6">You're already on the {selectedPlan.name} plan.</div>
    );
  }

  return (
    <BillingCheckout
      plan={selectedPlan}
      billingCycle={effectiveCycle}
      isPlanChange={isPlanChange}
      preview={preview}
    />
  );
}
