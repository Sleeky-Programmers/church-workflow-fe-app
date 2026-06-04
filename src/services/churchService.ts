import { authenticatedFetch } from "@/lib/api";

export interface SpecialDayDto {
  date: string;
  startTime: string;
  endTime?: string;
}

export type DAY =
  | "MONDAY"
  | "TUESDAY"
  | "WEDNESDAY"
  | "THURSDAY"
  | "FRIDAY"
  | "SATURDAY"
  | "SUNDAY";

export interface CreateChurchServiceDto {
  title: string;
  type: "REGULAR" | "SPECIAL";
  day?: DAY;
  startDate?: string;
  endDate?: string;
  description?: string;
  specialDays?: SpecialDayDto[];
  startTime?: string;
  endTime?: string;
  location?: string;
  recurrence?:
    | "NO_REPEAT"
    | "WEEKLY_MONDAY"
    | "MONTHLY_FIRST_MONDAY"
    | "ANNUALLY";
  eventType?:
    | "WORSHIP_SERVICE"
    | "BIRTHDAY"
    | "MEETING"
    | "WEDDING_ANNIVERSARY"
    | "OTHERS";
  reminderEnabled?: boolean;
  reminderType?: "EMAIL" | "SMS" | "PUSH_NOTIFICATION";
  reminderTimeBefore?:
    | "5_MINS"
    | "10_MINS"
    | "15_MINS"
    | "30_MINS"
    | "1_HOUR"
    | "2_HOURS"
    | "1_DAY"
    | "1_WEEK";
}

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

export async function deleteChurchService(id: string): Promise<any> {
  if (!id) {
    throw new Error("Service ID is required");
  }

  return await authenticatedFetch(`/church-services/${id}`, {
    method: "DELETE",
  });
}

export async function createChurchService(data: CreateChurchServiceDto) {
  return await authenticatedFetch("/church-services", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });
}
