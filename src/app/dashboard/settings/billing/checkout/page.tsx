"use client";

import { useState } from "react";
import Heading from "@/components/ui/typography/Heading";
import { Text } from "@/components/ui/typography/Text";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { PlanType, BillingCycle } from "@/lib/enums";
import { Check } from "lucide-react";
import { initializePayment } from "@/services/paymentService";
import { PaymentProvider } from "@/lib/enums";
import { PaymentType } from "@/services/billingService";

export default function BillingCheckout({
  plan,
  billingCycle,
  price,
}: {
  plan: PlanType;
  billingCycle: BillingCycle;
  price: number;
}) {
  const [selectedMethod, setSelectedMethod] = useState<
    "paystack" | "flutterwave"
  >("paystack");
  const [loading, setLoading] = useState(false);
  const [promoCode, setPromoCode] = useState("");

  const handlePayment = async () => {
    try {
      setLoading(true);

      const provider =
        selectedMethod === "paystack"
          ? PaymentProvider.PAYSTACK
          : PaymentProvider.FLUTTERWAVE;

      const response = await initializePayment({
        plan,
        billingCycle,
        provider,
        promoCode: promoCode || undefined,
        autoRenew: true,
      });

      window.location.href = response.authorization_url;
    } catch (err) {
      console.error("Payment init failed:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* ================= LEFT: ORDER SUMMARY ================= */}
      <div className="rounded-xl border bg-background p-6 space-y-6">
        <Heading level={3}>Order Summary</Heading>

        {/* Plan */}
        <div className="flex justify-between items-start">
          <div>
            <Text className="font-semibold">Growth Plan</Text>
            <Text variant="muted">Monthly Subscription</Text>
          </div>

          <div className="text-right">
            <Heading level={4}>₦20,000</Heading>
            <Text variant="muted">per month</Text>
          </div>
        </div>

        <hr />

        {/* Features */}
        <div className="space-y-3">
          <Text className="font-medium">What's included:</Text>

          {[
            "Up to 500 active members",
            "Custom roles & permissions",
            "Advanced analytics & reporting",
            "SMS & email notifications",
            "Priority customer support",
            "Custom branding options",
          ].map((feature) => (
            <div key={feature} className="flex items-center gap-2">
              <Check className="h-4 w-4 text-green-500" />
              <Text variant="muted">{feature}</Text>
            </div>
          ))}
        </div>

        <hr />

        {/* Pricing */}
        <div className="space-y-2">
          <div className="flex justify-between">
            <Text variant="muted">Subtotal</Text>
            <Text>₦20,000</Text>
          </div>

          <div className="flex justify-between">
            <Text variant="muted">Tax (0%)</Text>
            <Text>₦0</Text>
          </div>

          <div className="flex justify-between font-semibold">
            <Text>Total</Text>
            <Heading level={4}>₦20,000</Heading>
          </div>
        </div>
      </div>

      <div className="space-y-6">
        <Heading level={3}>Payment Details</Heading>

        <div className="rounded-xl border p-4 space-y-3">
          <Text className="font-medium">Promo Code</Text>
          <Input
            placeholder="Enter code"
            value={promoCode}
            onChange={(e) => setPromoCode(e.target.value)}
          />
          <div className="flex gap-2">
            <Input placeholder="Enter code" />
            <Button variant="outline">Apply</Button>
          </div>
        </div>

        <div className="rounded-xl border p-4 space-y-4">
          <Text className="font-medium">Payment Method</Text>

          <div
            onClick={() => setSelectedMethod("paystack")}
            className={cn(
              "border rounded-lg p-4 cursor-pointer transition",
              selectedMethod === "paystack"
                ? "border-primary bg-primary/5"
                : "border-input",
            )}
          >
            <Text className="font-medium">Paystack</Text>
            <Text variant="muted">Card, Bank Transfer, USSD</Text>
            <Text variant="muted">Secure payment via Paystack</Text>
          </div>

          <div
            onClick={() => setSelectedMethod("flutterwave")}
            className={cn(
              "border rounded-lg p-4 cursor-pointer transition",
              selectedMethod === "flutterwave"
                ? "border-primary bg-primary/5"
                : "border-input",
            )}
          >
            <Text className="font-medium">Flutterwave</Text>
            <Text variant="muted">Card, Bank Transfer, Mobile Money</Text>
            <Text variant="muted">Secure payment via Flutterwave</Text>
          </div>
        </div>

        <Button
          onClick={handlePayment}
          disabled={loading}
          className="w-full h-12 text-base"
        >
          {loading ? "Processing..." : `PAY ₦${price.toLocaleString()} NOW`}
        </Button>
        <Text variant="muted" className="text-center text-xs">
          By completing this purchase, you agree to our Terms of Service and
          Privacy Policy. Your subscription will automatically renew monthly.
        </Text>
      </div>
    </div>
  );
}
