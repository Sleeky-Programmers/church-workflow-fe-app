"use client";

import { AlertTriangle, X } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

import { fetchGivingConfigStatus } from "@/services/givingConfigService";

const MISSING_ITEMS: {
  key: "hasDefaultCurrency" | "hasDefaultOfferingType" | "hasActivePaymentMethod";
  label: string;
  tab: string;
}[] = [
  { key: "hasDefaultCurrency", label: "Offering Currency", tab: "offering-currency" },
  { key: "hasDefaultOfferingType", label: "Offering Type", tab: "offering-type" },
  {
    key: "hasActivePaymentMethod",
    label: "Offering Payment Method",
    tab: "offering-payment-method",
  },
];

export function GivingConfigWarningBanner() {
  const [missing, setMissing] = useState<typeof MISSING_ITEMS>([]);
  const [isLoaded, setIsLoaded] = useState(false);
  // Closing is temporary: it shows again on reload or when the page is revisited.
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    fetchGivingConfigStatus()
      .then((status) => {
        setMissing(MISSING_ITEMS.filter((item) => !status[item.key]));
      })
      .catch(() => {})
      .finally(() => setIsLoaded(true));
  }, []);

  if (!isLoaded || !missing.length || dismissed) return null;

  return (
    <div className="flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3">
      <AlertTriangle className="h-5 w-5 shrink-0 text-amber-600 mt-0.5" />
      <div className="flex-1 text-sm text-amber-800">
        <p className="font-semibold">
          {missing.map((item) => item.label).join(", ")} have not been set.
        </p>
        <p className="mt-0.5">
          Configure them in{" "}
          <Link
            href={`/dashboard/settings/configurations?tab=${missing[0].tab}`}
            className="underline font-medium"
          >
            Settings &gt; Configurations
          </Link>{" "}
          before recording a Given.
        </p>
      </div>
      <button
        type="button"
        onClick={() => setDismissed(true)}
        className="shrink-0 rounded p-0.5 text-amber-700/70 hover:bg-amber-100 hover:text-amber-900"
        aria-label="Dismiss"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  );
}
