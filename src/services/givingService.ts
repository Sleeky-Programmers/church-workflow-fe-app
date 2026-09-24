import { authenticatedFetch } from "@/lib/api";

export type GivingBatchStatus = "draft" | "submitted" | "confirmed" | "voided";

export interface GivingEntry {
  id?: string;
  offeringTypeId: string;
  offeringTypeName?: string;
  currencyCode: string;
  amount: number;
  paymentMethod: string;
  note?: string;
}

export interface GivingBatch {
  id: string;
  churchServiceId: string;
  serviceTitle?: string;
  date: string;
  status: GivingBatchStatus;
  countedWith?: string;
  notes?: string;
  totalAmount: number;
  entries?: GivingEntry[];
  createdAt?: string;
  updatedAt?: string;
  submittedAt?: string;
  confirmedAt?: string;
  voidedAt?: string;
  voidReason?: string;
  editReason?: string;
}

export interface GivingBatchEntryPayload {
  offeringTypeId: string;
  currencyCode: string;
  amount: number;
  paymentMethod: string;
  note?: string;
}

export interface CreateGivingBatchPayload {
  churchServiceId: string;
  date: string;
  countedWith?: string;
  notes?: string;
  entries: GivingBatchEntryPayload[];
}

export interface UpdateGivingBatchPayload extends Partial<CreateGivingBatchPayload> {
  editReason?: string;
}

export interface GivingBatchQueryParams {
  page?: number;
  limit?: number;
  startDate?: string;
  endDate?: string;
  status?: GivingBatchStatus;
}

export interface PaginationInfo {
  page: number;
  limit: number;
  itemCount: number;
  totalPages: number;
  hasPreviousPage: boolean;
  hasNextPage: boolean;
}

export interface OfferingType {
  id: string;
  name: string;
  isActive: boolean;
  sortOrder: number;
  isSystem: boolean;
}

export interface Currency {
  id: string;
  code: string;
  symbol: string;
  name: string;
  isDefault: boolean;
  isActive: boolean;
}

export interface GivingSummaryResponse {
  byOfferingType: { name: string; amount: number }[];
  byCurrency: { currencyCode: string; amount: number }[];
  totalAmount: number;
  recordCount: number;
}

export interface GivingMonthlyTrendPoint {
  month: string;
  currencyCode: string;
  totalAmount: number;
}

export interface DuplicateBatchCheckResponse {
  exists: boolean;
  batchId?: string;
}

// ---- Giving batches ----

export async function createGivingBatch(payload: CreateGivingBatchPayload) {
  return authenticatedFetch<GivingBatch>("/giving-batches", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function fetchGivingBatches(params: GivingBatchQueryParams = {}) {
  const query = new URLSearchParams();

  if (params.page) query.append("page", String(params.page));
  if (params.limit) query.append("limit", String(params.limit));
  if (params.startDate) query.append("startDate", params.startDate);
  if (params.endDate) query.append("endDate", params.endDate);
  if (params.status) query.append("status", params.status);

  return authenticatedFetch<{
    data: GivingBatch[];
    pagination: PaginationInfo;
  }>(`/giving-batches?${query.toString()}`);
}

export async function fetchGivingBatch(id: string) {
  return authenticatedFetch<GivingBatch>(`/giving-batches/${id}`);
}

export async function updateGivingBatch(
  id: string,
  payload: UpdateGivingBatchPayload,
) {
  return authenticatedFetch<GivingBatch>(`/giving-batches/${id}`, {
    method: "PUT",
    body: JSON.stringify(payload),
  });
}

export async function submitGivingBatch(id: string) {
  return authenticatedFetch<GivingBatch>(`/giving-batches/${id}/submit`, {
    method: "POST",
  });
}

export async function confirmGivingBatch(id: string) {
  return authenticatedFetch<GivingBatch>(`/giving-batches/${id}/confirm`, {
    method: "POST",
  });
}

export async function voidGivingBatch(id: string, voidReason: string) {
  return authenticatedFetch<GivingBatch>(`/giving-batches/${id}/void`, {
    method: "POST",
    body: JSON.stringify({ voidReason }),
  });
}

export async function checkDuplicateGivingBatch(params: {
  churchServiceId: string;
  date: string;
}) {
  const query = new URLSearchParams({
    churchServiceId: params.churchServiceId,
    date: params.date,
  });

  return authenticatedFetch<DuplicateBatchCheckResponse>(
    `/giving-batches/check-duplicate?${query.toString()}`,
  );
}

export async function fetchGivingSummary(params?: {
  startDate?: string;
  endDate?: string;
}) {
  const query = new URLSearchParams();
  if (params?.startDate) query.append("startDate", params.startDate);
  if (params?.endDate) query.append("endDate", params.endDate);

  return authenticatedFetch<GivingSummaryResponse>(
    `/giving-batches/summary?${query.toString()}`,
  );
}

export async function fetchGivingMonthlyTrend(params?: {
  startDate?: string;
  endDate?: string;
}) {
  const query = new URLSearchParams();
  if (params?.startDate) query.append("startDate", params.startDate);
  if (params?.endDate) query.append("endDate", params.endDate);

  return authenticatedFetch<GivingMonthlyTrendPoint[]>(
    `/giving-batches/monthly-trend?${query.toString()}`,
  );
}

// ---- Offering types ----

export async function fetchOfferingTypes() {
  return authenticatedFetch<OfferingType[]>("/offering-types");
}

export async function createOfferingType(payload: {
  name: string;
  sortOrder?: number;
}) {
  return authenticatedFetch<OfferingType>("/offering-types", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function updateOfferingType(
  id: string,
  payload: Partial<Pick<OfferingType, "name" | "isActive" | "sortOrder">>,
) {
  return authenticatedFetch<OfferingType>(`/offering-types/${id}`, {
    method: "PUT",
    body: JSON.stringify(payload),
  });
}

// ---- Currencies ----

export async function fetchCurrencies() {
  return authenticatedFetch<Currency[]>("/currencies");
}

export async function createCurrency(payload: {
  code: string;
  symbol: string;
  name: string;
}) {
  return authenticatedFetch<Currency>("/currencies", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function updateCurrency(
  id: string,
  payload: Partial<Pick<Currency, "code" | "symbol" | "name" | "isActive">>,
) {
  return authenticatedFetch<Currency>(`/currencies/${id}`, {
    method: "PUT",
    body: JSON.stringify(payload),
  });
}

export async function setDefaultCurrency(id: string) {
  return authenticatedFetch<Currency>(`/currencies/${id}/set-default`, {
    method: "PUT",
  });
}
