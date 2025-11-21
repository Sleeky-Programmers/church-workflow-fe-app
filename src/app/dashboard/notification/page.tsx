import { Button } from "@/components/ui/button";
import { Span, Text } from "@/components/ui/typography/Text";
import { NotificationData } from "@/lib/data";
import { NotificationTypes } from "@/types";
import { ChevronDown } from "lucide-react";

export default function Notification() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <Text text="Notification" />
        </div>

        <div className="flex items-center justify-end gap-2">
          <Button variant="ghost" className="hidden sm:flex items-center gap-2">
            Filter
            <ChevronDown className="w-4 h-4" />
          </Button>
          <Button>Mark all as read</Button>
        </div>
      </div>

      <div className="flex flex-col gap-3">
        {NotificationData.map((notification: NotificationTypes, index: number) => {
          const Icon = notification.icon as any;
          return (
            <div
              key={index}
              className={`flex items-center gap-4 p-3 rounded-lg transition-colors ease-linear cursor-pointer ${
                !notification.isRead ? "bg-sky-50" : "hover:bg-gray-50"
              }`}
            >
              <div className="flex items-start">
                <Span className={`block mt-2 w-2 h-2 rounded-full ${!notification.isRead ? "bg-sky-500" : "bg-transparent"}`} />
              </div>

              <div className="flex items-center gap-3 min-w-0 w-full">
                <div className={`flex items-center justify-center w-10 h-10 rounded-md ${notification.iconBg} ${notification.iconColor}`}>
                  <Icon className="w-5 h-5" />
                </div>

                <div className="flex items-center gap-4 min-w-0 w-full">
                  <div className="w-44 text-sm font-medium truncate">{notification.title}</div>
                  <div className="text-sm text-gray-600 truncate">{notification.description}</div>
                </div>
              </div>

              <div className="ml-auto text-xs text-gray-400 flex-shrink-0 whitespace-nowrap">{notification.date}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
