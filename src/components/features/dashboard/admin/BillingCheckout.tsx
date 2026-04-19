"use client";

import { useState } from "react";
import Heading from "@/components/ui/typography/Heading";
import { Text } from "@/components/ui/typography/Text";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { BillingCycle, PaymentProvider } from "@/lib/enums";
import { Check } from "lucide-react";
import { initializePayment } from "@/services/paymentService";
import { Plan } from "@/types";
import { Checkbox } from "@/components/ui/checkbox";

export default function BillingCheckout({
  plan,
  billingCycle,
}: {
  plan: Plan;
  billingCycle: BillingCycle;
}) {
  const [selectedMethod, setSelectedMethod] = useState<PaymentProvider>(
    PaymentProvider.PAYSTACK,
  );
  const [loading, setLoading] = useState(false);
  const [promoCode, setPromoCode] = useState("");
  const [agreed, setAgreed] = useState(false);

  const price =
    billingCycle === BillingCycle.MONTHLY
      ? plan.monthlyPrice
      : plan.yearlyPrice;

  const formatPrice = (price: number) => `₦${price.toLocaleString()}`;

  const handlePayment = async () => {
    try {
      setLoading(true);

      const response = await initializePayment({
        plan: plan.type,
        billingCycle,
        provider: selectedMethod, // ✅ simplified
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
      <div className="rounded-xl border bg-background p-6 space-y-6">
        <Heading level={3}>Order Summary</Heading>

        <div className="flex justify-between items-start">
          <div>
            <Text className="font-semibold">{plan.name} Plan</Text>
            <Text variant="muted">
              {billingCycle === BillingCycle.MONTHLY
                ? "Monthly Subscription"
                : "Yearly Subscription"}
            </Text>
          </div>

          <div className="text-right">
            <Heading level={4}>{formatPrice(price)}</Heading>
            <Text variant="muted">
              per {billingCycle === BillingCycle.MONTHLY ? "month" : "year"}
            </Text>
          </div>
        </div>

        <hr />

        <div className="space-y-3">
          <Text className="font-medium">What's included:</Text>

          {plan.features.map((feature) => (
            <div key={feature} className="flex items-center gap-2">
              <Check className="h-4 w-4 text-green-500" />
              <Text variant="muted">{feature}</Text>
            </div>
          ))}
        </div>

        <hr />

        <div className="space-y-2">
          <div className="flex justify-between">
            <Text variant="muted">Subtotal</Text>
            <Text>{formatPrice(price)}</Text>
          </div>

          <div className="flex justify-between">
            <Text variant="muted">Tax (0%)</Text>
            <Text>₦0</Text>
          </div>

          <div className="flex justify-between font-semibold">
            <Text>Total</Text>
            <Heading level={4}>{formatPrice(price)}</Heading>
          </div>
        </div>
      </div>

      <div className="space-y-6">
        <Heading level={3}>Payment Details</Heading>

        <div className="rounded-xl border p-4 space-y-3">
          <Text className="font-medium">Promo Code</Text>

          <div className="flex gap-2">
            <Input
              placeholder="Enter code"
              value={promoCode}
              onChange={(e) => setPromoCode(e.target.value)}
            />
            <Button variant="outline">Apply</Button>
          </div>
        </div>

        <div className="rounded-xl border p-4 space-y-4">
          <Text className="font-medium">Payment Method</Text>

          <div
            onClick={() => setSelectedMethod(PaymentProvider.PAYSTACK)}
            className={cn(
              "border rounded-lg p-4 cursor-pointer transition",
              selectedMethod === PaymentProvider.PAYSTACK
                ? "border-primary bg-primary/5"
                : "border-input",
            )}
          >
            <Text className="font-medium">Paystack</Text>
            <Text variant="muted">Card, Bank Transfer, USSD</Text>
          </div>

          <div
            onClick={() => setSelectedMethod(PaymentProvider.FLUTTERWAVE)}
            className={cn(
              "border rounded-lg p-4 cursor-pointer transition",
              selectedMethod === PaymentProvider.FLUTTERWAVE
                ? "border-primary bg-primary/5"
                : "border-input",
            )}
          >
            <Text className="font-medium">Flutterwave</Text>
            <Text variant="muted">Card, Bank Transfer, Mobile Money</Text>
          </div>
        </div>
        <div className="flex items-start gap-2">
          <Checkbox
            checked={agreed}
            onCheckedChange={(val) => setAgreed(!!val)}
          />

          <Text variant="muted" className="text-xs leading-5">
            By completing this purchase, you agree to our{" "}
            <span className="underline cursor-pointer">Terms of Service</span>{" "}
            and <span className="underline cursor-pointer">Privacy Policy</span>
            . Your subscription will automatically renew.
          </Text>
        </div>
        <Button
          onClick={handlePayment}
          disabled={loading || !agreed}
          className="w-full h-12 text-base"
        >
          {loading ? "Processing..." : `PAY ${formatPrice(price)} NOW`}
        </Button>
      </div>
    </div>
  );
}
