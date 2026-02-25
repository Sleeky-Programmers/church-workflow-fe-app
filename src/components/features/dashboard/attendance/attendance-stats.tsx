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
  onViewPresent: () => void;
  onViewAbsent: () => void;
  onLoadMembers: () => void;
};

export function AttendanceStatsView({
  presentMembers,
  absentMembers,
  onViewPresent,
  onViewAbsent,
  onLoadMembers,
}: AttendanceStatsViewProps) {
  const presentIds = presentMembers.map((m) => m.id);
  const absentIds = absentMembers.map((m) => m.id);

  const presentSplit = calculateGenderSplit(presentIds);
  const absentSplit = calculateGenderSplit(absentIds);

  const hasMembers = presentMembers.length > 0 || absentMembers.length > 0;

  return (
    <div className="flex-1 flex flex-col">
      <div className="p-4 border-b">
        <Heading level={4} className="font-semibold text-base">
          Members Attendance
        </Heading>
      </div>

      <div className="flex-1 p-4 space-y-3">
        {!hasMembers ? (
          <div className="flex items-center justify-center h-full">
            <Button
              onClick={onLoadMembers}
              className="bg-orange-600 hover:bg-orange-700"
            >
              Load members →
            </Button>
          </div>
        ) : (
          <div className="grid-rows-2">
            <Button onClick={onViewPresent} variant="outline" className="p-4">
              <div className="flex items-start gap-3">
                <div className="p-2 rounded-full">
                  <CheckCircle2 className="h-5 w-5 text-primary-600" />
                </div>
                <div className="flex-1">
                  <Text className="mb-1">Present Members</Text>
                  <Text variant="muted">
                    {presentSplit.males} Males - {presentSplit.females} Females
                  </Text>
                </div>
              </div>
            </Button>

            <Button onClick={onViewAbsent} variant="outline" className=" p-4">
              <div className="flex items-start gap-3">
                <div className="p-2 rounded-full">
                  <XCircle className="h-5 w-5 text-destructive-600" />
                </div>
                <div className="flex-1">
                  <div className="font-semibold text-gray-900 mb-1">
                    Absent Members
                  </div>
                  <Text variant="muted">
                    {absentSplit.males} Males - {absentSplit.females} Females
                  </Text>
                </div>
              </div>
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
