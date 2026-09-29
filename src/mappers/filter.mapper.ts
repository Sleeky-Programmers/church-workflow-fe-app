import {
  Gender,
  MaritalStatus,
  MembershipStatus,
} from "@/lib/enums";

interface FilterState {
  gender: Gender | null;
  maritalStatus: MaritalStatus | null;
  membershipStatus: MembershipStatus | null;
}

// All three facets are sent independently and AND-ed server-side, so a user
// can filter by gender + marital status + membership status simultaneously.
export function mapFiltersToQueryParams(filter: FilterState): string {
  const params = new URLSearchParams();

  if (filter.gender) params.set("gender", filter.gender);
  if (filter.maritalStatus) params.set("maritalStatus", filter.maritalStatus);
  if (filter.membershipStatus)
    params.set("membershipStatus", filter.membershipStatus);

  return params.toString();
}

// Kept for the legacy single-filter param (used by a few call sites that only
// ever pass one facet).
export function mapFiltersToBackend(filter: FilterState): string {
  if (filter.gender === Gender.MALE) {
    return MemberFilterParam.MALE;
  }
  if (filter.gender === Gender.FEMALE) {
    return MemberFilterParam.FEMALE;
  }
  if (filter.maritalStatus === MaritalStatus.MARRIED) {
    return MemberFilterParam.MARRIED;
  }
  if (filter.maritalStatus === MaritalStatus.SINGLE) {
    return MemberFilterParam.SINGLE;
  }
  if (filter.maritalStatus === MaritalStatus.DIVORCED) {
    return MemberFilterParam.DIVORCED;
  }
  if (filter.maritalStatus === MaritalStatus.WIDOWED) {
    return MemberFilterParam.WIDOWED;
  }
  if (filter.membershipStatus === MembershipStatus.VISITOR) {
    return MemberFilterParam.VISITOR;
  }
  if (filter.membershipStatus === MembershipStatus.MEMBER) {
    return MemberFilterParam.MEMBER;
  }
  if (filter.membershipStatus === MembershipStatus.VOLUNTEER) {
    return MemberFilterParam.VOLUNTEER;
  }
  if (filter.membershipStatus === MembershipStatus.LEADER) {
    return MemberFilterParam.LEADER;
  }

  if (filter.membershipStatus === MembershipStatus.WORKER) {
    return MemberFilterParam.WORKER;
  }
  if (filter.membershipStatus === MembershipStatus.CONVERT) {
    return MemberFilterParam.CONVERT;
  }
  return MemberFilterParam.ALL;
}

// Re-exported so existing imports of the legacy helper keep working without
// pulling the enum directly.
import { MemberFilter as MemberFilterParam } from "@/lib/enums";
