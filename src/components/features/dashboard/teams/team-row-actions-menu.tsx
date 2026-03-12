"use client";

import { useEffect, useRef, useState } from "react";
import {
  MoreVertical,
  Pencil,
  Users,
  CalendarCheck,
  BarChart3,
  Trash2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { TeamRow } from "@/types";
import { Text } from "@/components/ui/typography/Text";

interface TeamRowActionsMenuProps {
  row: TeamRow;
  onEdit: (row: TeamRow) => void;
  onManageMembers: (row: TeamRow) => void;
  onMarkAttendance: (row: TeamRow) => void;
  onViewReport: (row: TeamRow) => void;
  onDeleteRequest: (row: TeamRow) => void;
}

export default function TeamRowActionsMenu({
  row,
  onEdit,
  onManageMembers,
  onMarkAttendance,
  onViewReport,
  onDeleteRequest,
}: TeamRowActionsMenuProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;

    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [open]);

  return (
    <div className="relative inline-block" ref={ref}>
      <Button
        variant="ghost"
        size="icon"
        onClick={(e) => {
          e.stopPropagation();
          setOpen((prev) => !prev);
        }}
      >
        <MoreVertical className="h-4 w-4 text-gray-500" />
      </Button>

      {open && (
        <div
          className="absolute right-0 top-9 z-50 text-right rounded-xl border border-gray-100 bg-gray-50 py-1 shadow-lg min-w-[180px]"
          onClick={(e) => e.stopPropagation()}
        >
          <Button
            variant="ghost"
            className="justify-start gap-2 px-3 w-full"
            onClick={() => {
              onEdit(row);
              setOpen(false);
            }}
          >
            <Pencil className="h-4 w-4" />
            <Text variant="default">Edit Team</Text>
          </Button>
          <Button
            variant="ghost"
            className="justify-start gap-2 px-3 w-full"
            onClick={() => {
              onManageMembers(row);
              setOpen(false);
            }}
          >
            <Users className="h-4 w-4" />
            <Text variant="default">Manage Members</Text>
          </Button>
          <Button
            variant="ghost"
            className="justify-start gap-2 px-3 w-full"
            onClick={() => {
              onMarkAttendance(row);
              setOpen(false);
            }}
          >
            <CalendarCheck className="h-4 w-4" />
            <Text variant="default">Mark Attendance</Text>
          </Button>
          <Button
            variant="ghost"
            className="justify-start gap-2 px-3 w-full"
            onClick={() => {
              onViewReport(row);
              setOpen(false);
            }}
          >
            <BarChart3 className="h-4 w-4" />
            <Text variant="default">View Report</Text>
          </Button>
          <Button
            variant="ghost"
            className="justify-start gap-2 px-3 w-full"
            onClick={() => {
              onDeleteRequest(row);
              setOpen(false);
            }}
          >
            <Trash2 className="h-4 w-4 text-destructive-600" />
            <Text variant="error">Delete Team</Text>
          </Button>
        </div>
      )}
    </div>
  );
}
