"use client";

import { MemberProfile } from "@/types";
import { Card } from "@/components/ui/card";
import Heading from "@/components/ui/typography/Heading";
import { Text, Span } from "@/components/ui/typography/Text";
import { AttendanceStatsCards } from "./attendance-stats-cards";

type MemberOverviewTabProps = {
  member: MemberProfile;
};

function DetailField({
  label,
  value,
}: {
  label: string;
  value: string | boolean | undefined;
}) {
  return (
    <div className="mb-3">
      <Text variant="default">
        {label}:{" "}
        <Span variant="muted">
          {" "}
          {typeof value === "boolean" ? (value ? "Yes" : "No") : value || "-"}
        </Span>
      </Text>
    </div>
  );
}

export function MemberOverviewTab({ member }: MemberOverviewTabProps) {
  return (
    <div className="p-1 sm:p-6 space-y-4 sm:space-y-6">
      <div className="hidden sm:block">
        <AttendanceStatsCards
          servicesAttended={member.servicesAttended}
          servicesMissed={member.servicesMissed}
          attendanceRate={member.attendanceRate}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        <Card className="p-4 sm:p-6">
          <Heading level={4} className="mb-4">
            Profile Details
          </Heading>
          <div className="space-y-2">
            <DetailField label="Gender" value={member.gender} />
            <DetailField label="Date of Birth" value={member.birthday} />
            <DetailField label="Marital Status" value={member.maritalStatus} />
            {member.dateOfMarriage && (
              <DetailField
                label="Date of Marriage"
                value={member.dateOfMarriage}
              />
            )}
          </div>
        </Card>

        <Card className="p-4 sm:p-6">
          <Heading level={4} className="mb-4">
            Contact Information
          </Heading>
          <div className="space-y-2">
            <DetailField label="Phone" value={member.phone} />
            <DetailField label="Email" value={member.email} />
            <DetailField label="Address" value={member.address} />
          </div>
        </Card>
      </div>

      <Card className="p-4 sm:p-6">
        <Heading level={4} className="mb-4">
          Church Involvement
        </Heading>
        <div className="space-y-2">
          <DetailField
            label="Membership Status"
            value={member.membershipStatus}
          />
          <DetailField
            label="Date joined the church"
            value={member.dateJoined}
          />
          <DetailField label="Baptized" value={member.baptized} />
          <DetailField
            label="Volunteers Preferences"
            value={member.volunteersPreference}
          />
        </div>
      </Card>
    </div>
  );
}
