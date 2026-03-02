import { apiFetch } from "./index";

export interface Role {
  _id: string;
  churchId: string | null;
  roleName: string;
  description: string | null;
  type: "SYSTEM" | "CUSTOM";
  status: "ACTIVE" | "DISABLED";
  permissions: {
    moduleSection: string;
    accessLevel: string;
  }[];
  __v: number;
}

export interface AdminInvite {
  _id: string;
  churchId: string;
  churchRole: string; // The role ID usually, or role string
  email: string;
  status: "PENDING" | "ACTIVE" | "SUSPENDED" | string;
  createdAt: string;
  updatedAt: string;
}

export interface AccountSettings {
  _id: string;
  adminId: string;
  personalPreferences: {
    birthday: boolean;
    event: boolean;
    requisitionApproval: boolean;
    _id?: string;
  };
  personalPrivacy: {
    birthdayCalendarDisplay: boolean;
    birthdayShoutOut: boolean;
    emailAlerts: boolean;
    _id?: string;
  };
  createdAt: string;
  updatedAt: string;
}

// --- Roles API ---
export async function fetchRoles() {
  return apiFetch<Role[]>("/roles", { method: "GET" });
}

export async function createRole(payload: { roleName: string; permissions: any[] }) {
  return apiFetch<Role>("/roles", { method: "POST", body: JSON.stringify(payload) });
}

export async function updateRole(roleId: string, payload: { roleName?: string; description?: string; permissions?: any[] }) {
  return apiFetch<Role>(`/roles/${roleId}`, { method: "PUT", body: JSON.stringify(payload) });
}

export async function updateRoleStatus(roleId: string, status: "ACTIVE" | "DISABLED") {
  return apiFetch<Role>(`/roles/${roleId}`, { method: "PATCH", body: JSON.stringify({ status }) });
}

// --- Admin Invitations API ---
export async function fetchAdminInvites() {
  return apiFetch<AdminInvite[]>("/admin-invite", { method: "GET" });
}

export async function createAdminInvite(churchRoleId: string, email: string) {
  return apiFetch<AdminInvite>(`/admin-invite/${churchRoleId}`, { method: "POST", body: JSON.stringify({ email }) });
}

export async function changeAdminRole(inviteId: string, churchRoleId: string) {
  return apiFetch<AdminInvite>(`/admin-invite/${inviteId}/${churchRoleId}`, { method: "PUT" });
}

export async function deleteAdminInvite(inviteId: string) {
  return apiFetch<AdminInvite>(`/admin-invite/${inviteId}`, { method: "DELETE" });
}

export async function updateAdminStatus(inviteId: string, option: "SUSPEND" | "RESTORE") {
  return apiFetch<AdminInvite>(`/admin-invite/update/${inviteId}`, { method: "PUT", body: JSON.stringify({ option }) });
}

export async function removeAdminUser(inviteId: string) {
  return apiFetch<{ message: string }>(`/admin-invite/remove/${inviteId}`, { method: "DELETE", body: JSON.stringify({ key: "remove user" }) });
}

// --- Account Settings API ---
export async function fetchAccountSettings() {
  return apiFetch<AccountSettings>("/account-settings", { method: "GET" });
}

export async function updateAccountSettings(payload: { personalPreferences: any; personalPrivacy: any }) {
  return apiFetch<AccountSettings>("/account-settings", { method: "PUT", body: JSON.stringify(payload) });
}
