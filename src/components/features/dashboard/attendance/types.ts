export type SpecialServiceDaySchedule = {
  date: string;
  startTime: string;
  endTime: string;
};

export type SpecialServiceEvent = {
  id: string;
  serviceName: string;
  startDate: string;
  endDate?: string;
  location?: string;
  description?: string;
  recurrence: "none" | "monthly-first-sunday";
  daySchedules: SpecialServiceDaySchedule[];
};
