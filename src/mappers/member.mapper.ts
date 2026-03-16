import { MemberTitle } from "@/lib/enums";

export function mapMember(member: any) {
  const nameParts = member.fullName.split(" ");

  return {
    id: member._id,
    title: (member.title || MemberTitle.MR) as MemberTitle,
    fullName: member.fullName,
    firstName: nameParts[0] || "",
    lastName: nameParts.slice(1).join(" "),
    email: member.email || "",
    phone: member.phoneNumber || "",
    gender: member.gender,
    birthday: member.birthday,
    maritalStatus: member.maritalStatus,
    dateOfMarriage: member.dateOfMarriage,
    membershipStatus: member.membershipStatus,
    dateJoined: member.dateJoined,
    baptized: member.isBaptized,
    volunteersPreference: member.volunteerPreferences,
    servicesAttended: 0,
    servicesMissed: 0,
    attendanceRate: 0,
    attendanceRecords: [],
    initials:
      nameParts[0]?.[0]?.toUpperCase() +
      (nameParts[1]?.[0]?.toUpperCase() || ""),
  };
}
