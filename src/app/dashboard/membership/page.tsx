"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, Plus, Edit, MoreVertical } from "lucide-react";
import Heading from "@/components/ui/typography/Heading";
import { MembersTable } from "@/components/features/dashboard/membership/members-table";
import { MOCK_MEMBERS_FULL } from "@/lib/data";
import { MemberProfile, NewMemberData, Title } from "@/types";
import { MemberDetailsPage } from "@/components/features/dashboard/membership/member-details-page";
import { AddMemberModal } from "@/components/features/dashboard/membership/add-member-modal";
import { AddMemberFormatModal } from "@/components/features/dashboard/membership/select-modal";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useIsMobile } from "@/hooks/use-mobile";

export default function MembershipPage() {
  const isMobile = useIsMobile();
  const [members, setMembers] = useState<MemberProfile[]>(MOCK_MEMBERS_FULL);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedMemberId, setSelectedMemberId] = useState<string | null>(null);
  const [isFormatModalOpen, setIsFormatModalOpen] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedFormat, setSelectedFormat] = useState<"form" | "csv" | null>(
    null,
  );
  const [filterValue, setFilterValue] = useState("all");

  const filteredMembers = members.filter(
    (member) =>
      member.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      member.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      member.phone.includes(searchQuery),
  );

  const handleAddMember = (newMember: NewMemberData) => {
    const nameParts = newMember.fullName.trim().split(/\s+/);
    const firstName = nameParts[0] || "";
    const lastName = nameParts.slice(1).join(" ") || "";
    const initials = nameParts
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase() ?? "")
      .join("");

    const memberProfile: MemberProfile = {
      id: crypto.randomUUID(),
      title: (newMember.title || "Mr.") as Title,
      fullName: newMember.fullName,
      firstName,
      lastName,
      email: newMember.email,
      phone: newMember.phone,
      gender: newMember.gender,
      birthday: newMember.birthday,
      address: newMember.address,
      maritalStatus: newMember.maritalStatus,
      dateOfMarriage: newMember.dateOfMarriage,
      spouseFirstName: newMember.spouseFirstName,
      spouseLastName: newMember.spouseLastName,
      membershipStatus: newMember.membershipStatus,
      dateJoined: newMember.dateJoined,
      baptized: newMember.baptized,
      volunteersPreference: newMember.volunteersPreference,
      servicesAttended: 0,
      servicesMissed: 0,
      attendanceRate: 0,
      attendanceRecords: [],
      initials,
    };

    setMembers((prev) => [...prev, memberProfile]);
    setIsAddModalOpen(false);
    setSelectedFormat(null);
  };

  const handleFormatSelect = (format: "form" | "csv") => {
    setSelectedFormat(format);
    if (format === "form") {
      setIsAddModalOpen(true);
    } else if (format === "csv") {
      alert("CSV upload selected");
    }
  };

  if (selectedMemberId) {
    const selectedMember = members.find((m) => m.id === selectedMemberId);
    if (selectedMember) {
      return (
        <MemberDetailsPage
          member={selectedMember}
          onBack={() => setSelectedMemberId(null)}
        />
      );
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white">
        <div className="px-4 sm:px-6 py-4 flex items-center justify-between gap-2">
          <Heading level={3}>Membership</Heading>

          <div className="hidden sm:flex items-center gap-3">
            <div className="relative w-72 md:w-96">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search members..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <div>
              {" "}
              <Select value={filterValue} onValueChange={setFilterValue}>
                <SelectTrigger className="w-[120px]">
                  <SelectValue placeholder="Filter" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Filter</SelectItem>
                  <SelectItem value="male">Male</SelectItem>
                  <SelectItem value="female">Female</SelectItem>
                  <SelectItem value="this-month">Baptized</SelectItem>
                  <SelectItem value="new-members">New Members</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button
              onClick={() => setIsFormatModalOpen(true)}
              variant="default"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add a member
            </Button>
          </div>
          {isMobile && (
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <MoreVertical className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>

      <div className="py-4 sm:py-6 px-3 sm:px-4">
        <MembersTable
          members={filteredMembers}
          onRowClick={(memberId) => setSelectedMemberId(memberId)}
          onAddMember={() => setIsFormatModalOpen(true)}
        />
      </div>

      <AddMemberFormatModal
        open={isFormatModalOpen}
        onOpenChange={setIsFormatModalOpen}
        onSelectFormat={handleFormatSelect}
      />

      <AddMemberModal
        open={isAddModalOpen}
        onOpenChange={setIsAddModalOpen}
        onMemberAdded={handleAddMember}
      />
    </div>
  );
}
