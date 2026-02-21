"use client";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { fetchUsers, inviteUser, performUserAction } from "@/lib/api";
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
      const data = await fetchUsers();
      setUsers(data);
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
      const result = await inviteUser(data);
      if (result.success) {
        toast({
          title: "Success",
          description: result.message,
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
      const result = await performUserAction(userId, action);
      if (result.success) {
        toast({
          title: "Success",
          description: result.message,
        });
        loadUsers();
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Action failed. Please try again.",
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
      const result = await performUserAction(selectedUser.id, "remove");
      if (result.success) {
        toast({
          title: "Success",
          description: result.message,
        });
        setIsRemoveDialogOpen(false);
        setSelectedUser(null);
        loadUsers();
      }
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
