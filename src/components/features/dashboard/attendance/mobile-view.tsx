"use client";

import { addMonths, format, subMonths } from "date-fns";
import {
  ChevronLeft,
  ChevronRight,
  Menu,
  MoreVertical,
  Plus,
} from "lucide-react";
import { useState } from "react";

import MobileHeader from "@/components/layout/mobile-header";
import { Button } from "@/components/ui/button";
import { SidebarTrigger } from "@/components/ui/sidebar";
import Heading from "@/components/ui/typography/Heading";
import { Span, Text } from "@/components/ui/typography/Text";
import { getAttendanceCount } from "@/lib/utils";
import { RegularService, SpecialService, SpecialServiceEvent } from "@/types";

type MobileAttendanceViewProps = {
  regularServices: RegularService[];
  specialServices: SpecialServiceEvent[];
  onAddAttendance: (service: RegularService, date: string) => void;
  onAddGivingRecord: (service: RegularService, date: string) => void;
  onViewServiceDetails: (service: RegularService, date: string) => void;
  onAddService: () => void;
  onSelectRegularService: () => void;
  onSelectSpecialService: () => void;
  onAddSpecialAttendance?: (service: SpecialServiceEvent, date: string) => void;
};

// Type for combined service items to display
type ServiceItem = {
  id: string;
  name: string;
  type: "REGULAR" | "SPECIAL";
  startTime: string;
  endTime?: string;
  location?: string;
  colorKey: string;
  originalService: RegularService | SpecialServiceEvent;
};

const SERVICE_COLOR_BY_DAY: Record<
  string,
  { dayBg: string; dayText: string; border: string; accentText: string }
> = {
  Sunday: {
    dayBg: "bg-primary-100",
    dayText: "text-primary-700",
    border: "border-primary-600",
    accentText: "text-primary-700",
  },
  Monday: {
    dayBg: "bg-emerald-100",
    dayText: "text-emerald-700",
    border: "border-emerald-500",
    accentText: "text-emerald-700",
  },
  Tuesday: {
    dayBg: "bg-violet-100",
    dayText: "text-violet-700",
    border: "border-violet-500",
    accentText: "text-violet-700",
  },
  Wednesday: {
    dayBg: "bg-amber-100",
    dayText: "text-amber-700",
    border: "border-amber-500",
    accentText: "text-amber-700",
  },
  Thursday: {
    dayBg: "bg-sky-100",
    dayText: "text-sky-700",
    border: "border-sky-500",
    accentText: "text-sky-700",
  },
  Friday: {
    dayBg: "bg-fuchsia-100",
    dayText: "text-fuchsia-700",
    border: "border-fuchsia-500",
    accentText: "text-fuchsia-700",
  },
  Saturday: {
    dayBg: "bg-rose-100",
    dayText: "text-rose-700",
    border: "border-rose-500",
    accentText: "text-rose-700",
  },
};

export function MobileAttendanceView({
  regularServices,
  specialServices,
  onAddAttendance,
  onAddGivingRecord,
  onViewServiceDetails,
  onAddService,
  onSelectRegularService,
  onSelectSpecialService,
  onAddSpecialAttendance, // NEW
}: MobileAttendanceViewProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());

  const generateCalendarDays = () => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startingDayOfWeek = firstDay.getDay();

    const days: Date[] = [];

    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(new Date(year, month, -startingDayOfWeek + i + 1));
    }

    for (let day = 1; day <= lastDay.getDate(); day++) {
      days.push(new Date(year, month, day));
    }

    const remainingDays = 42 - days.length;
    for (let i = 1; i <= remainingDays; i++) {
      days.push(new Date(year, month + 1, i));
    }

    return days;
  };

  const getServiceColor = (
    service: RegularService | SpecialService,
    date?: Date,
  ) => {
    if (service.type === "REGULAR") {
      const regularService = service as RegularService;
      const primaryDay = regularService.day || "Sunday";
      return SERVICE_COLOR_BY_DAY[primaryDay] || SERVICE_COLOR_BY_DAY.Sunday;
    } else {
      const dayName = date ? format(date, "EEEE") : "Sunday";
      return SERVICE_COLOR_BY_DAY[dayName] || SERVICE_COLOR_BY_DAY.Sunday;
    }
  };

  const getDayCellClasses = (day: Date) => {
    const dayName = format(day, "EEEE");
    const dayStr = format(day, "yyyy-MM-dd");

    // Check for regular services
    const hasRegularService = regularServices.some((service) => {
      if (!service.day) return false;
      return service.day.toUpperCase() === dayName.toUpperCase();
    });

    // Check for special services on this specific date
    const hasSpecialService = specialServices.some((service) => {
      if (!service.daySchedules) return false;
      return service.daySchedules.some((schedule) => {
        // Normalize both dates to compare just the date part
        const scheduleDate = new Date(schedule.date);
        const scheduleDateStr = format(scheduleDate, "yyyy-MM-dd");
        return scheduleDateStr === dayStr;
      });
    });

    if (!hasRegularService && !hasSpecialService) return "";
    const color = SERVICE_COLOR_BY_DAY[dayName] || SERVICE_COLOR_BY_DAY.Sunday;
    return `${color.dayBg} ${color.dayText}`;
  };

  const getServicesForDate = (date: Date): ServiceItem[] => {
    const dayName = format(date, "EEEE");
    const dateStr = format(date, "yyyy-MM-dd");
    const items: ServiceItem[] = [];

    // Add regular services for this day of week
    regularServices.forEach((service) => {
      if (service.day && service.day.toUpperCase() === dayName.toUpperCase()) {
        items.push({
          id: service.id,
          name: service.title,
          type: "REGULAR",
          startTime: service.startTime,
          endTime: service.endTime,
          location: service.location,
          colorKey: dayName,
          originalService: service,
        });
      }
    });

    // Add special services for this specific date
    specialServices.forEach((service) => {
      const scheduleForDate = service.daySchedules?.find((schedule) => {
        const scheduleDate = new Date(schedule.date);
        const scheduleDateStr = format(scheduleDate, "yyyy-MM-dd");
        return scheduleDateStr === dateStr;
      });
      if (scheduleForDate) {
        items.push({
          id: service.id,
          name: service.title,
          type: "SPECIAL",
          startTime: scheduleForDate.startTime,
          endTime: scheduleForDate.endTime,
          location: service.location,
          colorKey: dayName,
          originalService: service,
        });
      }
    });

    return items.sort((a, b) => a.startTime.localeCompare(b.startTime));
  };

  const days = generateCalendarDays();
  const today = new Date();
  const selectedDateString = format(selectedDate, "yyyy-MM-dd");

  const servicesForDate = getServicesForDate(selectedDate);
  const hasServices = regularServices.length > 0 || specialServices.length > 0;

  return (
    <div className="min-h-screen bg-white">
      <MobileHeader title="Attendance Overview" />

      <div className="p-4">
        <div className="flex items-center justify-between mb-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Span variant="default" className="font-medium">
            {format(currentMonth, "MMMM yyyy")}
          </Span>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
        <div>
          <div className="grid grid-cols-7 mb-2">
            {["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"].map((day) => (
              <div key={day} className="text-center text-xs text-gray-500 py-2">
                {day}
              </div>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-1">
            {days.map((day, index) => {
              const isToday =
                format(day, "yyyy-MM-dd") === format(today, "yyyy-MM-dd");
              const isSelected =
                format(day, "yyyy-MM-dd") === selectedDateString;
              const isCurrentMonth = day.getMonth() === currentMonth.getMonth();
              const hasDayServices = getServicesForDate(day).length > 0;

              return (
                <button
                  key={index}
                  onClick={() => setSelectedDate(day)}
                  className={`
                    aspect-square flex items-center justify-center text-sm rounded-lg
                    ${isToday ? "bg-primary-600 text-white font-semibold" : ""}
                    ${isSelected && !isToday ? "bg-primary-100 text-primary-600 font-medium" : ""}
                    ${!isSelected && !isToday ? getDayCellClasses(day) : ""}
                    ${!isCurrentMonth ? "text-gray-300" : "text-gray-900"}
                    ${!isToday && !isSelected && !hasDayServices ? "hover:bg-gray-100" : ""}
                  `}
                >
                  {format(day, "d")}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      <div className="px-4 pb-4">
        <div className="flex items-center justify-between mb-4">
          <Heading level={3}>{format(selectedDate, "EEEE, MMMM d")}</Heading>
          {hasServices && (
            <Button variant="ghost" size="icon" onClick={onAddService}>
              <Plus className="h-5 w-5" />
            </Button>
          )}
        </div>

        {!hasServices && (
          <div className="space-y-4">
            <div className="flex justify-center py-8">
              <div className="relative">
                <div className="w-48 h-32 border-4 border-gray-900 rounded-lg bg-white shadow-lg">
                  <div className="flex items-center justify-center h-full p-4">
                    <div className="w-full">
                      <div className="h-0.5 bg-primary-500 rounded-full mb-4" />
                      <div className="grid grid-cols-5 gap-2">
                        {[...Array(15)].map((_, i) => (
                          <div
                            key={i}
                            className={`h-4 rounded ${i === 2 || i === 6 || i === 11 ? "bg-primary-500" : i === 8 || i === 13 ? "bg-gray-900" : "bg-gray-200"}`}
                          />
                        ))}
                      </div>
                      <div className="absolute bottom-2 right-2">
                        <div className="h-6 w-6 bg-primary-500 rounded-full flex items-center justify-center text-white text-xs">
                          +
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="mx-auto w-16 h-8 bg-gray-300 rounded-b-lg mt-1" />
                <div className="mx-auto w-24 h-1 bg-gray-400 rounded-full mt-1" />
              </div>
            </div>

            <div className="text-center mb-4">
              <Text variant="default">
                What type of service would you like to create?
              </Text>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <Button onClick={onSelectRegularService} className="h-auto py-3">
                Regular Service
              </Button>
              <Button
                onClick={onSelectSpecialService}
                variant="outline"
                className="h-auto py-3"
              >
                Special Service
              </Button>
            </div>
          </div>
        )}

        {hasServices && servicesForDate.length > 0 && (
          <div className="space-y-3">
            {servicesForDate.map((service) => {
              const isSpecial = service.type === "SPECIAL";
              const attendanceCount = !isSpecial
                ? getAttendanceCount(
                    service.originalService as RegularService,
                    selectedDateString,
                  )
                : null;
              const hasAttendance =
                attendanceCount !== null && attendanceCount > 0;

              return (
                <div
                  key={`${service.id}-${selectedDateString}`}
                  className={`border-l-4 bg-gray-50 p-3 rounded-r-lg ${getServiceColor(service.originalService as any, selectedDate).border}`}
                >
                  <button
                    type="button"
                    onClick={() => {
                      if (!isSpecial) {
                        onViewServiceDetails(
                          service.originalService as RegularService,
                          selectedDateString,
                        );
                      }
                    }}
                    className="w-full text-left"
                  >
                    <Heading
                      level={2}
                      className={`mb-1 ${getServiceColor(service.originalService as any, selectedDate).accentText}`}
                    >
                      {service.name}
                      {isSpecial && (
                        <Span variant="muted" className="text-xs ml-2">
                          (Special)
                        </Span>
                      )}
                    </Heading>
                  </button>
                  <Text variant="default" className="mb-2">
                    {service.startTime}
                    {service.endTime && ` - ${service.endTime}`}
                    {service.location && ` - ${service.location}`}
                  </Text>
                  <div className="flex gap-2">
                    {!isSpecial ? (
                      // Regular Service buttons
                      <>
                        <Button
                          size="sm"
                          onClick={() =>
                            onAddAttendance(
                              service.originalService as RegularService,
                              selectedDateString,
                            )
                          }
                          className={`flex-1 ${hasAttendance ? "bg-secondary-600 hover:bg-secondary-700" : ""}`}
                        >
                          {hasAttendance ? "View Attendance" : "Add Attendance"}
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() =>
                            onAddGivingRecord(
                              service.originalService as RegularService,
                              selectedDateString,
                            )
                          }
                          className="flex-1"
                        >
                          Add Giving Record
                        </Button>
                      </>
                    ) : (
                      // Special Service - just attendance
                      <Button
                        size="sm"
                        onClick={() => {
                          console.log({
                            originalService:
                              service.originalService as SpecialServiceEvent,
                            selectedDateString,
                            onAddSpecialAttendance: onAddSpecialAttendance
                              ? "true"
                              : "false",
                          });
                          onAddSpecialAttendance?.(
                            service.originalService as SpecialServiceEvent,
                            selectedDateString,
                          );
                        }}
                        className="flex-1"
                      >
                        Mark Attendance
                      </Button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {hasServices && servicesForDate.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            <Text variant="default">No services scheduled for this day</Text>
          </div>
        )}
      </div>
    </div>
  );
}
