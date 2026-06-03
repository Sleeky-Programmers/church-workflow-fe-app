"use client";

import { useEffect, useMemo, useState } from "react";

import { getEventTypeMeta } from "@/components/features/dashboard/events/constants";
import { EventDetailModal } from "@/components/features/dashboard/events/event-detail-modal";
import { EventFormModal } from "@/components/features/dashboard/events/event-form-modal";
import EventsMobile from "@/components/features/dashboard/events/event-mobile";
import { EventsCalendar } from "@/components/features/dashboard/events/events-calendar";
import { EventsEmptyState } from "@/components/features/dashboard/events/events-empty-state";
import Heading from "@/components/ui/typography/Heading";
import { useIsMobile } from "@/hooks/use-mobile";
import { useToast } from "@/hooks/use-toast";
import { EventRecurrence, EventReminderType, EventType } from "@/lib/enums";
import {
  deleteChurchService,
  getAllChurchServices,
  getChurchServiceById,
} from "@/services/churchService";
import { ChurchEvent, ChurchService, EventFormData } from "@/types";

const EVENT_STORAGE_KEY = "dashboard:events";

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
  remindBeforeMinutes: 30,
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
  remindBeforeMinutes: event.remindBeforeMinutes,
});

// Transform API response to ChurchService type
const transformChurchService = (apiService: any): ChurchService => ({
  id: apiService._id,
  churchId: apiService.churchId,
  serviceName: apiService.serviceName,
  type: apiService.type,
  day: apiService.day,
  startTime: apiService.startTime,
  endTime: apiService.endTime,
  location: apiService.location,
  specialDays: apiService.specialDays || [],
  createdAt: apiService.createdAt,
  updatedAt: apiService.updatedAt,
});

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
      console.log({ result });
      console.log({ transformedServices });

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

  const hasEvents = useMemo(() => events.length > 0, [events]);

  const handleCreateEvent = (date?: string) => {
    setEditingEvent(null);
    setFormInitialData(createDefaultFormData(date));
    setIsFormModalOpen(true);
  };

  const handleSubmitEvent = async (payload: EventFormData) => {
    const typeMeta = getEventTypeMeta(payload.type);

    if (editingEvent) {
      setEvents((prev) =>
        prev.map((event) =>
          event.id === editingEvent.id
            ? {
                ...event,
                ...payload,
                endTime: payload.endTime || undefined,
                location: payload.location || undefined,
                description: payload.description || undefined,
                colorClass: typeMeta.colorClass,
              }
            : event,
        ),
      );
      toast({ title: "Success", description: "Event updated successfully" });
      setEditingEvent(null);
      return;
    }

    const newEvent: ChurchEvent = {
      id: `event-${Date.now()}`,
      ...payload,
      endTime: payload.endTime || undefined,
      location: payload.location || undefined,
      description: payload.description || undefined,
      colorClass: typeMeta.colorClass,
    };

    setEvents((prev) => [...prev, newEvent]);
    toast({ title: "Success", description: "Event created successfully" });
  };

  const handleSelectEvent = (event: ChurchEvent) => {
    setSelectedEvent(event);
    setIsDetailModalOpen(true);
  };

  const handleDeleteEvent = async (eventId: string) => {
    // Check if this is a church service (has MongoDB _id format) or custom event (has "event-" prefix)
    const isChurchService =
      !eventId.startsWith("event-") && eventId.length > 12;

    if (isChurchService) {
      try {
        // Call backend to delete church service
        await deleteChurchService(eventId);

        // Refetch church services to update the list
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
      // Delete custom event from localStorage
      setEvents((prev) => prev.filter((event) => event.id !== eventId));
      toast({
        title: "Deleted",
        description: "Event deleted successfully",
      });
    }

    // Close modal and clear selected event
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
