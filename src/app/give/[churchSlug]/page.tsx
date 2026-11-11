"use client";

import { HeartHandshake } from "lucide-react";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader } from "@/components/ui/loader";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import Heading from "@/components/ui/typography/Heading";
import { Text } from "@/components/ui/typography/Text";
import {
  fetchGivingOptions,
  GivingOptionsResponse,
  initializeOnlineGiving,
} from "@/services/onlineGivingService";

// Gateway is auto-selected from the chosen currency rather than exposed as
// A separate picker - Paystack is used for NGN, Flutterwave for everything
// Else, mirroring the gateway split already used for subscription billing
// (see src/app/payment/verify/page.tsx). Revisit if more gateways are added.
function gatewayForCurrency(currencyCode: string): string {
  return currencyCode?.toUpperCase() === "NGN" ? "PAYSTACK" : "FLUTTERWAVE";
}

export default function GiveChurchPage() {
  const params = useParams();
  const churchSlug = Array.isArray(params?.churchSlug)
    ? params.churchSlug[0]
    : params?.churchSlug || "";

  const [options, setOptions] = useState<GivingOptionsResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  const [amount, setAmount] = useState("");
  const [currencyCode, setCurrencyCode] = useState("");
  const [offeringTypeId, setOfferingTypeId] = useState("");
  const [donorName, setDonorName] = useState("");
  const [donorEmail, setDonorEmail] = useState("");

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  useEffect(() => {
    if (!churchSlug) {
      return;
    }

    fetchGivingOptions(churchSlug)
      .then((data) => {
        setOptions(data);
        setCurrencyCode(
          data.currencies.find((c) => {
            return c.isDefault;
          })?.code ||
            data.currencies[0]?.code ||
            "",
        );
        setOfferingTypeId(data.offeringTypes[0]?.id || "");
      })
      .catch((error: any) => {
        setLoadError(
          error.message || "This giving link is unavailable right now.",
        );
      })
      .finally(() => {
        return setIsLoading(false);
      });
  }, [churchSlug]);

  const handleAmountChange = (raw: string) => {
    const normalized = raw.replace(/,/g, "");
    if (normalized !== "" && Number.isNaN(Number(normalized))) {
      return;
    }
    setAmount(normalized);
  };

  const handleSubmit = async () => {
    const parsedAmount = Number(amount);
    setSubmitError(null);

    if (!parsedAmount || parsedAmount <= 0) {
      setSubmitError("Enter a valid amount to give.");
      return;
    }
    if (!currencyCode || !offeringTypeId) {
      setSubmitError("Select a currency and an offering type.");
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await initializeOnlineGiving(churchSlug, {
        amount: parsedAmount,
        currencyCode,
        offeringTypeId,
        donorName: donorName.trim() || undefined,
        donorEmail: donorEmail.trim() || undefined,
        gateway: gatewayForCurrency(currencyCode),
      });

      window.location.href = response.redirectUrl;
    } catch (error: any) {
      setSubmitError(
        error.message || "Failed to start your giving. Please try again.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center gap-3">
        <Loader />
        <Text variant="muted">Loading...</Text>
      </div>
    );
  }

  if (loadError || !options) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="w-full max-w-md bg-white rounded-2xl shadow-sm border border-gray-200 p-8 text-center">
          <Text variant="muted">
            {loadError || "This giving link is unavailable right now."}
          </Text>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4 py-16">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-sm border border-gray-200 p-8 flex flex-col gap-6">
        <div className="flex flex-col items-center gap-2 text-center">
          <div className="h-14 w-14 rounded-full bg-[#0C5FB3]/10 flex items-center justify-center">
            <HeartHandshake className="h-7 w-7 text-[#0C5FB3]" />
          </div>
          <Heading level={2} className="text-2xl font-black text-gray-900">
            Give to {options.churchName}
          </Heading>
          <Text variant="muted" className="text-sm">
            Your giving makes a difference. Thank you for your generosity.
          </Text>
        </div>

        <div className="flex flex-col gap-2">
          <label className="text-sm font-medium text-gray-700">Amount</label>
          <div className="flex gap-2">
            <Select value={currencyCode} onValueChange={setCurrencyCode}>
              <SelectTrigger className="w-28 shrink-0">
                <SelectValue placeholder="Currency" />
              </SelectTrigger>
              <SelectContent>
                {options.currencies.map((currency) => {
                  return (
                    <SelectItem key={currency.code} value={currency.code}>
                      {currency.code}
                    </SelectItem>
                  );
                })}
              </SelectContent>
            </Select>
            <Input
              inputMode="decimal"
              placeholder="0.00"
              value={amount}
              onChange={(e) => {
                return handleAmountChange(e.target.value);
              }}
              disabled={isSubmitting}
            />
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <label className="text-sm font-medium text-gray-700">
            Give Towards
          </label>
          <Select value={offeringTypeId} onValueChange={setOfferingTypeId}>
            <SelectTrigger>
              <SelectValue placeholder="Select an offering type" />
            </SelectTrigger>
            <SelectContent>
              {options.offeringTypes.map((type) => {
                return (
                  <SelectItem key={type.id} value={type.id}>
                    {type.name}
                  </SelectItem>
                );
              })}
            </SelectContent>
          </Select>
        </div>

        <div className="flex flex-col gap-2">
          <label className="text-sm font-medium text-gray-700">
            Your Name{" "}
            <span className="text-gray-400 font-normal">(optional)</span>
          </label>
          <Input
            value={donorName}
            onChange={(e) => {
              return setDonorName(e.target.value);
            }}
            placeholder="Full name"
            disabled={isSubmitting}
          />
        </div>

        <div className="flex flex-col gap-2">
          <label className="text-sm font-medium text-gray-700">
            Email{" "}
            <span className="text-gray-400 font-normal">
              (optional, for your receipt)
            </span>
          </label>
          <Input
            type="email"
            value={donorEmail}
            onChange={(e) => {
              return setDonorEmail(e.target.value);
            }}
            placeholder="you@example.com"
            disabled={isSubmitting}
          />
        </div>

        {submitError && (
          <div className="rounded-lg bg-red-50 border border-red-200 px-4 py-3">
            <Text variant="muted" className="text-red-600 text-sm">
              {submitError}
            </Text>
          </div>
        )}

        <Button
          onClick={handleSubmit}
          disabled={isSubmitting}
          className="w-full py-6 rounded-[8px]"
        >
          {isSubmitting ? (
            <span className="flex items-center gap-2">
              <Loader size="w-5 h-5" showShadow={false} />
              Redirecting to payment...
            </span>
          ) : (
            "Give Now"
          )}
        </Button>
      </div>
    </div>
  );
}
