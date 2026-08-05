"use client";

import { useEffect, useState } from "react";

import { getEventTypeMeta } from "@/components/features/dashboard/events/constants";
import { EventDetailModal } from "@/components/features/dashboard/events/event-detail-modal";
import { EventFormModal } from "@/components/features/dashboard/events/event-form-modal";
import EventsMobile from "@/components/features/dashboard/events/event-mobile";
import { EventsCalendar } from "@/components/features/dashboard/events/events-calendar";
import Heading from "@/components/ui/typography/Heading";
import { useIsMobile } from "@/hooks/use-mobile";
import { useToast } from "@/hooks/use-toast";
import { EventRecurrence, EventReminderType, EventType } from "@/lib/enums";
import {
  createChurchService,
  CreateChurchServiceDto,
  DAY,
  deleteChurchService,
  getAllChurchServices,
  updateChurchService,
  UpdateChurchServiceDto,
} from "@/services/churchService";
import {
  ChurchEvent,
  ChurchService,
  EventFormData,
  ReminderTimeBefore,
} from "@/types";
import { convertTo12HourFormat } from "@/utils/helpers";

const EVENT_STORAGE_KEY = "dashboard:events";

// Helper to convert ReminderTimeBefore enum to number for storage
const mapReminderTimeToNumber = (value: ReminderTimeBefore): number => {
  const mapping: Record<ReminderTimeBefore, number> = {
    [ReminderTimeBefore.MINUTES_30]: 30,
    [ReminderTimeBefore.HOUR_1]: 60,
  };
  return mapping[value] || 30;
};

// Helper to convert number to ReminderTimeBefore enum for form editing
const mapNumberToReminderTime = (value: number): ReminderTimeBefore => {
  const mapping: Record<number, ReminderTimeBefore> = {
    30: ReminderTimeBefore.MINUTES_30,
    60: ReminderTimeBefore.HOUR_1,
  };
  return mapping[value] || ReminderTimeBefore.MINUTES_30;
};

const createDefaultFormData = (date = ""): EventFormData => ({
  title: "",
  type: EventType.WORSHIP_SERVICE,
  recurrence: EventRecurrence.NONE,
  date,
  startTime: "",
  endTime: "",
  location: "",
  description: "",
  sendReminder: true,
  reminderType: EventReminderType.IN_APP,
  remindBeforeMinutes: ReminderTimeBefore.MINUTES_30,
});

const toFormData = (event: ChurchEvent): EventFormData => ({
  title: event.title,
  type: event.type,
  recurrence: event.recurrence,
  date: event.date,
  startTime: event.startTime,
  endTime: event.endTime || "",
  location: event.location || "",
  description: event.description || "",
  sendReminder: event.sendReminder,
  reminderType: event.reminderType,
  remindBeforeMinutes: mapNumberToReminderTime(event.remindBeforeMinutes), // Convert number to enum
});

// Transform API response to ChurchService type
const transformChurchService = (apiService: any): ChurchService => ({
  id: apiService._id,
  churchId: apiService.churchId,
  title: apiService.title,
  type: apiService.type,
  day: apiService.day,
  startTime: apiService.startTime,
  endTime: apiService.endTime,
  location: apiService.location,
  specialDays: apiService.specialDays || [],
  createdAt: apiService.createdAt,
  updatedAt: apiService.updatedAt,
});

// Helper to map form data to API DTO
const mapFormDataToApiDto = (
  payload: EventFormData,
  isSpecial: boolean = false,
): CreateChurchServiceDto => {
  const baseDto: CreateChurchServiceDto = {
    title: payload.title,
    type: isSpecial ? "SPECIAL" : "REGULAR",
    startTime: payload.startTime
      ? convertTo12HourFormat(payload.startTime)
      : undefined,
    endTime: payload.endTime
      ? convertTo12HourFormat(payload.endTime)
      : undefined,
    location: payload.location || undefined,
    description: payload.description || undefined,
    eventType: payload.type as any,
    reminderEnabled: payload.sendReminder,
    reminderType: payload.reminderType as any,
    reminderTimeBefore: payload.remindBeforeMinutes, // Send enum directly to backend
  };

  if (isSpecial) {
    baseDto.startDate = payload.date;
  } else {
    // For REGULAR services - handle all recurrence types including SUNDAY
    switch (payload.recurrence) {
      case EventRecurrence.SUNDAY:
        baseDto.day = "SUNDAY";
        baseDto.recurrence = "SUNDAY";
        break;
      case EventRecurrence.WEEKLY:
        baseDto.recurrence = "WEEKLY_MONDAY";
        break;
      case EventRecurrence.NONE:
        baseDto.recurrence = "NO_REPEAT";
        break;
      case EventRecurrence.DAILY:
        baseDto.recurrence = "DAILY";
        break;
      case EventRecurrence.MONTHLY:
        baseDto.recurrence = "MONTHLY_FIRST_MONDAY";
        break;
      case EventRecurrence.YEARLY:
        baseDto.recurrence = "ANNUALLY";
        break;
      case EventRecurrence.WEEKDAYS:
        baseDto.recurrence = "WEEKDAYS";
        break;
      default:
        baseDto.recurrence = "NO_REPEAT";
        break;
    }

    // The backend requires `day` for every REGULAR service. Default it to
    // the selected date's weekday whenever the recurrence choice doesn't
    // already imply one (e.g. "Weekly on Sunday" always means SUNDAY).
    if (!baseDto.day && payload.date) {
      const dateObj = new Date(payload.date);
      baseDto.day = dateObj
        .toLocaleDateString("en-US", { weekday: "long" })
        .toUpperCase() as DAY;
    }
  }

  return baseDto;
};

export default function EventsPage() {
  const { toast } = useToast();
  const [events, setEvents] = useState<ChurchEvent[]>([]);
  const [churchServices, setChurchServices] = useState<ChurchService[]>([]);
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<ChurchEvent | null>(null);
  const [editingEvent, setEditingEvent] = useState<ChurchEvent | null>(null);
  const [formInitialData, setFormInitialData] = useState<EventFormData | null>(
    null,
  );
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    itemCount: 0,
    totalPages: 1,
  });
  const isMobile = useIsMobile();

  // Fetch church services from API
  const fetchChurchServices = async (page = 1, limit = 20) => {
    try {
      setLoading(true);
      const response = await getAllChurchServices({ page, limit });
      const result = response as any;
      const transformedServices = (result.data || []).map(
        transformChurchService,
      );
      setChurchServices(transformedServices);

      if (result.pagination) {
        setPagination(result.pagination);
      }
    } catch (error) {
      console.error("Failed to fetch church services:", error);
      toast({
        title: "Error",
        description: "Failed to load church services",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Load events from localStorage
  useEffect(() => {
    if (typeof window === "undefined") return;

    try {
      const stored = window.localStorage.getItem(EVENT_STORAGE_KEY);
      if (!stored) return;
      const parsed = JSON.parse(stored) as ChurchEvent[];
      if (Array.isArray(parsed)) {
        setEvents(parsed);
      }
    } catch {
      setEvents([]);
    }
  }, []);

  // Fetch church services on component mount
  useEffect(() => {
    fetchChurchServices();
  }, []);

  // Save events to localStorage
  useEffect(() => {
    if (typeof window === "undefined") return;
    window.localStorage.setItem(EVENT_STORAGE_KEY, JSON.stringify(events));
  }, [events]);

  const handleCreateEvent = (date?: string) => {
    setEditingEvent(null);
    setFormInitialData(createDefaultFormData(date));
    setIsFormModalOpen(true);
  };

  const handleSubmitEvent = async (payload: EventFormData) => {
    const typeMeta = getEventTypeMeta(payload.type);
    setSubmitting(true);

    try {
      const isChurchService =
        editingEvent?.id &&
        !editingEvent.id.startsWith("event-") &&
        editingEvent.id.length > 12;

      if (isChurchService && editingEvent) {
        // UPDATE existing church service
        const updateData: UpdateChurchServiceDto = {
          title: payload.title,
          type: "REGULAR",
          startTime: payload.startTime
            ? convertTo12HourFormat(payload.startTime)
            : undefined,
          endTime: payload.endTime
            ? convertTo12HourFormat(payload.endTime)
            : undefined,
          location: payload.location || undefined,
          description: payload.description || undefined,
          eventType: payload.type as any,
          reminderEnabled: payload.sendReminder,
          reminderType: payload.reminderType as any,
          reminderTimeBefore: payload.remindBeforeMinutes, // Send enum to backend
        };

        // Handle recurrence and day mapping for updates
        switch (payload.recurrence) {
          case EventRecurrence.SUNDAY:
            updateData.day = "SUNDAY";
            updateData.recurrence = "SUNDAY";
            break;
          case EventRecurrence.WEEKLY:
            updateData.recurrence = "WEEKLY_MONDAY";
            break;
          case EventRecurrence.NONE:
            updateData.recurrence = "NO_REPEAT";
            break;
          case EventRecurrence.DAILY:
            updateData.recurrence = "DAILY";
            break;
          case EventRecurrence.MONTHLY:
            updateData.recurrence = "MONTHLY_FIRST_MONDAY";
            break;
          case EventRecurrence.YEARLY:
            updateData.recurrence = "ANNUALLY";
            break;
          case EventRecurrence.WEEKDAYS:
            updateData.recurrence = "WEEKDAYS";
            break;
          default:
            updateData.recurrence = "NO_REPEAT";
            break;
        }

        // Same as create: `day` is required for REGULAR services, so default
        // it to the selected date's weekday when the recurrence doesn't imply one.
        if (!updateData.day && payload.date) {
          const dateObj = new Date(payload.date);
          updateData.day = dateObj
            .toLocaleDateString("en-US", { weekday: "long" })
            .toUpperCase() as DAY;
        }

        await updateChurchService(editingEvent.id, updateData);
        await fetchChurchServices(pagination.page, pagination.limit);

        toast({
          title: "Success",
          description: "Church service updated successfully",
        });
        setEditingEvent(null);
        setIsFormModalOpen(false);
        return;
      }

      // CREATE new church service
      const createData = mapFormDataToApiDto(payload);
      await createChurchService(createData);

      await fetchChurchServices(pagination.page, pagination.limit);

      // Create new event with proper type conversion
      const newEvent: ChurchEvent = {
        id: `event-${Date.now()}`,
        title: payload.title,
        type: payload.type,
        recurrence: payload.recurrence,
        date: payload.date,
        startTime: payload.startTime,
        endTime: payload.endTime || undefined,
        location: payload.location || undefined,
        description: payload.description || undefined,
        sendReminder: payload.sendReminder,
        reminderType: payload.reminderType,
        remindBeforeMinutes: mapReminderTimeToNumber(
          payload.remindBeforeMinutes,
        ), // Convert enum to number for storage
        colorClass: typeMeta.colorClass,
      };

      setEvents((prev) => [...prev, newEvent]);

      toast({
        title: "Success",
        description: "Event created successfully",
      });
      setIsFormModalOpen(false);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error?.message || "Failed to save event",
        variant: "destructive",
      });
      throw error;
    } finally {
      setSubmitting(false);
    }
  };

  const handleSelectEvent = (event: ChurchEvent) => {
    setSelectedEvent(event);
    setIsDetailModalOpen(true);
  };

  const handleDeleteEvent = async (eventId: string) => {
    const isChurchService =
      !eventId.startsWith("event-") && eventId.length > 12;

    if (isChurchService) {
      try {
        await deleteChurchService(eventId);
        await fetchChurchServices(pagination.page, pagination.limit);

        toast({
          title: "Success",
          description: "Church service deleted successfully",
        });
      } catch (error) {
        console.error("Failed to delete church service:", error);
        toast({
          title: "Error",
          description: "Failed to delete church service",
          variant: "destructive",
        });
        return;
      }
    } else {
      setEvents((prev) => prev.filter((event) => event.id !== eventId));
      toast({
        title: "Deleted",
        description: "Event deleted successfully",
      });
    }

    setIsDetailModalOpen(false);
    setSelectedEvent(null);
  };

  const handleEditEvent = (event: ChurchEvent) => {
    setEditingEvent(event);
    setFormInitialData(toFormData(event));
    setIsDetailModalOpen(false);
    setIsFormModalOpen(true);
  };

  if (isMobile) {
    return (
      <>
        <EventsMobile
          events={events}
          churchServices={churchServices}
          onCreateEvent={handleCreateEvent}
          onSelectEvent={handleSelectEvent}
        />

        <EventFormModal
          open={isFormModalOpen}
          onOpenChange={setIsFormModalOpen}
          onSubmit={handleSubmitEvent}
          initialData={formInitialData}
          isSubmitting={submitting}
          isEditMode={Boolean(editingEvent)}
        />

        <EventDetailModal
          open={isDetailModalOpen}
          event={selectedEvent}
          onOpenChange={setIsDetailModalOpen}
          onDelete={handleDeleteEvent}
          onEdit={handleEditEvent}
        />
      </>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b">
        <div className="px-6 py-4 flex items-center justify-between">
          <Heading level={2}>Events &amp; Reminders</Heading>
          {!loading && churchServices.length > 0 && (
            <div className="text-sm text-gray-500">
              {pagination.itemCount || churchServices.length} church services
              available
            </div>
          )}
        </div>
      </div>

      <div className="p-6">
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="text-gray-500">Loading church services...</div>
          </div>
        ) : (
          <EventsCalendar
            events={events}
            churchServices={churchServices}
            onCreateEvent={handleCreateEvent}
            onSelectEvent={handleSelectEvent}
          />
        )}
      </div>

      <EventFormModal
        open={isFormModalOpen}
        onOpenChange={setIsFormModalOpen}
        onSubmit={handleSubmitEvent}
        initialData={formInitialData}
        isSubmitting={submitting}
        isEditMode={Boolean(editingEvent)}
      />

      <EventDetailModal
        open={isDetailModalOpen}
        event={selectedEvent}
        onOpenChange={setIsDetailModalOpen}
        onDelete={handleDeleteEvent}
        onEdit={handleEditEvent}
      />
    </div>
  );
}
