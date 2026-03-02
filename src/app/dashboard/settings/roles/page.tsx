"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Text } from "@/components/ui/typography/Text";
import { Role, RoleAction } from "@/types";
import { fetchRoles, updateRoleStatus } from "@/lib/api/admin-settings";
import { RolesTable } from "@/components/features/dashboard/admin/role-table";
import { DeactivateRoleDialog } from "@/components/features/dashboard/admin/mini-components/deactivate-role-dialog";
import Heading from "@/components/ui/typography/Heading";
import { RouteConfig } from "@/config/routes";

export default function RolesPermissionsPage() {
  const router = useRouter();
  const [roles, setRoles] = useState<Role[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDeactivateDialogOpen, setIsDeactivateDialogOpen] = useState(false);
  const [selectedRole, setSelectedRole] = useState<Role | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    loadRoles();
  }, []);

  const loadRoles = async () => {
    setIsLoading(true);
    try {
      const data = await fetchRoles();
      console.log({ roleData: data });
      // Map API roles to component roles format
      const mappedRoles: Role[] = data.map((role: any) => ({
        id: role._id,
        name: role.roleName,
        type: role.type.toLowerCase() as "system" | "custom",
        users: 0, // Not provided by the API directly
        status: role.status.toLowerCase() as "active" | "disabled",
        description: role.description || "",
      }));
      setRoles(mappedRoles);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load roles. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleActionSelect = async (roleId: string, action: RoleAction) => {
    const role = roles.find((r) => r.id === roleId);
    if (!role) return;

    switch (action) {
      case "view_permissions":
        toast({
          title: "View Permissions",
          description: `Viewing permissions for ${role.name}`,
        });
        break;

      case "edit":
        router.push(`/dashboard/settings/roles/edit/${roleId}`);
        break;

      case "disable":
        if (role.users > 0) {
          setSelectedRole(role);
          setIsDeactivateDialogOpen(true);
        } else {
          await handleDeactivateRole(roleId);
        }
        break;

      case "enable":
        await handleEnableRole(roleId);
        break;
    }
  };

  const handleDeactivateRole = async (roleId?: string) => {
    const idToDeactivate = roleId || selectedRole?.id;
    if (!idToDeactivate) return;

    try {
      await updateRoleStatus(idToDeactivate, "DISABLED");

      setRoles((prev) =>
        prev.map((r) =>
          r.id === idToDeactivate ? { ...r, status: "disabled" } : r,
        ),
      );

      toast({
        title: "Success",
        description: "Role has been deactivated",
      });
      setIsDeactivateDialogOpen(false);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to deactivate role",
        variant: "destructive",
      });
    }
  };

  const handleEnableRole = async (roleId: string) => {
    try {
      await updateRoleStatus(roleId, "ACTIVE");

      setRoles((prev) =>
        prev.map((r) => (r.id === roleId ? { ...r, status: "active" } : r)),
      );

      toast({
        title: "Success",
        description: "Role has been enabled",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to enable role",
        variant: "destructive",
      });
    }
  };

  const handleCreateRole = () => {
    router.push(RouteConfig.dashboard.admin.createRole);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto" />
          <Text variant="default" className="mt-4">
            Loading roles...
          </Text>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Heading level={2}>Roles & Permissions</Heading>
        <Button onClick={handleCreateRole}>Create Role</Button>
      </div>

      <div className="bg-white rounded-lg border">
        <RolesTable roles={roles} onActionSelect={handleActionSelect} />
      </div>

      <DeactivateRoleDialog
        open={isDeactivateDialogOpen}
        onOpenChange={setIsDeactivateDialogOpen}
        roleName={selectedRole?.name || ""}
        onConfirm={() => handleDeactivateRole()}
      />
    </div>
  );
}
