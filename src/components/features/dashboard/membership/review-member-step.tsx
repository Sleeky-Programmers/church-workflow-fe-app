"use client";

import { NewMemberData } from "@/types";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import Heading from "@/components/ui/typography/Heading";
import { Text } from "@/components/ui/typography/Text";

type ReviewMemberStepProps = {
  data: Partial<NewMemberData>;
  onSave: () => void;
  onBack: () => void;
  isSaving?: boolean;
};

function ReviewSection({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="mb-6">
      <Heading level={4} className="mb-3">
        {title}
      </Heading>
      <Card className="p-4 bg-gray-50">{children}</Card>
    </div>
  );
}

function ReviewField({
  label,
  value,
}: {
  label: string;
  value: string | boolean | undefined;
}) {
  return (
    <div className="py-2 flex justify-between items-center border-b last:border-0">
      <Text variant="muted" className="text-sm">
        {label}
      </Text>
      <Text variant="default" className="text-sm font-medium">
        {typeof value === "boolean" ? (value ? "Yes" : "No") : value || "-"}
      </Text>
    </div>
  );
}

export function ReviewMemberStep({
  data,
  onSave,
  onBack,
  isSaving = false,
}: ReviewMemberStepProps) {
  return (
    <div className="space-y-6">
      <ReviewSection title="Profile Details">
        <ReviewField label="Title" value={data.title} />
        <ReviewField label="Full Name" value={data.fullName} />
        <ReviewField label="Gender" value={data.gender} />
        <ReviewField label="Birthday" value={data.birthday} />
        <ReviewField label="Marital Status" value={data.maritalStatus} />
        {data.dateOfMarriage && (
          <ReviewField label="Date of Marriage" value={data.dateOfMarriage} />
        )}
        {data.spouseFirstName && (
          <ReviewField
            label="Spouse Name"
            value={`${data.spouseFirstName} ${data.spouseLastName}`}
          />
        )}
      </ReviewSection>

      <ReviewSection title="Contact Information">
        <ReviewField label="Email" value={data.email} />
        <ReviewField label="Phone" value={data.phone} />
        <ReviewField label="Address" value={data.address} />
      </ReviewSection>

      <ReviewSection title="Church Activity">
        <ReviewField label="Membership Status" value={data.membershipStatus} />
        <ReviewField label="Date Joined" value={data.dateJoined} />
        <ReviewField label="Baptized" value={data.baptized} />
        <ReviewField
          label="Volunteers Preference"
          value={data.volunteersPreference}
        />
      </ReviewSection>

      <div className="flex justify-between pt-4">
        <Button variant="outline" onClick={onBack} disabled={isSaving}>
          ← Back
        </Button>
        <Button onClick={onSave} variant="secondary" disabled={isSaving}>
          {isSaving ? "Saving..." : "Save Member"}
        </Button>
      </div>
    </div>
  );
}
