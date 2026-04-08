"use client";

import { useEffect, useMemo, useState } from "react";
import { EventRecurrence, EventReminderType, EventType } from "@/lib/enums";
import { useToast } from "@/hooks/use-toast";
import { ChurchEvent, EventFormData } from "@/types";
import Heading from "@/components/ui/typography/Heading";
import { EventDetailModal } from "@/components/features/dashboard/events/event-detail-modal";
import { EventFormModal } from "@/components/features/dashboard/events/event-form-modal";
import { EventsCalendar } from "@/components/features/dashboard/events/events-calendar";
import { EventsEmptyState } from "@/components/features/dashboard/events/events-empty-state";
import { getEventTypeMeta } from "@/components/features/dashboard/events/constants";
import { useIsMobile } from "@/hooks/use-mobile";
import EventsMobile from "@/components/features/dashboard/events/event-mobile";

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

export default function EventsPage() {
  const { toast } = useToast();
  const [events, setEvents] = useState<ChurchEvent[]>([]);
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<ChurchEvent | null>(null);
  const [editingEvent, setEditingEvent] = useState<ChurchEvent | null>(null);
  const [formInitialData, setFormInitialData] = useState<EventFormData | null>(
    null,
  );
  const isMobile = useIsMobile();
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

  const handleSubmitEvent = (payload: EventFormData) => {
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

  const handleDeleteEvent = (eventId: string) => {
    setEvents((prev) => prev.filter((event) => event.id !== eventId));
    setIsDetailModalOpen(false);
    setSelectedEvent(null);
    toast({ title: "Deleted", description: "Event deleted successfully" });
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
        </div>
      </div>

      <div className="p-6">
        {hasEvents ? (
          <EventsCalendar
            events={events}
            onCreateEvent={handleCreateEvent}
            onSelectEvent={handleSelectEvent}
          />
        ) : (
          <EventsEmptyState onCreateEvent={() => handleCreateEvent()} />
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
