import { authenticatedFetch } from "@/lib/api";

export interface Location {
  id: string;
  name: string;
  isActive: boolean;
  sortOrder: number;
  isSystem: boolean;
}

export interface PaginatedList<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    itemCount: number;
    totalPages: number;
    hasPreviousPage: boolean;
    hasNextPage: boolean;
  };
}

// The API returns Mongoose documents keyed by `_id`; normalize to `id` so
// Callers have a stable identifier (matches the members/services convention).
function normalizeLocation(raw: any): Location {
  return {
    id: raw?._id ?? raw?.id,
    name: raw?.name,
    isActive: raw?.isActive,
    sortOrder: raw?.sortOrder ?? 0,
    isSystem: raw?.isSystem ?? false,
  };
}

export async function fetchLocations() {
  const data = await authenticatedFetch<any[]>("/locations");
  return data.map(normalizeLocation);
}

export async function fetchLocationsPage(page: number, limit: number) {
  const res = await authenticatedFetch<PaginatedList<any>>(
    `/locations?page=${page}&limit=${limit}`,
  );
  return {
    ...res,
    data: res.data.map(normalizeLocation),
  } as PaginatedList<Location>;
}

export async function createLocation(payload: {
  name: string;
  sortOrder?: number;
}) {
  const created = await authenticatedFetch<any>("/locations", {
    method: "POST",
    body: JSON.stringify(payload),
  });
  return normalizeLocation(created);
}

export async function updateLocation(
  id: string,
  payload: Partial<Pick<Location, "name" | "isActive" | "sortOrder">>,
) {
  const updated = await authenticatedFetch<any>(`/locations/${id}`, {
    method: "PUT",
    body: JSON.stringify(payload),
  });
  return normalizeLocation(updated);
}

export async function deleteLocation(id: string) {
  return authenticatedFetch<{ message: string }>(`/locations/${id}`, {
    method: "DELETE",
  });
}
