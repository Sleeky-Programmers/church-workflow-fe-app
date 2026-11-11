"use client";

import { Plus, Search } from "lucide-react";
import { useState } from "react";

import MobileHeader from "@/components/layout/mobile-header";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Loader } from "@/components/ui/loader";
import { Text } from "@/components/ui/typography/Text";
import { AVATAR_COLORS } from "@/lib/data";
import { MemberProfile, TeamRow } from "@/types";

import AddSmallTeamDialog from "./add-small-team-dialog";
import TeamRowActionsMenu from "./team-row-actions-menu";
import { TeamsFilterDropdown, TeamStatusFilter } from "./teams-filter-dropdown";

type TeamsMobileViewProps = {
  teams: TeamRow[];
  members: MemberProfile[];
  isLoading: boolean;

  query: string;
  onQueryChange: (value: string) => void;
  statusFilter: TeamStatusFilter;
  setStatusFilter: (status: TeamStatusFilter) => void;
  selectedMemberId: string;
  setSelectedMemberId: (memberId: string) => void;
  minMembers: number;
  setMinMembers: (min: number) => void;
  onClearFilters: () => void;

  onAddTeam: (payload: {
    name: string;
    leaderId: string;
    pendingLeaderEmail: string | null;
    memberIds: string[];
    status: string;
    description: string;
  }) => Promise<void>;
  onEdit: (row: TeamRow) => void;
  onManageMembers: (row: TeamRow) => void;
  onMarkAttendance: (row: TeamRow) => void;
  onViewReport: (row: TeamRow) => void;
  onDeleteRequest: (row: TeamRow) => void;
};

function getAvatarColor(name: string) {
  if (!name) {
    return AVATAR_COLORS[0];
  }
  const code = name.charCodeAt(0);
  return AVATAR_COLORS[code % AVATAR_COLORS.length];
}

function getInitials(name: string) {
  if (!name) {
    return "?";
  }
  const parts = name.trim().split(" ");
  if (parts.length === 1) {
    return parts[0][0].toUpperCase();
  }
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

export function TeamsMobileView({
  teams,
  members,
  isLoading,
  query,
  onQueryChange,
  statusFilter,
  setStatusFilter,
  selectedMemberId,
  setSelectedMemberId,
  minMembers,
  setMinMembers,
  onClearFilters,
  onAddTeam,
  onEdit,
  onManageMembers,
  onMarkAttendance,
  onViewReport,
  onDeleteRequest,
}: TeamsMobileViewProps) {
  const [isAddTeamOpen, setIsAddTeamOpen] = useState(false);

  return (
    <div className="pb-6">
      <MobileHeader
        title="Small Teams"
        rightAction={
          <Button
            variant="ghost"
            size="icon"
            className="h-9 w-9"
            onClick={() => {
              return setIsAddTeamOpen(true);
            }}
          >
            <Plus className="h-5 w-5" />
          </Button>
        }
      />

      <div className="px-3 pt-4 space-y-3">
        <div className="flex items-center gap-2">
          <Input
            placeholder="Search by Small Team, Member"
            leftIcon={<Search className="w-4 h-4" />}
            value={query}
            onChange={(e) => {
              return onQueryChange(e.target.value);
            }}
            className="flex-1"
          />
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
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-16">
            <Loader size="w-10 h-10" showShadow={false} />
          </div>
        ) : teams.length === 0 ? (
          <div className="py-8 text-center text-muted-foreground text-sm">
            No records found.
          </div>
        ) : (
          <div className="space-y-3">
            {teams.map((team) => {
              const leaderName = team.leader?.name ?? "";
              const color = getAvatarColor(leaderName);
              const isActive = team.status.toLowerCase() === "active";

              return (
                <Card key={team.id} className="rounded-2xl">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0 flex-1">
                        <Text className="font-medium truncate">
                          {team.name}
                        </Text>
                        {team.description && (
                          <Text
                            variant="muted"
                            className="text-xs mt-0.5 line-clamp-2"
                          >
                            {team.description}
                          </Text>
                        )}
                      </div>
                      <TeamRowActionsMenu
                        row={team}
                        onEdit={onEdit}
                        onManageMembers={onManageMembers}
                        onMarkAttendance={onMarkAttendance}
                        onViewReport={onViewReport}
                        onDeleteRequest={onDeleteRequest}
                      />
                    </div>

                    <div className="flex items-center gap-3 mt-3">
                      <Avatar className={`h-8 w-8 ${color.bg}`}>
                        <AvatarFallback
                          className={`text-xs font-semibold ${color.bg} ${color.text}`}
                        >
                          {getInitials(leaderName)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="min-w-0">
                        <Text variant="muted" className="text-xs">
                          Team Lead
                        </Text>
                        <Text variant="default" className="text-sm truncate">
                          {leaderName || "No leader assigned"}
                        </Text>
                      </div>
                    </div>

                    <div className="flex items-center justify-between mt-3 pt-3 border-t">
                      <Text variant="muted" className="text-xs">
                        {team.members} member{team.members === 1 ? "" : "s"}
                      </Text>
                      <Badge
                        variant="outline"
                        className={
                          isActive
                            ? "border-success-400 text-success-600 bg-transparent font-normal"
                            : "border-gray-300 text-gray-500 bg-transparent font-normal"
                        }
                      >
                        {team.status}
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>

      <AddSmallTeamDialog
        members={members}
        onSave={onAddTeam}
        open={isAddTeamOpen}
        onOpenChange={setIsAddTeamOpen}
        hideTrigger
      />
    </div>
  );
}
