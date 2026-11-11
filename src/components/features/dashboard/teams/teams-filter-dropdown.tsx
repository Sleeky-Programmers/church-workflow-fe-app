"use client";

import { ReusableFilterDropdown } from "@/components/features/dashboard/filter-drop-down";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Text } from "@/components/ui/typography/Text";
import { TeamStatus } from "@/lib/enums";
import { MemberProfile } from "@/types";

export type TeamStatusFilter = "all" | TeamStatus.ACTIVE | TeamStatus.INACTIVE;

interface TeamsFilterDropdownProps {
  // Search
  searchQuery: string;
  setSearchQuery: (query: string) => void;

  // Status filter
  statusFilter: TeamStatusFilter;
  setStatusFilter: (status: TeamStatusFilter) => void;

  // Member filter
  selectedMemberId: string;
  setSelectedMemberId: (memberId: string) => void;
  members: MemberProfile[];

  // Min members filter
  minMembers: number;
  setMinMembers: (min: number) => void;

  // Clear all filters
  onClearFilters: () => void;
}

export const TeamsFilterDropdown = ({
  searchQuery,
  setSearchQuery,
  statusFilter,
  setStatusFilter,
  selectedMemberId,
  setSelectedMemberId,
  members,
  minMembers,
  setMinMembers,
  onClearFilters,
}: TeamsFilterDropdownProps) => {
  const additionalSections = (
    <>
      {/* Status Filter */}
      <div className="space-y-2">
        <Text className="font-medium">Team Status</Text>
        <div className="flex items-center gap-2">
          {(
            [
              "all",
              TeamStatus.ACTIVE,
              TeamStatus.INACTIVE,
            ] as TeamStatusFilter[]
          ).map((status) => {
            return (
              <Button
                key={status}
                size="sm"
                variant={statusFilter === status ? "default" : "outline"}
                onClick={() => {
                  return setStatusFilter(status);
                }}
                className="h-7 capitalize flex-1"
              >
                {status === "all" ? "All" : status.toLowerCase()}
              </Button>
            );
          })}
        </div>
      </div>

      {/* Member Filter */}
      <div className="space-y-2">
        <Text className="font-medium">Team Member</Text>
        <Select value={selectedMemberId} onValueChange={setSelectedMemberId}>
          <SelectTrigger className="h-9">
            <SelectValue placeholder="All members" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All members</SelectItem>
            {members.map((member) => {
              return (
                <SelectItem key={member.id} value={member.id}>
                  {member.fullName}
                </SelectItem>
              );
            })}
          </SelectContent>
        </Select>
      </div>

      {/* Minimum Members Filter */}
      <div className="space-y-2">
        <Text className="font-medium">Minimum Team Size</Text>
        <div className="flex items-center gap-2">
          {[0, 2, 3, 5, 10].map((size) => {
            return (
              <Button
                key={size}
                size="sm"
                variant={minMembers === size ? "default" : "outline"}
                onClick={() => {
                  return setMinMembers(size);
                }}
                className="h-7 flex-1"
              >
                {size === 0 ? "Any" : `${size}+`}
              </Button>
            );
          })}
        </div>
      </div>
    </>
  );

  return (
    <ReusableFilterDropdown
      filterSections={[]}
      title="Team Filters"
      triggerButtonText="Filter"
      searchQuery={searchQuery}
      onSearchChange={setSearchQuery}
      searchPlaceholder="Search teams..."
      additionalSections={additionalSections}
      showClearAll={true}
      onClearAll={onClearFilters}
      onSave={() => {}}
    />
  );
};
