"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Span, Text } from "@/components/ui/typography/Text";
import Heading from "@/components/ui/typography/Heading";
import { NotificationData } from "@/lib/data";
import { NotificationTypes } from "@/types";
import { ChevronDown } from "lucide-react";

type FilterType = "all" | "unread" | "read";

export default function Notification() {
  const [notifications, setNotifications] =
    useState<NotificationTypes[]>(NotificationData);

  const [filter, setFilter] = useState<FilterType>("all");

  const filteredNotifications = notifications.filter((n) => {
    if (filter === "unread") return !n.isRead;
    if (filter === "read") return n.isRead;
    return true;
  });

  const markAllAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
  };

  return (
    <div className="space-y-6">
      <div className="flex md:items-center justify-between md:flex-row flex-col items-start mb-6">
        <Heading level={1} text="Notifications" />

        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            className="hidden sm:flex items-center gap-2"
            onClick={() =>
              setFilter(
                filter === "all"
                  ? "unread"
                  : filter === "unread"
                    ? "read"
                    : "all",
              )
            }
          >
            {filter === "all" ? "All" : filter === "unread" ? "Unread" : "Read"}
            <ChevronDown className="w-4 h-4" />
          </Button>

          <Button onClick={markAllAsRead}>Mark all as read</Button>
        </div>
      </div>

      <div className="flex flex-col gap-2 w-full">
        {filteredNotifications.map(
          (notification: NotificationTypes, index: number) => {
            const Icon = notification.icon;

            return (
              <div
                key={index}
                className={`flex items-center gap-4 p-3 rounded-lg cursor-pointer transition-colors
                  hover:bg-sky-50
                `}
              >
                <Span
                  className={`mt-2 w-2 h-2 rounded-full ${
                    notification.isRead ? "bg-transparent" : "bg-sky-500"
                  }`}
                />

                <div
                  className={`flex items-center justify-center w-10 h-10 rounded-md
                    ${notification.iconBg} ${notification.iconColor}`}
                >
                  <Icon className="w-5 h-5" />
                </div>

                <div className="flex items-center gap-6 min-w-0 flex-1">
                  <div className="flex-shrink-0 w-48">
                    <Text
                      className={`text-sm truncate ${
                        notification.isRead
                          ? "font-normal text-gray-700"
                          : "font-semibold text-gray-900"
                      }`}
                    >
                      {notification.title}
                    </Text>
                  </div>

                  <div className="flex-1 min-w-0">
                    <Text variant="muted" className="truncate">
                      {notification.description}
                    </Text>
                  </div>

                  <div className="flex-shrink-0 text-xs text-gray-400 whitespace-nowrap">
                    {notification.date}
                  </div>
                </div>
              </div>
            );
          },
        )}
      </div>
    </div>
  );
}
