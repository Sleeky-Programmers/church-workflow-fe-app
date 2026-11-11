"use client";
import { useCallback, useEffect, useState } from "react";

import { InviteUserDialog } from "@/components/features/dashboard/admin/invite-user";
import { ChangeRoleDialog } from "@/components/features/dashboard/admin/mini-components/change-role-dialog";
import { ManageBranchAccessDialog } from "@/components/features/dashboard/admin/mini-components/manage-branch-access-dialog";
import { RemoveUserDialog } from "@/components/features/dashboard/admin/mini-components/remove-user-dialog";
import { UserTable } from "@/components/features/dashboard/admin/users-table";
import { LimitBanner } from "@/components/features/dashboard/subscription/limit-banner";
import { PlanLimitReachedModal } from "@/components/features/dashboard/subscription/plan-limit-reached-modal";
import { Button } from "@/components/ui/button";
import { Loader } from "@/components/ui/loader";
import Heading from "@/components/ui/typography/Heading";
import { Text } from "@/components/ui/typography/Text";
import { useToast } from "@/hooks/use-toast";
import {
  changeAdminRole,
  createAdminInvite,
  deleteAdminInvite,
  fetchAdminInvites,
  fetchRoles,
  getUserPlanLimitStatus,
  removeAdminUser,
  resendAdminInvite,
  updateAdminStatus,
} from "@/lib/api/admin-settings";
import { AdminOption } from "@/lib/enums";
import { getNextPlan, getUpgradeFeatures } from "@/lib/plan-utils";
import { getPlans } from "@/services/billingService";
import { useUserStore } from "@/stores/useUserStore";

// Add a "isCurrentUser" flag to each mapped user so the table can highlight
// The signed-in admin's own row and lock its actions.
import { Plan, PlanLimitStatus } from "@/types";
import { User, UserAction } from "@/types/user";
import { useLatest } from "@/hooks/use-latest";

export function UserManagementPage() {
  const accessScope = useUserStore((state) => {
    return state.accessScope;
  });
  const currentUser = useUserStore((state) => {
    return state.user;
  });
  const canManageBranchAccess = accessScope === "ORG_WIDE";

  const [users, setUsers] = useState<User[]>([]);
  const [roles, setRoles] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isInviteDialogOpen, setIsInviteDialogOpen] = useState(false);
  const [isRemoveDialogOpen, setIsRemoveDialogOpen] = useState(false);
  const [isChangeRoleDialogOpen, setIsChangeRoleDialogOpen] = useState(false);
  const [isBranchAccessDialogOpen, setIsBranchAccessDialogOpen] =
    useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isActionLoading, setIsActionLoading] = useState(false);
  const { toast } = useToast();

  const [limitStatus, setLimitStatus] = useState<PlanLimitStatus | null>(null);
  const [plans, setPlans] = useState<Plan[]>([]);
  const [plansLoaded, setPlansLoaded] = useState(false);
  const [isLimitReachedModalOpen, setIsLimitReachedModalOpen] = useState(false);

  const refreshLimitStatus = useCallback(async () => {
    try {
      const status = await getUserPlanLimitStatus();
      setLimitStatus(status);
      return status;
    } catch {
      return null;
    }
  }, []);

  useEffect(() => {
    refreshLimitStatus();
  }, [refreshLimitStatus]);

  useEffect(() => {
    getPlans()
      .then(setPlans)
      .catch(() => {
        return undefined;
      })
      .finally(() => {
        return setPlansLoaded(true);
      });
  }, []);

  const nextPlan = getNextPlan(limitStatus?.planName ?? null, plans);
  const nextPlanFeatures = getUpgradeFeatures(nextPlan);

  const handleInviteClick = async () => {
    const status = limitStatus ?? (await refreshLimitStatus());
    if (status && status.limit > 0 && status.current >= status.limit) {
      setIsLimitReachedModalOpen(true);
      return;
    }
    setIsInviteDialogOpen(true);
  };

  const loadUsers: any = async () => {
    setIsLoading(true);
    try {
      const [data, rolesData] = await Promise.all([
        fetchAdminInvites(),
        fetchRoles(),
      ]);

      setRoles(rolesData);
      const currentUserEmail = currentUser?.email?.toLowerCase();
      const mappedUsers: User[] = data.map((invite: any) => {
        const roleId =
          typeof invite.churchRole === "string"
            ? invite.churchRole
            : invite.churchRole?._id;
        const roleObj = rolesData.find((r: any) => {
          return r._id === roleId;
        });

        return {
          id: invite._id,
          name: invite?.firstName
            ? `${invite.firstName} ${invite.lastName || ""}`.trim()
            : "-",
          email: invite.email,
          role: roleObj ? roleObj.roleName : "-",
          roleId: roleId,
          status: invite.status.toLowerCase() as
            | "active"
            | "pending"
            | "suspended",
          dateInvited: new Date(invite.createdAt).toLocaleString(),
          isCurrentUser:
            !!currentUserEmail &&
            invite.email?.toLowerCase() === currentUserEmail,
        } as User & { isCurrentUser: boolean };
      });
      setUsers(mappedUsers);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to load users. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const loadUsersRef = useLatest(loadUsers);

  useEffect(() => {
    loadUsersRef.current();
  }, [loadUsersRef]);

  const handleInviteUser = async (data: {
    email: string;
    role: string;
    title?: string;
    firstName?: string;
    lastName?: string;
  }) => {
    setIsActionLoading(true);
    try {
      const payload: any = { email: data.email };
      if (data.title) {
        payload.title = data.title;
      }
      if (data.firstName) {
        payload.firstName = data.firstName;
      }
      if (data.lastName) {
        payload.lastName = data.lastName;
      }

      const result = await createAdminInvite(data.role, payload);
      if (result) {
        toast({
          title: "Success",
          description: "Invitation sent successfully",
        });
        loadUsers();
        refreshLimitStatus();
        return result;
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description:
          error.message || "Failed to send invitation. Please try again.",
        variant: "destructive",
      });
      throw error;
    } finally {
      setIsActionLoading(false);
    }
  };

  const handleActionSelect = async (userId: string, action: UserAction) => {
    const user = users.find((u) => {
      return u.id === userId;
    });
    if (!user) {
      return;
    }

    if (action === "remove") {
      setSelectedUser(user);
      setIsRemoveDialogOpen(true);
      return;
    }

    if (action === "change_role") {
      setSelectedUser(user);
      setIsChangeRoleDialogOpen(true);
      return;
    }

    if (action === "manage_branch_access") {
      setSelectedUser(user);
      setIsBranchAccessDialogOpen(true);
      return;
    }

    setIsActionLoading(true);
    try {
      switch (action) {
        case "suspend":
          await updateAdminStatus(userId, AdminOption.SUSPEND);
          break;
        case "restore":
          await updateAdminStatus(userId, AdminOption.RESTORE);
          break;
        case "delete_invitation":
          await deleteAdminInvite(userId);
          break;
        case "resend_invite":
          await resendAdminInvite(userId);
          break;
        default:
          throw new Error("Action not supported locally yet");
      }

      toast({
        title: "Success",
        description: "Action completed successfully",
      });
      loadUsers();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Action failed. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsActionLoading(false);
    }
  };

  const handleRemoveUser = async () => {
    if (!selectedUser) {
      return;
    }

    setIsActionLoading(true);
    try {
      await removeAdminUser(selectedUser.id);
      toast({
        title: "Success",
        description: "User removed successfully",
      });
      setIsRemoveDialogOpen(false);
      setSelectedUser(null);
      loadUsers();
    } catch (error: any) {
      toast({
        title: "Error",
        description:
          error.message || "Failed to remove user. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsActionLoading(false);
    }
  };

  const handleConfirmChangeRole = async (newRoleId: string) => {
    if (!selectedUser) {
      return;
    }
    setIsActionLoading(true);
    try {
      await changeAdminRole(selectedUser.id, newRoleId);
      toast({
        title: "Success",
        description: "User role updated successfully",
      });
      setIsChangeRoleDialogOpen(false);
      setSelectedUser(null);
      loadUsers();
    } catch (error: any) {
      toast({
        title: "Error",
        description:
          error.message || "Failed to update role. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsActionLoading(false);
    }
  };

  const refetchRoles = async () => {
    try {
      const rolesData = await fetchRoles();
      setRoles(rolesData);
    } catch {}
  };

  return (
    <div className="space-y-6">
      <LimitBanner
        fetchStatus={getUserPlanLimitStatus}
        dismissKey="userLimitBannerDismissed"
        resourceLabel="user seats"
        resourceLimitLabel="user seat limit"
      />

      <div className="flex items-center justify-between">
        <Heading level={2}>User Management</Heading>
        <Button onClick={handleInviteClick}>Invite User</Button>
      </div>

      <div className="bg-white rounded-lg border">
        {isLoading ? (
          <div className="flex items-center justify-center py-16 gap-2">
            <Loader size="w-10 h-10" showShadow={false} />
            <Text variant="default">Loading users...</Text>
          </div>
        ) : (
          <UserTable
            users={users}
            onActionSelect={handleActionSelect}
            canManageBranchAccess={canManageBranchAccess}
          />
        )}
      </div>

      <InviteUserDialog
        open={isInviteDialogOpen}
        onOpenChange={setIsInviteDialogOpen}
        onSubmit={handleInviteUser}
        isLoading={isActionLoading}
        onRoleCreated={refetchRoles}
      />

      <RemoveUserDialog
        open={isRemoveDialogOpen}
        onOpenChange={setIsRemoveDialogOpen}
        userName={selectedUser?.name || ""}
        onConfirm={handleRemoveUser}
      />

      <ChangeRoleDialog
        open={isChangeRoleDialogOpen}
        onOpenChange={setIsChangeRoleDialogOpen}
        userName={selectedUser?.name || ""}
        currentRoleId={selectedUser?.roleId || ""}
        roles={roles}
        onConfirm={handleConfirmChangeRole}
        isLoading={isActionLoading}
      />

      <ManageBranchAccessDialog
        open={isBranchAccessDialogOpen}
        onOpenChange={setIsBranchAccessDialogOpen}
        userId={selectedUser?.id || null}
        userName={selectedUser?.name || ""}
        onSaved={loadUsers}
      />

      <PlanLimitReachedModal
        open={isLimitReachedModalOpen}
        onOpenChange={setIsLimitReachedModalOpen}
        limit={limitStatus?.limit ?? 0}
        planName={limitStatus?.planName ?? null}
        resourceLabel="user"
        resourceLabelPlural="users"
        nextPlanName={nextPlan?.name}
        isNextPlanLoading={!plansLoaded}
        features={nextPlanFeatures}
      />
    </div>
  );
}
