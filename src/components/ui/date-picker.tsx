"use client";

import { format, isValid, parseISO } from "date-fns";
import { CalendarDays } from "lucide-react";

import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";

export interface DatePickerProps {
  id?: string;
  /** ISO date string, yyyy-MM-dd. Empty string means no date selected. */
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  /** Earliest selectable date, yyyy-MM-dd. */
  minDate?: string;
  /** Latest selectable date, yyyy-MM-dd. */
  maxDate?: string;
}

/** App-wide date input: a Popover-driven Calendar instead of the native
 * browser date picker, so every date field looks and behaves the same way. */
export function DatePicker({
  id,
  value,
  onChange,
  placeholder = "Select Date",
  disabled,
  className,
  minDate,
  maxDate,
}: DatePickerProps) {
  const parsed = value ? parseISO(value) : undefined;
  const selected = parsed && isValid(parsed) ? parsed : undefined;
  const min = minDate ? parseISO(minDate) : undefined;
  const max = maxDate ? parseISO(maxDate) : undefined;
  const disabledDays = [
    ...(min && isValid(min) ? [{ before: min }] : []),
    ...(max && isValid(max) ? [{ after: max }] : []),
  ];

  return (
    <Popover>
      <PopoverTrigger asChild>
        <button
          id={id}
          type="button"
          disabled={disabled}
          className={cn(
            "flex h-9 w-full items-center gap-2 rounded-lg border border-gray-300 bg-white px-3 text-left text-sm text-gray-900 shadow-none transition-colors hover:border-gray-400 disabled:cursor-not-allowed disabled:opacity-50",
            !selected && "text-muted-foreground",
            className,
          )}
        >
          <CalendarDays className="h-4 w-4 shrink-0 text-gray-400" />
          <span className="truncate">
            {selected ? format(selected, "MMM d, yyyy") : placeholder}
          </span>
        </button>
      </PopoverTrigger>

      <PopoverContent align="start" className="w-auto bg-white p-0">
        <Calendar
          mode="single"
          selected={selected}
          defaultMonth={selected}
          disabled={disabledDays.length ? disabledDays : undefined}
          onSelect={(date) => onChange(date ? format(date, "yyyy-MM-dd") : "")}
        />
      </PopoverContent>
    </Popover>
  );
}
