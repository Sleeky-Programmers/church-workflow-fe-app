// services/churchService.ts

import { authenticatedFetch } from "@/lib/api";
import { ReminderTimeBefore } from "@/types";

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

export type ServiceType = "REGULAR" | "SPECIAL";
export type RecurrenceType =
  | "NO_REPEAT"
  | "DAILY"
  | "WEEKLY_MONDAY"
  | "MONTHLY_FIRST_MONDAY"
  | "ANNUALLY"
  | "WEEKDAYS"
  | "SUNDAY";
export type EventTypeType =
  | "WORSHIP_SERVICE"
  | "BIRTHDAY"
  | "MEETING"
  | "WEDDING_ANNIVERSARY"
  | "OTHERS";
export type ReminderTypeType = "EMAIL" | "SMS" | "PUSH_NOTIFICATION" | "IN_APP";
export type ReminderTimeBeforeType =
  | "5_MINS"
  | "10_MINS"
  | "15_MINS"
  | "30_MINS"
  | "1_HOUR"
  | "2_HOURS"
  | "1_DAY"
  | "1_WEEK";

export interface CreateChurchServiceDto {
  title: string;
  type: ServiceType;
  day?: DAY;
  startDate?: string;
  endDate?: string;
  description?: string;
  specialDays?: SpecialDayDto[];
  startTime?: string;
  endTime?: string;
  location?: string;
  recurrence?: RecurrenceType;
  eventType?: EventTypeType;
  reminderEnabled?: boolean;
  reminderType?: ReminderTypeType;
  reminderTimeBefore?: ReminderTimeBefore;
}

export interface UpdateChurchServiceDto extends Partial<CreateChurchServiceDto> {}

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

/**
 * Create a new church service
 * POST /church-services
 */
export async function createChurchService(data: CreateChurchServiceDto) {
  return await authenticatedFetch("/church-services", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });
}

/**
 * Update an existing church service
 * PUT /church-services/:id
 */
export async function updateChurchService(
  id: string,
  data: UpdateChurchServiceDto,
) {
  if (!id) {
    throw new Error("Service ID is required");
  }

  return await authenticatedFetch(`/church-services/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });
}
