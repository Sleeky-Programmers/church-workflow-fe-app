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
import { ViewRolePermissionsDialog } from "@/components/features/dashboard/admin/mini-components/view-role-permissions-dialog";
import Heading from "@/components/ui/typography/Heading";
import { RouteConfig } from "@/config/routes";
import { Loader } from "@/components/ui/loader";

export default function RolesPermissionsPage() {
  const router = useRouter();
  const [roles, setRoles] = useState<Role[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDeactivateDialogOpen, setIsDeactivateDialogOpen] = useState(false);
  const [isViewPermissionsDialogOpen, setIsViewPermissionsDialogOpen] =
    useState(false);
  const [selectedRole, setSelectedRole] = useState<Role | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    loadRoles();
  }, []);

  const loadRoles = async () => {
    setIsLoading(true);
    try {
      const data = await fetchRoles();
      const mappedRoles: Role[] = data.map((role: any) => ({
        id: role._id,
        name: role.roleName,
        type: role.type.toLowerCase() as "system" | "custom",
        users: 0,
        status: role.status.toLowerCase() as "active" | "disabled",
        description: role.description || "",
      }));
      setRoles(mappedRoles);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to load roles. Please try again.",
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
        setSelectedRole(role);
        setIsViewPermissionsDialogOpen(true);
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
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to deactivate role",
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
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to enable role",
        variant: "destructive",
      });
    }
  };

  const handleCreateRole = () => {
    router.push(RouteConfig.dashboard.admin.createRole);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Heading level={2}>Roles & Permissions</Heading>
        <Button onClick={handleCreateRole}>Create Role</Button>
      </div>

      <div className="bg-white rounded-lg border">
        {isLoading ? (
          <div className="flex items-center justify-center py-16 gap-2">
            <Loader size="w-10 h-10" showShadow={false} />
            <Text variant="default">Loading roles...</Text>
          </div>
        ) : (
          <RolesTable roles={roles} onActionSelect={handleActionSelect} />
        )}
      </div>

      <DeactivateRoleDialog
        open={isDeactivateDialogOpen}
        onOpenChange={setIsDeactivateDialogOpen}
        roleName={selectedRole?.name || ""}
        onConfirm={() => handleDeactivateRole()}
      />

      <ViewRolePermissionsDialog
        open={isViewPermissionsDialogOpen}
        onOpenChange={setIsViewPermissionsDialogOpen}
        roleId={selectedRole?.id || null}
        roleName={selectedRole?.name || ""}
      />
    </div>
  );
}
