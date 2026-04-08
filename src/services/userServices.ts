import { authenticatedFetch } from "@/lib/api";
import { AdminResponse } from "@/lib/interface";
import { mapAdminToOption } from "@/mappers/admin.mapper";

export async function fetchAdmins({
  page = 1,
  search = "",
}: {
  page?: number;
  search?: string;
}) {
  const params = new URLSearchParams({
    page: String(page),
    limit: "10",
  });

  if (search) params.append("search", search);

  const response = await authenticatedFetch<{
    data: AdminResponse[];
    pagination: any;
  }>(`/admin?${params}`);

  return {
    data: response.data.map(mapAdminToOption),
    pagination: response.pagination,
  };
}

export async function updateProfile(data: {
  firstName: string;
  lastName: string;
  email: string;
}) {
  return await authenticatedFetch("/admin/me", {
    method: "PATCH",
    body: JSON.stringify(data),
    headers: {
      "Content-Type": "application/json",
    },
  });
}
