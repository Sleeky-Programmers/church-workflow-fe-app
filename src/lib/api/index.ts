import { InviteFormData, PendingInvite, User, UserAction } from "@/types/user";
import { MOCK_USERS } from "../user-data";

export async function fetchUsers(): Promise<User[]> {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(MOCK_USERS);
    }, 500);
  });
}

export async function fetchUserById(userId: string): Promise<User | null> {
  return new Promise((resolve) => {
    setTimeout(() => {
      const user = MOCK_USERS.find((u) => u.id === userId);
      resolve(user || null);
    }, 300);
  });
}
export async function inviteUser(data: {
  email: string;
  role: string;
}): Promise<{ success: boolean; message: string }> {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        success: true,
        message: "Invitation sent successfully",
      });
    }, 500);
  });
}

export async function fetchPendingInvites(): Promise<PendingInvite[]> {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve([]);
    }, 300);
  });
}
export async function performUserAction(
  userId: string,
  action: UserAction,
  additionalData?: Record<string, unknown>,
): Promise<{ success: boolean; message: string }> {
  return new Promise((resolve) => {
    setTimeout(() => {
      const messages: Record<UserAction, string> = {
        view_details: "User details loaded",
        change_role: "User role updated successfully",
        resend_invite: "Invitation resent successfully",
        delete_invitation: "Invitation deleted successfully",
        suspend: "User suspended successfully",
        restore: "User restored successfully",
        remove: "User removed successfully",
      };

      resolve({
        success: true,
        message: messages[action] || "Action completed",
      });
    }, 500);
  });
}

export async function sendInvitation(
  data: InviteFormData,
): Promise<{ success: boolean; message: string }> {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        success: true,
        message: "Invitation sent successfully",
      });
    }, 500);
  });
}
