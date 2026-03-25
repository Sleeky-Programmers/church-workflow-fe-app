"use client";

import { useState } from "react";
import { createPortal } from "react-dom";
import { MemberProfile } from "@/types";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import Heading from "@/components/ui/typography/Heading";
import { Text } from "@/components/ui/typography/Text";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { Gender, MembershipStatus } from "@/lib/enums";
type Props = {
  member: MemberProfile;
  onClose: () => void;
  onSave: (data: Partial<MemberProfile>) => Promise<void>;
};

export function EditMemberModal({ member, onClose, onSave }: Props) {
  const normalizeDate = (dateStr?: string) => {
    if (dateStr) {
      const date = new Date(dateStr);
      if (!Number.isNaN(date.getTime())) {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, "0");
        const day = String(date.getDate()).padStart(2, "0");
        return `${year}-${month}-${day}`;
      }
    }

    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, "0");
    const day = String(today.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  const [formData, setFormData] = useState<MemberProfile>({
    ...member,
    birthday: member.birthday
      ? normalizeDate(member.birthday)
      : normalizeDate(),
    dateJoined: member.dateJoined ? normalizeDate(member.dateJoined) : "",
  });

  const [isSaving, setIsSaving] = useState(false);

  const handleChange = (key: keyof MemberProfile, value: any) => {
    setFormData((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const handleSubmit = async () => {
    try {
      setIsSaving(true);
      await onSave(formData);
    } finally {
      setIsSaving(false);
    }
  };

  const modalContent = (
    <div
      className="fixed inset-0 bg-black/40 flex items-center justify-center z-50"
      onClick={onClose}
    >
      <div onClick={(e) => e.stopPropagation()} className="w-full max-w-3xl">
        <Card className="p-6 space-y-6 max-h-[90vh] overflow-y-auto">
          <Heading level={3}>Edit Member</Heading>

          <div>
            <Text className="mb-2 font-medium">Profile</Text>

            <Text className="mb-1 text-sm text-muted-foreground">
              Full Name
            </Text>
            <Input
              className="border rounded px-3 py-2 w-full mb-3"
              placeholder="Full Name"
              value={formData.fullName || ""}
              onChange={(e) => handleChange("fullName", e.target.value)}
            />

            <Text className="mb-1 text-sm text-muted-foreground">Gender</Text>
            <Select
              value={formData.gender || ""}
              onValueChange={(val) => handleChange("gender", val)}
            >
              <SelectTrigger className="mb-3">
                <SelectValue>{formData.gender || "Gender"}</SelectValue>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={Gender.MALE}>Male</SelectItem>
                <SelectItem value={Gender.FEMALE}>Female</SelectItem>
              </SelectContent>
            </Select>

            <Text className="mb-1 text-sm text-muted-foreground">
              Date of Birth
            </Text>
            <Input
              type="date"
              className="border rounded px-3 py-2 w-full mb-3"
              value={formData.birthday || ""}
              onChange={(e) => handleChange("birthday", e.target.value)}
            />
          </div>

          <div>
            <Text className="mb-2 font-medium">Contact</Text>

            <Text className="mb-1 text-sm text-muted-foreground">Email</Text>
            <input
              className="border rounded px-3 py-2 w-full mb-2"
              placeholder="Email"
              value={formData.email || ""}
              onChange={(e) => handleChange("email", e.target.value)}
            />

            <Text className="mb-1 text-sm text-muted-foreground">Phone</Text>
            <input
              className="border rounded px-3 py-2 w-full mb-2"
              placeholder="Phone"
              value={formData.phone || ""}
              onChange={(e) => handleChange("phone", e.target.value)}
            />

            <Text className="mb-1 text-sm text-muted-foreground">Address</Text>
            <input
              className="border rounded px-3 py-2 w-full"
              placeholder="Address"
              value={formData.address || ""}
              onChange={(e) => handleChange("address", e.target.value)}
            />
          </div>
          <div>
            <Text className="mb-2 font-medium">Church Info</Text>

            <Text className="mb-1 text-sm text-muted-foreground">
              Membership Status
            </Text>
            <Select
              value={formData.membershipStatus || ""}
              onValueChange={(val) => handleChange("membershipStatus", val)}
            >
              <SelectTrigger className="mb-3">
                <SelectValue>
                  {formData.membershipStatus || "Membership Status"}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={MembershipStatus.MEMBER}>Member</SelectItem>
                <SelectItem value={MembershipStatus.VISITOR}>
                  Visitor
                </SelectItem>
                <SelectItem value={MembershipStatus.WORKER}>Worker</SelectItem>
                <SelectItem value={MembershipStatus.LEADER}>Leader</SelectItem>
                <SelectItem value={MembershipStatus.CONVERT}>
                  New Convert
                </SelectItem>
                <SelectItem value={MembershipStatus.VOLUNTEER}>
                  Volunteer
                </SelectItem>
              </SelectContent>
            </Select>

            <Text className="mb-1 text-sm text-muted-foreground">
              Date Joined
            </Text>
            <Input
              type="date"
              className="border rounded h-11 px-3 py-2 w-full mb-3"
              value={formData.dateJoined || ""}
              onChange={(e) => handleChange("dateJoined", e.target.value)}
            />

            <Text className="mb-1 text-sm text-muted-foreground">Baptized</Text>
            <Select
              value={
                formData.baptized === true
                  ? "Yes"
                  : formData.baptized === false
                    ? "No"
                    : ""
              }
              onValueChange={(val) => handleChange("baptized", val === "Yes")}
            >
              <SelectTrigger className="mb-3">
                <SelectValue>
                  {formData.baptized === true
                    ? "Yes"
                    : formData.baptized === false
                      ? "No"
                      : "Select Baptized?"}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Yes">Yes</SelectItem>
                <SelectItem value="No">No</SelectItem>
              </SelectContent>
            </Select>

            <Text className="mb-1 text-sm text-muted-foreground">
              Volunteers Preference
            </Text>
            <Select
              value={formData.volunteersPreference || ""}
              onValueChange={(val) => handleChange("volunteersPreference", val)}
            >
              <SelectTrigger>
                <SelectValue>
                  {formData.volunteersPreference || "Select Preference"}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Choir">Choir</SelectItem>
                <SelectItem value="Ushering">Ushering</SelectItem>
                <SelectItem value="Media">Media</SelectItem>
                <SelectItem value="Technical">Technical</SelectItem>
                <SelectItem value="Protocol">Protocol</SelectItem>
                <SelectItem value="Children">Children’s Church</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button onClick={handleSubmit} disabled={isSaving}>
              {isSaving ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
}
