"use client";

import { CheckCircle2, Home, XCircle } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";

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
import {
  verifyOnlineGiving,
  VerifyOnlineGivingResponse,
} from "@/services/onlineGivingService";
import { formatCurrency } from "@/utils/currency";

type VerifyStatus = "loading" | "success" | "failed" | "not_found";

export default function GiveVerifyPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-gray-50 flex items-center justify-center gap-3">
          <Loader />
          <Text variant="muted">Loading...</Text>
        </div>
      }
    >
      <GiveVerifyContent />
    </Suspense>
  );
}

function GiveVerifyContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Paystack-style redirect uses 'reference'; Flutterwave-style uses
  // 'tx_ref' - mirror src/app/payment/verify/page.tsx's handling.
  const reference = searchParams.get("reference") || searchParams.get("tx_ref");

  const [status, setStatus] = useState<VerifyStatus>("loading");
  const [data, setData] = useState<VerifyOnlineGivingResponse | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!reference) {
      setStatus("not_found");
      return;
    }

    verifyOnlineGiving(reference)
      .then((res) => {
        setData(res);
        setStatus(
          res.status?.toLowerCase() === "success" ? "success" : "failed",
        );
      })
      .catch((error: any) => {
        setStatus("failed");
        setErrorMessage(
          error.message || "We couldn't verify this gift. Please try again.",
        );
      });
  }, [reference]);

  const handleGoHome = () => {
    return router.push("/");
  };

  if (status === "loading") {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <Card className="max-w-md w-full shadow-xl border-0">
          <CardContent className="pt-8 pb-6 text-center">
            <div className="flex flex-col items-center">
              <Loader size="w-16 h-16" className="mb-2" />
              <CardTitle className="text-xl font-semibold mb-2">
                Verifying Your Gift
              </CardTitle>
              <CardDescription>
                Please wait while we confirm your giving...
              </CardDescription>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (status === "success" && data) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <Card className="max-w-md w-full shadow-xl border-0 border-t-4 border-t-green-500">
          <CardContent className="pt-8 pb-4 text-center">
            <div className="flex flex-col items-center">
              <div className="h-20 w-20 rounded-full bg-green-100 flex items-center justify-center mb-4">
                <CheckCircle2 className="h-12 w-12 text-green-600" />
              </div>
              <CardTitle className="text-2xl font-bold mb-2">
                Thank You!
              </CardTitle>
              <CardDescription className="text-base mb-4">
                Your giving has been received. We are grateful for your
                generosity.
              </CardDescription>

              <div className="w-full bg-gray-50 rounded-lg p-4 text-left space-y-2">
                <div className="flex justify-between text-sm">
                  <Text variant="muted">Amount</Text>
                  <Text className="font-medium">
                    {formatCurrency(data.amount, data.currencyCode)}
                  </Text>
                </div>
                <div className="flex justify-between text-sm">
                  <Text variant="muted">Towards</Text>
                  <Text className="font-medium">{data.offeringTypeName}</Text>
                </div>
              </div>
            </div>
          </CardContent>
          <CardFooter>
            <Button onClick={handleGoHome} className="w-full gap-2">
              <Home className="h-4 w-4 mr-2" />
              Done
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  if (status === "not_found") {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <Card className="max-w-md w-full shadow-xl border-0">
          <CardContent className="pt-8 pb-4 text-center">
            <div className="flex flex-col items-center">
              <div className="h-20 w-20 rounded-full bg-yellow-100 flex items-center justify-center mb-4">
                <XCircle className="h-12 w-12 text-yellow-600" />
              </div>
              <CardTitle className="text-2xl font-bold mb-2">
                No Reference Found
              </CardTitle>
              <CardDescription className="text-base mb-4">
                We could not find a giving reference to verify.
              </CardDescription>
            </div>
          </CardContent>
          <CardFooter>
            <Button variant="ghost" onClick={handleGoHome} className="w-full">
              <Home className="h-4 w-4 mr-2" />
              Go to Homepage
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  // Failed state.
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <Card className="max-w-md w-full shadow-xl border-0 border-t-4 border-t-red-500">
        <CardContent className="pt-8 pb-4 text-center">
          <div className="flex flex-col items-center">
            <div className="h-20 w-20 rounded-full bg-red-100 flex items-center justify-center mb-4">
              <XCircle className="h-12 w-12 text-red-600" />
            </div>
            <CardTitle className="text-2xl font-bold mb-2">
              Verification Failed
            </CardTitle>
            <CardDescription className="text-base mb-4">
              {errorMessage ||
                "We could not confirm this gift. Please contact the church if you were charged."}
            </CardDescription>
          </div>
        </CardContent>
        <CardFooter>
          <Button variant="ghost" onClick={handleGoHome} className="w-full">
            <Home className="h-4 w-4 mr-2" />
            Go to Homepage
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
