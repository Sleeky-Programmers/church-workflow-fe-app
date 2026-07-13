"use client";

import { format } from "date-fns";
import { Calendar, Clock, MapPin, Star } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Text } from "@/components/ui/typography/Text";
import { CalendarDay, RegularService, SpecialServiceEvent } from "@/types";

import { ServiceItem } from "./service";
import { ServicePopover } from "./service-popover";

type CalendarDayCellProps = {
  day: CalendarDay;
  specialServices?: SpecialServiceEvent[];
  givingTotals?: Record<string, number>;
  onAddAttendance: (service: RegularService, date: string) => void;
  onViewServiceDetails: (service: RegularService, date: string) => void;
  onAddGivingRecord: (service: RegularService, date: string) => void;
  onAddSpecialAttendance?: (service: SpecialServiceEvent, date: string) => void;
};

export function CalendarDayCell({
  day,
  specialServices = [],
  givingTotals = {},
  onAddAttendance,
  onViewServiceDetails,
  onAddGivingRecord,
  onAddSpecialAttendance,
}: CalendarDayCellProps) {
  const hasMultipleRegularServices = day.services.length > 1;
  const hasAnyService = day.services.length > 0 || specialServices.length > 0;
  const dayPalette = [
    "bg-primary-50",
    "bg-emerald-50",
    "bg-violet-50",
    "bg-amber-50",
    "bg-sky-50",
    "bg-fuchsia-50",
    "bg-rose-50",
  ];
  const dayTintClass = dayPalette[day.date.getDay()];

  return (
    <div
      className={`
        min-h-[120px] p-2 border-b border-r
        ${!day.isCurrentMonth ? "bg-gray-50" : hasAnyService ? dayTintClass : "bg-white"}
      `}
    >
      <div className="flex items-center justify-between mb-2">
        <div
          className={`
            text-sm font-medium
            ${day.isToday ? "flex items-center justify-center w-6 h-6 bg-primary-600 text-white rounded-full" : day.isCurrentMonth ? "text-gray-500" : "text-gray-400"}
          `}
        >
          {format(day.date, "d")}
        </div>

        {hasMultipleRegularServices && (
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
            givingTotal={givingTotals[`${service.id}|${day.dateString}`]}
            onAddAttendance={() => onAddAttendance(service, day.dateString)}
            onViewServiceDetails={() =>
              onViewServiceDetails(service, day.dateString)
            }
            onAddGivingRecord={() => onAddGivingRecord(service, day.dateString)}
          />
        ))}

        {specialServices.map((service) => {
          // Get schedule for this date
          const schedule = service.daySchedules?.find(
            (s) => s.date === day.dateString,
          );

          return (
            <div
              key={service.id}
              className="text-xs mb-2 p-2 border border-primary/30 bg-primary/5 rounded hover:bg-primary/10 transition-colors cursor-pointer"
              onClick={() => onAddSpecialAttendance?.(service, day.dateString)}
            >
              <div className="flex items-start gap-1.5">
                <Star className="h-3 w-3 text-primary flex-shrink-0 mt-0.5" />
                <div className="flex-1 min-w-0">
                  <Text className="font-semibold text-left truncate">
                    {service.serviceName}
                  </Text>
                  <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 mt-0.5">
                    {service.location && (
                      <span className="text-[10px] text-muted-foreground flex items-center gap-0.5">
                        <MapPin className="h-2.5 w-2.5" />
                        {service.location}
                      </span>
                    )}
                    {schedule && (
                      <span className="text-[10px] text-muted-foreground flex items-center gap-0.5">
                        <Clock className="h-2.5 w-2.5" />
                        {schedule.startTime}
                        {schedule.endTime && ` - ${schedule.endTime}`}
                      </span>
                    )}
                    {service.startDate && (
                      <span className="text-[10px] text-muted-foreground flex items-center gap-0.5">
                        <Calendar className="h-2.5 w-2.5" />
                        {format(new Date(service.startDate), "MMM d")}
                        {service.endDate &&
                          ` - ${format(new Date(service.endDate), "MMM d")}`}
                      </span>
                    )}
                  </div>
                  {service.description && (
                    <Text
                      variant="muted"
                      className="text-[10px] truncate mt-0.5"
                    >
                      {service.description}
                    </Text>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
