import { authenticatedFetch } from "@/lib/api";
import { RequisitionStatus } from "@/lib/enums";

export interface CreateRequisitionPayload {
  departmentId: string;
  title: string;
  description?: string;
  amount: number;
}

export interface RequisitionRequesterRef {
  id: string;
  name: string;
  email: string;
}

export interface RequisitionResponse {
  id: string;
  departmentId: string;
  departmentName?: string;
  title: string;
  description: string;
  amount: number;
  currency: string;
  status: RequisitionStatus;
  requestedBy: RequisitionRequesterRef | string;
  reviewedBy: string | null;
  reviewedAt: string | null;
  reviewNote: string | null;
  expenseId: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface RequisitionQueryParams {
  page?: number;
  limit?: number;
  departmentId?: string;
  status?: RequisitionStatus;
}

export async function createRequisition(payload: CreateRequisitionPayload) {
  return authenticatedFetch<RequisitionResponse>("/requisitions", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function fetchRequisitions(params: RequisitionQueryParams) {
  const query = new URLSearchParams();

  if (params.page) query.append("page", String(params.page));
  if (params.limit) query.append("limit", String(params.limit));
  if (params.departmentId) query.append("departmentId", params.departmentId);
  if (params.status) query.append("status", params.status);

  return authenticatedFetch<{
    data: RequisitionResponse[];
    pagination: any;
  }>(`/requisitions?${query.toString()}`);
}

export async function fetchRequisitionById(id: string) {
  return authenticatedFetch<RequisitionResponse>(`/requisitions/${id}`);
}

export async function approveRequisition(id: string) {
  return authenticatedFetch<RequisitionResponse>(
    `/requisitions/${id}/approve`,
    { method: "PUT" },
  );
}

export async function rejectRequisition(id: string, reviewNote: string) {
  return authenticatedFetch<RequisitionResponse>(`/requisitions/${id}/reject`, {
    method: "PUT",
    body: JSON.stringify({ reviewNote }),
  });
}

export async function deleteRequisition(id: string) {
  return authenticatedFetch<{ message: string }>(`/requisitions/${id}`, {
    method: "DELETE",
  });
}
