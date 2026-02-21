"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { PermissionModuleSelector } from "@/components/features/dashboard/admin/mini-components/permission-selector";
import { MODULE_PERMISSIONS } from "@/lib/role-constants";
import { PermissionLevel } from "@/types";
import Heading from "@/components/ui/typography/Heading";
import { Text, Span } from "@/components/ui/typography/Text";

type CreateRolePageProps = {
  mode?: "create" | "edit";
  initialData?: {
    name: string;
    description?: string;
    permissions: Record<string, PermissionLevel>;
  };
  roleId?: string;
};

export default function CreateRolePage({
  mode = "create",
  initialData,
  roleId,
}: CreateRolePageProps) {
  const router = useRouter();
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
      await new Promise((resolve) => setTimeout(resolve, 500));

      toast({
        title: "Success",
        description:
          mode === "create"
            ? "Role created successfully"
            : "Role updated successfully",
      });

      router.push("/dashboard/settings/roles");
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save role. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    router.push("/dashboard/settings/roles");
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b top-0">
        <div className="px-6 py-4 flex items-center">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleCancel}
            className="p-0 gap-1.5"
          >
            <ArrowLeft className="h-4 w-4" />
            <Span variant="default">Back</Span>
          </Button>
          <div className="flex-1 text-center">
            <Heading level={2}>
              {" "}
              {mode === "create" ? "Create New Role" : "Edit Role"}
            </Heading>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto p-6">
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
              <Label htmlFor="description">Description (Optional)</Label>
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

          <div className="flex justify-end gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={handleCancel}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading || !name.trim()}>
              {isLoading
                ? mode === "create"
                  ? "Creating..."
                  : "Saving..."
                : mode === "create"
                  ? "Create Role"
                  : "Save Changes"}
            </Button>
          </div>
        </form>
      </main>
    </div>
  );
}
