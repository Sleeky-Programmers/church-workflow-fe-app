"use client";

import { useState } from "react";

import { PermissionModuleSelector } from "@/components/features/dashboard/admin/mini-components/permission-selector";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import Heading from "@/components/ui/typography/Heading";
import { Span, Text } from "@/components/ui/typography/Text";
import { useToast } from "@/hooks/use-toast";
import { createRole, updateRole } from "@/lib/api/admin-settings";
import {
  frontendToBackendModule,
  MODULE_PERMISSIONS,
} from "@/lib/role-constants";
import { PermissionLevel } from "@/types";

export type CreateRoleFormProps = {
  mode?: "create" | "edit";
  initialData?: {
    name: string;
    description?: string;
    permissions: Record<string, PermissionLevel>;
  };
  roleId?: string;
  onSuccess?: (role?: any) => void;
  onCancel?: () => void;
  showCancelButton?: boolean;
  cancelButtonText?: string;
  submitButtonText?: string;
  isDialog?: boolean;
};

export function CreateRoleForm({
  mode = "create",
  initialData,
  roleId,
  onSuccess,
  onCancel,
  showCancelButton = true,
  cancelButtonText = "Cancel",
  submitButtonText,
  isDialog = false,
}: CreateRoleFormProps) {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const [name, setName] = useState(initialData?.name || "");
  const [description, setDescription] = useState(
    initialData?.description || "",
  );
  const [permissions, setPermissions] = useState<
    Record<string, PermissionLevel>
  >(
    initialData?.permissions ||
      MODULE_PERMISSIONS.reduce(
        (acc, module) => ({
          ...acc,
          [module.module]: "no_access" as PermissionLevel,
        }),
        {},
      ),
  );

  const handlePermissionChange = (
    moduleName: string,
    level: PermissionLevel,
  ) => {
    setPermissions((prev) => ({
      ...prev,
      [moduleName]: level,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) {
      toast({
        title: "Error",
        description: "Role name is required",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      const formattedPermissions = Object.entries(permissions).map(
        ([moduleName, level]) => ({
          moduleSection: frontendToBackendModule[moduleName] || moduleName,
          accessLevel: level.toUpperCase(),
        }),
      );

      let result;
      if (mode === "create") {
        result = await createRole({
          roleName: name,
          permissions: formattedPermissions,
          description: description || undefined,
        } as any);
      } else if (roleId) {
        result = await updateRole(roleId, {
          roleName: name,
          description: description || undefined,
          permissions: formattedPermissions,
        });
      }

      toast({
        title: "Success",
        description:
          mode === "create"
            ? "Role created successfully"
            : "Role updated successfully",
      });

      if (onSuccess) {
        onSuccess(result);
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to save role. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const defaultSubmitText = mode === "create" ? "Create Role" : "Save Changes";
  const loadingText = mode === "create" ? "Creating..." : "Saving...";

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      <div className="bg-white rounded-lg border p-6 space-y-4">
        <Heading level={4}>Role Details</Heading>

        <div className="space-y-2">
          <Label htmlFor="role-name">Role Name</Label>
          <Input
            id="role-name"
            placeholder="E.g. Media Lead"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="description">
            Description <Span variant="muted">(Optional)</Span>
          </Label>
          <Textarea
            id="description"
            placeholder="Type your message here."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
          />
        </div>
      </div>

      <div className="bg-white rounded-lg border p-6 space-y-4">
        <div>
          <Heading level={3}>Assign Permissions</Heading>
          <Text variant="muted" className="mt-1">
            Select what users with this role can access.
          </Text>
        </div>

        <div className="space-y-6">
          {MODULE_PERMISSIONS.map((module) => (
            <PermissionModuleSelector
              key={module.module}
              module={module}
              value={permissions[module.module] || "no_access"}
              onChange={handlePermissionChange}
            />
          ))}
        </div>
      </div>

      <div
        className={`flex ${showCancelButton ? "justify-end gap-3" : "justify-end"}`}
      >
        {showCancelButton && onCancel && (
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            disabled={isLoading}
          >
            {cancelButtonText}
          </Button>
        )}
        <Button type="submit" disabled={isLoading || !name.trim()}>
          {isLoading ? loadingText : submitButtonText || defaultSubmitText}
        </Button>
      </div>
    </form>
  );
}
