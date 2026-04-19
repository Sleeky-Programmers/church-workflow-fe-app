import { authenticatedFetch } from "@/lib/api";

export interface CreateDepartmentPayload {
  name: string;
  description?: string;
  hod?: string;
  memberIds?: string[];
}

export interface UpdateDepartmentPayload {
  name?: string;
  description?: string;
  hod?: string | null;
}

export interface DepartmentQueryParams {
  page?: number;
  limit?: number;
  search?: string;
  name?: string;
  hod?: string;
  status?: string;
}

export interface DepartmentResponse {
  id: string;
  name: string;

  hod?: {
    id: string;
    name: string;
    email: string;
  } | null;

  members: {
    id: string;
    fullName: string;
    email?: string;
    phoneNumber?: string;
    dateJoined: string;
  }[];
}

export async function createDepartment(payload: CreateDepartmentPayload) {
  return authenticatedFetch<DepartmentResponse>("/department", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function fetchDepartments(params: DepartmentQueryParams) {
  const query = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      query.append(key, String(value));
    }
  });

  return authenticatedFetch<{
    data: DepartmentResponse[];
    pagination: any;
  }>(`/department?${query.toString()}`);
}

export async function fetchDepartmentById(
  id: any,
): Promise<DepartmentResponse> {
  return authenticatedFetch<DepartmentResponse>(`/department/${id}`);
}

export async function updateDepartment(
  id: string,
  payload: UpdateDepartmentPayload,
) {
  return authenticatedFetch<DepartmentResponse>(`/department/${id}`, {
    method: "PUT",
    body: JSON.stringify(payload),
  });
}

export async function deleteDepartment(id: string) {
  return authenticatedFetch<{ message: string }>(`/department/${id}`, {
    method: "DELETE",
  });
}

export async function exportDepartments(): Promise<Blob> {
  return authenticatedFetch<Blob>("/department/export", {
    method: "GET",
    responseType: "blob",
  });
}

export async function addDepartmentMembers(
  departmentId: string,
  memberIds: string[],
) {
  return authenticatedFetch(`/department/${departmentId}/members`, {
    method: "PUT",
    body: JSON.stringify({
      memberIds,
      action: "ADD",
    }),
  });
}
export async function removeDepartmentMembers(
  departmentId: string,
  memberIds: string[],
) {
  return authenticatedFetch(`/department/${departmentId}/members/remove`, {
    method: "PUT",
    body: JSON.stringify({ memberIds }),
  });
}
