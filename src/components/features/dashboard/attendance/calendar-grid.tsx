"use client";

import { useState, useMemo } from "react";
import { format, addMonths, subMonths } from "date-fns";
import { ChevronLeft, ChevronRight, Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { generateCalendarDays, mapServicesToCalendar } from "@/lib/utils";
import { RegularService } from "@/types";
import { CalendarDayCell } from "./calendar-day-cell";
import { Span } from "@/components/ui/typography/Text";

type CalendarGridProps = {
  services: RegularService[];
  onAddAttendance: (service: RegularService, date: string) => void;
  onAddGivingRecord: (service: RegularService, date: string) => void;
  onAddService: () => void;
};

const DAY_HEADERS = ["SUN", "MON", "TUE", "WED", "THUR", "FRI", "SAT"];

export function CalendarGrid({
  services,
  onAddAttendance,
  onAddGivingRecord,
  onAddService,
}: CalendarGridProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedMonth, setSelectedMonth] = useState(
    format(new Date(), "MMMM"),
  );
  const [selectedType, setSelectedType] = useState("all");

  const calendarDays = useMemo(() => {
    const days = generateCalendarDays(currentMonth);
    return mapServicesToCalendar(days, services);
  }, [currentMonth, services]);

  const handleToday = () => {
    setCurrentMonth(new Date());
  };

  const handlePrevMonth = () => {
    setCurrentMonth(subMonths(currentMonth, 1));
  };

  const handleNextMonth = () => {
    setCurrentMonth(addMonths(currentMonth, 1));
  };

  return (
    <div className="bg-white rounded-lg border">
      <div className="flex items-center justify-between p-4 border-b">
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleToday}
            className="h-8"
          >
            Today
          </Button>

          <div className="flex items-center">
            <Button
              variant="ghost"
              size="icon"
              onClick={handlePrevMonth}
              className="h-8 w-8"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Span className="text-sm font-medium px-2 min-w-[100px] text-center">
              {format(currentMonth, "MMMM yyyy")}
            </Span>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleNextMonth}
              className="h-8 w-8"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Select value={selectedMonth} onValueChange={setSelectedMonth}>
            <SelectTrigger className="w-[120px] h-8">
              <SelectValue placeholder="Month" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="January">January</SelectItem>
              <SelectItem value="February">February</SelectItem>
              <SelectItem value="March">March</SelectItem>
              <SelectItem value="April">April</SelectItem>
              <SelectItem value="May">May</SelectItem>
              <SelectItem value="June">June</SelectItem>
              <SelectItem value="July">July</SelectItem>
              <SelectItem value="August">August</SelectItem>
              <SelectItem value="September">September</SelectItem>
              <SelectItem value="October">October</SelectItem>
              <SelectItem value="November">November</SelectItem>
              <SelectItem value="December">December</SelectItem>
            </SelectContent>
          </Select>

          <Select value={selectedType} onValueChange={setSelectedType}>
            <SelectTrigger className="w-[120px] h-8">
              <SelectValue placeholder="All Types" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="regular">Regular</SelectItem>
              <SelectItem value="special">Special</SelectItem>
            </SelectContent>
          </Select>

          <Button variant="ghost" size="icon" className="h-8 w-8">
            <Filter className="h-4 w-4" />
          </Button>

          <Button onClick={onAddService} className="h-8">
            Add service
          </Button>
        </div>
      </div>
      <div>
        <div className="grid grid-cols-7 bg-gray-50">
          {DAY_HEADERS.map((day) => (
            <div
              key={day}
              className="p-2 text-center text-xs font-medium text-gray-600 border-b"
            >
              {day}
            </div>
          ))}
        </div>
        <div className="grid grid-cols-7">
          {calendarDays.map((day, index) => (
            <CalendarDayCell
              key={index}
              day={day}
              onAddAttendance={onAddAttendance}
              onAddGivingRecord={onAddGivingRecord}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
