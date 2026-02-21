"use client";

import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { RolePermissions as RolePermissionsType } from "../../../../../types/user";
import Heading from "@/components/ui/typography/Heading";
import { Text } from "@/components/ui/typography/Text";

type UserDetailsPermissionsViewProps = {
  rolePermissions: RolePermissionsType;
};

export function UserDetailsPermissionsView({
  rolePermissions,
}: UserDetailsPermissionsViewProps) {
  return (
    <div className="space-y-4">
      <div>
        <Heading level={3}>Permissions (Read-only)</Heading>
        <Text variant="default" className="mt-1">
          Permissions shown are inherited from the assigned role and cannot be
          edited here.
        </Text>
      </div>

      <div className="space-y-6">
        {rolePermissions.permissions.map((permission, index) => (
          <div key={index} className="space-y-3">
            <Heading level={4}>{permission.module}</Heading>
            <RadioGroup value={permission.level} disabled>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="no_access" id={`no-access-${index}`} />
                <Label
                  htmlFor={`no-access-${index}`}
                  className="text-sm font-normal cursor-not-allowed text-gray-600"
                >
                  No Access
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="view" id={`view-${index}`} />
                <Label
                  htmlFor={`view-${index}`}
                  className="text-sm font-normal cursor-not-allowed text-gray-600"
                >
                  View → View{" "}
                  {permission.module.toLowerCase().replace(" module", "")}
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="manage" id={`manage-${index}`} />
                <Label
                  htmlFor={`manage-${index}`}
                  className="text-sm font-normal cursor-not-allowed text-gray-600"
                >
                  Manage → Add / Edit{" "}
                  {permission.module.toLowerCase().replace(" module", "")}
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem
                  value="full_access"
                  id={`full-access-${index}`}
                />
                <Label
                  htmlFor={`full-access-${index}`}
                  className="text-sm font-normal cursor-not-allowed text-gray-600"
                >
                  {permission.description}
                </Label>
              </div>
            </RadioGroup>
          </div>
        ))}
      </div>
    </div>
  );
}
