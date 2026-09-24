"use client";

import { LocationManager } from "@/components/features/dashboard/settings/location-manager";
import { TitleManager } from "@/components/features/dashboard/settings/title-manager";
import Heading from "@/components/ui/typography/Heading";
import { Text } from "@/components/ui/typography/Text";
import { useUserStore } from "@/stores/useUserStore";

export default function ListsSettingsPage() {
  const accessScope = useUserStore((state) => state.accessScope);
  const canManage = accessScope === "ORG_WIDE";

  return (
    <div className="space-y-6">
      <Heading level={3}>Titles & Locations</Heading>

      <Text variant="muted" className="text-sm">
        Manage the titles and locations available across Members, Attendance,
        and Events. Changes apply church-wide, including all branches.
      </Text>

      {!canManage && (
        <Text variant="muted" className="text-sm">
          Only org-wide admins can add, rename, or deactivate entries here.
        </Text>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <TitleManager readOnly={!canManage} />
        <LocationManager readOnly={!canManage} />
      </div>
    </div>
  );
}
