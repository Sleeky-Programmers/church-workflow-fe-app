import { MemberTitle } from "@/lib/enums";

export function mapMember(m: any) {
  const nameParts = m.fullName.split(" ");

  return {
    id: m._id,
    title: (m.title || MemberTitle.MR) as MemberTitle,
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
}
