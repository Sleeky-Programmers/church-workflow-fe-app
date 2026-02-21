"use client";

import { useRouter } from "next/navigation";
import { User } from "@/types/user";
import { performUserAction } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { UserDetailsPage } from "./user-details";

type UserDetailsPageClientProps = {
  user: User;
};

export function UserDetailsPageClient({ user }: UserDetailsPageClientProps) {
  const router = useRouter();
  const { toast } = useToast();

  const handleBack = () => {
    router.push("/dashboard/settings/users");
  };

  const handleRoleChange = async (userId: string, newRole: string) => {
    try {
      await performUserAction(userId, "change_role", { role: newRole });
      router.refresh();
      toast({
        title: "Success",
        description: `Role updated to ${newRole}`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update role",
        variant: "destructive",
      });
    }
  };

  const handleSuspend = async (userId: string) => {
    try {
      await performUserAction(userId, "suspend");
      router.refresh();
      toast({
        title: "Success",
        description: "User has been suspended",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to suspend user",
        variant: "destructive",
      });
    }
  };

  const handleRemove = async (userId: string) => {
    try {
      await performUserAction(userId, "remove");
      toast({
        title: "Success",
        description: "User has been removed",
      });
      router.push("/dashboard/settings/users");
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to remove user",
        variant: "destructive",
      });
    }
  };

  const handleResendInvite = async (userId: string) => {
    try {
      await performUserAction(userId, "resend_invite");
      toast({
        title: "Success",
        description: "Invitation has been resent",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to resend invitation",
        variant: "destructive",
      });
    }
  };

  const handleDeleteInvite = async (userId: string) => {
    try {
      await performUserAction(userId, "delete_invitation");
      toast({
        title: "Success",
        description: "Invitation has been deleted",
      });
      router.push("/dashboard/settings/users");
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete invitation",
        variant: "destructive",
      });
    }
  };

  const handleReinstate = async (userId: string) => {
    try {
      await performUserAction(userId, "restore");
      router.refresh();
      toast({
        title: "Success",
        description: "User has been reinstated",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to reinstate user",
        variant: "destructive",
      });
    }
  };

  return (
    <UserDetailsPage
      user={user}
      onBack={handleBack}
      onRoleChange={handleRoleChange}
      onSuspend={handleSuspend}
      onRemove={handleRemove}
      onResendInvite={handleResendInvite}
      onDeleteInvite={handleDeleteInvite}
      onReinstate={handleReinstate}
    />
  );
}
