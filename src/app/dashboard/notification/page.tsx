import { Button } from "@/components/ui/button";
import { Text } from "@/components/ui/typography/Text";
import {
  CheckCircle,
  FileText,
  DollarSign,
  UserPlus,
  Gift,
  Tag,
  ChevronDown,
} from "lucide-react";

export default function Notification() {
  const notificationData = [
    {
      icon: CheckCircle,
      title: "Requisition Approved by HOD",
      description: "Sound system upgrade request was approved",
      date: "Just Now",
      isRead: false,
      iconBg: "bg-green-100",
      iconColor: "text-green-700",
    },
    {
      icon: FileText,
      title: "Offering Report Ready - March 2025",
      description: "Total ₦380,000 collected across 3 branches",
      date: "30 mins ago",
      isRead: false,
      iconBg: "bg-orange-100",
      iconColor: "text-orange-600",
    },
    {
      icon: DollarSign,
      title: "Salary Payment Successful",
      description: "Salaries for 6 staff members completed",
      date: "1 hour ago",
      isRead: false,
      iconBg: "bg-emerald-100",
      iconColor: "text-emerald-700",
    },
    {
      icon: UserPlus,
      title: "New Member Registered",
      description: "Gloria Samuel added to Youth Church",
      date: "8 hours ago",
      isRead: false,
      iconBg: "bg-blue-100",
      iconColor: "text-blue-700",
    },
    {
      icon: Gift,
      title: "Upcoming Birthday: Ade Samuel",
      description: "Birthday is tomorrow - May 16",
      date: "1 day ago",
      isRead: false,
      iconBg: "bg-rose-100",
      iconColor: "text-rose-600",
    },
    {
      icon: Tag,
      title: "Subscription Expiring in 3 Days",
      description: "Current plan will expire on May 18",
      date: "30 days ago",
      isRead: false,
      iconBg: "bg-violet-100",
      iconColor: "text-violet-700",
    },
  ];

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
        {notificationData.map((notification, index) => {
          const Icon = notification.icon as any;
          return (
            <div
              key={index}
              className={`flex items-center gap-4 p-3 rounded-lg transition-colors ease-linear cursor-pointer ${
                !notification.isRead ? "bg-sky-50" : "hover:bg-gray-50"
              }`}
            >
              {/* left dot */}
              <div className="flex items-start">
                <span className={`block mt-2 w-2 h-2 rounded-full ${!notification.isRead ? "bg-sky-500" : "bg-transparent"}`} />
              </div>

              {/* icon + text: title and description horizontally */}
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
