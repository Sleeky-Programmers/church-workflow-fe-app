"use client";

import { useState } from "react";
import { MemberProfile } from "@/types";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Edit, ChevronDown } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import Heading from "@/components/ui/typography/Heading";
import { Span, Text } from "@/components/ui/typography/Text";
import { MemberOverviewTab } from "./member-overview-tab";
import { MemberAttendanceTab } from "./member-attendance-tab";

type MemberDetailsPageProps = {
  member: MemberProfile;
  onBack: () => void;
};

export function MemberDetailsPage({ member, onBack }: MemberDetailsPageProps) {
  const [activeTab, setActiveTab] = useState<"overview" | "attendance">(
    "overview",
  );
  const [filterValue, setFilterValue] = useState("all");

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b">
        <div className="px-6 py-4 flex items-center justify-center relative">
          <Button
            variant="ghost"
            size="sm"
            onClick={onBack}
            className="absolute left-6 gap-1"
          >
            <ArrowLeft className="h-4 w-4" />
            <Span variant="default">Back</Span>
          </Button>

          <Heading level={2}>Member Details</Heading>
        </div>
      </div>

      <div className="bg-white border-b px-6 py-6">
        <div className="flex items-start gap-4">
          <Avatar className="h-16 w-16">
            <AvatarFallback className="bg-gray-900 text-white text-lg font-semibold">
              {member.initials}
            </AvatarFallback>
          </Avatar>

          <div>
            <Heading level={3} className="mb-1">
              {member.fullName}
            </Heading>
            <Text variant="muted" className="text-sm">
              {member.email}
            </Text>
          </div>
        </div>
      </div>

      <div className="border-b bg-white">
        <div className="flex items-center justify-between px-6">
          <div className="flex gap-1">
            <Button
              variant={activeTab === "overview" ? "default" : "ghost"}
              onClick={() => setActiveTab("overview")}
            >
              Overview
            </Button>
            <Button
              variant={activeTab === "attendance" ? "default" : "ghost"}
              onClick={() => setActiveTab("attendance")}
            >
              Attendance
            </Button>
          </div>

          {activeTab === "overview" ? (
            <Button variant="outline" className="flex items-center gap-2">
              <Edit className="h-4 w-4" />
              Edit
            </Button>
          ) : (
            <Select value={filterValue} onValueChange={setFilterValue}>
              <SelectTrigger className="w-[120px]">
                <SelectValue placeholder="Filter" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="present">Present</SelectItem>
                <SelectItem value="absent">Absent</SelectItem>
                <SelectItem value="this-month">This Month</SelectItem>
                <SelectItem value="last-month">Last Month</SelectItem>
              </SelectContent>
            </Select>
          )}
        </div>
      </div>
      <div className="bg-gray-50 p-6">
        {activeTab === "overview" && <MemberOverviewTab member={member} />}
        {activeTab === "attendance" && (
          <MemberAttendanceTab
            records={member.attendanceRecords}
            filterValue={filterValue}
          />
        )}
      </div>
    </div>
  );
}
