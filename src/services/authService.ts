import { authenticatedFetch } from "@/lib/api";

export async function updatePassword(data: {
  currentPassword: string;
  newPassword: string;
  confirmNewPassword: string;
}) {
  return await authenticatedFetch("/auth/change-password", {
    method: "PATCH",
    body: JSON.stringify(data),
  });
}
