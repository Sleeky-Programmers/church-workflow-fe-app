export interface AdminInviteData {
  firstName: string;
  lastName: string;
  email: string;
  churchName: string;
  churchId: string;
  role: "admin" | "administrator";
  invitedAt: number;
  expiresAt: number;
}

export function decodeInviteToken(): AdminInviteData | null {
  try {
    return null;
  } catch {
    return null;
  }
}

export function isInviteTokenValid(inviteData: AdminInviteData): boolean {
  const now = Date.now();
  return now < inviteData.expiresAt;
}

export async function fetchAdminInviteData(
  inviteToken: string,
): Promise<AdminInviteData | null> {
  try {
    if (inviteToken === "test-invite-token" || inviteToken === "demo") {
      return {
        firstName: "John",
        lastName: "Doe",
        email: "johndoe@gmail.com",
        churchName: "Holy Church",
        churchId: "church-001",
        role: "admin",
        invitedAt: Date.now() - 86400000,
        expiresAt: Date.now() + 604800000,
      };
    }

    return null;
  } catch {
    return null;
  }
}

export function validateInvitedEmail(
  inputEmail: string,
  invitedEmail: string,
): boolean {
  return inputEmail.toLowerCase() === invitedEmail.toLowerCase();
}
