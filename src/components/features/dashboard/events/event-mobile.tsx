"use client";

import Heading from "@/components/ui/typography/Heading";
import { Button } from "@/components/ui/button";
import { MoreVertical } from "lucide-react";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { ChurchEvent } from "@/types";
import { formatEventDate } from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/card";
import { getEventTypeMeta } from "@/components/features/dashboard/events/constants";
import MobileHeader from "@/components/layout/mobile-header";

type Props = {
  events: ChurchEvent[];
  onCreateEvent: (date?: string) => void;
  onSelectEvent: (event: ChurchEvent) => void;
};

export default function EventsMobile({
  events,
  onCreateEvent,
  onSelectEvent,
}: Props) {
  const hasEvents = events.length > 0;

  return (
    <div className="pb-6">
      <MobileHeader title="Events" />

      <div className="px-3 pt-4 space-y-4">
        <Button className="w-full" onClick={() => onCreateEvent()}>
          Create Event
        </Button>

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
            {events.map((event) => {
              const meta = getEventTypeMeta(event.type);
              const date = formatEventDate(event.date);

              return (
                <Card
                  key={event.id}
                  className="rounded-2xl cursor-pointer"
                  onClick={() => onSelectEvent(event)}
                >
                  <CardContent className="p-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span
                        className={`w-2 h-2 rounded-full ${meta.colorClass}`}
                      />
                      <div>
                        <p className="text-sm font-medium">{event.title}</p>
                        <p className="text-xs text-muted-foreground">{date}</p>
                      </div>
                    </div>

                    <span className="text-xs text-muted-foreground">
                      {meta.label}
                    </span>
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
