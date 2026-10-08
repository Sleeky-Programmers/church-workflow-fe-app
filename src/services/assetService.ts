import { authenticatedFetch } from "@/lib/api";

import {
  Asset,
  AssetCondition,
  AssetRisk,
  AssetStatus,
} from "@/components/features/dashboard/assets/data";

export interface AssetQueryParams {
  page?: number;
  limit?: number;
  search?: string;
  category?: string;
  risk?: string;
  type?: string;
  status?: string;
}

export interface AssetListRow {
  id: string;
  name: string;
  tag: string;
  avatar: string;
  category: string;
  department: string;
  qty: number;
  condition: AssetCondition;
  risk: AssetRisk;
  status: AssetStatus;
  maintenance: string | null;
  maintenanceDue: string | null;
}

export interface AssetStatsResponse {
  totalAssets: number;
  maintenanceDue: number;
  highRisk: number;
  goodCondition: number;
  overdue: number;
}

export interface AssetConditionPayload {
  good: number;
  fair: number;
  repair: number;
  damaged: number;
}

export interface CreateAssetPayload {
  name: string;
  tag?: string;
  category: string;
  department?: string;
  description: string;
  location?: string;
  owner?: string;
  responsibleMode: "system" | "manual";
  responsibleAdmin?: string;
  responsibleManualName?: string;
  responsibleManualEmail?: string;
  conditions: AssetConditionPayload;
  risk: AssetRisk;
  status: AssetStatus;
  maintenanceEnabled: boolean;
  frequency?: string;
  lastService?: string;
  lastReview?: string;
  remarks?: string;
}

export type UpdateAssetPayload = Partial<CreateAssetPayload>;

export interface LogServicePayload {
  date: string;
  maintenanceType: string;
  notes?: string;
  nextServiceDate?: string;
}

export interface MaintenanceNotificationsPayload {
  notificationsEnabled: boolean;
  notifyUpcoming: boolean;
  notifyDue: boolean;
  notifyOverdue: boolean;
  notifyDaysBefore: number;
  recipients: string[];
}

export async function fetchAssets(params: AssetQueryParams) {
  const query = new URLSearchParams();

  if (params.page) query.append("page", String(params.page));
  if (params.limit) query.append("limit", String(params.limit));
  if (params.search) query.append("search", params.search);
  if (params.category) query.append("category", params.category);
  if (params.risk) query.append("risk", params.risk);
  if (params.type) query.append("type", params.type);
  if (params.status) query.append("status", params.status);

  return authenticatedFetch<{ data: AssetListRow[]; pagination: any }>(
    `/assets?${query.toString()}`,
  );
}

export async function fetchAssetStats() {
  return authenticatedFetch<AssetStatsResponse>("/assets/stats");
}

export async function fetchAssetById(id: string) {
  return authenticatedFetch<Asset>(`/assets/${id}`);
}

export async function createAsset(payload: CreateAssetPayload) {
  return authenticatedFetch<Asset>("/assets", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function updateAsset(id: string, payload: UpdateAssetPayload) {
  return authenticatedFetch<Asset>(`/assets/${id}`, {
    method: "PUT",
    body: JSON.stringify(payload),
  });
}

export async function deleteAsset(id: string) {
  return authenticatedFetch<{ message: string }>(`/assets/${id}`, {
    method: "DELETE",
  });
}

export async function logAssetService(id: string, payload: LogServicePayload) {
  return authenticatedFetch<Asset>(`/assets/${id}/services`, {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function updateMaintenanceNotifications(
  id: string,
  payload: MaintenanceNotificationsPayload,
) {
  return authenticatedFetch<Asset>(`/assets/${id}/maintenance-notifications`, {
    method: "PUT",
    body: JSON.stringify(payload),
  });
}

export async function uploadAssetImage(id: string, file: File) {
  const formData = new FormData();
  formData.append("file", file);

  return authenticatedFetch<Asset>(`/assets/${id}/images`, {
    method: "POST",
    body: formData,
  });
}

export async function deleteAssetImage(id: string, imageId: string) {
  return authenticatedFetch<Asset>(`/assets/${id}/images/${imageId}`, {
    method: "DELETE",
  });
}
