"use client";

import { Bell } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

import { Loader } from "@/components/ui/loader";
import Heading from "@/components/ui/typography/Heading";
import { Span, Text } from "@/components/ui/typography/Text";
import { fetchNotifications } from "@/lib/api";
import { notificationConfig } from "@/lib/utils";
import { ApiNotification } from "@/types";

export function RecentActivityWidget() {
  const [notifications, setNotifications] = useState<ApiNotification[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchNotifications()
      .then((res) => setNotifications((res.data || []).slice(0, 5)))
      .catch(() => setNotifications([]))
      .finally(() => setIsLoading(false));
  }, []);

  return (
    <div
      className="bg-white rounded-2xl border border-gray-300 p-5
                 shadow-[0_1px_4px_rgba(0,0,0,0.06)] flex flex-col h-full"
    >
      <div className="flex items-center justify-between mb-4">
        <Heading level={4}>Recent Activity</Heading>
        <Bell className="w-[18px] h-[18px] text-primary-400 shrink-0" />
      </div>

      <div className="flex-1">
        {isLoading ? (
          <div className="flex items-center justify-center py-6">
            <Loader size="w-6 h-6" showShadow={false} />
          </div>
        ) : notifications.length === 0 ? (
          <Text variant="muted" className="text-sm">
            No recent activity yet.
          </Text>
        ) : (
          <div className="space-y-3">
            {notifications.map((notification) => {
              const meta = notificationConfig[notification.type];
              const Icon = meta.icon;

              return (
                <div key={notification._id} className="flex items-center gap-3">
                  <div
                    className={`flex items-center justify-center w-8 h-8 rounded-md shrink-0 ${meta.background} ${meta.color}`}
                  >
                    <Icon className="w-4 h-4" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <Text className="text-sm font-medium truncate">
                      {notification.title}
                    </Text>
                    <Span variant="muted" className="text-xs truncate block">
                      {notification.body}
                    </Span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <Link
        href="/dashboard/activity-log"
        className="text-sm text-primary-600 hover:underline mt-4"
      >
        View all
      </Link>
    </div>
  );
}
