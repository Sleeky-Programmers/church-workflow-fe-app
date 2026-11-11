import { getInitials } from "@/lib/utils";
import {
  ActivityLogApiResponse,
  Member,
  NotificationApiResponse,
  RegularService,
  SpecialServiceDaySchedule,
  SpecialServiceEvent,
} from "@/types";
import {
  AdminRegisterPayload,
  AdminRegisterResponse,
  AttendanceStatsResponse,
  CreateChurchPayload,
  CreateWeeklyServicePayload,
  GoogleAuthResponse,
  LoginPayload,
  LoginResponse,
  ResetPasswordPayload,
  ResetPasswordResponse,
  SignupPayload,
  VerifyOtpPayload,
  VerifyOtpResponse,
} from "@/types/payload";
import { InviteFormData, PendingInvite, User, UserAction } from "@/types/user";

import { MOCK_ADMIN } from "../data";
import { MOCK_USERS } from "../user-data";
import { SESSION_SCOPED_STORAGE_KEYS } from "../auth/storage-keys";

function clearSessionScopedStorage() {
  if (typeof window === "undefined") {
    return;
  }
  SESSION_SCOPED_STORAGE_KEYS.forEach((key) => {
    return window.localStorage.removeItem(key);
  });
}

const BASE_URL = process.env.NEXT_PUBLIC_API_URL;

// ─────────────────────────────────────────────────────────────────────────────
// Read timeouts + in-flight de-duplication
// ─────────────────────────────────────────────────────────────────────────────

/** Reads that take longer than this are aborted with a clear message. */
const READ_TIMEOUT_MS = 25_000;

export const REQUEST_TIMEOUT_MESSAGE =
  "The server took too long to respond. Please try again.";

function isReadRequest(options: RequestInit) {
  const method = (options.method || "GET").toUpperCase();
  return method === "GET" || method === "HEAD";
}

/**
 * Fetch() with a timeout for reads only. Without it a stalled request hangs
 * the widget's spinner forever (or until the platform kills the function and
 * the browser reports an opaque "Failed to fetch"). Mutations are left alone:
 * aborting them client-side wouldn't stop the server, and long writes such as
 * CSV imports are legitimate. Callers that pass their own signal keep it.
 */
async function fetchWithTimeout(url: string, init: RequestInit) {
  if (init.signal || !isReadRequest(init)) {
    return fetch(url, init);
  }
  const controller = new AbortController();
  const timer = setTimeout(() => {
    return controller.abort();
  }, READ_TIMEOUT_MS);
  try {
    return await fetch(url, { ...init, signal: controller.signal });
  } catch (err) {
    if (controller.signal.aborted) {
      const timeoutError: any = new Error(REQUEST_TIMEOUT_MESSAGE);
      timeoutError.name = "TimeoutError";
      timeoutError.isTimeout = true;
      throw timeoutError;
    }
    throw err;
  } finally {
    clearTimeout(timer);
  }
}

// Identical GETs fired at the same moment (e.g. two dashboard widgets both
// Asking for the giving trend) share one network request. Entries are dropped
// As soon as the request settles, so this never serves stale data.
const inFlightReads = new Map<string, Promise<unknown>>();

function dedupeRead<T>(key: string | null, run: () => Promise<T>): Promise<T> {
  if (!key) {
    return run();
  }
  const existing = inFlightReads.get(key);
  if (existing) {
    return existing as Promise<T>;
  }
  const promise = run().finally(() => {
    return inFlightReads.delete(key);
  });
  inFlightReads.set(key, promise);
  return promise;
}

function readDedupeKey(
  kind: string,
  endpoint: string,
  options: RequestInit & { responseType?: string },
): string | null {
  if (typeof window === "undefined") {
    return null;
  }
  if (!isReadRequest(options) || options.body || options.signal) {
    return null;
  }
  if (options.responseType && options.responseType !== "json") {
    return null;
  }
  const token = localStorage.getItem("accessToken") || "";
  return `${kind}|${options.method || "GET"}|${endpoint}|${token}`;
}

export async function authenticatedFetch<T>(
  endpoint: string,
  options: RequestInit & { responseType?: "json" | "blob" | "text" } = {},
): Promise<T> {
  return dedupeRead(readDedupeKey("auth", endpoint, options), () => {
    return authenticatedFetchImpl<T>(endpoint, options);
  });
}

async function authenticatedFetchImpl<T>(
  endpoint: string,
  options: RequestInit & { responseType?: "json" | "blob" | "text" } = {},
): Promise<T> {
  const token = localStorage.getItem("accessToken");
  if (!token) {
    throw new Error("No authentication token");
  }

  const isFormData = options.body instanceof FormData;

  const getHeaders = (authToken: string) => {
    return {
      Authorization: `Bearer ${authToken}`,
      ...(isFormData || options.responseType === "blob"
        ? {}
        : { "Content-Type": "application/json" }),
      ...options.headers,
    };
  };

  const response = await fetchWithTimeout(`${BASE_URL}${endpoint}`, {
    ...options,
    headers: getHeaders(token),
  });

  if (response.status === 401) {
    try {
      const refreshData = await refreshAuthToken();

      localStorage.setItem("accessToken", refreshData.accessToken);
      localStorage.setItem("refreshToken", refreshData.refreshToken);

      const retryResponse = await fetchWithTimeout(`${BASE_URL}${endpoint}`, {
        ...options,
        headers: getHeaders(refreshData.accessToken),
      });

      if (!retryResponse.ok) {
        throw new Error("Retry failed");
      }
      if (options.responseType === "blob") {
        return (await retryResponse.blob()) as T;
      }

      if (options.responseType === "text") {
        return (await retryResponse.text()) as T;
      }

      return retryResponse.json();
    } catch (err) {
      localStorage.removeItem("accessToken");
      localStorage.removeItem("refreshToken");
      clearSessionScopedStorage();

      if (!window.location.pathname.includes("/auth/login")) {
        window.location.href = "/auth/login";
      }

      throw err;
    }
  }

  if (!response.ok) {
    const text = await response.text();

    let data: any;
    try {
      data = JSON.parse(text);
    } catch {
      data = text;
    }

    const message =
      typeof data === "object" && data?.message
        ? data.message
        : "Request failed";

    const error: any = new Error(message);
    error.status = response.status;
    error.response = { status: response.status, data };

    throw error;
  }

  if (options.responseType === "blob") {
    return (await response.blob()) as T;
  }

  if (options.responseType === "text") {
    return (await response.text()) as T;
  }

  return response.json();
}

export async function apiFetch<T>(
  endpoint: string,
  options: RequestInit,
): Promise<T> {
  return dedupeRead(readDedupeKey("api", endpoint, options), () => {
    return apiFetchImpl<T>(endpoint, options);
  });
}

async function apiFetchImpl<T>(
  endpoint: string,
  options: RequestInit,
): Promise<T> {
  const token =
    typeof window !== "undefined" ? localStorage.getItem("accessToken") : null;

  const response = await fetchWithTimeout(`${BASE_URL}${endpoint}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token && { Authorization: `Bearer ${token}` }),
      ...options.headers,
    },
  });

  const text = await response.text();
  let data: unknown = null;
  if (text) {
    try {
      data = JSON.parse(text);
    } catch {
      data = text;
    }
  }

  if (response.status === 401) {
    if (typeof window !== "undefined") {
      localStorage.removeItem("accessToken");
      localStorage.removeItem("refreshToken");
      clearSessionScopedStorage();
      if (!window.location.pathname.includes("/auth/login")) {
        window.location.href = "/auth/login";
      }
    }
    const message =
      typeof data === "object" && data && "message" in data
        ? String((data as { message?: unknown }).message || "Unauthorized")
        : "Unauthorized";
    const error: any = new Error(message);
    error.response = { status: 401, data };
    error.status = 401;
    throw error;
  }

  if (!response.ok) {
    const message =
      typeof data === "object" && data && "message" in data
        ? String((data as { message?: unknown }).message || "Request failed")
        : text || "Request failed";
    const error: any = new Error(message);
    error.response = { status: response.status, data };
    error.status = response.status;
    throw error;
  }

  return (data ?? null) as T;
}

export function signup(payload: SignupPayload) {
  return apiFetch("/auth/register", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function adminRegister(token: string, payload: AdminRegisterPayload) {
  const query = token ? `?token=${encodeURIComponent(token)}` : "";
  return apiFetch<AdminRegisterResponse>(`/auth/admin-register${query}`, {
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
  if (!token) {
    throw new Error("No auth token");
  }

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
  return await authenticatedFetch<any>("/church/me", {
    method: "GET",
  });
}

export async function getMyBranches() {
  return await authenticatedFetch<{
    branches: {
      _id: string;
      name: string;
      alias: string | null;
      isHQ: boolean;
      isActive: boolean;
    }[];
    accessScope: "BRANCH" | "ORG_WIDE";
    activeBranchId: string | null;
  }>("/branches/me", {
    method: "GET",
  });
}

export async function switchBranch(branchId: string) {
  return await authenticatedFetch<{
    accessToken: string;
    refreshToken: string;
  }>("/auth/switch-branch", {
    method: "POST",
    body: JSON.stringify({ branchId }),
  });
}

export async function createWeeklyService(payload: CreateWeeklyServicePayload) {
  return authenticatedFetch("/church-services", {
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
      const user = MOCK_USERS.find((u) => {
        return u.id === userId;
      });
      resolve(user || null);
    }, 300);
  });
}
export async function inviteUser(_data: {
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
  _additionalData?: Record<string, unknown>,
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
        manage_branch_access: "Branch access updated successfully",
      };

      resolve({
        success: true,
        message: messages[action] || "Action completed",
      });
    }, 500);
  });
}

export async function sendInvitation(
  _data: InviteFormData,
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

type ChurchServiceApi = {
  _id: string;
  title: string;
  type: "REGULAR" | "SPECIAL";
  recurrence:
    | "WEEKLY_MONDAY"
    | "NO_REPEAT"
    | "MONTHLY_FIRST_MONDAY"
    | "ANNUALLY";
  day?: string;
  daySchedules: SpecialServiceDaySchedule[];
  eventType: any;
  startTime: string;
  endTime?: string;
  location?: string;
  startDate?: string;
  endDate?: string;
  description?: string;
  specialDays?: { date: string; startTime: string; endTime?: string }[];
};

type PaginatedResponse<T> = {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    itemCount: number;
    totalPages: number;
    hasPreviousPage: boolean;
    hasNextPage: boolean;
  };
};

export function getRefreshToken(): string | null {
  if (typeof window === "undefined") {
    return null;
  }
  return localStorage.getItem("refreshToken");
}

// A single in-flight refresh shared by every caller. The refresh token is
// Rotated server-side on first use, so if parallel 401s each kicked off their
// Own refresh, the first would invalidate the token for all the others
// ("Refresh failed" → spurious logout). De-duping them behind one promise is
// What keeps a token expiry from randomly nuking the whole dashboard.
let inFlightRefresh: Promise<{
  accessToken: string;
  refreshToken: string;
}> | null = null;

export async function refreshAuthToken() {
  if (inFlightRefresh) {
    return inFlightRefresh;
  }

  inFlightRefresh = (async () => {
    const refreshToken = getRefreshToken();

    if (!refreshToken) {
      throw new Error("No refresh token");
    }

    const response = await fetch(`${BASE_URL}/auth/refresh-token`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ refreshToken }),
    });

    if (!response.ok) {
      throw new Error("Refresh failed");
    }

    return response.json();
  })();

  try {
    return await inFlightRefresh;
  } finally {
    inFlightRefresh = null;
  }
}

function mapChurchServiceToRegular(service: ChurchServiceApi): RegularService {
  return {
    id: service._id,
    title: service.title,
    startTime: service.startTime,
    day: service.day ? service.day : "",
    type: service.type,
    endTime: service.endTime,
    location: service.location,
    frequency: "weekly",
    attendanceRecords: [],
  };
}

export const mapToRegularService = (
  apiService: ChurchServiceApi,
): RegularService => {
  return {
    id: apiService._id,
    title: apiService.title,
    type: apiService.type,
    day: apiService.day ? apiService.day : "",
    startTime: apiService.startTime,
    endTime: apiService.endTime,
    location: apiService.location,
    description: apiService.description,
    frequency: apiService.recurrence === "WEEKLY_MONDAY" ? "weekly" : "monthly",
    attendanceRecords: [],
  };
};

// Helper function to map API response to SpecialServiceEvent
export const mapToSpecialService = (
  apiService: ChurchServiceApi,
): SpecialServiceEvent => {
  return {
    id: apiService._id,
    title: apiService.title ? apiService.title : "",
    startDate: apiService.startDate || "",
    endDate: apiService.endDate,
    startTime: apiService.startTime || "",
    endTime: apiService.endTime,
    location: apiService.location,
    description: apiService.description,
    recurrence: apiService.recurrence as any,
    eventType: apiService.eventType as any,
    daySchedules:
      apiService.specialDays?.map((day) => {
        return {
          date: day.date,
          startTime: day.startTime,
          endTime: day.endTime ? day.endTime : "",
        };
      }) || [],
  };
};

export async function fetchServices(_month: string): Promise<RegularService[]> {
  const response = await authenticatedFetch<
    PaginatedResponse<ChurchServiceApi>
  >("/church-services?page=1&limit=100", { method: "GET" });

  return (response.data || [])
    .filter((service) => {
      return (
        typeof service.type === "string" &&
        service.type.toUpperCase() === "REGULAR"
      );
    })
    .map(mapChurchServiceToRegular);
}

export async function fetchAllServices(_month: string) {
  const response = await authenticatedFetch<
    PaginatedResponse<ChurchServiceApi>
  >("/church-services?page=1&limit=100", { method: "GET" });

  return response.data || [];
}

export async function createSpecialServices(
  _month: string,
): Promise<RegularService[]> {
  const response = await authenticatedFetch<
    PaginatedResponse<ChurchServiceApi>
  >("/church-services", { method: "POST" });

  return (response.data || [])
    .filter((service) => {
      return (
        typeof service.type === "string" &&
        service.type.toUpperCase() === "REGULAR"
      );
    })
    .map(mapChurchServiceToRegular);
}

export async function fetchTotalMembers(): Promise<{
  totalMembers: number;
  growth: string;
}> {
  const res = await apiFetch<any>("/members/stats", { method: "GET" });
  return { totalMembers: res.totalMembers || 0, growth: res.growth || "0%" };
}

export async function fetchAttendanceStats(): Promise<AttendanceStatsResponse> {
  return authenticatedFetch<AttendanceStatsResponse>("/attendance/stats", {
    method: "GET",
  });
}

export type Month =
  | "January"
  | "February"
  | "March"
  | "April"
  | "May"
  | "June"
  | "July"
  | "August"
  | "September"
  | "October"
  | "November"
  | "December";

export interface MonthlyAttendance {
  month: Month;
  totalAttendance: number;
}

export interface AttendanceTrendResponse {
  regularService: MonthlyAttendance[];
  specialService: MonthlyAttendance[];
}

export async function fetchAttendanceTrend(): Promise<AttendanceTrendResponse> {
  return authenticatedFetch<AttendanceTrendResponse>("/attendance/trend", {
    method: "GET",
  });
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
  const query = new URLSearchParams({
    page: String(page),
    limit: String(limit),
    ...(search ? { search } : {}),
  });

  const response = await authenticatedFetch<
    PaginatedResponse<{
      _id: string;
      fullName: string;
      email?: string;
      gender?: string;
    }>
  >(`/members?${query.toString()}`, { method: "GET" });

  const members =
    response.data?.map((member) => {
      return {
        id: member._id,
        name: member.fullName,
        email: member.email || "",
        initials: getInitials(member.fullName || ""),
        gender: member.gender,
      };
    }) || [];

  return {
    members,
    total: response.pagination?.itemCount || 0,
    pages: response.pagination?.totalPages || 1,
  };
}

type RawAttendanceApiRecord = {
  _id: string;
  churchServiceId: string;
  date: string;
  memberId?: string;
  recordedBy?: string;
};

type AttendanceApiRecord = {
  attendees: string[];
  recordedBy: string;
};

export type AttendanceApiResult = {
  attendance: AttendanceApiRecord | null;
  stats: {
    present: { male: number; female: number; total: number };
    absent: { male: number; female: number; total: number };
  } | null;
};

export async function getAttendanceRecord(
  serviceId: string,
  date: string,
): Promise<AttendanceApiResult> {
  const query = new URLSearchParams({
    serviceId,
    date,
  });

  const raw = await authenticatedFetch<{
    attendance: RawAttendanceApiRecord[] | null;
    stats: AttendanceApiResult["stats"];
  }>(`/attendance?${query.toString()}`, { method: "GET" });

  if (!raw.attendance || raw.attendance.length === 0) {
    return { attendance: null, stats: raw.stats || null };
  }

  return {
    attendance: {
      attendees: raw.attendance
        .map((record) => {
          return record.memberId;
        })
        .filter((id): id is string => {
          return Boolean(id);
        }),
      recordedBy: raw.attendance[0]?.recordedBy || "",
    },
    stats: raw.stats || null,
  };
}
export async function saveAttendance(data: {
  serviceId: string;
  date: string;
  presentMembers: string[];
}): Promise<{ message: string }> {
  const query = new URLSearchParams({
    serviceId: data.serviceId,
  });

  return authenticatedFetch<{ message: string }>(
    `/attendance/mark?${query.toString()}`,
    {
      method: "POST",
      body: JSON.stringify({
        date: data.date,
        memberIds: data.presentMembers,
      }),
    },
  );
}

export async function saveAbsentAttendance(data: {
  serviceId: string;
  date: string;
  absentMembers: string[];
}): Promise<{ message: string }> {
  if (!data.absentMembers || data.absentMembers.length === 0) {
    return { message: "No absent members to save" };
  }

  const query = new URLSearchParams({ serviceId: data.serviceId });

  return authenticatedFetch<{ message: string }>(
    `/attendance/mark-absent?${query.toString()}`,
    {
      method: "POST",
      body: JSON.stringify({
        date: data.date,
        memberIds: data.absentMembers,
      }),
    },
  );
}
type SmallTeamMemberApi = {
  id: string;
  fullName: string;
  email: string;
};

type SmallTeamApi = {
  _id: string;
  name: string;
  status: "ACTIVE" | "INACTIVE";
  description: string;
  leader: {
    id: string;
    fullName: string;
  } | null;
  pendingLeaderEmail?: string | null;
  members: SmallTeamMemberApi[];
  membersCount: number;
  createdAt: string;
  updatedAt: string;
};

export type SmallTeamListResponse = {
  data: SmallTeamApi[];
  pagination: {
    page: number;
    limit: number;
    itemCount: number;
    totalPages: number;
    hasPreviousPage: boolean;
    hasNextPage: boolean;
  };
};

export async function fetchSmallTeams(
  page: number = 1,
  limit: number = 100,
  search: string = "",
): Promise<SmallTeamListResponse> {
  const query = new URLSearchParams({
    page: String(page),
    limit: String(limit),
    ...(search ? { search } : {}),
  });

  return authenticatedFetch<SmallTeamListResponse>(
    `/small-teams?${query.toString()}`,
    { method: "GET" },
  );
}

export async function createSmallTeam(payload: {
  name: string;
  leaderId?: string;
  pendingLeaderEmail?: string;
  memberIds: string[];
  status: "ACTIVE" | "INACTIVE";
  description?: string;
}): Promise<SmallTeamApi> {
  return authenticatedFetch<SmallTeamApi>("/small-teams", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function updateSmallTeam(payload: {
  teamId: string;
  name?: string;
  leaderId?: string | null;
  pendingLeaderEmail?: string | null;
  memberIds?: string[];
  status?: "ACTIVE" | "INACTIVE";
  description?: string;
}): Promise<SmallTeamApi> {
  const { teamId, ...body } = payload;
  return authenticatedFetch<SmallTeamApi>(`/small-teams/${teamId}`, {
    method: "PUT",
    body: JSON.stringify(body),
  });
}

export async function updateSmallTeamMembers(
  teamId: string,
  memberIds: string[],
): Promise<SmallTeamApi> {
  return authenticatedFetch<SmallTeamApi>(`/small-teams/${teamId}/members`, {
    method: "PUT",
    body: JSON.stringify({ memberIds }),
  });
}

export async function deleteSmallTeam(
  teamId: string,
): Promise<{ message: string }> {
  return authenticatedFetch<{ message: string }>(`/small-teams/${teamId}`, {
    method: "DELETE",
  });
}

export async function markSmallTeamAttendance(payload: {
  teamId: string;
  serviceId: string;
  date: string;
  memberIds: string[];
}): Promise<{
  message: string;
  presentCount: number;
  totalTeamMembers: number;
}> {
  const { teamId, serviceId, date, memberIds } = payload;
  const query = new URLSearchParams({ serviceId });
  return authenticatedFetch(
    `/small-teams/${teamId}/attendance?${query.toString()}`,
    {
      method: "POST",
      body: JSON.stringify({ date, memberIds }),
    },
  );
}

export type SmallTeamReportResponse = {
  team: SmallTeamApi;
  attendancePercentage: number;
  sessions: number;
  lowAttendanceMembers: {
    id: string;
    fullName: string;
    email: string;
    presentCount: number;
    sessions: number;
    attendancePercentage: number;
  }[];
};

export async function fetchSmallTeamReport(
  teamId: string,
  params?: {
    from?: string;
    to?: string;
    lowAttendanceThreshold?: number;
  },
): Promise<SmallTeamReportResponse> {
  const query = new URLSearchParams();
  if (params?.from) {
    query.set("from", params.from);
  }
  if (params?.to) {
    query.set("to", params.to);
  }
  if (typeof params?.lowAttendanceThreshold === "number") {
    query.set("lowAttendanceThreshold", String(params.lowAttendanceThreshold));
  }

  const suffix = query.toString() ? `?${query.toString()}` : "";
  return authenticatedFetch<SmallTeamReportResponse>(
    `/small-teams/${teamId}/report${suffix}`,
    { method: "GET" },
  );
}

export type MemberAttendanceHistoryResponse = {
  memberId: string;
  records: {
    id: string;
    service: string;
    date: string;
    status: "Present" | "Absent";
    recordedBy: string;
    time: string;
  }[];
  stats: {
    attended: number;
    missed: number;
    total: number;
    rate: number;
  };
  trends: {
    month: string;
    attended: number;
    total: number;
    rate: number;
  }[];
};

export async function fetchMemberAttendanceHistory(
  memberId: string,
  params?: { from?: string; to?: string },
): Promise<MemberAttendanceHistoryResponse> {
  const query = new URLSearchParams();
  if (params?.from) {
    query.set("from", params.from);
  }
  if (params?.to) {
    query.set("to", params.to);
  }
  const suffix = query.toString() ? `?${query.toString()}` : "";

  return authenticatedFetch<MemberAttendanceHistoryResponse>(
    `/attendance/member/${memberId}${suffix}`,
    { method: "GET" },
  );
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

export async function fetchActivityLogs(
  page = 1,
  limit = 20,
): Promise<ActivityLogApiResponse> {
  const params = new URLSearchParams({
    page: String(page),
    limit: String(limit),
  });

  return await apiFetch(`/activity-log?${params.toString()}`, {
    method: "GET",
  });
}
