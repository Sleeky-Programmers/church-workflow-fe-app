"use client";

import { Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";

import { CurrencyManager } from "@/components/features/dashboard/finance/giving/currency-manager";
import { OfferingTypeManager } from "@/components/features/dashboard/finance/giving/offering-type-manager";
import { PaymentMethodManager } from "@/components/features/dashboard/finance/giving/payment-method-manager";
import { LocationManager } from "@/components/features/dashboard/settings/location-manager";
import { TitleManager } from "@/components/features/dashboard/settings/title-manager";
import { Loader } from "@/components/ui/loader";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import Heading from "@/components/ui/typography/Heading";
import { Text } from "@/components/ui/typography/Text";
import { useHasAccess } from "@/lib/access-control";
import { useUserStore } from "@/stores/useUserStore";

const TABS = [
  { value: "location", label: "Location" },
  { value: "titles", label: "Titles" },
  { value: "offering-currency", label: "Offering Currency" },
  { value: "offering-type", label: "Offering Type" },
  { value: "offering-payment-method", label: "Offering Payment Method" },
] as const;

export default function ConfigurationsSettingsPage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center py-20">
          <Loader size="w-10 h-10" showShadow={false} />
        </div>
      }
    >
      <ConfigurationsContent />
    </Suspense>
  );
}

function ConfigurationsContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const accessScope = useUserStore((state) => state.accessScope);
  const canManageLists = accessScope === "ORG_WIDE";
  const canManageGiving = useHasAccess("GIVING", "FULL_ACCESS");

  const activeTab = TABS.some((tab) => tab.value === searchParams.get("tab"))
    ? (searchParams.get("tab") as string)
    : TABS[0].value;

  const handleTabChange = (value: string) => {
    router.replace(`/dashboard/settings/configurations?tab=${value}`);
  };

  return (
    <div className="space-y-6">
      <Heading level={3}>Configurations</Heading>
      <Text variant="muted" className="text-sm">
        Manage the church-wide settings used across Members, Attendance,
        Events, and Giving. Changes apply church-wide, including all
        branches.
      </Text>

      <Tabs value={activeTab} onValueChange={handleTabChange}>
        <TabsList className="h-auto flex-wrap justify-start gap-1">
          {TABS.map((tab) => (
            <TabsTrigger key={tab.value} value={tab.value}>
              {tab.label}
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value="location" className="w-full">
          {!canManageLists && (
            <Text variant="muted" className="text-sm mb-3">
              Only org-wide admins can add, rename, or deactivate entries
              here.
            </Text>
          )}
          <LocationManager readOnly={!canManageLists} />
        </TabsContent>

        <TabsContent value="titles" className="w-full">
          {!canManageLists && (
            <Text variant="muted" className="text-sm mb-3">
              Only org-wide admins can add, rename, or deactivate entries
              here.
            </Text>
          )}
          <TitleManager readOnly={!canManageLists} />
        </TabsContent>

        <TabsContent value="offering-currency" className="w-full">
          {canManageGiving ? <CurrencyManager /> : <NoGivingAccess />}
        </TabsContent>

        <TabsContent value="offering-type" className="w-full">
          {canManageGiving ? <OfferingTypeManager /> : <NoGivingAccess />}
        </TabsContent>

        <TabsContent value="offering-payment-method" className="w-full">
          {canManageGiving ? <PaymentMethodManager /> : <NoGivingAccess />}
        </TabsContent>
      </Tabs>
    </div>
  );
}

function NoGivingAccess() {
  return (
    <div className="py-10 text-center">
      <Text variant="muted">
        You don&apos;t have permission to manage giving settings.
      </Text>
    </div>
  );
}
