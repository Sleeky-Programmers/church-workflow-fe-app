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
  const response = await authenticatedFetch<any>("/members/add", {
    method: "POST",
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
      occupation: data.occupation,
      educationalBackground: data.education,
      membershipStatus: data.membershipStatus,
      dateJoined: data.dateJoined,
      previousChurchMembership: data.previousChurchMembership,
      isBaptized: data.baptized,
      ministries: data.ministriesInvolved,
      volunteerPreferences: data.volunteersPreference,
      cellGroupName:
        data.smallGroupMember === "Yes" ? data.smallGroupName : undefined,
    }),
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
