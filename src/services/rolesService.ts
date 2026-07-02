import { authenticatedFetch } from "@/lib/api";
import { Role } from "@/types";

export async function fetchRoles() {
  const response = await authenticatedFetch<Role[]>("/roles?page=1&limit=100", {
    method: "GET",
  });

  return response || [];
}
