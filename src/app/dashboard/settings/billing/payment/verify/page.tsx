"use client";

import {
  ArrowRight,
  CheckCircle2,
  CreditCard,
  Home,
  XCircle,
} from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardTitle,
} from "@/components/ui/card";
import { Loader } from "@/components/ui/loader";
import { Text } from "@/components/ui/typography/Text";
import { useToast } from "@/hooks/use-toast";
import { manualVerifyPayment } from "@/services/paymentService";

type PaymentStatus =
  | "idle"
  | "loading"
  | "success"
  | "failed"
  | "cancelled"
  | "not_found";

interface PaymentVerificationData {
  status: string;
  reference: string;
  amount: number;
  plan: string;
  billingCycle: string;
  message?: string;
  subscription?: {
    id: string;
    plan: string;
    status: string;
  };
}

export default function PaymentVerifyPage() {
  const router = useRouter();
  const { toast } = useToast();
  const searchParams = useSearchParams();

  // Paystack uses 'reference'
  const reference = searchParams.get("reference");
  // Flutterwave uses 'tx_ref' and 'transaction_id'
  const txRef = searchParams.get("tx_ref");
  const transactionId = searchParams.get("transaction_id");
  // Flutterwave also returns 'status' as 'success-pending-validation'
  const statusParam = searchParams.get("status");

  const [paymentStatus, setPaymentStatus] = useState<PaymentStatus>("idle");
  const [paymentData, setPaymentData] =
    useState<PaymentVerificationData | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [, setIsVerifying] = useState(false);

  // Get the actual reference - Flutterwave uses tx_ref, Paystack uses reference
  const actualReference = txRef || reference;

  // Detect the provider from the URL parameters
  const detectProvider = (): "PAYSTACK" | "FLUTTERWAVE" => {
    // If we have tx_ref and transaction_id, it's definitely Flutterwave
    if (txRef && transactionId) {
      return "FLUTTERWAVE";
    }

    // If we have tx_ref but no reference, it's Flutterwave
    if (txRef && !reference) {
      return "FLUTTERWAVE";
    }

    // If we have reference but no tx_ref, it's Paystack
    if (reference && !txRef) {
      return "PAYSTACK";
    }

    // If we have both (rare), check the format
    if (txRef && reference) {
      // Flutterwave tx_ref starts with CW- or similar
      if (txRef.startsWith("CW-") || txRef.startsWith("FLW-")) {
        return "FLUTTERWAVE";
      }
      return "PAYSTACK";
    }

    return "PAYSTACK";
  };

  const provider = detectProvider();

  // Check if payment was cancelled by user
  const isCancelled =
    statusParam?.toLowerCase() === "cancelled" ||
    statusParam?.toLowerCase() === "canceled";

  const handleVerifyPayment = async () => {
    if (!actualReference) {
      setPaymentStatus("not_found");
      setErrorMessage(
        "No payment reference found. Please check your payment status in your account.",
      );
      return;
    }

    setIsVerifying(true);
    setPaymentStatus("loading");

    try {
      const response = await manualVerifyPayment(
        actualReference,
        provider,
        transactionId || undefined,
      );

      if (response && response.status === "success") {
        setPaymentStatus("success");
        setPaymentData({
          status: response.status,
          reference: actualReference,
          amount: response.amount / 100,
          plan: response.metadata?.plan || "N/A",
          billingCycle: response.metadata?.billingCycle || "N/A",
        });
        toast({
          title: "Payment Successful! 🎉",
          description: `Your subscription has been activated.`,
        });
      } else {
        setPaymentStatus("failed");
        setErrorMessage(
          response?.message ||
            "Payment verification failed. Please try again or contact support.",
        );
        toast({
          title: "Payment Verification Failed",
          description:
            response?.message || "Please try again or contact support.",
          variant: "destructive",
        });
      }
    } catch (error: any) {
      setPaymentStatus("failed");
      setErrorMessage(
        error?.message || "Failed to verify payment. Please contact support.",
      );
      toast({
        title: "Error",
        description:
          error?.message || "Failed to verify payment. Please contact support.",
        variant: "destructive",
      });
    } finally {
      setIsVerifying(false);
    }
  };

  const handleGoToDashboard = () => {
    router.push("/dashboard");
  };

  const handleGoToBilling = () => {
    router.push("/dashboard/settings/billing");
  };

  const handleRetry = () => {
    setPaymentStatus("idle");
    setErrorMessage(null);
    setIsVerifying(false);
  };

  const handleContactSupport = () => {
    window.location.href = "mailto:support@churchworkflow.com";
  };

  // If payment was cancelled, show cancelled state
  if (isCancelled) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <Card className="max-w-md w-full shadow-xl border-0 border-t-4 border-t-yellow-500">
          <CardContent className="pt-8 pb-4 text-center">
            <div className="flex flex-col items-center">
              <div className="h-20 w-20 rounded-full bg-yellow-100 flex items-center justify-center mb-4">
                <XCircle className="h-12 w-12 text-yellow-600" />
              </div>
              <CardTitle className="text-2xl font-bold mb-2">
                Payment Cancelled
              </CardTitle>
              <CardDescription className="text-base mb-4">
                You cancelled the payment process. No charges were made.
              </CardDescription>

              <div className="w-full bg-yellow-50 rounded-lg p-4 text-left">
                <Text variant="muted" className="text-sm">
                  <span className="font-medium">Reference:</span>{" "}
                  {actualReference}
                </Text>
                {transactionId && (
                  <Text variant="muted" className="text-sm mt-1">
                    <span className="font-medium">Transaction ID:</span>{" "}
                    {transactionId}
                  </Text>
                )}
                <Text variant="muted" className="text-sm mt-1">
                  <span className="font-medium">Provider:</span> {provider}
                </Text>
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex flex-col gap-2">
            <Button onClick={handleGoToBilling} className="w-full gap-2">
              <CreditCard className="h-4 w-4 mr-2" />
              Back to Billing
            </Button>
            <Button
              variant="ghost"
              onClick={handleGoToDashboard}
              className="w-full"
            >
              <Home className="h-4 w-4 mr-2" />
              Go to Dashboard
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  // Idle State - Show verify button
  if (paymentStatus === "idle") {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <Card className="max-w-md w-full shadow-xl border-0">
          <CardContent className="pt-8 pb-6 text-center">
            <div className="flex flex-col items-center">
              <div className="h-20 w-20 rounded-full bg-blue-100 flex items-center justify-center mb-4">
                <CreditCard className="h-12 w-12 text-blue-600" />
              </div>
              <CardTitle className="text-2xl font-bold mb-2">
                Verify Your Payment
              </CardTitle>
              <CardDescription className="text-base mb-4">
                {provider === "FLUTTERWAVE"
                  ? "Your Flutterwave payment is being processed. Click below to verify."
                  : "Click the button below to verify your payment status."}
              </CardDescription>

              <div className="w-full bg-gray-50 rounded-lg p-4 text-left space-y-2 mb-4">
                <div className="flex justify-between text-sm">
                  <Text variant="muted">Reference</Text>
                  <Text className="font-mono text-xs">
                    {actualReference || "N/A"}
                  </Text>
                </div>
                {transactionId && (
                  <div className="flex justify-between text-sm">
                    <Text variant="muted">Transaction ID</Text>
                    <Text className="font-mono text-xs">{transactionId}</Text>
                  </div>
                )}
                <div className="flex justify-between text-sm">
                  <Text variant="muted">Provider</Text>
                  <Text className="font-medium">{provider}</Text>
                </div>
                {statusParam && statusParam !== "cancelled" && (
                  <div className="flex justify-between text-sm">
                    <Text variant="muted">Status</Text>
                    <Text className="font-medium text-yellow-600">
                      {statusParam}
                    </Text>
                  </div>
                )}
              </div>

              <Button
                onClick={handleVerifyPayment}
                className="w-full gap-2"
                size="lg"
              >
                Verify Payment
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Loading State
  if (paymentStatus === "loading") {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <Card className="max-w-md w-full shadow-xl border-0">
          <CardContent className="pt-8 pb-6 text-center">
            <div className="flex flex-col items-center">
              <Loader size="w-16 h-16" className="mb-2" />
              <CardTitle className="text-xl font-semibold mb-2">
                Verifying Payment
              </CardTitle>
              <CardDescription>
                Please wait while we verify your payment...
              </CardDescription>
              <Text variant="muted" className="text-xs mt-4">
                This may take a few moments
              </Text>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Success State
  if (paymentStatus === "success" && paymentData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <Card className="max-w-md w-full shadow-xl border-0 border-t-4 border-t-green-500">
          <CardContent className="pt-8 pb-4 text-center">
            <div className="flex flex-col items-center">
              <div className="h-20 w-20 rounded-full bg-green-100 flex items-center justify-center mb-4">
                <CheckCircle2 className="h-12 w-12 text-green-600" />
              </div>
              <CardTitle className="text-2xl font-bold mb-2">
                Payment Successful! 🎉
              </CardTitle>
              <CardDescription className="text-base mb-4">
                Your subscription has been activated successfully.
              </CardDescription>

              <div className="w-full bg-gray-50 rounded-lg p-4 text-left space-y-2">
                <div className="flex justify-between text-sm">
                  <Text variant="muted">Plan</Text>
                  <Text className="font-medium">{paymentData.plan}</Text>
                </div>
                <div className="flex justify-between text-sm">
                  <Text variant="muted">Billing Cycle</Text>
                  <Text className="font-medium">
                    {paymentData.billingCycle}
                  </Text>
                </div>
                <div className="flex justify-between text-sm">
                  <Text variant="muted">Amount</Text>
                  <Text className="font-medium">
                    ₦{paymentData.amount?.toLocaleString()}
                  </Text>
                </div>
                <div className="flex justify-between text-sm">
                  <Text variant="muted">Reference</Text>
                  <Text className="font-mono text-xs">
                    {paymentData.reference}
                  </Text>
                </div>
                {transactionId && (
                  <div className="flex justify-between text-sm">
                    <Text variant="muted">Transaction ID</Text>
                    <Text className="font-mono text-xs">{transactionId}</Text>
                  </div>
                )}
                <div className="flex justify-between text-sm">
                  <Text variant="muted">Provider</Text>
                  <Text className="font-medium">{provider}</Text>
                </div>
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex flex-col gap-2">
            <Button onClick={handleGoToDashboard} className="w-full gap-2">
              Go to Dashboard
              <ArrowRight className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              onClick={handleGoToBilling}
              className="w-full"
            >
              <CreditCard className="h-4 w-4 mr-2" />
              View Billing
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  // Failed State
  if (paymentStatus === "failed") {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <Card className="max-w-md w-full shadow-xl border-0 border-t-4 border-t-red-500">
          <CardContent className="pt-8 pb-4 text-center">
            <div className="flex flex-col items-center">
              <div className="h-20 w-20 rounded-full bg-red-100 flex items-center justify-center mb-4">
                <XCircle className="h-12 w-12 text-red-600" />
              </div>
              <CardTitle className="text-2xl font-bold mb-2">
                Payment Failed
              </CardTitle>
              <CardDescription className="text-base mb-4">
                {errorMessage ||
                  "We could not process your payment. Please try again."}
              </CardDescription>

              <div className="w-full bg-red-50 rounded-lg p-4 text-left">
                <Text variant="muted" className="text-sm">
                  <span className="font-medium">Reference:</span>{" "}
                  {actualReference}
                </Text>
                {transactionId && (
                  <Text variant="muted" className="text-sm mt-1">
                    <span className="font-medium">Transaction ID:</span>{" "}
                    {transactionId}
                  </Text>
                )}
                <Text variant="muted" className="text-sm mt-1">
                  <span className="font-medium">Provider:</span> {provider}
                </Text>
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex flex-col gap-2">
            <Button onClick={handleRetry} className="w-full gap-2">
              Try Again
            </Button>
            <Button
              variant="outline"
              onClick={handleContactSupport}
              className="w-full"
            >
              Contact Support
            </Button>
            <Button
              variant="ghost"
              onClick={handleGoToDashboard}
              className="w-full"
            >
              <Home className="h-4 w-4 mr-2" />
              Go to Dashboard
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  // Not Found State
  if (paymentStatus === "not_found") {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <Card className="max-w-md w-full shadow-xl border-0">
          <CardContent className="pt-8 pb-4 text-center">
            <div className="flex flex-col items-center">
              <div className="h-20 w-20 rounded-full bg-yellow-100 flex items-center justify-center mb-4">
                <XCircle className="h-12 w-12 text-yellow-600" />
              </div>
              <CardTitle className="text-2xl font-bold mb-2">
                No Payment Reference Found
              </CardTitle>
              <CardDescription className="text-base mb-4">
                {errorMessage ||
                  "We could not find a payment reference to verify."}
              </CardDescription>
            </div>
          </CardContent>
          <CardFooter className="flex flex-col gap-2">
            <Button onClick={handleGoToBilling} className="w-full gap-2">
              <CreditCard className="h-4 w-4 mr-2" />
              Go to Billing
            </Button>
            <Button
              variant="ghost"
              onClick={handleGoToDashboard}
              className="w-full"
            >
              <Home className="h-4 w-4 mr-2" />
              Go to Dashboard
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  return null;
}
