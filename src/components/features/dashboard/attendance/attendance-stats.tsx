"use client";

import { CheckCircle2, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Member } from "@/types";
import { calculateGenderSplit } from "@/lib/utils";
import Heading from "@/components/ui/typography/Heading";
import { Text } from "@/components/ui/typography/Text";

type AttendanceStatsViewProps = {
  presentMembers: Member[];
  absentMembers: Member[];
  isMembersLoaded: boolean;
  isAttendanceMarked: boolean;
  onLoadMembers: () => void;
};

export function AttendanceStatsView({
  presentMembers,
  absentMembers,
  isMembersLoaded,
  isAttendanceMarked,
  onLoadMembers,
}: AttendanceStatsViewProps) {
  const presentIds = presentMembers.map((m) => m.id);
  const absentIds = absentMembers.map((m) => m.id);

  const presentSplit = calculateGenderSplit(presentIds);
  const absentSplit = calculateGenderSplit(absentIds);

  return (
    <div className="flex-1 flex flex-col">
      <div className="p-4 flex items-center justify-between gap-3">
        <Heading level={4}>Members Attendance</Heading>

        {!isMembersLoaded ? (
          <Button
            onClick={onLoadMembers}
            className="bg-orange-600 hover:bg-orange-700 whitespace-nowrap"
          >
            Load members
          </Button>
        ) : (
          <Button
            disabled
            className="bg-gray-300 text-gray-700 hover:bg-gray-300 whitespace-nowrap"
          >
            Members loaded
          </Button>
        )}
      </div>

      <div className="flex-1 p-4">
        {isAttendanceMarked ? (
          <div className="space-y-3">
            <div className="p-4 rounded-lg border bg-primary-50">
              <div className="flex items-start gap-3">
                <CheckCircle2 className="h-5 w-5 text-primary-600 mt-0.5" />
                <div>
                  <Text className="mb-1">Present Members</Text>
                  <Text variant="muted">
                    {presentSplit.males} Males - {presentSplit.females} Females
                  </Text>
                  <Text variant="muted">Total: {presentMembers.length}</Text>
                </div>
              </div>
            </div>

            <div className="p-4 rounded-lg border bg-destructive-50">
              <div className="flex items-start gap-3">
                <XCircle className="h-5 w-5 text-destructive-600 mt-0.5" />
                <div>
                  <Text className="mb-1">Absent Members</Text>
                  <Text variant="muted">
                    {absentSplit.males} Males - {absentSplit.females} Females
                  </Text>
                  <Text variant="muted">Total: {absentMembers.length}</Text>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="h-full" />
        )}
      </div>
    </div>
  );
}
