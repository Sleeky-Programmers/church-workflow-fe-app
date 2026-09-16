"use client";

import { Search } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { MemberProfile } from "@/types";

import AddSmallTeamDialog from "./add-small-team-dialog";
import { TeamsFilterDropdown, TeamStatusFilter } from "./teams-filter-dropdown";

interface Props {
  query: string;
  onQueryChange: (value: string) => void;
  members: MemberProfile[];
  onSave: (payload: {
    name: string;
    leaderId: string;
    pendingLeaderEmail: string | null;
    memberIds: string[];
    status: string;
    description: string;
  }) => Promise<void>;
  // Filter props
  statusFilter: TeamStatusFilter;
  setStatusFilter: (status: TeamStatusFilter) => void;
  selectedMemberId: string;
  setSelectedMemberId: (memberId: string) => void;
  minMembers: number;
  setMinMembers: (min: number) => void;
  onClearFilters: () => void;
}

export default function TeamsSearchBar({
  query,
  onQueryChange,
  members,
  onSave,
  statusFilter,
  setStatusFilter,
  selectedMemberId,
  setSelectedMemberId,
  minMembers,
  setMinMembers,
  onClearFilters,
}: Props) {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-3">
        <Input
          placeholder="Search by Small Team, Member"
          leftIcon={<Search className="w-4 h-4" />}
          value={query}
          onChange={(e) => onQueryChange(e.target.value)}
          className="w-[300px]"
        />
      </div>
      <div className="flex items-center gap-3">
        <TeamsFilterDropdown
          searchQuery={query}
          setSearchQuery={onQueryChange}
          statusFilter={statusFilter}
          setStatusFilter={setStatusFilter}
          selectedMemberId={selectedMemberId}
          setSelectedMemberId={setSelectedMemberId}
          members={members}
          minMembers={minMembers}
          setMinMembers={setMinMembers}
          onClearFilters={onClearFilters}
        />
        <AddSmallTeamDialog members={members} onSave={onSave} />
      </div>
    </div>
  );
}
