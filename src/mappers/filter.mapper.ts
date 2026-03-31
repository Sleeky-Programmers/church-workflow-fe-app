import {
  Gender,
  MaritalStatus,
  MembershipStatus,
  MemberFilter,
} from "@/lib/enums";

interface FilterState {
  gender: Gender | null;
  maritalStatus: MaritalStatus | null;
  membershipStatus: MembershipStatus | null;
}

export function mapFiltersToBackend(filter: FilterState): string {
  if (filter.gender === Gender.MALE) return MemberFilter.MALE;
  if (filter.gender === Gender.FEMALE) return MemberFilter.FEMALE;

  if (filter.maritalStatus === MaritalStatus.MARRIED)
    return MemberFilter.MARRIED;
  if (filter.maritalStatus === MaritalStatus.SINGLE) return MemberFilter.SINGLE;
  if (filter.maritalStatus === MaritalStatus.DIVORCED)
    return MemberFilter.DIVORCED;
  if (filter.maritalStatus === MaritalStatus.WIDOWED)
    return MemberFilter.WIDOWED;

  if (filter.membershipStatus === MembershipStatus.VISITOR)
    return MemberFilter.VISITOR;
  if (filter.membershipStatus === MembershipStatus.MEMBER)
    return MemberFilter.MEMBER;
  if (filter.membershipStatus === MembershipStatus.VOLUNTEER)
    return MemberFilter.VOLUNTEER;
  if (filter.membershipStatus === MembershipStatus.LEADER)
    return MemberFilter.LEADER;

  if (filter.membershipStatus === MembershipStatus.WORKER)
    return MemberFilter.WORKER;

  if (filter.membershipStatus === MembershipStatus.CONVERT)
    return MemberFilter.CONVERT;

  return MemberFilter.ALL;
}
