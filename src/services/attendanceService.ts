import { authenticatedFetch } from "@/lib/api";

export type AttendanceTrendResponse = {
  totalAttendance: number;
  attendanceGrowth: string;
  monthlyAttendanceTrends: Array<{
    month: string;
    year: number;
    attendance: number;
  }>;
};

export async function fetchAttendanceTrends() {
  const response = await authenticatedFetch<AttendanceTrendResponse>(
    "/attendance/trend",
    { method: "GET" },
  );

  return response;
}
