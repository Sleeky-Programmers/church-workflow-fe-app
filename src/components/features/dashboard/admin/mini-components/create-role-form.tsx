"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { PermissionModuleSelector } from "@/components/features/dashboard/admin/mini-components/permission-selector";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader } from "@/components/ui/loader";
import { Textarea } from "@/components/ui/textarea";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import Heading from "@/components/ui/typography/Heading";
import { Span, Text } from "@/components/ui/typography/Text";
import { useToast } from "@/hooks/use-toast";
import { createRole, updateRole } from "@/lib/api/admin-settings";
import {
  frontendToBackendModule,
  MODULE_PERMISSIONS,
  VISIBLE_MODULE_PERMISSIONS,
} from "@/lib/role-constants";
import { PermissionLevel } from "@/types";
import { createRoleSchema, CreateRoleFormValues } from "@/types/schema";

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

  const form = useForm<CreateRoleFormValues>({
    resolver: zodResolver(createRoleSchema),
    defaultValues: {
      name: initialData?.name || "",
      description: initialData?.description || "",
    },
  });

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

  const handleSubmit = async ({ name, description }: CreateRoleFormValues) => {
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
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(handleSubmit)}
        className="relative space-y-8"
      >
        {isLoading && (
          <div className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-2 rounded-lg bg-white/80 backdrop-blur-[1px]">
            <Loader size="w-12 h-12" showShadow={false} />
            <Text variant="muted">{loadingText}</Text>
          </div>
        )}

        <div className="bg-white rounded-lg border p-6 space-y-4">
          <Heading level={4}>Role Details</Heading>

          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Role Name</FormLabel>
                <FormControl>
                  <Input
                    placeholder="E.g. Media Lead"
                    disabled={isLoading}
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="description"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  Description <Span variant="muted">(Optional)</Span>
                </FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Type your message here."
                    disabled={isLoading}
                    rows={3}
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="bg-white rounded-lg border p-6 space-y-4">
          <div>
            <Heading level={3}>Assign Permissions</Heading>
            <Text variant="muted" className="mt-1">
              Select what users with this role can access.
            </Text>
          </div>

          <div className="space-y-6">
            {VISIBLE_MODULE_PERMISSIONS.map((module) => (
              <PermissionModuleSelector
                key={module.module}
                module={module}
                value={permissions[module.module] || "no_access"}
                onChange={handlePermissionChange}
                disabled={isLoading}
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
          <Button type="submit" disabled={isLoading}>
            {isLoading ? (
              <span className="flex items-center gap-2">
                <Loader size="w-4 h-4" showShadow={false} />
                {loadingText}
              </span>
            ) : (
              submitButtonText || defaultSubmitText
            )}
          </Button>
        </div>
      </form>
    </Form>
  );
}
