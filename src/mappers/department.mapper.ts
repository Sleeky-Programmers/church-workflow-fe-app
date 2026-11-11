import { DepartmentRow } from "@/types";

export function mapDepartmentToRow(dept: any): DepartmentRow {
  return {
    id: String(dept.id),

    name: dept.name,

    hod: dept.hod
      ? {
          name: dept.hod.name,
        }
      : null,

    members: Array.isArray(dept.members)
      ? dept.members.length
      : (dept.membersCount ?? 0),

    status: dept.status === "ACTIVE" ? "Active" : "Inactive",
  };
}
