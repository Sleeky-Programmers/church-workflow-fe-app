import { authenticatedFetch } from "@/lib/api";

export interface SaveGivingRecordPayload {
  churchServiceId: string;
  date: string;
  tithe?: number;
  offering?: number;
  specialOffering?: number;
  thanksgivingOffering?: number;
}

export interface GivingRecordResponse {
  id: string;
  churchServiceId: string;
  serviceTitle?: string;
  date: string;
  tithe: number;
  offering: number;
  specialOffering: number;
  thanksgivingOffering: number;
  totalAmount: number;
  currency: string;
  recordedBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface GivingRecordQueryParams {
  page?: number;
  limit?: number;
  startDate?: string;
  endDate?: string;
  churchServiceId?: string;
}

export interface GivingSummaryResponse {
  tithe: number;
  offering: number;
  specialOffering: number;
  thanksgivingOffering: number;
  totalAmount: number;
  recordCount: number;
}

export interface GivingMonthlyTrendPoint {
  month: string;
  totalAmount: number;
}

export async function saveGivingRecord(payload: SaveGivingRecordPayload) {
  return authenticatedFetch<GivingRecordResponse>("/giving-records", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function fetchGivingRecords(params: GivingRecordQueryParams) {
  const query = new URLSearchParams();

  if (params.page) query.append("page", String(params.page));
  if (params.limit) query.append("limit", String(params.limit));
  if (params.startDate) query.append("startDate", params.startDate);
  if (params.endDate) query.append("endDate", params.endDate);
  if (params.churchServiceId)
    query.append("churchServiceId", params.churchServiceId);

  return authenticatedFetch<{
    data: GivingRecordResponse[];
    pagination: any;
  }>(`/giving-records?${query.toString()}`);
}

export async function fetchGivingSummary(params?: {
  startDate?: string;
  endDate?: string;
}) {
  const query = new URLSearchParams();
  if (params?.startDate) query.append("startDate", params.startDate);
  if (params?.endDate) query.append("endDate", params.endDate);

  return authenticatedFetch<GivingSummaryResponse>(
    `/giving-records/summary?${query.toString()}`,
  );
}

export async function fetchGivingMonthlyTrend() {
  return authenticatedFetch<GivingMonthlyTrendPoint[]>(
    "/giving-records/monthly-trend",
  );
}

export async function updateGivingRecord(
  id: string,
  payload: Partial<SaveGivingRecordPayload>,
) {
  return authenticatedFetch<GivingRecordResponse>(`/giving-records/${id}`, {
    method: "PUT",
    body: JSON.stringify(payload),
  });
}

export async function deleteGivingRecord(id: string) {
  return authenticatedFetch<{ message: string }>(`/giving-records/${id}`, {
    method: "DELETE",
  });
}
