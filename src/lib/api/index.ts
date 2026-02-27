import { InviteFormData, PendingInvite, User, UserAction } from "@/types/user";
import { MOCK_USERS } from "../user-data";
import {
  SignupPayload,
  VerifyOtpPayload,
  VerifyOtpResponse,
  LoginPayload,
  LoginResponse,
  GoogleAuthPayload,
  GoogleAuthResponse,
  ResetPasswordPayload,
  ResetPasswordResponse,
  CreateChurchPayload,
  CreateWeeklyServicePayload,
} from "@/types/payload";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL;

async function authenticatedFetch<T>(
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

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data?.message || "Request failed");
  }
  return data as T;
}

async function apiFetch<T>(endpoint: string, options: RequestInit): Promise<T> {
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

  if (!response.ok) {
    throw new Error(await response.text());
  }

  return response.json();
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

export async function googleAuth(payload: GoogleAuthPayload, token?: string) {
  const query = token ? `?token=${encodeURIComponent(token)}` : "";

  return apiFetch<GoogleAuthResponse>(`/auth/google${query}`, {
    method: "POST",
    body: JSON.stringify(payload),
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

export async function completeOnboarding() {
  const token = localStorage.getItem("accessToken");
  if (!token) throw new Error("No auth token");

  return apiFetch("/auth/complete-onboarding", {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
  });
}

export async function createChurch(
  payload: CreateChurchPayload,
  logoFile: File,
) {
  const formData = new FormData();

  formData.append("file", logoFile);
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

export async function createWeeklyService(payload: CreateWeeklyServicePayload) {
  return apiFetch("/events/weekly-service/create", {
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
    throw new Error(await response.text());
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
