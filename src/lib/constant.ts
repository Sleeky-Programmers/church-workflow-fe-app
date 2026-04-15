import { Gender, MemberTitle, MaritalStatus, MembershipStatus } from "./enums";

export const GENDER_MAP: Record<string, Gender> = {
  male: Gender.MALE,
  female: Gender.FEMALE,
};
export const TITLE_MAP: Record<string, MemberTitle> = {
  mr: MemberTitle.MR,
  mrs: MemberTitle.MRS,
  miss: MemberTitle.MISS,
  dr: MemberTitle.DR,
  pastor: MemberTitle.PASTOR,
  rev: MemberTitle.REV,
};
export const MARITAL_MAP: Record<string, MaritalStatus> = {
  single: MaritalStatus.SINGLE,
  married: MaritalStatus.MARRIED,
  divorced: MaritalStatus.DIVORCED,
  widowed: MaritalStatus.WIDOWED,
};
export const MEMBERSHIP_MAP: Record<string, MembershipStatus> = {
  member: MembershipStatus.MEMBER,
  visitor: MembershipStatus.VISITOR,
  volunteer: MembershipStatus.VOLUNTEER,
  worker: MembershipStatus.WORKER,
  leader: MembershipStatus.LEADER,
  "new convert": MembershipStatus.CONVERT,
};
