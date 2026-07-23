"use client";

import {
  addDays,
  addMonths,
  addWeeks,
  addYears,
  eachDayOfInterval,
  endOfMonth,
  endOfWeek,
  endOfYear,
  format,
  isBefore,
  isSameDay,
  isSameMonth,
  parseISO,
  startOfMonth,
  startOfWeek,
  startOfYear,
  subMonths,
  subWeeks,
  subYears,
} from "date-fns";
import { ChevronLeft, ChevronRight, Plus } from "lucide-react";
import { useMemo, useState } from "react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Span, Text } from "@/components/ui/typography/Text";
import {
  EventCalendarView,
  EventRecurrence,
  EventReminderType,
  EventType,
} from "@/lib/enums";
import { cn } from "@/lib/utils";
import { ChurchEvent, ChurchService } from "@/types";

import {
  EVENT_TYPE_LABEL_MAP,
  EVENT_TYPE_OPTIONS,
  EVENT_VIEW_DROPDOWN_OPTIONS,
  EVENT_VIEW_OPTIONS,
} from "./constants";

type EventsCalendarProps = {
  events: ChurchEvent[];
  churchServices?: ChurchService[];
  onCreateEvent: (date?: string) => void;
  onSelectEvent: (event: ChurchEvent) => void;
};

const DAY_HEADERS = ["SUN", "MON", "TUE", "WED", "THUR", "FRI", "SAT"];
const WEEK_HEADERS = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"];
const TIME_SLOTS = Array.from({ length: 17 }, (_, index) => index + 1);

function parseHour(time: string) {
  const [hour] = time.split(":");
  return Number(hour || "0");
}

function occursOnDate(event: ChurchEvent, date: Date) {
  const startDate = parseISO(event.date);
  const currentDate = new Date(date);
  startDate.setHours(0, 0, 0, 0);
  currentDate.setHours(0, 0, 0, 0);

  if (isBefore(currentDate, startDate)) {
    return false;
  }

  if (event.recurrence === EventRecurrence.NONE) {
    return isSameDay(startDate, currentDate);
  }

  if (event.recurrence === EventRecurrence.DAILY) {
    return true;
  }

  if (event.recurrence === EventRecurrence.WEEKDAYS) {
    const day = currentDate.getDay();
    return day >= 1 && day <= 5;
  }

  if (event.recurrence === EventRecurrence.WEEKLY) {
    return startDate.getDay() === currentDate.getDay();
  }

  if (event.recurrence === EventRecurrence.MONTHLY) {
    return startDate.getDate() === currentDate.getDate();
  }

  if (event.recurrence === EventRecurrence.YEARLY) {
    return (
      startDate.getMonth() === currentDate.getMonth() &&
      startDate.getDate() === currentDate.getDate()
    );
  }

  return false;
}

function generateServiceOccurrences(
  service: ChurchService,
  startDate: Date,
  endDate: Date,
): ChurchEvent[] {
  const occurrences: ChurchEvent[] = [];

  if (service.type === "SPECIAL" && service.specialDays?.length) {
    service.specialDays.forEach((specialDay: any) => {
      const date = new Date(specialDay.date);
      if (date >= startDate && date <= endDate) {
        occurrences.push({
          id: `${service.id}-${format(date, "yyyy-MM-dd")}`,
          title: service.title,
          type: EventType.WORSHIP_SERVICE,
          recurrence: EventRecurrence.NONE,
          date: format(date, "yyyy-MM-dd"),
          startTime: specialDay.startTime,
          endTime: specialDay.endTime || "",
          location: service.location || "",
          sendReminder: true,
          reminderType: EventReminderType.IN_APP,
          remindBeforeMinutes: 30,
          colorClass: "bg-purple-500",
        });
      }
    });
    return occurrences;
  }

  if (service.type === "REGULAR" && service.day) {
    const dayMap: Record<string, number> = {
      SUNDAY: 0,
      MONDAY: 1,
      TUESDAY: 2,
      WEDNESDAY: 3,
      THURSDAY: 4,
      FRIDAY: 5,
      SATURDAY: 6,
    };

    const targetDay = dayMap[service.day];
    if (targetDay === undefined) {
      return occurrences;
    }

    let currentDate = new Date(startDate);
    currentDate.setHours(0, 0, 0, 0);

    // Find the first occurrence of the target day
    const currentDay = currentDate.getDay();
    const diff = (targetDay - currentDay + 7) % 7;
    if (diff > 0) {
      currentDate.setDate(currentDate.getDate() + diff);
    }

    // Generate all occurrences until end date
    while (currentDate <= endDate) {
      occurrences.push({
        id: `${service.id}-${format(currentDate, "yyyy-MM-dd")}`,
        title: service.title,
        type: EventType.WORSHIP_SERVICE,
        recurrence: EventRecurrence.NONE,
        date: format(currentDate, "yyyy-MM-dd"),
        startTime: service.startTime,
        endTime: service.endTime || "",
        location: service.location || "",
        sendReminder: true,
        reminderType: EventReminderType.IN_APP,
        remindBeforeMinutes: 30,
        colorClass: "bg-blue-500",
      });

      // Move to next week
      currentDate.setDate(currentDate.getDate() + 7);
    }
  }

  return occurrences;
}

export function EventsCalendar({
  events,
  churchServices = [],
  onCreateEvent,
  onSelectEvent,
}: EventsCalendarProps) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewMode, setViewMode] = useState<EventCalendarView>(
    EventCalendarView.MONTH,
  );
  const [typeFilter, setTypeFilter] = useState<EventType | "ALL">("ALL");
  const [calendarDisplayType, setCalendarDisplayType] = useState("calendar");
  const [selectedDateForList, setSelectedDateForList] = useState<Date | null>(
    null,
  );
  const [showChurchServices, setShowChurchServices] = useState(true);

  // Get the date range for the current view
  const dateRange = useMemo(() => {
    let start: Date;
    let end: Date;

    switch (viewMode) {
      case EventCalendarView.WEEK:
        start = startOfWeek(currentDate, { weekStartsOn: 0 });
        end = endOfWeek(currentDate, { weekStartsOn: 0 });
        break;
      case EventCalendarView.YEAR:
        start = startOfYear(currentDate);
        end = endOfYear(currentDate);
        break;
      default: // MONTH
        start = startOfMonth(currentDate);
        end = endOfMonth(currentDate);
        break;
    }

    return { start, end };
  }, [currentDate, viewMode]);

  // Combine events with generated church service occurrences
  const allEvents = useMemo(() => {
    if (!showChurchServices) return events;

    // Generate all occurrences for all church services within the date range
    const serviceEvents: ChurchEvent[] = [];
    churchServices.forEach((service) => {
      const occurrences = generateServiceOccurrences(
        service,
        dateRange.start,
        dateRange.end,
      );
      serviceEvents.push(...occurrences);
    });

    return [...events, ...serviceEvents];
  }, [events, churchServices, showChurchServices, dateRange]);

  const filteredEvents = useMemo(() => {
    const next = [...allEvents];
    const filteredByType =
      typeFilter === "ALL"
        ? next
        : next.filter((item) => item.type === typeFilter);
    return filteredByType.sort((a, b) =>
      `${a.date}${a.startTime}`.localeCompare(`${b.date}${b.startTime}`),
    );
  }, [allEvents, typeFilter]);

  const monthDays = useMemo(() => {
    const start = startOfWeek(startOfMonth(currentDate), { weekStartsOn: 0 });
    const end = endOfWeek(endOfMonth(currentDate), { weekStartsOn: 0 });
    return eachDayOfInterval({ start, end });
  }, [currentDate]);

  const weekDays = useMemo(() => {
    const start = startOfWeek(currentDate, { weekStartsOn: 0 });
    return Array.from({ length: 7 }, (_, index) => addDays(start, index));
  }, [currentDate]);

  const yearMonths = useMemo(() => {
    const start = startOfYear(currentDate);
    const end = endOfYear(currentDate);
    return eachDayOfInterval({ start, end }).reduce<Date[]>((acc, date) => {
      if (date.getDate() === 1) acc.push(date);
      return acc;
    }, []);
  }, [currentDate]);

  const getEventsForDate = (date: Date) =>
    filteredEvents.filter((event) => occursOnDate(event, date));

  const handleToday = () => setCurrentDate(new Date());

  const handlePrev = () => {
    if (viewMode === EventCalendarView.WEEK) {
      setCurrentDate((prev) => subWeeks(prev, 1));
      return;
    }
    if (viewMode === EventCalendarView.YEAR) {
      setCurrentDate((prev) => subYears(prev, 1));
      return;
    }
    setCurrentDate((prev) => subMonths(prev, 1));
  };

  const handleNext = () => {
    if (viewMode === EventCalendarView.WEEK) {
      setCurrentDate((prev) => addWeeks(prev, 1));
      return;
    }
    if (viewMode === EventCalendarView.YEAR) {
      setCurrentDate((prev) => addYears(prev, 1));
      return;
    }
    setCurrentDate((prev) => addMonths(prev, 1));
  };

  const title =
    viewMode === EventCalendarView.WEEK
      ? `${format(weekDays[0], "MMM d")} - ${format(weekDays[6], "MMM d, yyyy")}`
      : viewMode === EventCalendarView.YEAR
        ? format(currentDate, "yyyy")
        : format(currentDate, "MMMM yyyy");

  const selectedDayEvents = useMemo(() => {
    if (!selectedDateForList) return [];
    return getEventsForDate(selectedDateForList);
  }, [selectedDateForList, filteredEvents]);

  const renderMonthView = () => (
    <div>
      <div className="grid grid-cols-7 bg-muted/20 border-b">
        {DAY_HEADERS.map((day) => (
          <Text variant="muted" key={day} className="py-2">
            {day}
          </Text>
        ))}
      </div>
      <div className="grid grid-cols-7">
        {monthDays.map((day) => {
          const dayEvents = getEventsForDate(day);
          const visibleEvents = dayEvents.slice(0, 3);
          const hasHiddenEvents = dayEvents.length > 3;

          return (
            <div
              key={day.toISOString()}
              className={cn(
                "group min-h-[150px] border-r border-b p-2",
                isSameMonth(day, currentDate) ? "bg-background" : "bg-muted/20",
              )}
            >
              <div
                className={cn(
                  "mb-2 text-sm font-medium",
                  isSameDay(day, new Date())
                    ? "h-7 w-7 rounded-full bg-primary text-primary-foreground flex items-center justify-center"
                    : "text-muted-foreground",
                )}
              >
                {format(day, "d")}
              </div>

              <div className="space-y-1">
                {visibleEvents.map((event) => (
                  <Button
                    key={event.id}
                    type="button"
                    variant="ghost"
                    onClick={() => onSelectEvent(event)}
                    className="w-full flex gap-2"
                  >
                    <Span
                      className={`h-2.5 w-2.5 rounded-full ${event.colorClass}`}
                    />
                    <Span className="truncate">{event.title}</Span>
                  </Button>
                ))}

                {hasHiddenEvents ? (
                  <Button
                    type="button"
                    onClick={() => setSelectedDateForList(day)}
                    className="hover:underline"
                  >
                    View all
                  </Button>
                ) : null}

                {isSameMonth(day, currentDate) ? (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => onCreateEvent(format(day, "yyyy-MM-dd"))}
                    className="mt-1 h-7 px-1 inline-flex items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100 hover:underline"
                  >
                    <Plus className="h-3 w-3 bg-primary-500 text-gray-50" />
                    Add Event
                  </Button>
                ) : null}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );

  const renderWeekView = () => (
    <div className="px-4 pb-4">
      <div className="grid grid-cols-8 border-b">
        <div />
        {weekDays.map((day) => (
          <div key={day.toISOString()} className="border-l py-2 text-center">
            <Text variant="default">{format(day, "EEE")}</Text>
            <Text
              className={cn(
                "text-4xl",
                isSameDay(day, new Date())
                  ? "text-primary font-semibold"
                  : "text-foreground",
              )}
            >
              {format(day, "d")}
            </Text>
          </div>
        ))}
      </div>

      {TIME_SLOTS.map((slot) => (
        <div key={slot} className="grid grid-cols-8 min-h-12 border-b">
          <div className="text-xs text-muted-foreground py-1">
            {format(new Date(2025, 0, 1, slot), "ha")}
          </div>
          {weekDays.map((day) => {
            const slotEvents = getEventsForDate(day).filter(
              (event) => parseHour(event.startTime) === slot,
            );

            return (
              <div
                key={`${day.toISOString()}-${slot}`}
                className="border-l px-1 py-1"
              >
                {slotEvents.map((event) => (
                  <Button
                    key={event.id}
                    type="button"
                    onClick={() => onSelectEvent(event)}
                    className="mb-1 text-xs flex items-center gap-1 text-left w-full"
                  >
                    <Span
                      className={`h-2.5 w-2.5 rounded-full ${event.colorClass}`}
                    />
                    <Span className="truncate">{event.title}</Span>
                  </Button>
                ))}
              </div>
            );
          })}
        </div>
      ))}
    </div>
  );

  const renderYearView = () => (
    <div className="grid grid-cols-4 gap-4 p-4">
      {yearMonths.map((monthStart) => {
        const monthGridStart = startOfWeek(startOfMonth(monthStart), {
          weekStartsOn: 0,
        });
        const monthGridEnd = endOfWeek(endOfMonth(monthStart), {
          weekStartsOn: 0,
        });
        const days = eachDayOfInterval({
          start: monthGridStart,
          end: monthGridEnd,
        });

        return (
          <div key={monthStart.toISOString()} className="rounded-lg border p-3">
            <Text className="text-sm font-semibold mb-2">
              {format(monthStart, "MMMM")}
            </Text>
            <div className="grid grid-cols-7 text-[10px] text-muted-foreground mb-1">
              {WEEK_HEADERS.map((header) => (
                <Span
                  key={`${monthStart.toISOString()}-${header}`}
                  className="text-center"
                >
                  {header[0]}
                </Span>
              ))}
            </div>
            <div className="grid grid-cols-7 gap-1">
              {days.map((day) => {
                const hasEvent = getEventsForDate(day).length > 0;
                const inMonth = isSameMonth(day, monthStart);

                return (
                  <Button
                    key={day.toISOString()}
                    type="button"
                    onClick={() => setSelectedDateForList(day)}
                    className={cn(
                      "h-6 w-6 rounded text-[11px]",
                      hasEvent
                        ? "bg-primary/10 text-primary font-semibold"
                        : "text-foreground",
                      !inMonth && "text-muted-foreground/40",
                    )}
                  >
                    {format(day, "d")}
                  </Button>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );

  return (
    <>
      <div className="rounded-lg border bg-background">
        <div className="flex items-center justify-between gap-3 p-4 border-b">
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={handleToday}>
              Today
            </Button>

            <Button variant="ghost" size="icon" onClick={handlePrev}>
              <ChevronLeft className="h-4 w-4" />
            </Button>

            <Button variant="ghost" size="icon" onClick={handleNext}>
              <ChevronRight className="h-4 w-4" />
            </Button>

            <Text variant="default">{title}</Text>
          </div>

          <div className="flex items-center gap-2">
            {churchServices.length > 0 && (
              <Button
                variant={showChurchServices ? "default" : "outline"}
                size="sm"
                onClick={() => setShowChurchServices(!showChurchServices)}
                className="h-9"
              >
                {showChurchServices ? "Hide Services" : "Show Services"}
              </Button>
            )}

            <Select
              value={viewMode}
              onValueChange={(value) => setViewMode(value as EventCalendarView)}
            >
              <SelectTrigger className="h-9 w-28">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {EVENT_VIEW_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select
              value={typeFilter}
              onValueChange={(value) =>
                setTypeFilter(value as EventType | "ALL")
              }
            >
              <SelectTrigger className="h-9 w-36">
                <SelectValue placeholder="All Types" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">All Types</SelectItem>
                {EVENT_TYPE_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select
              value={calendarDisplayType}
              onValueChange={setCalendarDisplayType}
            >
              <SelectTrigger className="h-9 w-28">
                <SelectValue placeholder="View" />
              </SelectTrigger>
              <SelectContent>
                {EVENT_VIEW_DROPDOWN_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Button onClick={() => onCreateEvent()}>Create event</Button>
          </div>
        </div>

        {viewMode === EventCalendarView.MONTH ? renderMonthView() : null}
        {viewMode === EventCalendarView.WEEK ? renderWeekView() : null}
        {viewMode === EventCalendarView.YEAR ? renderYearView() : null}
      </div>

      <Dialog
        open={Boolean(selectedDateForList)}
        onOpenChange={(open) => !open && setSelectedDateForList(null)}
      >
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>
              {selectedDateForList
                ? format(selectedDateForList, "EEEE, MMMM do")
                : "Events"}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-2">
            {selectedDayEvents.length === 0 ? (
              <Text variant="default">No events on this date.</Text>
            ) : null}

            {selectedDayEvents.map((event) => (
              <Button
                key={event.id}
                type="button"
                variant="outline"
                onClick={() => {
                  onSelectEvent(event);
                  setSelectedDateForList(null);
                }}
                className="w-full px-3 py-2"
              >
                <div className="flex items-center gap-2">
                  <Span
                    className={`h-2.5 w-2.5 rounded-full ${event.colorClass}`}
                  />
                  <Text variant="default">{event.title}</Text>
                </div>
                <Text variant="default" className="mt-1">
                  {EVENT_TYPE_LABEL_MAP[event.type]} -{" "}
                  {format(parseISO(`${event.date}T${event.startTime}`), "p")}
                </Text>
              </Button>
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

// "use client";

// import {
//   addDays,
//   addMonths,
//   addWeeks,
//   addYears,
//   eachDayOfInterval,
//   endOfMonth,
//   endOfWeek,
//   endOfYear,
//   format,
//   isBefore,
//   isSameDay,
//   isSameMonth,
//   parseISO,
//   startOfMonth,
//   startOfWeek,
//   startOfYear,
//   subMonths,
//   subWeeks,
//   subYears,
// } from "date-fns";
// import { ChevronLeft, ChevronRight, Plus } from "lucide-react";
// import { useMemo, useState } from "react";

// import { Button } from "@/components/ui/button";
// import {
//   Dialog,
//   DialogContent,
//   DialogHeader,
//   DialogTitle,
// } from "@/components/ui/dialog";
// import {
//   Select,
//   SelectContent,
//   SelectItem,
//   SelectTrigger,
//   SelectValue,
// } from "@/components/ui/select";
// import { Span, Text } from "@/components/ui/typography/Text";
// import {
//   EventCalendarView,
//   EventRecurrence,
//   EventReminderType,
//   EventType,
// } from "@/lib/enums";
// import { cn } from "@/lib/utils";
// import { ChurchEvent, ChurchService } from "@/types";

// import {
//   EVENT_TYPE_LABEL_MAP,
//   EVENT_TYPE_OPTIONS,
//   EVENT_VIEW_DROPDOWN_OPTIONS,
//   EVENT_VIEW_OPTIONS,
// } from "./constants";

// type EventsCalendarProps = {
//   events: ChurchEvent[];
//   churchServices?: ChurchService[]; // Add churchServices prop
//   onCreateEvent: (date?: string) => void;
//   onSelectEvent: (event: ChurchEvent) => void;
// };

// const DAY_HEADERS = ["SUN", "MON", "TUE", "WED", "THUR", "FRI", "SAT"];
// const WEEK_HEADERS = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"];
// const TIME_SLOTS = Array.from({ length: 17 }, (_, index) => index + 1);

// function parseHour(time: string) {
//   const [hour] = time.split(":");
//   return Number(hour || "0");
// }

// function occursOnDate(event: ChurchEvent, date: Date) {
//   const startDate = parseISO(event.date);
//   const currentDate = new Date(date);
//   startDate.setHours(0, 0, 0, 0);
//   currentDate.setHours(0, 0, 0, 0);

//   if (isBefore(currentDate, startDate)) return false;

//   if (event.recurrence === EventRecurrence.NONE) {
//     return isSameDay(startDate, currentDate);
//   }

//   if (event.recurrence === EventRecurrence.DAILY) return true;

//   if (event.recurrence === EventRecurrence.WEEKDAYS) {
//     const day = currentDate.getDay();
//     return day >= 1 && day <= 5;
//   }

//   if (event.recurrence === EventRecurrence.WEEKLY) {
//     return startDate.getDay() === currentDate.getDay();
//   }

//   if (event.recurrence === EventRecurrence.MONTHLY) {
//     return startDate.getDate() === currentDate.getDate();
//   }

//   if (event.recurrence === EventRecurrence.YEARLY) {
//     return (
//       startDate.getMonth() === currentDate.getMonth() &&
//       startDate.getDate() === currentDate.getDate()
//     );
//   }

//   return false;
// }

// // Helper to convert church service to event format with proper date mapping
// const convertChurchServiceToEvent = (
//   service: ChurchService,
//   referenceDate?: Date,
// ): ChurchEvent => {
//   // Use the reference date if provided, otherwise use today
//   const baseDate = referenceDate || new Date();

//   // Find the date for the service's day in the current week
//   const serviceDate = getDateForDayOfWeek(baseDate, service.day);

//   return {
//     id: service.id,
//     title: service.serviceName,
//     type: EventType.WORSHIP_SERVICE,
//     recurrence: EventRecurrence.WEEKLY,
//     date: serviceDate.toISOString().split("T")[0],
//     startTime: service.startTime,
//     endTime: service.endTime || "",
//     location: service.location || "",
//     description: `${service.type} service on ${service.day}s`,
//     sendReminder: true,
//     reminderType: EventReminderType.IN_APP,
//     remindBeforeMinutes: 30,
//     colorClass: "bg-blue-500",
//   };
// };

// /**
//  * Get the date for a specific day of the week in the current week
//  */
// const getDateForDayOfWeek = (baseDate: Date, day: string): Date => {
//   const dayMap: Record<string, number> = {
//     SUNDAY: 0,
//     MONDAY: 1,
//     TUESDAY: 2,
//     WEDNESDAY: 3,
//     THURSDAY: 4,
//     FRIDAY: 5,
//     SATURDAY: 6,
//   };

//   const targetDay = dayMap[day];
//   if (targetDay === undefined) {
//     return new Date(baseDate);
//   }

//   const currentDay = baseDate.getDay();
//   const diff = targetDay - currentDay;
//   const result = new Date(baseDate);
//   result.setDate(result.getDate() + diff);

//   return result;
// };

// export function EventsCalendar({
//   events,
//   churchServices = [],
//   onCreateEvent,
//   onSelectEvent,
// }: EventsCalendarProps) {
//   const [currentDate, setCurrentDate] = useState(new Date());
//   const [viewMode, setViewMode] = useState<EventCalendarView>(
//     EventCalendarView.MONTH,
//   );
//   const [typeFilter, setTypeFilter] = useState<EventType | "ALL">("ALL");
//   const [calendarDisplayType, setCalendarDisplayType] = useState("calendar");
//   const [selectedDateForList, setSelectedDateForList] = useState<Date | null>(
//     null,
//   );
//   const [showChurchServices, setShowChurchServices] = useState(true); // Toggle for church services

//   // Combine events with church services
//   const allEvents = useMemo(() => {
//     if (!showChurchServices) return events;

//     // Convert church services to events with proper date mapping
//     const serviceEvents = churchServices.map((service) =>
//       convertChurchServiceToEvent(service, currentDate),
//     );
//     return [...events, ...serviceEvents];
//   }, [events, churchServices, showChurchServices, currentDate]);

//   const filteredEvents = useMemo(() => {
//     const next = [...allEvents];
//     const filteredByType =
//       typeFilter === "ALL"
//         ? next
//         : next.filter((item) => item.type === typeFilter);
//     return filteredByType.sort((a, b) =>
//       `${a.date}${a.startTime}`.localeCompare(`${b.date}${b.startTime}`),
//     );
//   }, [allEvents, typeFilter]);

//   const monthDays = useMemo(() => {
//     const start = startOfWeek(startOfMonth(currentDate), { weekStartsOn: 0 });
//     const end = endOfWeek(endOfMonth(currentDate), { weekStartsOn: 0 });
//     return eachDayOfInterval({ start, end });
//   }, [currentDate]);

//   const weekDays = useMemo(() => {
//     const start = startOfWeek(currentDate, { weekStartsOn: 0 });
//     return Array.from({ length: 7 }, (_, index) => addDays(start, index));
//   }, [currentDate]);

//   const yearMonths = useMemo(() => {
//     const start = startOfYear(currentDate);
//     const end = endOfYear(currentDate);
//     return eachDayOfInterval({ start, end }).reduce<Date[]>((acc, date) => {
//       if (date.getDate() === 1) acc.push(date);
//       return acc;
//     }, []);
//   }, [currentDate]);

//   const getEventsForDate = (date: Date) =>
//     filteredEvents.filter((event) => occursOnDate(event, date));

//   const handleToday = () => setCurrentDate(new Date());

//   const handlePrev = () => {
//     if (viewMode === EventCalendarView.WEEK) {
//       setCurrentDate((prev) => subWeeks(prev, 1));
//       return;
//     }
//     if (viewMode === EventCalendarView.YEAR) {
//       setCurrentDate((prev) => subYears(prev, 1));
//       return;
//     }
//     setCurrentDate((prev) => subMonths(prev, 1));
//   };

//   const handleNext = () => {
//     if (viewMode === EventCalendarView.WEEK) {
//       setCurrentDate((prev) => addWeeks(prev, 1));
//       return;
//     }
//     if (viewMode === EventCalendarView.YEAR) {
//       setCurrentDate((prev) => addYears(prev, 1));
//       return;
//     }
//     setCurrentDate((prev) => addMonths(prev, 1));
//   };

//   const title =
//     viewMode === EventCalendarView.WEEK
//       ? `${format(weekDays[0], "MMM d")} - ${format(weekDays[6], "MMM d, yyyy")}`
//       : viewMode === EventCalendarView.YEAR
//         ? format(currentDate, "yyyy")
//         : format(currentDate, "MMMM yyyy");

//   const selectedDayEvents = useMemo(() => {
//     if (!selectedDateForList) return [];
//     return getEventsForDate(selectedDateForList);
//   }, [selectedDateForList, filteredEvents]);

//   const renderMonthView = () => (
//     <div>
//       <div className="grid grid-cols-7 bg-muted/20 border-b">
//         {DAY_HEADERS.map((day) => (
//           <Text variant="muted" key={day} className="py-2">
//             {day}
//           </Text>
//         ))}
//       </div>
//       <div className="grid grid-cols-7">
//         {monthDays.map((day) => {
//           const dayEvents = getEventsForDate(day);
//           const visibleEvents = dayEvents.slice(0, 3);
//           const hasHiddenEvents = dayEvents.length > 3;

//           return (
//             <div
//               key={day.toISOString()}
//               className={cn(
//                 "group min-h-[150px] border-r border-b p-2",
//                 isSameMonth(day, currentDate) ? "bg-background" : "bg-muted/20",
//               )}
//             >
//               <div
//                 className={cn(
//                   "mb-2 text-sm font-medium",
//                   isSameDay(day, new Date())
//                     ? "h-7 w-7 rounded-full bg-primary text-primary-foreground flex items-center justify-center"
//                     : "text-muted-foreground",
//                 )}
//               >
//                 {format(day, "d")}
//               </div>

//               <div className="space-y-1">
//                 {visibleEvents.map((event) => (
//                   <Button
//                     key={event.id}
//                     type="button"
//                     variant="ghost"
//                     onClick={() => onSelectEvent(event)}
//                     className="w-full flex gap-2"
//                   >
//                     <Span
//                       className={`h-2.5 w-2.5 rounded-full ${event.colorClass}`}
//                     />
//                     <Span className="truncate">{event.title}</Span>
//                   </Button>
//                 ))}

//                 {hasHiddenEvents ? (
//                   <Button
//                     type="button"
//                     onClick={() => setSelectedDateForList(day)}
//                     className="hover:underline"
//                   >
//                     View all
//                   </Button>
//                 ) : null}

//                 {isSameMonth(day, currentDate) ? (
//                   <Button
//                     type="button"
//                     variant="ghost"
//                     size="sm"
//                     onClick={() => onCreateEvent(format(day, "yyyy-MM-dd"))}
//                     className="mt-1 h-7 px-1 inline-flex items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100 hover:underline"
//                   >
//                     <Plus className="h-3 w-3 bg-primary-500 text-gray-50" />
//                     Add Event
//                   </Button>
//                 ) : null}
//               </div>
//             </div>
//           );
//         })}
//       </div>
//     </div>
//   );

//   const renderWeekView = () => (
//     <div className="px-4 pb-4">
//       <div className="grid grid-cols-8 border-b">
//         <div />
//         {weekDays.map((day) => (
//           <div key={day.toISOString()} className="border-l py-2 text-center">
//             <Text variant="default">{format(day, "EEE")}</Text>
//             <Text
//               className={cn(
//                 "text-4xl",
//                 isSameDay(day, new Date())
//                   ? "text-primary font-semibold"
//                   : "text-foreground",
//               )}
//             >
//               {format(day, "d")}
//             </Text>
//           </div>
//         ))}
//       </div>

//       {TIME_SLOTS.map((slot) => (
//         <div key={slot} className="grid grid-cols-8 min-h-12 border-b">
//           <div className="text-xs text-muted-foreground py-1">
//             {format(new Date(2025, 0, 1, slot), "ha")}
//           </div>
//           {weekDays.map((day) => {
//             const slotEvents = getEventsForDate(day).filter(
//               (event) => parseHour(event.startTime) === slot,
//             );

//             return (
//               <div
//                 key={`${day.toISOString()}-${slot}`}
//                 className="border-l px-1 py-1"
//               >
//                 {slotEvents.map((event) => (
//                   <Button
//                     key={event.id}
//                     type="button"
//                     onClick={() => onSelectEvent(event)}
//                     className="mb-1 text-xs flex items-center gap-1 text-left w-full"
//                   >
//                     <Span
//                       className={`h-2.5 w-2.5 rounded-full ${event.colorClass}`}
//                     />
//                     <Span className="truncate">{event.title}</Span>
//                   </Button>
//                 ))}
//               </div>
//             );
//           })}
//         </div>
//       ))}
//     </div>
//   );

//   const renderYearView = () => (
//     <div className="grid grid-cols-4 gap-4 p-4">
//       {yearMonths.map((monthStart) => {
//         const monthGridStart = startOfWeek(startOfMonth(monthStart), {
//           weekStartsOn: 0,
//         });
//         const monthGridEnd = endOfWeek(endOfMonth(monthStart), {
//           weekStartsOn: 0,
//         });
//         const days = eachDayOfInterval({
//           start: monthGridStart,
//           end: monthGridEnd,
//         });

//         return (
//           <div key={monthStart.toISOString()} className="rounded-lg border p-3">
//             <Text className="text-sm font-semibold mb-2">
//               {format(monthStart, "MMMM")}
//             </Text>
//             <div className="grid grid-cols-7 text-[10px] text-muted-foreground mb-1">
//               {WEEK_HEADERS.map((header) => (
//                 <Span
//                   key={`${monthStart.toISOString()}-${header}`}
//                   className="text-center"
//                 >
//                   {header[0]}
//                 </Span>
//               ))}
//             </div>
//             <div className="grid grid-cols-7 gap-1">
//               {days.map((day) => {
//                 const hasEvent = getEventsForDate(day).length > 0;
//                 const inMonth = isSameMonth(day, monthStart);

//                 return (
//                   <Button
//                     key={day.toISOString()}
//                     type="button"
//                     onClick={() => setSelectedDateForList(day)}
//                     className={cn(
//                       "h-6 w-6 rounded text-[11px]",
//                       hasEvent
//                         ? "bg-primary/10 text-primary font-semibold"
//                         : "text-foreground",
//                       !inMonth && "text-muted-foreground/40",
//                     )}
//                   >
//                     {format(day, "d")}
//                   </Button>
//                 );
//               })}
//             </div>
//           </div>
//         );
//       })}
//     </div>
//   );

//   return (
//     <>
//       <div className="rounded-lg border bg-background">
//         <div className="flex items-center justify-between gap-3 p-4 border-b">
//           <div className="flex items-center gap-2">
//             <Button variant="outline" size="sm" onClick={handleToday}>
//               Today
//             </Button>

//             <Button variant="ghost" size="icon" onClick={handlePrev}>
//               <ChevronLeft className="h-4 w-4" />
//             </Button>

//             <Button variant="ghost" size="icon" onClick={handleNext}>
//               <ChevronRight className="h-4 w-4" />
//             </Button>

//             <Text variant="default">{title}</Text>
//           </div>

//           <div className="flex items-center gap-2">
//             {/* Toggle for church services */}
//             {churchServices.length > 0 && (
//               <Button
//                 variant={showChurchServices ? "default" : "outline"}
//                 size="sm"
//                 onClick={() => setShowChurchServices(!showChurchServices)}
//                 className="h-9"
//               >
//                 {showChurchServices ? "Hide Services" : "Show Services"}
//               </Button>
//             )}

//             <Select
//               value={viewMode}
//               onValueChange={(value) => setViewMode(value as EventCalendarView)}
//             >
//               <SelectTrigger className="h-9 w-28">
//                 <SelectValue />
//               </SelectTrigger>
//               <SelectContent>
//                 {EVENT_VIEW_OPTIONS.map((option) => (
//                   <SelectItem key={option.value} value={option.value}>
//                     {option.label}
//                   </SelectItem>
//                 ))}
//               </SelectContent>
//             </Select>

//             <Select
//               value={typeFilter}
//               onValueChange={(value) =>
//                 setTypeFilter(value as EventType | "ALL")
//               }
//             >
//               <SelectTrigger className="h-9 w-36">
//                 <SelectValue placeholder="All Types" />
//               </SelectTrigger>
//               <SelectContent>
//                 <SelectItem value="ALL">All Types</SelectItem>
//                 {EVENT_TYPE_OPTIONS.map((option) => (
//                   <SelectItem key={option.value} value={option.value}>
//                     {option.label}
//                   </SelectItem>
//                 ))}
//               </SelectContent>
//             </Select>

//             <Select
//               value={calendarDisplayType}
//               onValueChange={setCalendarDisplayType}
//             >
//               <SelectTrigger className="h-9 w-28">
//                 <SelectValue placeholder="View" />
//               </SelectTrigger>
//               <SelectContent>
//                 {EVENT_VIEW_DROPDOWN_OPTIONS.map((option) => (
//                   <SelectItem key={option.value} value={option.value}>
//                     {option.label}
//                   </SelectItem>
//                 ))}
//               </SelectContent>
//             </Select>

//             <Button onClick={() => onCreateEvent()}>Create event</Button>
//           </div>
//         </div>

//         {viewMode === EventCalendarView.MONTH ? renderMonthView() : null}
//         {viewMode === EventCalendarView.WEEK ? renderWeekView() : null}
//         {viewMode === EventCalendarView.YEAR ? renderYearView() : null}
//       </div>

//       <Dialog
//         open={Boolean(selectedDateForList)}
//         onOpenChange={(open) => !open && setSelectedDateForList(null)}
//       >
//         <DialogContent className="max-w-md">
//           <DialogHeader>
//             <DialogTitle>
//               {selectedDateForList
//                 ? format(selectedDateForList, "EEEE, MMMM do")
//                 : "Events"}
//             </DialogTitle>
//           </DialogHeader>

//           <div className="space-y-2">
//             {selectedDayEvents.length === 0 ? (
//               <Text variant="default">No events on this date.</Text>
//             ) : null}

//             {selectedDayEvents.map((event) => (
//               <Button
//                 key={event.id}
//                 type="button"
//                 variant="outline"
//                 onClick={() => {
//                   onSelectEvent(event);
//                   setSelectedDateForList(null);
//                 }}
//                 className="w-full px-3 py-2"
//               >
//                 <div className="flex items-center gap-2">
//                   <Span
//                     className={`h-2.5 w-2.5 rounded-full ${event.colorClass}`}
//                   />
//                   <Text variant="default">{event.title}</Text>
//                 </div>
//                 <Text variant="default" className="mt-1">
//                   {EVENT_TYPE_LABEL_MAP[event.type]} -{" "}
//                   {format(parseISO(`${event.date}T${event.startTime}`), "p")}
//                 </Text>
//               </Button>
//             ))}
//           </div>
//         </DialogContent>
//       </Dialog>
//     </>
//   );
// }
