"use client";

import { Calendar, Mail, TrendingUp, User, Users, X } from "lucide-react";
import { useEffect, useState } from "react";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Dialog, DialogClose, DialogContent } from "@/components/ui/dialog";
import { Loader } from "@/components/ui/loader";
import Heading from "@/components/ui/typography/Heading";
import { Span, Text } from "@/components/ui/typography/Text";
import { useIsMobile } from "@/hooks/use-mobile";
import { cn } from "@/lib/utils";
import { TeamRow } from "@/types";

interface TeamReportData {
  team: {
    _id: string;
    name: string;
    status: "ACTIVE" | "INACTIVE";
    description: string;
    leader: {
      id: string;
      fullName: string;
    } | null;
    members: {
      id: string;
      fullName: string;
      email: string;
    }[];
    membersCount: number;
    createdAt: string;
    updatedAt: string;
  };
  attendancePercentage: number;
  sessions: number;
  lowAttendanceMembers: {
    id: string;
    fullName: string;
    email: string;
  }[];
}

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  team: TeamRow | null;
  reportData: TeamReportData | null;
  isLoading?: boolean;
}

export function ViewTeamReportDialog({
  open,
  onOpenChange,
  team,
  reportData,
  isLoading = false,
}: Props) {
  const isMobile = useIsMobile();

  const [attendanceColor, setAttendanceColor] = useState<string>("");

  useEffect(() => {
    if (!open) return;
    if (reportData) {
      const percentage = reportData.attendancePercentage;
      if (percentage >= 80) {
        setAttendanceColor("text-green-600");
      } else if (percentage >= 50) {
        setAttendanceColor("text-yellow-600");
      } else {
        setAttendanceColor("text-red-600");
      }
    }
  }, [open, reportData]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const getInitials = (fullName: string) => {
    const names = fullName.trim().split(" ").filter(Boolean);
    if (!names.length) return "?";
    if (names.length === 1) return names[0][0].toUpperCase();
    return `${names[0][0]}${names[names.length - 1][0]}`.toUpperCase();
  };

  // Loading state
  if (isLoading) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent
          showClose={false}
          mobileSheet={isMobile}
          className={cn("!p-0 !bg-transparent !shadow-none !border-none")}
        >
          <div className="rounded-xl shadow-lg w-full sm:w-[500px] h-full flex flex-col overflow-hidden bg-gray-50">
            <div className="flex justify-between items-center border-b px-6 py-4">
              <Heading level={2}>Team Report</Heading>
              <DialogClose asChild>
                <Button
                  className="p-2"
                  size="icon"
                  variant="ghost"
                  aria-label="Close dialog"
                >
                  <X className="w-4 h-4" />
                </Button>
              </DialogClose>
            </div>
            <div className="flex-1 relative">
              <div className="absolute inset-0 flex items-center justify-center bg-white/60 z-10">
                <Loader className="h-8 w-8 animate-spin text-primary-600" />
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  if (!reportData || !team) {
    return null;
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        showClose={false}
        mobileSheet={isMobile}
        className={cn("!p-0 !bg-transparent !shadow-none !border-none")}
      >
        <div className="flex items-start gap-4">
          <div className="rounded-xl shadow-lg w-full sm:w-[500px] h-full flex flex-col overflow-hidden bg-gray-50 max-h-[90vh]">
            {/* Header */}
            <div className="flex justify-between items-center border-b px-6 py-4 bg-white">
              <Heading level={2}>Team Report</Heading>
              <DialogClose asChild>
                <Button
                  className="p-2"
                  size="icon"
                  variant="ghost"
                  aria-label="Close dialog"
                >
                  <X className="w-4 h-4" />
                </Button>
              </DialogClose>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5">
              {/* Team Name & Status */}
              <div className="flex items-start justify-between">
                <div>
                  <Heading level={3} className="text-xl">
                    {reportData.team.name}
                  </Heading>
                  <div className="flex items-center gap-2 mt-1">
                    <span
                      className={cn(
                        "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium",
                        reportData.team.status === "ACTIVE"
                          ? "bg-green-100 text-green-800"
                          : "bg-gray-100 text-gray-800",
                      )}
                    >
                      {reportData.team.status}
                    </span>
                    {reportData.team.description && (
                      <Text variant="muted" className="text-xs">
                        • {reportData.team.description}
                      </Text>
                    )}
                  </div>
                </div>
                <div className="text-right">
                  <Text variant="muted" className="text-xs">
                    Created {formatDate(reportData.team.createdAt)}
                  </Text>
                </div>
              </div>

              {/* Stats Cards */}
              <div className="grid grid-cols-3 gap-3">
                <div className="bg-white rounded-lg border border-gray-200 px-3 py-3">
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4 text-gray-500" />
                    <Text variant="muted" className="text-xs">
                      Members
                    </Text>
                  </div>
                  <Text className="text-xl font-semibold mt-1">
                    {reportData.team.membersCount}
                  </Text>
                </div>

                <div className="bg-white rounded-lg border border-gray-200 px-3 py-3">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-gray-500" />
                    <Text variant="muted" className="text-xs">
                      Sessions
                    </Text>
                  </div>
                  <Text className="text-xl font-semibold mt-1">
                    {reportData.sessions}
                  </Text>
                </div>

                <div className="bg-white rounded-lg border border-gray-200 px-3 py-3">
                  <div className="flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-gray-500" />
                    <Text variant="muted" className="text-xs">
                      Attendance
                    </Text>
                  </div>
                  <Text
                    className={cn(
                      "text-xl font-semibold mt-1",
                      attendanceColor,
                    )}
                  >
                    {reportData.attendancePercentage}%
                  </Text>
                </div>
              </div>

              {/* Leader Info */}
              {reportData.team.leader && (
                <div className="bg-white rounded-lg border border-gray-200 px-4 py-3">
                  <Text variant="muted" className="text-xs mb-2">
                    Team Leader
                  </Text>
                  <div className="flex items-center gap-3">
                    <Avatar className="h-8 w-8">
                      <AvatarFallback className="bg-blue-100 text-blue-700 text-xs">
                        {reportData.team.leader.fullName ===
                        "undefined undefined"
                          ? "NA"
                          : getInitials(reportData.team.leader.fullName)}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <Text className="text-sm font-medium">
                        {reportData.team.leader.fullName ===
                        "undefined undefined"
                          ? "N/A"
                          : reportData.team.leader.fullName}
                      </Text>
                    </div>
                  </div>
                </div>
              )}

              {/* Members List */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Text variant="muted" className="text-xs">
                    Team Members ({reportData.team.members.length})
                  </Text>
                </div>
                <div className="space-y-2 max-h-[200px] overflow-y-auto">
                  {reportData.team.members.map((member) => (
                    <div
                      key={member.id}
                      className="bg-white rounded-lg border border-gray-200 px-3 py-2 flex items-center justify-between"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <Avatar className="h-8 w-8">
                          <AvatarFallback className="bg-gray-200 text-gray-700 text-xs">
                            {getInitials(member.fullName)}
                          </AvatarFallback>
                        </Avatar>
                        <div className="min-w-0">
                          <Text className="text-sm truncate">
                            {member.fullName}
                          </Text>
                          <div className="flex items-center gap-1">
                            <Mail className="w-3 h-3 text-gray-400" />
                            <Text variant="muted" className="text-xs truncate">
                              {member.email}
                            </Text>
                          </div>
                        </div>
                      </div>
                      {reportData.lowAttendanceMembers.some(
                        (low) => low.id === member.id,
                      ) && (
                        <Span
                          variant="chip"
                          className="bg-yellow-100 text-yellow-800 text-xs px-2 py-0.5"
                        >
                          Low Attendance
                        </Span>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Low Attendance Warning */}
              {reportData.lowAttendanceMembers.length > 0 && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg px-4 py-3">
                  <div className="flex items-start gap-2">
                    <span className="text-yellow-600 text-sm">⚠️</span>
                    <div>
                      <Text className="text-sm font-medium text-yellow-800">
                        Low Attendance Alert
                      </Text>
                      <Text variant="muted" className="text-xs text-yellow-700">
                        {reportData.lowAttendanceMembers.length} member(s) have
                        low attendance. Consider following up with them.
                      </Text>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="flex justify-end border-t border-gray-200 px-6 py-4 bg-white">
              <DialogClose asChild>
                <Button variant="outline" className="px-6">
                  Close
                </Button>
              </DialogClose>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
