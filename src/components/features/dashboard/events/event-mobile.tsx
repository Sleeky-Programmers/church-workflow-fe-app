"use client";

import { useState } from "react";

import { getEventTypeMeta } from "@/components/features/dashboard/events/constants";
import MobileHeader from "@/components/layout/mobile-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import Heading from "@/components/ui/typography/Heading";
import { EventRecurrence, EventReminderType, EventType } from "@/lib/enums";
import { formatDateSafely } from "@/lib/utils";
import { ChurchEvent, ChurchService } from "@/types";

type Props = {
  events: ChurchEvent[];
  churchServices?: ChurchService[];
  onCreateEvent: (date?: string) => void;
  onSelectEvent: (event: ChurchEvent) => void;
};

// Helper to convert church service to event format for display
const convertChurchServiceToEvent = (service: ChurchService): ChurchEvent => {
  return {
    id: service.id,
    title: service.title,
    type: EventType.WORSHIP_SERVICE,
    recurrence: EventRecurrence.WEEKLY,
    date: new Date().toISOString().split("T")[0],
    startTime: service.startTime,
    endTime: service.endTime,
    location: service.location,
    description: `${service.type} service on ${service.day}s`,
    sendReminder: true,
    reminderType: EventReminderType.IN_APP,
    remindBeforeMinutes: 30,
    colorClass: "bg-blue-500",
  };
};

export default function EventsMobile({
  events,
  churchServices = [],
  onCreateEvent,
  onSelectEvent,
}: Props) {
  const [showChurchServices, setShowChurchServices] = useState(true);

  // Combine events and church services
  const allEvents = showChurchServices
    ? [...events, ...churchServices.map(convertChurchServiceToEvent)]
    : events;

  const hasEvents = allEvents.length > 0;

  return (
    <div className="pb-6">
      <MobileHeader title="Events" />

      <div className="px-3 pt-4 space-y-4">
        <div className="flex gap-2">
          <Button className="flex-1" onClick={() => onCreateEvent()}>
            Create Event
          </Button>

          {churchServices.length > 0 && (
            <Button
              variant={showChurchServices ? "default" : "outline"}
              onClick={() => setShowChurchServices(!showChurchServices)}
              className="flex-1"
            >
              {showChurchServices ? "Hide Services" : "Show Services"}
            </Button>
          )}
        </div>

        {!hasEvents ? (
          <Card className="rounded-2xl">
            <CardContent className="p-6 text-center">
              <Heading level={4} text="No Events Yet" />
              <p className="text-sm text-muted-foreground mt-1">
                Create your first event to get started
              </p>

              <Button className="mt-4" onClick={() => onCreateEvent()}>
                Create Event
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {allEvents.map((event) => {
              const meta = getEventTypeMeta(event.type);
              const date = formatDateSafely(event.date);

              // Check if this is a church service (by ID format or property)
              const isChurchService =
                event.id.startsWith("69ee") || event.id.length === 24;

              return (
                <Card
                  key={event.id}
                  className="rounded-2xl cursor-pointer hover:shadow-md transition-shadow"
                  onClick={() => onSelectEvent(event)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-3">
                        <span
                          className={`w-2 h-2 rounded-full ${meta.colorClass}`}
                        />
                        <p className="text-sm font-medium">{event.title}</p>
                      </div>
                      <span className="text-xs text-muted-foreground">
                        {meta.label}
                      </span>
                    </div>

                    <div className="pl-5">
                      <p className="text-xs text-muted-foreground">{date}</p>
                      {event.location && (
                        <p className="text-xs text-muted-foreground mt-1">
                          📍 {event.location}
                        </p>
                      )}
                      {event.startTime && (
                        <p className="text-xs text-muted-foreground mt-1">
                          🕒 {event.startTime}{" "}
                          {event.endTime ? `- ${event.endTime}` : ""}
                        </p>
                      )}
                      {isChurchService && (
                        <p className="text-xs text-blue-600 mt-1">
                          Regular Church Service
                        </p>
                      )}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
