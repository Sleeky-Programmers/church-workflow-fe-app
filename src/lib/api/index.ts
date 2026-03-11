import { InviteFormData, PendingInvite, User, UserAction } from "@/types/user";
import { MOCK_USERS } from "../user-data";
import {
  SignupPayload,
  VerifyOtpPayload,
  VerifyOtpResponse,
  LoginPayload,
  LoginResponse,
  ResetPasswordPayload,
  ResetPasswordResponse,
  CreateChurchPayload,
  CreateWeeklyServicePayload,
  GoogleAuthResponse,
} from "@/types/payload";
import { MOCK_ADMIN, MOCK_MEMBERS_FULL, MOCK_SERVICES } from "../data";
import {
  ActivityLogApiResponse,
  AttendanceRecord,
  Member,
  NotificationApiResponse,
  RegularService,
} from "@/types";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL;

export async function authenticatedFetch<T>(
  endpoint: string,
  options: RequestInit = {},
): Promise<T> {
  const token = localStorage.getItem("accessToken");
  if (!token) throw new Error("No authentication token");

  const isFormData = options.body instanceof FormData;

  const response = await fetch(`${BASE_URL}${endpoint}`, {
    ...options,
    headers: {
      Authorization: `Bearer ${token}`,
      ...(isFormData ? {} : { "Content-Type": "application/json" }),
      ...options.headers,
    },
  });

  if (response.status === 401) {
    if (typeof window !== "undefined") {
      localStorage.removeItem("accessToken");
      if (!window.location.pathname.includes("/auth/login")) {
        window.location.href = "/auth/login";
      }
    }
    const error: any = new Error("Unauthorized");
    error.response = { status: 401 };
    error.status = 401;
    throw error;
  }

  const text = await response.text();
  let data: unknown = null;
  if (text) {
    try {
      data = JSON.parse(text);
    } catch {
      data = text;
    }
  }

  if (!response.ok) {
    const message =
      typeof data === "object" && data && "message" in data
        ? String((data as { message?: unknown }).message || "Request failed")
        : "Request failed";
    const error: any = new Error(message);
    error.response = { status: response.status };
    error.status = response.status;
    throw error;
  }

  return data as T;
}

export async function apiFetch<T>(
  endpoint: string,
  options: RequestInit,
): Promise<T> {
  const token =
    typeof window !== "undefined" ? localStorage.getItem("accessToken") : null;

  const response = await fetch(`${BASE_URL}${endpoint}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token && { Authorization: `Bearer ${token}` }),
      ...options.headers,
    },
  });

  if (response.status === 401) {
    if (typeof window !== "undefined") {
      localStorage.removeItem("accessToken");
      if (!window.location.pathname.includes("/auth/login")) {
        window.location.href = "/auth/login";
      }
    }
    const error: any = new Error("Unauthorized");
    error.response = { status: 401 };
    error.status = 401;
    throw error;
  }

  if (!response.ok) {
    const error: any = new Error(await response.text());
    error.response = { status: response.status };
    error.status = response.status;
    throw error;
  }

  const text = await response.text();
  return text ? JSON.parse(text) : (null as unknown as T);
}

export function signup(payload: SignupPayload) {
  return apiFetch("/auth/register", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function verifyOtp(payload: VerifyOtpPayload) {
  return apiFetch<VerifyOtpResponse>("/auth/verify-otp", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function resendOtp(email: string) {
  return apiFetch<{ message: string }>("/auth/request-otp", {
    method: "POST",
    body: JSON.stringify({ email }),
  });
}

export async function login(payload: LoginPayload) {
  return apiFetch<LoginResponse>("/auth/login", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function googleAuth(idToken: string, token?: string) {
  const query = token ? `?token=${encodeURIComponent(token)}` : "";

  return apiFetch<GoogleAuthResponse>(`/auth/google${query}`, {
    method: "POST",
    body: JSON.stringify({ idToken }),
  });
}

export async function requestOtp(email: string) {
  return apiFetch<{ message: string }>("/auth/request-otp", {
    method: "POST",
    body: JSON.stringify({ email }),
  });
}

export async function resetPassword(payload: ResetPasswordPayload) {
  return apiFetch<ResetPasswordResponse>("/auth/reset-password", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function getCurrentUser() {
  const token = localStorage.getItem("accessToken");
  if (!token) throw new Error("No auth token");

  return apiFetch<any>("/admin", {
    method: "GET",
    headers: { Authorization: `Bearer ${token}` },
  });
}

export async function createChurch(
  payload: CreateChurchPayload,
  logoFile?: File | null,
) {
  const formData = new FormData();

  if (logoFile) {
    formData.append("file", logoFile);
  }
  formData.append("name", payload.name);
  formData.append("alias", payload.alias || "");
  formData.append("address", payload.address);
  formData.append("country", payload.country);
  formData.append("state", payload.state || "");
  formData.append("defaultCurrency", payload.defaultCurrency);
  formData.append("timeZone", payload.timeZone);
  return authenticatedFetch("/church", {
    method: "POST",
    body: formData,
  });
}

export async function getMyChurch() {
  return await authenticatedFetch<unknown>("/church/me", {
    method: "GET",
  });
}

export async function createWeeklyService(payload: CreateWeeklyServicePayload) {
  return apiFetch("/church-services", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function uploadMembersCsv(file: File) {
  const token = localStorage.getItem("accessToken");

  if (!token) {
    throw new Error("Unauthorized");
  }

  const formData = new FormData();
  formData.append("file", file);

  const response = await fetch(`${BASE_URL}/members/csv/create`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: formData,
  });

  if (!response.ok) {
    const text = await response.text();
    try {
      const parsed = JSON.parse(text) as {
        message?: string | string[];
      };
      const message = Array.isArray(parsed.message)
        ? parsed.message.join(", ")
        : parsed.message;
      throw new Error(message || "Members upload failed");
    } catch {
      throw new Error(text || "Members upload failed");
    }
  }

  return response.json();
}

export async function fetchUsers(): Promise<User[]> {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(MOCK_USERS);
    }, 500);
  });
}

export async function fetchUserById(userId: string): Promise<User | null> {
  return new Promise((resolve) => {
    setTimeout(() => {
      const user = MOCK_USERS.find((u) => u.id === userId);
      resolve(user || null);
    }, 300);
  });
}
export async function inviteUser(data: {
  email: string;
  role: string;
}): Promise<{ success: boolean; message: string }> {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        success: true,
        message: "Invitation sent successfully",
      });
    }, 500);
  });
}

export async function fetchPendingInvites(): Promise<PendingInvite[]> {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve([]);
    }, 300);
  });
}
export async function performUserAction(
  userId: string,
  action: UserAction,
  additionalData?: Record<string, unknown>,
): Promise<{ success: boolean; message: string }> {
  return new Promise((resolve) => {
    setTimeout(() => {
      const messages: Record<UserAction, string> = {
        view_details: "User details loaded",
        change_role: "User role updated successfully",
        resend_invite: "Invitation resent successfully",
        delete_invitation: "Invitation deleted successfully",
        suspend: "User suspended successfully",
        restore: "User restored successfully",
        remove: "User removed successfully",
      };

      resolve({
        success: true,
        message: messages[action] || "Action completed",
      });
    }, 500);
  });
}

export async function sendInvitation(
  data: InviteFormData,
): Promise<{ success: boolean; message: string }> {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        success: true,
        message: "Invitation sent successfully",
      });
    }, 500);
  });
}

export async function fetchServices(month: string): Promise<RegularService[]> {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(MOCK_SERVICES);
    }, 300);
  });
}

export async function fetchTotalMembers(): Promise<{
  totalMembers: number;
  growth: string;
}> {
  const res = await apiFetch<any>("/members/stats", { method: "GET" });
  return { totalMembers: res.totalMembers || 0, growth: res.growth || "0%" };
}

export async function fetchMembers(
  page: number = 1,
  limit: number = 10,
  search: string = "",
): Promise<{
  members: Member[];
  total: number;
  pages: number;
}> {
  return new Promise((resolve) => {
    setTimeout(() => {
      let filtered = MOCK_MEMBERS_FULL;

      if (search) {
        filtered = MOCK_MEMBERS_FULL.filter(
          (m) =>
            m.fullName.toLowerCase().includes(search.toLowerCase()) ||
            m.email.toLowerCase().includes(search.toLowerCase()),
        );
      }

      const start = (page - 1) * limit;
      const end = start + limit;
      const paginated = filtered.slice(start, end);

      const members = paginated.map((m) => ({
        id: m.id,
        name: m.fullName,
        email: m.email,
        initials: m.initials,
      }));

      resolve({
        members,
        total: filtered.length,
        pages: Math.ceil(filtered.length / limit),
      });
    }, 300);
  });
}

export async function getAttendanceRecord(
  serviceId: string,
  date: string,
): Promise<AttendanceRecord | null> {
  const service = MOCK_SERVICES.find((s) => s.id === serviceId);
  const record = service?.attendanceRecords?.find((r) => r.date === date);

  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(record || null);
    }, 300);
  });
}

export async function saveAttendance(
  data: Omit<AttendanceRecord, "absentMembers">,
): Promise<{
  success: boolean;
  recordId: string;
}> {
  return new Promise((resolve) => {
    setTimeout(() => {
      const allMemberIds = MOCK_MEMBERS_FULL.map((m) => m.id);
      const absentMembers = allMemberIds.filter(
        (id) => !data.presentMembers.includes(id),
      );

      const service = MOCK_SERVICES.find((s) => s.id === data.serviceId);
      if (service) {
        if (!service.attendanceRecords) {
          service.attendanceRecords = [];
        }

        const existingIndex = service.attendanceRecords.findIndex(
          (r) => r.date === data.date,
        );

        const record: AttendanceRecord = {
          ...data,
          absentMembers,
        };

        if (existingIndex >= 0) {
          service.attendanceRecords[existingIndex] = record;
        } else {
          service.attendanceRecords.push(record);
        }
      }

      resolve({
        success: true,
        recordId: `record-${Date.now()}`,
      });
    }, 500);
  });
}

export async function updateAttendance(
  recordId: string,
  updates: {
    addToPresent?: string[];
    removeFromPresent?: string[];
  },
): Promise<{ success: boolean }> {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({ success: true });
    }, 500);
  });
}

export function getCurrentAdmin() {
  return MOCK_ADMIN;
}

export async function fetchNotifications(): Promise<NotificationApiResponse> {
  return await apiFetch("/notifications", {
    method: "GET",
  });
}

export async function markNotificationAsRead(notificationId: string) {
  return await apiFetch(`/notifications/${notificationId}/read`, {
    method: "PUT",
  });
}

export async function markAllNotificationsAsRead() {
  return await apiFetch("/notifications/read-all", {
    method: "PUT",
  });
}

export async function fetchActivityLogs(): Promise<ActivityLogApiResponse> {
  return await apiFetch("/activity-log", {
    method: "GET",
  });
}
