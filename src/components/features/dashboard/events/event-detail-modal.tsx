"use client";

import { format, isValid, parseISO } from "date-fns";
import { Calendar, Clock3, MapPin, Repeat, Trash2, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import Heading from "@/components/ui/typography/Heading";
import { Span, Text } from "@/components/ui/typography/Text";
import { ChurchEvent } from "@/types";

import {
  EVENT_REMINDER_LABEL_MAP,
  EVENT_TYPE_LABEL_MAP,
  formatRecurrenceLabel,
} from "./constants";

type EventDetailModalProps = {
  open: boolean;
  event: ChurchEvent | null;
  onOpenChange: (open: boolean) => void;
  onDelete: (eventId: string) => void;
  onEdit: (event: ChurchEvent) => void;
};

// Helper function to parse time string safely
function parseTimeString(date: string, time: string): Date | null {
  if (!date || !time) return null;

  // Remove AM/PM and trim
  const cleanTime = time.replace(/\s*(AM|PM)/i, "").trim();
  const [hours, minutes] = cleanTime.split(":").map(Number);

  const parsedDate = parseISO(date);
  if (!isValid(parsedDate)) return null;

  // Set the time
  parsedDate.setHours(hours || 0, minutes || 0, 0, 0);

  // Adjust for PM if needed
  if (time.toLowerCase().includes("pm") && hours !== 12) {
    parsedDate.setHours(hours + 12);
  } else if (time.toLowerCase().includes("am") && hours === 12) {
    parsedDate.setHours(0);
  }

  return parsedDate;
}

// Helper to format time safely
function formatTimeSafely(date: string, time: string): string {
  const dateTime = parseTimeString(date, time);
  if (!dateTime || !isValid(dateTime)) {
    return time; // Return original time string as fallback
  }
  return format(dateTime, "p");
}

// Helper to format date safely
function formatDateSafely(dateString: string): string {
  const date = parseISO(dateString);
  if (!isValid(date)) {
    return dateString;
  }
  return format(date, "EEEE, MMMM do, yyyy");
}

export function EventDetailModal({
  open,
  event,
  onOpenChange,
  onDelete,
  onEdit,
}: EventDetailModalProps) {
  if (!event) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent showClose={false} className="max-w-lg p-0">
        <DialogHeader className="px-6 py-4 border-b">
          <div className="flex items-center justify-between">
            <DialogTitle>{EVENT_TYPE_LABEL_MAP[event.type]}</DialogTitle>

            <div className="flex items-center gap-2">
              <Button
                className="p-2"
                size="icon"
                variant="ghost"
                onClick={() => onDelete(event.id)}
                aria-label="Delete activity"
              >
                <Trash2 className="w-4 h-4" />
              </Button>

              <DialogClose asChild>
                <Button
                  className="p-2"
                  size="icon"
                  variant="outline"
                  aria-label="Close dialog"
                >
                  <X className="w-4 h-4" />
                </Button>
              </DialogClose>
            </div>
          </div>
        </DialogHeader>

        <div className="px-6 py-5 space-y-4">
          <div className="flex items-center gap-2">
            <Span className={`h-3 w-3 rounded-full ${event.colorClass}`} />
            <Heading level={3}>{event.title}</Heading>
          </div>

          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              <Span>{formatDateSafely(event.date)}</Span>
            </div>

            <div className="flex items-center gap-2">
              <Clock3 className="h-4 w-4" />
              <Span>
                {formatTimeSafely(event.date, event.startTime)}
                {event.endTime
                  ? ` - ${formatTimeSafely(event.date, event.endTime)}`
                  : ""}
              </Span>
            </div>

            {event.location ? (
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4" />
                <Span>{event.location}</Span>
              </div>
            ) : null}

            <div className="flex items-center gap-2">
              <Repeat className="h-4 w-4" />
              <Span>{formatRecurrenceLabel(event.recurrence, event.date)}</Span>
            </div>
          </div>

          {event.description ? (
            <div>
              <Text variant="default">Description</Text>
              <Text variant="muted">{event.description}</Text>
            </div>
          ) : null}

          <Span variant="muted">
            {event.sendReminder
              ? `Reminder: ${EVENT_REMINDER_LABEL_MAP[event.reminderType]} (${event.remindBeforeMinutes} mins before)`
              : "Reminder disabled"}
          </Span>
        </div>

        <div className="px-6 py-4 border-t flex justify-end">
          <Button onClick={() => onEdit(event)}>Update</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
