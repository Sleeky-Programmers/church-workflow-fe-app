"use client";

import { Button } from "@/components/ui/button";
import { Span } from "@/components/ui/typography/Text";
import { getAttendanceCount } from "@/lib/utils";
import { RegularService } from "@/types";
import { ChevronRight } from "lucide-react";

type ServiceItemProps = {
  service: RegularService;
  date: string;
  onAddAttendance: () => void;
  onAddGivingRecord: () => void;
};

export function ServiceItem({
  service,
  date,
  onAddAttendance,
  onAddGivingRecord,
}: ServiceItemProps) {
  const attendanceCount = getAttendanceCount(service, date);
  const hasAttendance = attendanceCount !== null;

  return (
    <div className="text-xs mb-2 p-2 bg-gray-50 rounded hover:bg-gray-100 transition-colors">
      <div className="font-semibold text-gray-900 mb-1 truncate">
        {service.serviceName}
      </div>

      {hasAttendance ? (
        <Button
          onClick={onAddAttendance}
          className="flex items-center gap-1 text-secondary-600 hover:text-secondary-700 w-full mb-1"
        >
          <Span className="h-1.5 w-1.5 bg-secondary-600 rounded-full flex-shrink-0" />
          <Span className="truncate">{attendanceCount} members</Span>
          <ChevronRight className="h-3 w-3 ml-auto flex-shrink-0" />
        </Button>
      ) : (
        <Button
          onClick={onAddAttendance}
          className="flex items-center gap-1 text-secondary-600 hover:text-secondary-700 w-full mb-1"
        >
          <Span className="h-1.5 w-1.5 bg-secondary-600 rounded-full flex-shrink-0" />
          <Span className="truncate">Add attendance</Span>
          <ChevronRight className="h-3 w-3 ml-auto flex-shrink-0" />
        </Button>
      )}

      <Button
        onClick={onAddGivingRecord}
        className="flex items-center gap-1 text-success-600 hover:text-success-700 w-full"
      >
        <Span className="h-1.5 w-1.5 bg-success-600 rounded-full flex-shrink-0" />
        <Span className="truncate">Add giving record</Span>
        <ChevronRight className="h-3 w-3 ml-auto flex-shrink-0" />
      </Button>
    </div>
  );
}
