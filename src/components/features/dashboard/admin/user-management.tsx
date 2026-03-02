"use client";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  fetchAdminInvites,
  createAdminInvite,
  updateAdminStatus,
  removeAdminUser,
} from "@/lib/api/admin-settings";
import { User, UserAction } from "@/types/user";
import { UserTable } from "@/components/features/dashboard/admin/users-table";
import { InviteUserDialog } from "@/components/features/dashboard/admin/invite-user";
import { RemoveUserDialog } from "@/components/features/dashboard/admin/mini-components/remove-user-dialog";
import { useToast } from "@/hooks/use-toast";
import Heading from "@/components/ui/typography/Heading";
import { Text } from "@/components/ui/typography/Text";

export function UserManagementPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isInviteDialogOpen, setIsInviteDialogOpen] = useState(false);
  const [isRemoveDialogOpen, setIsRemoveDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isActionLoading, setIsActionLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    setIsLoading(true);
    try {
      const data = await fetchAdminInvites();
      const mappedUsers: User[] = data.map((invite: any) => ({
        id: invite._id,
        name: invite.email, // Since the API mostly returns emails for pending invites
        email: invite.email,
        role: invite.churchRole,
        status: invite.status.toLowerCase() as
          | "active"
          | "pending"
          | "suspended",
        dateInvited: new Date(invite.createdAt).toLocaleString(),
      }));
      setUsers(mappedUsers);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load users. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleInviteUser = async (data: { email: string; role: string }) => {
    setIsActionLoading(true);
    try {
      const result = await createAdminInvite(data.role, data.email);
      if (result) {
        toast({
          title: "Success",
          description: "Invitation sent successfully",
        });
        setIsInviteDialogOpen(false);
        loadUsers();
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to send invitation. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsActionLoading(false);
    }
  };

  const handleActionSelect = async (userId: string, action: UserAction) => {
    const user = users.find((u) => u.id === userId);
    if (!user) return;

    if (action === "remove") {
      setSelectedUser(user);
      setIsRemoveDialogOpen(true);
      return;
    }

    setIsActionLoading(true);
    try {
      let result;
      switch (action) {
        case "suspend":
          result = await updateAdminStatus(userId, "SUSPEND");
          break;
        case "restore":
          result = await updateAdminStatus(userId, "RESTORE");
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
    if (!selectedUser) return;

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
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to remove user. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsActionLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto" />
          <Text variant="default" className="mt-4 ">
            Loading users...
          </Text>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Heading level={2}>User Management</Heading>
        <Button onClick={() => setIsInviteDialogOpen(true)}>Invite User</Button>
      </div>

      <div className="bg-white rounded-lg border">
        <UserTable users={users} onActionSelect={handleActionSelect} />
      </div>

      <InviteUserDialog
        open={isInviteDialogOpen}
        onOpenChange={setIsInviteDialogOpen}
        onSubmit={handleInviteUser}
        isLoading={isActionLoading}
      />

      <RemoveUserDialog
        open={isRemoveDialogOpen}
        onOpenChange={setIsRemoveDialogOpen}
        userName={selectedUser?.name || ""}
        onConfirm={handleRemoveUser}
      />
    </div>
  );
}
