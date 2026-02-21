"use client";

import { CheckCircle2, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Member } from "@/types";
import { calculateGenderSplit } from "@/lib/utils";
import Heading from "@/components/ui/typography/Heading";

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
          <>
            <Button
              onClick={onViewPresent}
              className="w-full p-4 rounded-lg border-2 border-primary-200 bg-primary-50 hover:bg-primary-100 transition-colors text-left"
            >
              <div className="flex items-start gap-3">
                <div className="p-2 bg-primary-100 rounded-full">
                  <CheckCircle2 className="h-5 w-5 text-primary-600" />
                </div>
                <div className="flex-1">
                  <div className="font-semibold text-gray-900 mb-1">
                    Present Members
                  </div>
                  <div className="text-sm text-gray-600">
                    {presentSplit.males} Males - {presentSplit.females} Females
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-primary-600">
                    {presentMembers.length}
                  </div>
                </div>
              </div>
            </Button>

            <Button
              onClick={onViewAbsent}
              className="w-full p-4 rounded-lg border-2 border-destructive-200 bg-destructive-50 hover:bg-destructive-100 transition-colors text-left"
            >
              <div className="flex items-start gap-3">
                <div className="p-2 bg-destructive-100 rounded-full">
                  <XCircle className="h-5 w-5 text-destructive-600" />
                </div>
                <div className="flex-1">
                  <div className="font-semibold text-gray-900 mb-1">
                    Absent Members
                  </div>
                  <div className="text-sm text-gray-600">
                    {absentSplit.males} Males - {absentSplit.females} Females
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-destructive-600">
                    {absentMembers.length}
                  </div>
                </div>
              </div>
            </Button>
          </>
        )}
      </div>
    </div>
  );
}
