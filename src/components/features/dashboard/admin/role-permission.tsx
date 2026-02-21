"use client";

import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { RolePermissions as RolePermissionsType } from "../../../../types/user";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import Heading from "@/components/ui/typography/Heading";
import { Text } from "@/components/ui/typography/Text";

type RolePermissionsViewProps = {
  rolePermissions: RolePermissionsType;
  onBack: () => void;
};

export function RolePermissionsView({
  rolePermissions,
  onBack,
}: RolePermissionsViewProps) {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Button
          variant="ghost"
          size="sm"
          onClick={onBack}
          className="h-8 w-8 p-0"
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <Heading level={3}>{rolePermissions.role} Role Permissions</Heading>
      </div>

      <div>
        <Heading level={4} className=" mb-1">
          Description
        </Heading>
        <Text variant="muted">{rolePermissions.description}</Text>
      </div>

      <div>
        <Heading level={3} className=" mb-2">
          Permissions (Read-only)
        </Heading>
        <Text variant="default" className="mb-4">
          Permissions shown are inherited from the assigned role and cannot be
          edited here.
        </Text>

        <div className="space-y-6">
          {rolePermissions.permissions.map((permission, index) => (
            <div key={index} className="space-y-3">
              <Heading level={3}>{permission.module}</Heading>
              <RadioGroup value={permission.level} disabled>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="no_access" id={`no-access-${index}`} />
                  <Label
                    htmlFor={`no-access-${index}`}
                    className="text-sm font-normal cursor-not-allowed"
                  >
                    No Access
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="view" id={`view-${index}`} />
                  <Label
                    htmlFor={`view-${index}`}
                    className="text-sm font-normal cursor-not-allowed"
                  >
                    View → View members
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="manage" id={`manage-${index}`} />
                  <Label
                    htmlFor={`manage-${index}`}
                    className="text-sm font-normal cursor-not-allowed"
                  >
                    Manage → Add / Edit members
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem
                    value="full_access"
                    id={`full-access-${index}`}
                  />
                  <Label
                    htmlFor={`full-access-${index}`}
                    className="text-sm font-normal cursor-not-allowed"
                  >
                    {permission.description}
                  </Label>
                </div>
              </RadioGroup>
            </div>
          ))}
        </div>
      </div>

      <div className="flex justify-end pt-4 border-t">
        <Button onClick={onBack}>Done</Button>
      </div>
    </div>
  );
}
