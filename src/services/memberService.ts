import { apiFetch } from "@/lib/api";
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

  if (search) params.append("search", search);
  if (filter && filter !== "all") params.append("filter", filter);

  const response = await apiFetch<FetchMembersResponse>(`/members?${params}`, {
    method: "GET",
  });

  return {
    data: response.data.map(mapMember),
    pagination: response.pagination,
  };
}

export async function createMember(data: NewMemberData) {
  return apiFetch("/members/add", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      title: data.title,
      fullName: data.fullName,
      email: data.email,
      phoneNumber: data.phone,
      gender: data.gender,
      birthday: data.birthday,
      maritalStatus: data.maritalStatus,
      dateOfMarriage: data.dateOfMarriage,
      spouseFirstName: data.spouseFirstName,
      spouseLastName: data.spouseLastName,
      membershipStatus: data.membershipStatus,
      dateJoined: data.dateJoined,
      isBaptized: data.baptized,
      volunteerPreferences: data.volunteersPreference,
    }),
  });
}

export async function uploadMembersCsv(file: File) {
  const formData = new FormData();
  formData.append("file", file);

  return apiFetch("/members/csv/create", {
    method: "POST",
    body: formData,
  });
}
