import { authenticatedFetch } from "@/lib/api";
import { MemberProfile, NewMemberData } from "@/types";
import { mapMember } from "@/mappers/member.mapper";

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
    cellGroupName:
      data.smallGroupMember === "Yes"
        ? data.smallGroupName || undefined
        : undefined,
  };
}

export async function fetchMembers(
  page = 1,
  limit = 10,
  search?: string,
  filter?: string,
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

export async function deleteMember(id: string): Promise<void> {
  await authenticatedFetch(`/members/${id}`, {
    method: "DELETE",
  });
}
