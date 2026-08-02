"use client";

import { useState } from "react";
import Heading from "@/components/ui/typography/Heading";
import { Text } from "@/components/ui/typography/Text";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader } from "@/components/ui/loader";
import { cn } from "@/lib/utils";
import { BillingCycle, DiscountType, PaymentProvider } from "@/lib/enums";
import { Check, X } from "lucide-react";
import { initializePayment } from "@/services/paymentService";
import { validateCoupon } from "@/services/couponService";
import { Coupon, Plan, PlanChangePreview } from "@/types";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { useUserStore } from "@/stores/useUserStore";

export default function BillingCheckout({
  plan,
  billingCycle,
  isPlanChange = false,
  preview = null,
}: {
  plan: Plan;
  billingCycle: BillingCycle;
  isPlanChange?: boolean;
  preview?: PlanChangePreview | null;
}) {
  const { toast } = useToast();
  const church = useUserStore((state) => state.church);

  const [selectedMethod, setSelectedMethod] = useState<PaymentProvider>(
    PaymentProvider.PAYSTACK,
  );
  const [loading, setLoading] = useState(false);
  const [promoCode, setPromoCode] = useState("");
  const [isApplyingCoupon, setIsApplyingCoupon] = useState(false);
  const [couponError, setCouponError] = useState<string | null>(null);
  const [appliedCoupon, setAppliedCoupon] = useState<Coupon | null>(null);
  const [agreed, setAgreed] = useState(false);

  const price =
    billingCycle === BillingCycle.MONTHLY
      ? plan.monthlyPrice
      : plan.yearlyPrice;

  const discountAmount = appliedCoupon
    ? appliedCoupon.discountType === DiscountType.PERCENTAGE
      ? Math.min(Math.round((price * appliedCoupon.discount) / 100), price)
      : Math.min(appliedCoupon.discount, price)
    : 0;

  const total = price - discountAmount;

  const formatPrice = (price: number) => `₦${price.toLocaleString()}`;

  const handlePromoCodeChange = (value: string) => {
    setPromoCode(value);
    if (appliedCoupon) setAppliedCoupon(null);
    if (couponError) setCouponError(null);
  };

  const handleApplyCoupon = async () => {
    const code = promoCode.trim();
    if (!code) {
      setCouponError("Enter a coupon code");
      return;
    }

    setIsApplyingCoupon(true);
    setCouponError(null);

    try {
      const coupon = await validateCoupon({
        code: code.toUpperCase(),
        planType: plan.type,
        churchId: church?._id,
      });

      setAppliedCoupon(coupon);
      toast({
        title: "Coupon applied",
        description: `${coupon.code} has been applied to your order`,
      });
    } catch (error: any) {
      setAppliedCoupon(null);
      setCouponError(error?.message || "Invalid coupon code");
    } finally {
      setIsApplyingCoupon(false);
    }
  };

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
    setPromoCode("");
    setCouponError(null);
  };

  const handlePayment = async () => {
    try {
      setLoading(true);

      const response = await initializePayment({
        plan: plan.type,
        billingCycle,
        provider: selectedMethod, // ✅ simplified
        promoCode: appliedCoupon?.code || undefined,
        autoRenew: true,
      });

      window.location.href = response.authorization_url;
    } catch (err: any) {
      toast({
        title: "Payment failed",
        description:
          err?.message || "Failed to start payment. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (date: string) =>
    new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });

  return (
    <div className="space-y-6">
      {isPlanChange && (
        <div className="rounded-xl border border-primary/30 bg-primary/5 p-4 space-y-1">
          <Text className="font-medium">Plan change</Text>
          <Text variant="muted" className="text-xs">
            {preview && preview.remainingDays > 0
              ? `${preview.remainingDays} day${
                  preview.remainingDays === 1 ? "" : "s"
                } remaining on your current plan will be added on top of the ${
                  plan.name
                } plan's period.`
              : `You're switching to the ${plan.name} plan.`}
          </Text>
          {preview?.newEndDate && (
            <Text variant="muted" className="text-xs">
              Your new plan will be active until{" "}
              {formatDate(preview.newEndDate)}.
            </Text>
          )}
        </div>
      )}

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

            {appliedCoupon && (
              <div className="flex justify-between">
                <Text variant="muted">Discount ({appliedCoupon.code})</Text>
                <Text className="text-green-600">
                  -{formatPrice(discountAmount)}
                </Text>
              </div>
            )}

            <div className="flex justify-between">
              <Text variant="muted">Tax (0%)</Text>
              <Text>₦0</Text>
            </div>

            <div className="flex justify-between font-semibold">
              <Text>Total</Text>
              <Heading level={4}>{formatPrice(total)}</Heading>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <Heading level={3}>Payment Details</Heading>

          <div className="rounded-xl border p-4 space-y-3">
            <Text className="font-medium">Promo Code</Text>

            {appliedCoupon ? (
              <div className="flex items-center justify-between rounded-lg border border-green-200 bg-green-50 px-3 py-2">
                <div className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-green-600" />
                  <Text className="text-green-700 font-medium">
                    {appliedCoupon.code} applied
                  </Text>
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6"
                  onClick={handleRemoveCoupon}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ) : (
              <>
                <div className="flex gap-2">
                  <Input
                    placeholder="Enter code"
                    value={promoCode}
                    onChange={(e) => handlePromoCodeChange(e.target.value)}
                    disabled={isApplyingCoupon}
                    className={couponError ? "border-destructive-600" : ""}
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleApplyCoupon}
                    disabled={isApplyingCoupon || !promoCode.trim()}
                  >
                    {isApplyingCoupon ? (
                      <span className="flex items-center gap-2">
                        <Loader size="w-4 h-4" showShadow={false} />
                        Applying...
                      </span>
                    ) : (
                      "Apply"
                    )}
                  </Button>
                </div>
                {couponError && (
                  <Text variant="error" className="text-xs">
                    {couponError}
                  </Text>
                )}
              </>
            )}
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
              and{" "}
              <span className="underline cursor-pointer">Privacy Policy</span>.
              Your subscription will automatically renew.
            </Text>
          </div>
          <Button
            onClick={handlePayment}
            disabled={loading || !agreed}
            className="w-full h-12 text-base"
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <Loader size="w-5 h-5" showShadow={false} />
                Processing...
              </span>
            ) : (
              `PAY ${formatPrice(total)} NOW`
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
