"use client";

import { addDays, format } from "date-fns";
import { CalendarDays, Clock3, X } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { LocationCombobox } from "@/components/ui/location-combobox";
import { Loader } from "@/components/ui/loader";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Span, Text } from "@/components/ui/typography/Text";
import { useToast } from "@/hooks/use-toast";
import { SpecialServiceDaySchedule, SpecialServiceEvent } from "@/types";
import { createSpecialServiceSchema } from "@/types/schema";

type CreateSpecialServiceModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreateService: (service: SpecialServiceEvent) => Promise<void>;
};

const DEFAULT_START_TIME = "";
const DEFAULT_END_TIME = "";

// Map frontend recurrence to backend enum values
const RECURRENCE_MAP: Record<string, string> = {
  none: "NO_REPEAT",
  weekly: "WEEKLY_MONDAY",
  monthly: "MONTHLY_FIRST_MONDAY",
  yearly: "ANNUALLY",
};

// Map event types
const EVENT_TYPE_MAP: Record<string, string> = {
  WORSHIP_SERVICE: "WORSHIP_SERVICE",
  BIRTHDAY: "BIRTHDAY",
  MEETING: "MEETING",
  WEDDING_ANNIVERSARY: "WEDDING_ANNIVERSARY",
  OTHERS: "OTHERS",
};

function listDates(startDate: string, endDate?: string): string[] {
  if (!startDate) {
    return [];
  }
  const start = new Date(startDate);
  const end = new Date(endDate || startDate);

  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) return [];

  const normalizedEnd = end < start ? start : end;
  const dates: string[] = [];
  let cursor = start;

  while (cursor <= normalizedEnd) {
    dates.push(format(cursor, "yyyy-MM-dd"));
    cursor = addDays(cursor, 1);
  }

  return dates;
}

export function CreateSpecialServiceModal({
  open,
  onOpenChange,
  onCreateService,
}: CreateSpecialServiceModalProps) {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [title, setTitle] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [location, setLocation] = useState("");
  const [description, setDescription] = useState("");
  const [recurrence, setRecurrence] = useState<
    "none" | "weekly" | "monthly" | "yearly"
  >("none");
  const [eventType, setEventType] = useState<string>("WORSHIP_SERVICE"); // Add event type state
  const [applySameTime, setApplySameTime] = useState(true);
  const [daySchedules, setDaySchedules] = useState<SpecialServiceDaySchedule[]>(
    [],
  );

  const dateRange = useMemo(
    () => listDates(startDate, endDate || startDate),
    [startDate, endDate],
  );

  useEffect(() => {
    if (!dateRange.length) {
      setDaySchedules([]);
      return;
    }

    setDaySchedules((prev) =>
      dateRange.map((date, index) => {
        const existing = prev.find((schedule) => schedule.date === date);
        if (existing) return existing;

        const first = prev[0];
        return {
          date,
          startTime:
            applySameTime && index > 0
              ? first?.startTime || DEFAULT_START_TIME
              : DEFAULT_START_TIME,
          endTime:
            applySameTime && index > 0
              ? first?.endTime || DEFAULT_END_TIME
              : DEFAULT_END_TIME,
        };
      }),
    );
  }, [dateRange, applySameTime]);

  const updateScheduleTime = (
    date: string,
    field: "startTime" | "endTime",
    value: string,
  ) => {
    setDaySchedules((prev) =>
      prev.map((schedule) => {
        if (schedule.date !== date) return schedule;
        return { ...schedule, [field]: value };
      }),
    );

    if (applySameTime && dateRange[0] === date) {
      setDaySchedules((prev) =>
        prev.map((schedule, index) =>
          index === 0 ? schedule : { ...schedule, [field]: value },
        ),
      );
    }
  };

  const convertTo12HourFormat = (time24: string) => {
    if (!time24) return "";
    const [hours, minutes] = time24.split(":");
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? "PM" : "AM";
    const hour12 = hour % 12 || 12;
    return `${hour12}:${minutes} ${ampm}`;
  };

  const handleClose = () => {
    if (isLoading) return;
    onOpenChange(false);
    setTitle("");
    setStartDate("");
    setEndDate("");
    setLocation("");
    setDescription("");
    setRecurrence("none");
    setEventType("WORSHIP_SERVICE");
    setApplySameTime(true);
    setDaySchedules([]);
  };

  const handleCreate = async () => {
    const result = createSpecialServiceSchema.safeParse({
      title,
      startDate,
      endDate,
      location,
      description,
      recurrence,
      eventType,
      daySchedules,
    });

    if (!result.success) {
      toast({
        title: "Validation Error",
        description: result.error.issues[0].message,
        variant: "destructive",
      });
      return;
    }

    const id =
      typeof crypto !== "undefined" && crypto.randomUUID
        ? crypto.randomUUID()
        : `special-${Date.now()}`;

    setIsLoading(true);

    try {
      await onCreateService({
        id,
        title: title.trim(),
        startDate,
        endDate: endDate || startDate,
        location: location.trim() || undefined,
        description: description.trim() || undefined,
        recurrence: RECURRENCE_MAP[recurrence] as
          | "NO_REPEAT"
          | "WEEKLY_MONDAY"
          | "MONTHLY_FIRST_MONDAY"
          | "ANNUALLY",
        daySchedules: daySchedules.map((schedule) => ({
          date: schedule.date,
          startTime: convertTo12HourFormat(schedule.startTime),
          endTime: schedule.endTime
            ? convertTo12HourFormat(schedule.endTime)
            : "",
        })),
        eventType: eventType as any, // Add event type
      });

      handleClose();
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent
        showClose={false}
        mobileSheet
        className="max-w-2xl p-0 overflow-hidden max-sm:max-h-[88vh]"
      >
        <DialogHeader className="px-6 py-4 border-b">
          <div className="flex items-center justify-between">
            <DialogTitle className="text-xl">Special Service</DialogTitle>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleClose}
              disabled={isLoading}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </DialogHeader>

        <div className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
          <div className="space-y-2">
            <Label>
              Service Name <Span variant="error">*</Span>
            </Label>
            <Input
              placeholder="e.g. Anointing Service"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              disabled={isLoading}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>
                Start Date <Span variant="error">*</Span>
              </Label>
              <Input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                disabled={isLoading}
              />
            </div>
            <div className="space-y-2">
              <Label>End Date</Label>
              <Input
                type="date"
                value={endDate}
                min={startDate || undefined}
                onChange={(e) => setEndDate(e.target.value)}
                disabled={isLoading}
              />
            </div>
          </div>

          {/* Add Event Type Select */}
          <div className="space-y-2">
            <Label>Event Type</Label>
            <Select
              value={eventType}
              onValueChange={setEventType}
              disabled={isLoading}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select event type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="WORSHIP_SERVICE">Worship Service</SelectItem>
                <SelectItem value="BIRTHDAY">Birthday</SelectItem>
                <SelectItem value="MEETING">Meeting</SelectItem>
                <SelectItem value="WEDDING_ANNIVERSARY">
                  Wedding Anniversary
                </SelectItem>
                <SelectItem value="OTHERS">Others</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Repeat</Label>
            <Select
              value={recurrence}
              onValueChange={(value) =>
                setRecurrence(value as "none" | "weekly" | "monthly" | "yearly")
              }
              disabled={isLoading}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select repeat rule" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">One-time</SelectItem>
                <SelectItem value="weekly">Weekly (Monday)</SelectItem>
                <SelectItem value="monthly">Monthly (First Monday)</SelectItem>
                <SelectItem value="yearly">Annually</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center gap-2">
            <Checkbox
              checked={applySameTime}
              onCheckedChange={(checked) => setApplySameTime(Boolean(checked))}
              disabled={isLoading}
            />
            <Text>Apply the same time for others</Text>
          </div>

          <div className="space-y-3">
            {daySchedules.map((schedule) => (
              <div
                key={schedule.date}
                className="space-y-2 border rounded-lg p-3"
              >
                <div className="flex items-center gap-2 text-sm">
                  <CalendarDays className="h-4 w-4" />
                  {format(new Date(schedule.date), "do MMMM, yyyy")}
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <Label>
                      Start Time <Span variant="error">*</Span>
                    </Label>
                    <div className="relative">
                      <Input
                        type="time"
                        value={schedule.startTime}
                        onChange={(e) =>
                          updateScheduleTime(
                            schedule.date,
                            "startTime",
                            e.target.value,
                          )
                        }
                        disabled={isLoading}
                      />
                      <Clock3 className="h-4 w-4 absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                    </div>
                  </div>
                  <div className="space-y-1">
                    <Label>End Time</Label>
                    <div className="relative">
                      <Input
                        type="time"
                        value={schedule.endTime}
                        onChange={(e) =>
                          updateScheduleTime(
                            schedule.date,
                            "endTime",
                            e.target.value,
                          )
                        }
                        disabled={isLoading}
                      />
                      <Clock3 className="h-4 w-4 absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="space-y-2">
            <Label>Location</Label>
            <LocationCombobox
              value={location}
              onChange={setLocation}
              placeholder="e.g. Main Auditorium"
              disabled={isLoading}
            />
          </div>

          <div className="space-y-2">
            <Label>Description</Label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Add description"
              className="w-full min-h-24 rounded-md border border-input bg-background px-3 py-2 text-sm"
              disabled={isLoading}
            />
          </div>

          <div className="flex justify-end">
            <Button onClick={handleCreate} disabled={isLoading}>
              {isLoading ? (
                <span className="flex items-center gap-2">
                  <Loader size="w-4 h-4" showShadow={false} />
                  Creating...
                </span>
              ) : (
                "Create event"
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
