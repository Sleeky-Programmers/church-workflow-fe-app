import { apiFetch } from "@/lib/api";
import { MemberProfile, NewMemberData, MemberTitle } from "@/types";

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

  const mapped = response.data.map((m: any) => {
    const nameParts = m.fullName.split(" ");

    return {
      id: m._id,
      title: (m.title || "MR.") as MemberTitle,
      fullName: m.fullName,
      firstName: nameParts[0] || "",
      lastName: nameParts.slice(1).join(" "),
      email: m.email || "",
      phone: m.phoneNumber || "",
      gender: m.gender,
      birthday: m.birthday,
      maritalStatus: m.maritalStatus,
      dateOfMarriage: m.dateOfMarriage,
      spouseFirstName: m.spouseFirstName,
      spouseLastName: m.spouseLastName,
      membershipStatus: m.membershipStatus,
      dateJoined: m.dateJoined,
      baptized: m.isBaptized,
      volunteersPreference: m.volunteerPreferences,
      servicesAttended: 0,
      servicesMissed: 0,
      attendanceRate: 0,
      attendanceRecords: [],
      initials:
        nameParts[0]?.[0]?.toUpperCase() +
        (nameParts[1]?.[0]?.toUpperCase() || ""),
    };
  });

  return {
    data: mapped,
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
