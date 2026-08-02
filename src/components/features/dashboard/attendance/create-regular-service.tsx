"use client";

import { Info, Plus, Trash2, X } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Span, Text } from "@/components/ui/typography/Text";
import { convertTo12Hour } from "@/lib/utils";
import { RegularService } from "@/types";

export type PendingRegularService = {
  title: string;
  day: string;
  startTime: string;
  endTime: string;
  location?: string;
  frequency: "weekly" | "monthly";
};

type CreateRegularServiceModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreateServices: (services: PendingRegularService[]) => Promise<void>;
};

const daysOfWeek = [
  { short: "Sun", full: "Sunday" },
  { short: "Mon", full: "Monday" },
  { short: "Tue", full: "Tuesday" },
  { short: "Wed", full: "Wednesday" },
  { short: "Thurs", full: "Thursday" },
  { short: "Fri", full: "Friday" },
  { short: "Sat", full: "Saturday" },
];

const SERVICE_DAY_ENUM_MAP: Record<string, string> = {
  Sunday: "SUNDAY",
  Monday: "MONDAY",
  Tuesday: "TUESDAY",
  Wednesday: "WEDNESDAY",
  Thursday: "THURSDAY",
  Friday: "FRIDAY",
  Saturday: "SATURDAY",
};

export function CreateRegularServiceModal({
  open,
  onOpenChange,
  onCreateServices,
}: CreateRegularServiceModalProps) {
  const [services, setServices] = useState<RegularService[]>([]);
  const [showTooltip, setShowTooltip] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const [formData, setFormData] = useState<RegularService>({
    id: "",
    title: "",
    type: "REGULAR",
    day: "",
    startTime: "",
    endTime: "",
    location: "",
    frequency: "weekly",
  });

  const clearError = (field: string) => {
    setErrors((prev) => {
      if (!prev[field]) return prev;
      const next = { ...prev };
      delete next[field];
      return next;
    });
  };

  const handleDayToggle = (day: string) => {
    setFormData((prev) => ({
      ...prev,
      day,
    }));
    clearError("day");
  };

  const handleAddService = () => {
    const nextErrors: Record<string, string> = {};

    if (!formData.title.trim())
      nextErrors.title = "Please enter a service name";
    if (formData.day.length === 0)
      nextErrors.day = "Please select at least one day";
    if (!formData.startTime) nextErrors.startTime = "Please set a start time";
    if (!formData.endTime) nextErrors.endTime = "Please set an end time";
    if (
      formData.startTime &&
      formData.endTime &&
      formData.endTime <= formData.startTime
    ) {
      nextErrors.endTime = "End time must be after start time";
    }

    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      return;
    }

    setErrors({});
    setServices((prev) => [...prev, { ...formData }]);

    setFormData({
      id: "",
      title: "",
      type: "REGULAR",
      day: "",
      startTime: "",
      endTime: "",
      location: "",
      frequency: "weekly",
    });
  };

  const handleRemoveService = (index: number) => {
    setServices((prev) => prev.filter((_, i) => i !== index));
  };

  const handleCreateServices = async () => {
    if (services.length === 0) {
      return;
    }
    setIsCreating(true);
    try {
      const pending: PendingRegularService[] = [];

      for (const service of services) {
        const startTime = convertTo12Hour(service.startTime);
        const endTime = convertTo12Hour(service.endTime || "");

        // Handle both string and array cases
        const days = Array.isArray(service.day) ? service.day : [service.day];

        for (const day of days) {
          const dayEnum = SERVICE_DAY_ENUM_MAP[day];

          if (!dayEnum) {
            console.error(`Invalid day: ${day}`);
            continue;
          }

          pending.push({
            title: service.title,
            day: dayEnum,
            startTime,
            endTime,
            location: service.location || "",
            frequency: "weekly",
          });
        }
      }

      // Parent owns the actual API call(s) and the resulting toast/refetch,
      // matching the special-service and event creation flows.
      await onCreateServices(pending);

      onOpenChange(false);
      setServices([]);
      setFormData({
        id: "",
        title: "",
        type: "REGULAR",
        day: "",
        startTime: "",
        endTime: "",
        location: "",
        frequency: "weekly",
      });
    } catch (error) {
      // Parent already surfaces an error toast; keep the modal open to retry.
    } finally {
      setIsCreating(false);
    }
  };

  const handleClose = () => {
    onOpenChange(false);
    setServices([]);
    setErrors({});
    setFormData({
      id: "",
      title: "",
      type: "REGULAR",
      day: "",
      startTime: "",
      endTime: "",
      location: "",
      frequency: "weekly",
    });
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent
        showClose={false}
        mobileSheet
        className="sm:max-w-lg max-h-[90vh] overflow-y-auto max-sm:max-h-[85vh] max-sm:p-4"
      >
        <DialogHeader className="relative">
          <DialogTitle>Create Regular Service</DialogTitle>
          <DialogDescription className="sr-only">
            Create one or more weekly services by day and time.
          </DialogDescription>
          <Button
            onClick={handleClose}
            type="button"
            variant="ghost"
            size="icon"
            className="absolute right-0 top-0"
          >
            <X className="h-4 w-4" />
            <Span className="sr-only">Close</Span>
          </Button>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {showTooltip && (
            <div className="bg-primary-600 text-white text-xs p-3 rounded-lg relative">
              Specify the service name to distinguish between multiple services
              on the same day. This ensures accurate and organized attendance
              records.
              <Button
                onClick={() => setShowTooltip(false)}
                className="absolute top-2 right-2 text-white hover:text-gray-200"
              >
                <X className="h-3 w-3" />
              </Button>
            </div>
          )}

          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Label htmlFor="service-name">
                Service Name <Span className="text-destructive-600">*</Span>
              </Label>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onMouseEnter={() => setShowTooltip(true)}
                onMouseLeave={() => setShowTooltip(false)}
                className="text-primary-600"
              >
                <Info className="h-4 w-4" />
              </Button>
            </div>
            <Input
              id="service-name"
              placeholder="e.g. Sunday First Service, Sunday Second Service, Bible Study, e.t.c."
              value={formData.title}
              onChange={(e) => {
                setFormData((prev) => ({
                  ...prev,
                  title: e.target.value,
                }));
                clearError("title");
              }}
              className={errors.title ? "border-destructive-600" : ""}
            />
            {errors.title ? <Text variant="error">{errors.title}</Text> : null}
          </div>

          <div className="space-y-2">
            <div className="grid grid-cols-4 sm:grid-cols-7 gap-2">
              {daysOfWeek.map((day) => (
                <Button
                  key={day.short}
                  type="button"
                  variant={
                    formData.day.includes(day.full) ? "default" : "outline"
                  }
                  size="sm"
                  onClick={() => handleDayToggle(day.full)}
                  className="w-full"
                >
                  {day.short}
                </Button>
              ))}
            </div>
            {errors.day ? <Text variant="error">{errors.day}</Text> : null}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="start-time">
                Start Time <Span className="text-destructive-600">*</Span>
              </Label>
              <Input
                id="start-time"
                type="time"
                value={formData.startTime}
                onChange={(e) => {
                  setFormData((prev) => ({
                    ...prev,
                    startTime: e.target.value,
                  }));
                  clearError("startTime");
                }}
                className={errors.startTime ? "border-destructive-600" : ""}
              />
              {errors.startTime ? (
                <Text variant="error">{errors.startTime}</Text>
              ) : null}
            </div>
            <div className="space-y-2">
              <Label htmlFor="end-time">
                End Time <Span className="text-destructive-600">*</Span>
              </Label>
              <Input
                id="end-time"
                type="time"
                value={formData.endTime}
                onChange={(e) => {
                  setFormData((prev) => ({
                    ...prev,
                    endTime: e.target.value,
                  }));
                  clearError("endTime");
                }}
                className={errors.endTime ? "border-destructive-600" : ""}
              />
              {errors.endTime ? (
                <Text variant="error">{errors.endTime}</Text>
              ) : null}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="location">Location</Label>
            <Input
              id="location"
              placeholder="e.g. Main Auditorium"
              value={formData.location}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, location: e.target.value }))
              }
            />
          </div>

          <Button onClick={handleAddService} className="w-full" size="lg">
            <Plus className="mr-2 h-4 w-4" />
            Add Service
          </Button>

          {services.length > 0 && (
            <div className="space-y-2 pt-2">
              {services.map((service, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border"
                >
                  <div className="flex-1">
                    <Text variant="default">{service.title}</Text>
                    <Text variant="muted">
                      {service.day} - {service.startTime}
                      {service.endTime && ` - ${service.endTime}`}
                      {service.location && ` - ${service.location}`}
                    </Text>
                  </div>
                  <div className="flex items-center gap-2">
                    <Span className="text-xs bg-primary-100 text-primary-700 px-2 py-1 rounded">
                      Weekly
                    </Span>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => handleRemoveService(index)}
                      className="h-8 w-8 text-destructive-600 hover:text-destructive-700 hover:bg-destructive-50"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
          <Button
            onClick={handleCreateServices}
            variant="default"
            className="w-full"
            size="lg"
            disabled={services.length === 0 || isCreating}
          >
            {isCreating ? "Creating..." : "Create Service"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
