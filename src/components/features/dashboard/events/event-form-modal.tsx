"use client";

import { X } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { LocationCombobox } from "@/components/ui/location-combobox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { EventRecurrence, EventReminderType, EventType } from "@/lib/enums";
import { EventFormData, ReminderTimeBefore } from "@/types";
import { eventFormSchema, EventFormValues } from "@/types/schema";

import {
  EVENT_REMINDER_MINUTES_OPTIONS,
  EVENT_REMINDER_TYPE_OPTIONS,
  EVENT_TYPE_OPTIONS,
  getEventRecurrenceOptions,
  REMINDER_TIME_LABEL_MAP,
} from "./constants";

type EventFormModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (payload: EventFormData) => Promise<void>;
  initialData?: EventFormData | null;
  isSubmitting?: boolean;
  /** True when editing an existing event, false/omitted when creating a new one. */
  isEditMode?: boolean;
};

const DEFAULT_FORM_VALUES: EventFormValues = {
  title: "",
  type: EventType.WORSHIP_SERVICE,
  recurrence: EventRecurrence.NONE,
  date: "",
  startTime: "",
  endTime: "",
  location: "",
  description: "",
  sendReminder: true,
  reminderType: EventReminderType.IN_APP,
  remindBeforeMinutes: ReminderTimeBefore.MINUTES_30,
};

export function EventFormModal({
  open,
  onOpenChange,
  onSubmit,
  initialData,
  isSubmitting = false,
  isEditMode = false,
}: EventFormModalProps) {
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [extraData, setExtraData] = useState<
    Pick<EventFormData, "specialDays" | "serviceType">
  >({});

  const form = useForm<EventFormValues>({
    resolver: zodResolver(eventFormSchema),
    defaultValues: DEFAULT_FORM_VALUES,
  });

  const date = form.watch("date");
  const recurrenceOptions = useMemo(() => {
    return getEventRecurrenceOptions(date);
  }, [date]);

  useEffect(() => {
    if (!open) {
      return;
    }
    form.reset(
      initialData
        ? {
            title: initialData.title,
            type: initialData.type,
            recurrence: initialData.recurrence,
            date: initialData.date,
            startTime: initialData.startTime,
            endTime: initialData.endTime || "",
            location: initialData.location || "",
            description: initialData.description || "",
            sendReminder: initialData.sendReminder,
            reminderType: initialData.reminderType,
            remindBeforeMinutes: initialData.remindBeforeMinutes,
          }
        : DEFAULT_FORM_VALUES,
    );
    setExtraData({
      specialDays: initialData?.specialDays,
      serviceType: initialData?.serviceType,
    });
    setSubmitError(null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, initialData]);

  const handleSubmit = async (values: EventFormValues) => {
    try {
      setSubmitError(null);
      await onSubmit({ ...values, ...extraData });
      onOpenChange(false);
    } catch (error: any) {
      let errorMessage = "Failed to save event. Please try again.";

      if (error?.message) {
        errorMessage = error.message;
      } else if (error?.response?.data?.message) {
        const apiMessage = error.response.data.message;
        if (Array.isArray(apiMessage)) {
          errorMessage = apiMessage.join(", ");
        } else {
          errorMessage = apiMessage;
        }
      } else if (typeof error === "string") {
        errorMessage = error;
      }

      setSubmitError(errorMessage);
    }
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(newOpen) => {
        if (isSubmitting) {
          return;
        }
        if (!newOpen) {
          setSubmitError(null);
        }
        onOpenChange(newOpen);
      }}
    >
      <DialogContent showClose={false} className="max-w-2xl p-0">
        <DialogHeader className="px-6 py-4 border-b">
          <div className="flex items-center justify-between">
            <DialogTitle>
              {isEditMode ? "Update Event" : "Create Event"}
            </DialogTitle>
            <DialogClose asChild>
              <Button
                className="p-2"
                size="icon"
                variant="outline"
                aria-label="Close dialog"
                disabled={isSubmitting}
              >
                <X className="w-4 h-4" />
              </Button>
            </DialogClose>
          </div>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)}>
            <div className="px-6 py-5 space-y-4 max-h-[80vh] overflow-y-auto">
              {submitError && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
                  <div className="text-red-500 text-sm font-medium">Error</div>
                  <div className="flex-1 text-sm text-red-700">
                    {submitError}
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="h-6 w-6 p-0 text-red-500 hover:text-red-700 hover:bg-red-100"
                    onClick={() => {
                      return setSubmitError(null);
                    }}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              )}

              <FormField
                control={form.control}
                name="title"
                render={({ field }) => {
                  return (
                    <FormItem>
                      <FormLabel>Title *</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Event title..."
                          disabled={isSubmitting}
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  );
                }}
              />

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="type"
                  render={({ field }) => {
                    return (
                      <FormItem>
                        <FormLabel>Event Type</FormLabel>
                        <Select
                          value={field.value}
                          onValueChange={field.onChange}
                          disabled={isSubmitting}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {EVENT_TYPE_OPTIONS.map((option) => {
                              return (
                                <SelectItem
                                  key={option.value}
                                  value={option.value}
                                >
                                  {option.label}
                                </SelectItem>
                              );
                            })}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    );
                  }}
                />

                <FormField
                  control={form.control}
                  name="recurrence"
                  render={({ field }) => {
                    return (
                      <FormItem>
                        <FormLabel>Event Recurrence</FormLabel>
                        <Select
                          value={field.value}
                          onValueChange={field.onChange}
                          disabled={isSubmitting}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Does not repeat" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {recurrenceOptions.map((option) => {
                              return (
                                <SelectItem
                                  key={option.value}
                                  value={option.value}
                                >
                                  {option.label}
                                </SelectItem>
                              );
                            })}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    );
                  }}
                />
              </div>

              <FormField
                control={form.control}
                name="date"
                render={({ field }) => {
                  return (
                    <FormItem>
                      <FormLabel>Date *</FormLabel>
                      <FormControl>
                        <Input type="date" disabled={isSubmitting} {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  );
                }}
              />

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="startTime"
                  render={({ field }) => {
                    return (
                      <FormItem>
                        <FormLabel>Start Time *</FormLabel>
                        <FormControl>
                          <Input
                            type="time"
                            disabled={isSubmitting}
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    );
                  }}
                />

                <FormField
                  control={form.control}
                  name="endTime"
                  render={({ field }) => {
                    return (
                      <FormItem>
                        <FormLabel>End Time *</FormLabel>
                        <FormControl>
                          <Input
                            type="time"
                            disabled={isSubmitting}
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    );
                  }}
                />
              </div>

              <FormField
                control={form.control}
                name="location"
                render={({ field }) => {
                  return (
                    <FormItem>
                      <FormLabel>Location</FormLabel>
                      <FormControl>
                        <LocationCombobox
                          value={field.value}
                          onChange={field.onChange}
                          placeholder="e.g. Main Auditorium"
                          disabled={isSubmitting}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  );
                }}
              />

              <FormField
                control={form.control}
                name="sendReminder"
                render={({ field }) => {
                  return (
                    <FormItem className="flex items-center gap-3 space-y-0">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={(checked) => {
                            return field.onChange(checked === true);
                          }}
                          disabled={isSubmitting}
                        />
                      </FormControl>
                      <FormLabel>Send reminder</FormLabel>
                    </FormItem>
                  );
                }}
              />

              {form.watch("sendReminder") ? (
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="reminderType"
                    render={({ field }) => {
                      return (
                        <FormItem>
                          <FormLabel>Reminder Type</FormLabel>
                          <Select
                            value={field.value}
                            onValueChange={field.onChange}
                            disabled={isSubmitting}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="In-App Notification" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {EVENT_REMINDER_TYPE_OPTIONS.map((option) => {
                                return (
                                  <SelectItem
                                    key={option.value}
                                    value={option.value}
                                  >
                                    {option.label}
                                  </SelectItem>
                                );
                              })}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      );
                    }}
                  />

                  <FormField
                    control={form.control}
                    name="remindBeforeMinutes"
                    render={({ field }) => {
                      return (
                        <FormItem>
                          <FormLabel>Time Before</FormLabel>
                          <Select
                            value={field.value}
                            onValueChange={field.onChange}
                            disabled={isSubmitting}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select time" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {EVENT_REMINDER_MINUTES_OPTIONS.map((option) => {
                                return (
                                  <SelectItem
                                    key={option.value}
                                    value={option.value}
                                  >
                                    {REMINDER_TIME_LABEL_MAP[option.value]}
                                  </SelectItem>
                                );
                              })}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      );
                    }}
                  />
                </div>
              ) : null}

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => {
                  return (
                    <FormItem>
                      <FormLabel>Description</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Add description"
                          className="min-h-24"
                          disabled={isSubmitting}
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  );
                }}
              />
            </div>

            <div className="px-6 py-4 border-t flex justify-end">
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting
                  ? "Saving..."
                  : isEditMode
                    ? "Update event"
                    : "Create event"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
