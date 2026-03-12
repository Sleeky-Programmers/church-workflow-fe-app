"use client";

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { TeamRow } from "@/types";
import Heading from "@/components/ui/typography/Heading";
import { Text } from "@/components/ui/typography/Text";
import { Users, CalendarCheck, BarChart3, Trash2, X, User } from "lucide-react";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  team: TeamRow | null;
  onManage: () => void;
  onMarkAttendance: () => void;
  onViewReport: () => void;
  onDelete: () => void;
}

export default function TeamActionsSheet({
  open,
  onOpenChange,
  team,
  onManage,
  onMarkAttendance,
  onViewReport,
  onDelete,
}: Props) {
  if (!team) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        showClose={false}
        mobileSheet
        className="w-full max-w-[520px] p-0 overflow-hidden max-sm:max-h-[88vh]"
      >
        <div className="rounded-xl shadow-lg w-full flex flex-col overflow-hidden bg-gray-50">
          <div className="flex items-center justify-between border-b px-4 py-3">
            <Heading level={3}>{team.name}</Heading>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onOpenChange(false)}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>

          <div className="p-4 space-y-3">
            <div className="rounded-lg border bg-white px-3 py-2 flex items-center gap-3">
              <User className="h-4 w-4 text-gray-500" />
              <div>
                <Text variant="muted" className="text-xs">
                  Team Lead
                </Text>
                <Text variant="default">{team.leader?.name || "Not set"}</Text>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div className="rounded-lg border bg-white px-3 py-2">
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-gray-500" />
                  <Text variant="muted" className="text-xs">
                    Members
                  </Text>
                </div>
                <Text variant="default" className="mt-1">
                  {team.members}
                </Text>
              </div>
              <div className="rounded-lg border bg-white px-3 py-2">
                <div className="flex items-center gap-2">
                  <BarChart3 className="h-4 w-4 text-gray-500" />
                  <Text variant="muted" className="text-xs">
                    Status
                  </Text>
                </div>
                <Text variant="default" className="mt-1">
                  {team.status}
                </Text>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <Button
                variant="outline"
                className="justify-start gap-2"
                onClick={onManage}
              >
                <Users className="h-4 w-4" />
                Manage Members
              </Button>
              <Button
                variant="outline"
                className="justify-start gap-2"
                onClick={onMarkAttendance}
              >
                <CalendarCheck className="h-4 w-4" />
                Mark Attendance
              </Button>
            </div>

            <Button
              variant="outline"
              className="w-full justify-center gap-2"
              onClick={onViewReport}
            >
              <BarChart3 className="h-4 w-4" />
              View Reports
            </Button>
            <Button
              variant="destructive"
              className="w-full justify-center gap-2"
              onClick={onDelete}
            >
              <Trash2 className="h-4 w-4" />
              Delete Team
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
