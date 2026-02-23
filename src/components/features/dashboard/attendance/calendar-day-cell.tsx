"use client";

import { format } from "date-fns";
import { CalendarDay, RegularService } from "@/types";
import { ServicePopover } from "./service-popover";
import { ServiceItem } from "./service";
import { Button } from "@/components/ui/button";

type CalendarDayCellProps = {
  day: CalendarDay;
  onAddAttendance: (service: RegularService, date: string) => void;
  onAddGivingRecord: (service: RegularService, date: string) => void;
};

export function CalendarDayCell({
  day,
  onAddAttendance,
  onAddGivingRecord,
}: CalendarDayCellProps) {
  const hasMultipleServices = day.services.length > 1;

  return (
    <div
      className={`
        min-h-[120px] p-2 border-b border-r
        ${!day.isCurrentMonth ? "bg-gray-50" : "bg-white"}
      `}
    >
      <div className="flex items-center justify-between mb-2">
        <div
          className={`
            text-sm font-medium
            ${
              day.isToday
                ? "flex items-center justify-center w-6 h-6 bg-primary-600 text-white rounded-full"
                : day.isCurrentMonth
                  ? "text-gray-500"
                  : "text-gray-400"
            }
          `}
        >
          {format(day.date, "d")}
        </div>

        {hasMultipleServices && (
          <ServicePopover services={day.services} date={day.dateString}>
            <Button className="text-xs text-primary-600 hover:text-primary-700">
              {day.services.length} services
            </Button>
          </ServicePopover>
        )}
      </div>

      <div className="space-y-1">
        {day.services.map((service) => (
          <ServiceItem
            key={service.id}
            service={service}
            date={day.dateString}
            onAddAttendance={() => onAddAttendance(service, day.dateString)}
            onAddGivingRecord={() => onAddGivingRecord(service, day.dateString)}
          />
        ))}
      </div>
    </div>
  );
}
