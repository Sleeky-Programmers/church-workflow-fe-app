"use client";

import { CurrencyManager } from "@/components/features/dashboard/finance/giving/currency-manager";
import { OfferingTypeManager } from "@/components/features/dashboard/finance/giving/offering-type-manager";
import { SidebarTrigger } from "@/components/ui/sidebar";
import Heading from "@/components/ui/typography/Heading";
import { Text } from "@/components/ui/typography/Text";
import { useHasAccess } from "@/lib/access-control";

export default function GivingSettingsPage() {
  const canFullAccess = useHasAccess("GIVING", "FULL_ACCESS");

  if (!canFullAccess) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <SidebarTrigger className="sm:hidden" />
          <Heading level={2} text="Giving Settings" />
        </div>
        <div className="py-16 text-center">
          <Text variant="muted">
            You don&apos;t have permission to manage giving settings.
          </Text>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <SidebarTrigger className="sm:hidden" />
        <Heading level={2} text="Giving Settings" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <OfferingTypeManager />
        <CurrencyManager />
      </div>
    </div>
  );
}
