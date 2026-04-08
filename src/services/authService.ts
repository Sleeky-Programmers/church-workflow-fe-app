import { authenticatedFetch } from "@/lib/api";
export async function updatePassword(data: {
  newPassword: string;
  confirmNewPassword: string;
}) {
  return await authenticatedFetch("/auth/reset-password", {
    method: "PATCH",
    body: JSON.stringify(data),
  });
}
