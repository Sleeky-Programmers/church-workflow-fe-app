"use client";

import { useState } from "react";
import { format, addMonths, subMonths } from "date-fns";
import {
  ChevronLeft,
  ChevronRight,
  Menu,
  MoreVertical,
  Plus,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { RegularService } from "@/types";
import Heading from "@/components/ui/typography/Heading";
import { Text, Span } from "@/components/ui/typography/Text";

type MobileAttendanceViewProps = {
  services: RegularService[];
  onAddAttendance: (service: RegularService, date: string) => void;
  onAddGivingRecord: (service: RegularService, date: string) => void;
  onSelectRegularService: () => void;
  onSelectSpecialService: () => void;
};

export function MobileAttendanceView({
  services,
  onAddAttendance,
  onAddGivingRecord,
  onSelectRegularService,
  onSelectSpecialService,
}: MobileAttendanceViewProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());

  const generateCalendarDays = () => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startingDayOfWeek = firstDay.getDay();

    const days: (Date | null)[] = [];

    for (let i = 0; i < startingDayOfWeek; i++) {
      const prevDay = new Date(year, month, -startingDayOfWeek + i + 1);
      days.push(prevDay);
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

  const days = generateCalendarDays();
  const today = new Date();
  const selectedDateString = format(selectedDate, "yyyy-MM-dd");

  const servicesForDate = services.filter((service) => {
    const dayName = format(selectedDate, "EEEE");
    return service.days.includes(dayName);
  });

  const hasServices = services.length > 0;

  return (
    <div className="min-h-screen bg-white">
      <div className="flex items-center justify-between p-4 border-b">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon">
            <Menu className="h-5 w-5" />
          </Button>
          <Heading level={2}>Attendance Overview</Heading>
        </div>
        <Button variant="ghost" size="icon">
          <MoreVertical className="h-5 w-5" />
        </Button>
      </div>

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
              if (!day) return <div key={index} />;

              const isToday =
                format(day, "yyyy-MM-dd") === format(today, "yyyy-MM-dd");
              const isSelected =
                format(day, "yyyy-MM-dd") === selectedDateString;
              const isCurrentMonth = day.getMonth() === currentMonth.getMonth();

              return (
                <button
                  key={index}
                  onClick={() => setSelectedDate(day)}
                  className={`
                    aspect-square flex items-center justify-center text-sm rounded-lg
                    ${isToday ? "bg-primary-600 text-white font-semibold" : ""}
                    ${isSelected && !isToday ? "bg-primary-100 text-primary-600 font-medium" : ""}
                    ${!isCurrentMonth ? "text-gray-300" : "text-gray-900"}
                    ${!isToday && !isSelected ? "hover:bg-gray-100" : ""}
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
            <Button variant="ghost" size="icon">
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
                            className={`h-4 rounded ${
                              i === 2 || i === 6 || i === 11
                                ? "bg-primary-500"
                                : i === 8 || i === 13
                                  ? "bg-gray-900"
                                  : "bg-gray-200"
                            }`}
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
            {servicesForDate.map((service) => (
              <div
                key={service.id}
                className="border-l-4 border-primary-600 bg-gray-50 p-3 rounded-r-lg"
              >
                <Heading level={2} className=" mb-1">
                  {service.serviceName}
                </Heading>
                <Text variant="default" className=" mb-2">
                  {service.days.join(", ")} · {service.startTime}
                  {service.endTime && ` - ${service.endTime}`}
                  {service.location && ` · ${service.location}`}
                </Text>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    onClick={() => onAddAttendance(service, selectedDateString)}
                    className="flex-1"
                  >
                    Add Attendance
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() =>
                      onAddGivingRecord(service, selectedDateString)
                    }
                    className="flex-1"
                  >
                    Add Giving Record
                  </Button>
                </div>
              </div>
            ))}
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
