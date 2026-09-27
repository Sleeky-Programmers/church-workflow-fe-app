import { authenticatedFetch } from "@/lib/api";
import { AdminResponse } from "@/lib/interface";
import { mapAdminToOption } from "@/mappers/admin.mapper";

type FetchOptionsParams = {
  page?: number;
  limit?: number;
  search?: string;
};

export async function fetchAdmins({
  page = 1,
  limit = 10,
  search = "",
}: FetchOptionsParams) {
  const params = new URLSearchParams({
    page: String(page),
    limit: String(limit),
  });

  if (search) params.append("search", search);

  const response = await authenticatedFetch<{
    data: any[];
    pagination: any;
  }>(`/admin?${params}`);

  return {
    data: response.data.map((admin) => ({
      id: admin.id || admin._id,
      fullName: admin.fullName || `${admin.firstName} ${admin.lastName}`,
    })),
    pagination: response.pagination,
  };
}

export async function updateProfile(data: {
  title?: string;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber?: string;
}) {
  return await authenticatedFetch("/admin/me", {
    method: "PATCH",
    body: JSON.stringify(data),
    headers: {
      "Content-Type": "application/json",
    },
  });
}

export async function getProfile() {
  return await authenticatedFetch("/admin/profile", {
    method: "GET",
  });
}
