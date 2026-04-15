import { MemberProfile } from "@/types";
import { authenticatedFetch } from "@/lib/api";
import { mapMember } from "@/mappers/member.mapper";

export async function fetchAllMembers(): Promise<MemberProfile[]> {
  const response = await authenticatedFetch<{
    data: MemberProfile[];
  }>("/members/all", {
    method: "GET",
  });

  return response.data.map(mapMember);
}
