import { authenticatedFetch } from "@/lib/api";

export async function updateChurch(data: any, file?: File) {
  const formData = new FormData();

  Object.entries(data).forEach(([key, value]) => {
    if (value) formData.append(key, value as string);
  });

  if (file) {
    formData.append("file", file);
  }

  return await authenticatedFetch("/church/me", {
    method: "PATCH",
    body: formData,
  });
}

export async function getAllChurchServices(params?: {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
}) {
  const queryParams = new URLSearchParams();

  if (params?.page) queryParams.append("page", params.page.toString());
  if (params?.limit) queryParams.append("limit", params.limit.toString());
  if (params?.search) queryParams.append("search", params.search);
  if (params?.status) queryParams.append("status", params.status);

  const url = `/church-services${queryParams.toString() ? `?${queryParams.toString()}` : ""}`;

  return await authenticatedFetch(url, {
    method: "GET",
  });
}

// Get a single church service by ID
export async function getChurchServiceById(id: string): Promise<any> {
  if (!id) {
    throw new Error("Service ID is required");
  }

  return await authenticatedFetch(`/church-services/${id}`, {
    method: "GET",
  });
}
