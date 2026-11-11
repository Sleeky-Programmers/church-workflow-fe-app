import { trackAction } from "@/lib/usage-tracker";
import { authenticatedFetch } from "@/lib/api";
import { mapMember } from "@/mappers/member.mapper";
import { MembershipStatus } from "@/lib/enums";
import {
  ArchivedGuest,
  CsvImportReport,
  FrequentGuest,
  LimitResource,
  MemberLimitStatus,
  MemberProfile,
  NewMemberData,
  PlanLimitStatus,
} from "@/types";

export interface FetchMembersResponse {
  data: MemberProfile[];
  pagination: {
    page: number;
    limit: number;
    itemCount: number;
    totalPages: number;
    hasPreviousPage: boolean;
    hasNextPage: boolean;
  };
}

function normalizeMemberPayload(data: Partial<NewMemberData>) {
  return {
    title: data.title || undefined,
    fullName: data.fullName,
    email: data.email || undefined,
    phoneNumber: data.phone || undefined,
    gender: data.gender,
    birthday: data.birthday || undefined,
    maritalStatus: data.maritalStatus,
    dateOfMarriage: data.dateOfMarriage || undefined,
    occupation: data.occupation || undefined,
    address: data.address || undefined,
    educationalBackground: data.education || undefined,
    membershipStatus: data.membershipStatus,
    dateJoined: data.dateJoined || undefined,
    previousChurchMembership: data.previousChurchMembership || undefined,
    isBaptized: data.baptized,
    ministries: data.ministriesInvolved || undefined,
    volunteerPreferences: data.volunteersPreference || undefined,
    // "No" clears the cell group (null), which guests must not have.
    cellGroupName:
      data.smallGroupMember === "Yes"
        ? data.smallGroupName || undefined
        : data.smallGroupMember === "No"
          ? null
          : undefined,
  };
}

export type MemberBirthday = {
  _id: string;
  fullName: string;
  birthday: string;
};

/** Name + birthday for every member that has one set (single light query). */
export async function fetchMemberBirthdays(): Promise<MemberBirthday[]> {
  const res = await authenticatedFetch<MemberBirthday[]>("/members/birthdays", {
    method: "GET",
  });
  return Array.isArray(res) ? res : [];
}

export async function fetchMembers(
  page = 1,
  limit = 10,
  search?: string,
  filter?: string,
  facets?: {
    gender?: string;
    maritalStatus?: string;
    membershipStatus?: string;
    excludeStatus?: string;
  },
): Promise<FetchMembersResponse> {
  const params = new URLSearchParams({
    page: String(page),
    limit: String(limit),
  });

  if (search) {
    params.append("search", search);
  }
  if (filter && filter !== "all") {
    params.append("filter", filter);
  }
  // Independent facet filters (AND-ed server-side)
  if (facets?.gender) {
    params.append("gender", facets.gender);
  }
  if (facets?.maritalStatus) {
    params.append("maritalStatus", facets.maritalStatus);
  }
  if (facets?.membershipStatus) {
    params.append("membershipStatus", facets.membershipStatus);
  }
  if (facets?.excludeStatus) {
    params.append("excludeStatus", facets.excludeStatus);
  }

  const response = await authenticatedFetch<FetchMembersResponse>(
    `/members?${params}`,
    {
      method: "GET",
    },
  );

  return {
    data: response.data.map(mapMember),
    pagination: response.pagination,
  };
}

/**
 * Member picker source for departments and small teams. Guests (Visitor)
 * can't join groups, so they're left out.
 */
export async function fetchGroupEligibleMembers(
  page = 1,
  limit = 10,
  search?: string,
): Promise<FetchMembersResponse> {
  return fetchMembers(page, limit, search, undefined, {
    excludeStatus: MembershipStatus.VISITOR,
  });
}

export async function fetchMemberById(id: string): Promise<MemberProfile> {
  const response = await authenticatedFetch<any>(`/members/${id}`, {
    method: "GET",
  });

  return mapMember(response);
}

export async function fetchAllMembers() {
  const members = await authenticatedFetch<MemberProfile[]>("/members/all");

  return members.map(mapMember);
}

export async function createMember(data: NewMemberData) {
  const payload = normalizeMemberPayload(data);

  const response = await authenticatedFetch<any>("/members/add", {
    method: "POST",
    body: JSON.stringify(payload),
  });

  trackAction("member.add");
  return mapMember(response);
}

export async function updateMember(id: string, data: Partial<NewMemberData>) {
  const payload = normalizeMemberPayload(data);

  const response = await authenticatedFetch<any>(`/members/${id}`, {
    method: "PUT",
    body: JSON.stringify(payload),
  });

  return mapMember(response);
}

export function uploadMembersCsv(
  file: File,
  options?: {
    onProgress?: (progress: number) => void;
    signal?: AbortSignal;
    token?: string;
  },
): Promise<any> {
  const { onProgress, signal, token } = options || {};

  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();

    xhr.open("POST", `${process.env.NEXT_PUBLIC_API_URL}/members/csv/create`);

    if (token) {
      xhr.setRequestHeader("Authorization", `Bearer ${token}`);
    }

    if (onProgress) {
      xhr.upload.onprogress = (event) => {
        if (event.lengthComputable) {
          const percent = Math.round((event.loaded / event.total) * 100);
          onProgress(percent);
        }
      };
    }
    xhr.onload = () => {
      let response: any = null;

      try {
        response = xhr.responseText ? JSON.parse(xhr.responseText) : null;
      } catch {
        response = {
          message: xhr.responseText || "Unknown server response",
        };
      }

      if (xhr.status >= 200 && xhr.status < 300) {
        resolve(response);
      } else {
        reject(response);
      }
    };

    xhr.onerror = () => {
      reject(new Error("Network error"));
    };

    if (signal) {
      signal.addEventListener("abort", () => {
        xhr.abort();
        reject(new Error("Upload aborted"));
      });
    }

    const formData = new FormData();
    formData.append("file", file);

    xhr.send(formData);
  });
}

/** Validates an import file and returns the summary, without importing. */
export async function previewMembersCsv(file: File): Promise<CsvImportReport> {
  const formData = new FormData();
  formData.append("file", file);
  return authenticatedFetch<CsvImportReport>("/members/csv/preview", {
    method: "POST",
    body: formData,
  });
}

export async function fetchFrequentGuests(): Promise<{
  data: FrequentGuest[];
  total: number;
}> {
  return authenticatedFetch("/members/frequent-guests", { method: "GET" });
}

export async function fetchArchivedGuests(
  page = 1,
  limit = 10,
  search?: string,
): Promise<{
  data: ArchivedGuest[];
  pagination: FetchMembersResponse["pagination"];
}> {
  const params = new URLSearchParams({
    page: String(page),
    limit: String(limit),
  });
  if (search) {
    params.append("search", search);
  }
  return authenticatedFetch(`/members/archived?${params}`, { method: "GET" });
}

export async function exportArchivedGuestsCsv(): Promise<Blob> {
  return authenticatedFetch<Blob>("/members/archived/export", {
    method: "GET",
    responseType: "blob",
  });
}

export async function restoreArchivedGuest(id: string) {
  return authenticatedFetch(`/members/${id}/restore`, { method: "POST" });
}

export async function deleteMember(id: string): Promise<void> {
  await authenticatedFetch(`/members/${id}`, {
    method: "DELETE",
  });
}

export async function getMemberLimitStatus(): Promise<MemberLimitStatus> {
  const response = await authenticatedFetch<{
    success: boolean;
    data: MemberLimitStatus;
  }>("/members/member-limit-status", { method: "GET" });
  return response.data;
}

/** Limit status for one resource: the member limit or the separate guest limit. */
export async function getResourcePlanLimitStatus(
  resource: LimitResource,
): Promise<PlanLimitStatus> {
  const status = await getMemberLimitStatus();
  const usage = resource === "guest" ? status.guests : status.members;
  if (!usage) {
    return { resource, ...(await getMemberPlanLimitStatus()) };
  }
  return {
    resource,
    current: usage.current,
    limit: usage.limit,
    percentage: usage.percentage,
    isOverLimit: usage.isOverLimit,
    isNearLimit: usage.isNearLimit,
    planName: status.planName,
    // The grace period only applies to the member limit.
    isWithinGracePeriod:
      resource === "member" ? status.isWithinGracePeriod : false,
    gracePeriodEnds: resource === "member" ? status.gracePeriodEnds : null,
    daysRemaining: resource === "member" ? status.daysRemaining : null,
  };
}

/** Stable reference for <LimitBanner fetchStatus> (an inline arrow would refetch every render). */
export const getGuestPlanLimitStatus = () => {
  return getResourcePlanLimitStatus("guest");
};

export async function getMemberPlanLimitStatus(): Promise<PlanLimitStatus> {
  const status = await getMemberLimitStatus();

  return {
    resource: "member",
    current: status.currentMembers,
    limit: status.limit,
    percentage: status.percentage,
    isOverLimit: status.isOverLimit,
    isNearLimit: status.isNearLimit,
    planName: status.planName,
    isWithinGracePeriod: status.isWithinGracePeriod,
    gracePeriodEnds: status.gracePeriodEnds,
    daysRemaining: status.daysRemaining,
  };
}
