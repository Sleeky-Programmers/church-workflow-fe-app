"use client";

import { RolePermissions as RolePermissionsType } from "../../../../../types/user";
import { Button } from "@/components/ui/button";
import Heading from "@/components/ui/typography/Heading";
import { Text } from "@/components/ui/typography/Text";
import { PermissionModuleSelector } from "./permission-selector";
import { MODULE_PERMISSIONS } from "@/lib/role-constants";
import { PermissionLevel } from "@/types";

type UserDetailsPermissionsViewProps = {
  rolePermissions: RolePermissionsType;
  // Known for role-management contexts (viewing a role from Roles &
  // Permissions) - drives which explanatory copy renders. Omit for contexts
  // where "system vs custom" isn't the relevant framing (e.g. previewing a
  // role while inviting someone, or viewing a specific user's inherited
  // permissions) and pass headerNote instead.
  roleType?: "system" | "custom";
  // Shown only when roleType === "custom" - switches the caller to edit mode.
  onEditRole?: () => void;
  // Override copy for contexts where roleType isn't applicable.
  headerNote?: string;
};

export function UserDetailsPermissionsView({
  rolePermissions,
  roleType,
  onEditRole,
  headerNote,
}: UserDetailsPermissionsViewProps) {
  return (
    <div className="space-y-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <Heading level={3}>Permissions</Heading>
          <Text variant="default" className="mt-1">
            {roleType === "system"
              ? "System role — permissions are set by Church Workflow and can't be changed."
              : roleType === "custom"
                ? "Permissions assigned to this role."
                : headerNote ||
                  "Permissions shown are inherited from the assigned role."}
          </Text>
        </div>

        {roleType === "custom" && onEditRole && (
          <Button variant="outline" size="sm" onClick={onEditRole}>
            Edit
          </Button>
        )}
      </div>

      <div className="space-y-6">
        {MODULE_PERMISSIONS.map((moduleDef) => {
          const matchedPerm = rolePermissions.permissions.find(
            (p) => p.module === moduleDef.module,
          );
          const level: PermissionLevel = matchedPerm
            ? (matchedPerm.level as PermissionLevel)
            : "no_access";

          if (level === "no_access") return null;

          return (
            <PermissionModuleSelector
              key={moduleDef.module}
              module={moduleDef}
              value={level}
              disabled={true}
            />
          );
        })}

        {rolePermissions.permissions.length === 0 ||
        rolePermissions.permissions.every((p) => p.level === "no_access") ? (
          <div className="text-gray-500 py-4 italic">
            No specific permissions granted yet.
          </div>
        ) : null}
      </div>
    </div>
  );
}
