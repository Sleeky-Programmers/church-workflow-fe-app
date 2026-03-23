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

export async function createMember(data: NewMemberData) {
  const normalizedPayload = {
    title: data.title || undefined,
    fullName: data.fullName,
    email: data.email || undefined,
    phoneNumber: data.phone || undefined,
    gender: data.gender,
    birthday: data.birthday || undefined,
    maritalStatus: data.maritalStatus,
    dateOfMarriage: data.dateOfMarriage || undefined,
    occupation: data.occupation || undefined,
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

  const response = await authenticatedFetch<any>("/members/add", {
    method: "POST",
    body: JSON.stringify(normalizedPayload),
  });

  return mapMember(response);
}

export async function uploadMembersCsv(file: File) {
  const formData = new FormData();
  formData.append("file", file);

  return authenticatedFetch("/members/csv/create", {
    method: "POST",
    body: formData,
  });
}
