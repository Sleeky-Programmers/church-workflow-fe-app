"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";

import BillingCheckout from "@/components/features/dashboard/admin/BillingCheckout";
import { getSubscriptionOverview } from "@/services/billingService";
import { useToast } from "@/hooks/use-toast";
import { Plan } from "@/types";
import { PlanType, BillingCycle } from "@/lib/enums";
import { Loader } from "@/components/ui/loader";

export default function CheckoutPage() {
  const params = useSearchParams();
  const { toast } = useToast();

  const plan = params.get("plan") as PlanType;
  const cycle = params.get("cycle") as BillingCycle;

  const [plans, setPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchPlans() {
      try {
        const data = await getSubscriptionOverview();
        setPlans(data.plans);
        toast({
          title: "Plans loaded",
          description: "Subscription plans loaded successfully",
        });
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

  return <BillingCheckout plan={selectedPlan} billingCycle={cycle} />;
}
