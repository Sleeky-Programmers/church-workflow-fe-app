"use client";

import { useMemo, useState } from "react";
import Table from "@/components/features/dashboard/Table";
import Heading from "@/components/ui/typography/Heading";
import { Input } from "@/components/ui/input";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Search, ChevronDown, MoreVertical } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { TeamRow } from "@/types";
import {
  smallTeamsData,
  MOCK_MEMBERS_FULL,
  smallTeamMemberMap,
} from "@/lib/data";
import { Button } from "@/components/ui/button";
import AddSmallTeamDialog from "@/components/features/dashboard/teams/add-small-team-dialog";
import { getTeamColumns } from "@/components/features/dashboard/teams/team-columns";
import ManageTeamMembersDialog from "@/components/features/dashboard/teams/manage-team-members-dialog";
import MarkTeamAttendanceDialog from "@/components/features/dashboard/teams/mark-team-attendance-dialog";
import TeamActionsSheet from "@/components/features/dashboard/teams/team-actions-sheet";
import { useIsMobile } from "@/hooks/use-mobile";
import { TeamStatus } from "@/lib/enums";

export default function TeamsPage() {
  const isMobile = useIsMobile();
  const { toast } = useToast();
  const [query, setQuery] = useState("");
  const [data, setData] = useState<TeamRow[]>(smallTeamsData as TeamRow[]);
  const [deleteTarget, setDeleteTarget] = useState<TeamRow | null>(null);
  const [manageTarget, setManageTarget] = useState<TeamRow | null>(null);
  const [markTarget, setMarkTarget] = useState<TeamRow | null>(null);
  const [mobileActionTarget, setMobileActionTarget] = useState<TeamRow | null>(
    null,
  );
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [teamMembers, setTeamMembers] =
    useState<Record<string, string[]>>(smallTeamMemberMap);

  const filtered = useMemo(() => {
    if (!query) return data;
    const q = query.toLowerCase();
    return data.filter(
      (team) =>
        team.name.toLowerCase().includes(q) ||
        (team.leader?.name ?? "").toLowerCase().includes(q) ||
        String(team.members).includes(q) ||
        team.status.toLowerCase().includes(q),
    );
  }, [data, query]);

  const handleEdit = (row: TeamRow) => {
    toast({
      title: "Edit Team",
      description: `Edit ${row.name}`,
    });
  };

  const handleManageMembers = (row: TeamRow) => {
    setManageTarget(row);
  };

  const handleMarkAttendance = (row: TeamRow) => {
    setMarkTarget(row);
  };

  const handleViewReport = (row: TeamRow) => {
    toast({
      title: "View Report",
      description: `View report for ${row.name}`,
    });
  };

  const handleConfirmDelete = () => {
    if (!deleteTarget) return;
    setData((prev) => prev.filter((team) => team.id !== deleteTarget.id));
    setTeamMembers((prev) => {
      const next = { ...prev };
      delete next[deleteTarget.id];
      return next;
    });
    setDeleteTarget(null);
  };

  const handleAddTeam = (payload: {
    name: string;
    leaderId: string;
    memberIds: string[];
    status: string;
    description: string;
  }) => {
    const leaderMember = MOCK_MEMBERS_FULL.find(
      (member) => member.id === payload.leaderId,
    );
    const leader = leaderMember
      ? { name: leaderMember.fullName, initials: leaderMember.initials }
      : null;

    const normalizedStatus =
      payload.status.toLowerCase() === "active"
        ? TeamStatus.ACTIVE
        : TeamStatus.INACTIVE;

    const newTeam: TeamRow = {
      id: crypto.randomUUID(),
      name: payload.name.trim(),
      leader,
      members: payload.memberIds.length,
      status: normalizedStatus,
    };

    setData((prev) => [newTeam, ...prev]);
    setTeamMembers((prev) => ({
      ...prev,
      [newTeam.id]: payload.memberIds,
    }));
  };

  const handleUpdateMembers = (memberIds: string[]) => {
    if (!manageTarget) return;
    setTeamMembers((prev) => ({
      ...prev,
      [manageTarget.id]: memberIds,
    }));
    setData((prev) =>
      prev.map((team) =>
        team.id === manageTarget.id
          ? { ...team, members: memberIds.length }
          : team,
      ),
    );
    setManageTarget(null);
  };

  const columns = getTeamColumns({
    onEdit: handleEdit,
    onManageMembers: handleManageMembers,
    onMarkAttendance: handleMarkAttendance,
    onViewReport: handleViewReport,
    onDeleteRequest: setDeleteTarget,
  });

  if (isMobile) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="bg-white">
          <div className="px-4 py-4 flex items-center justify-between gap-2">
            <Heading level={3}>Small Teams</Heading>
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <MoreVertical className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <div className="px-3 py-4">
          <div className="rounded-xl border bg-white overflow-hidden">
            <div className="flex items-center justify-between px-4 py-3 border-b">
              <Heading level={4}>All Teams</Heading>
              <Button size="sm" onClick={() => setIsAddOpen(true)}>
                Add
              </Button>
            </div>
            <div className="divide-y">
              {filtered.map((team) => (
                <div
                  key={team.id}
                  className="flex items-center justify-between px-4 py-3"
                >
                  <span className="text-sm text-gray-800">{team.name}</span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setMobileActionTarget(team)}
                  >
                    View Team
                  </Button>
                </div>
              ))}
            </div>
          </div>
        </div>

        <AddSmallTeamDialog
          open={isAddOpen}
          onOpenChange={setIsAddOpen}
          hideTrigger
          triggerLabel="Add"
          onSave={handleAddTeam}
        />

        <TeamActionsSheet
          open={!!mobileActionTarget}
          onOpenChange={(open) => !open && setMobileActionTarget(null)}
          team={mobileActionTarget}
          onManage={() => {
            if (!mobileActionTarget) return;
            setManageTarget(mobileActionTarget);
            setMobileActionTarget(null);
          }}
          onMarkAttendance={() => {
            if (!mobileActionTarget) return;
            setMarkTarget(mobileActionTarget);
            setMobileActionTarget(null);
          }}
          onViewReport={() => {
            if (!mobileActionTarget) return;
            toast({
              title: "View Report",
              description: `View report for ${mobileActionTarget.name}`,
            });
            setMobileActionTarget(null);
          }}
          onDelete={() => {
            if (!mobileActionTarget) return;
            setDeleteTarget(mobileActionTarget);
            setMobileActionTarget(null);
          }}
        />

        <ManageTeamMembersDialog
          open={!!manageTarget}
          onOpenChange={(open) => !open && setManageTarget(null)}
          team={manageTarget}
          memberIds={manageTarget ? teamMembers[manageTarget.id] || [] : []}
          onSave={handleUpdateMembers}
        />

        <MarkTeamAttendanceDialog
          open={!!markTarget}
          onOpenChange={(open) => !open && setMarkTarget(null)}
          team={markTarget}
          teamMemberIds={markTarget ? teamMembers[markTarget.id] || [] : []}
        />

        <AlertDialog
          open={!!deleteTarget}
          onOpenChange={(open) => !open && setDeleteTarget(null)}
        >
          <AlertDialogContent className="max-w-sm rounded-2xl">
            <AlertDialogHeader>
              <AlertDialogTitle className="text-base font-semibold text-gray-900">
                Delete team?
              </AlertDialogTitle>
              <AlertDialogDescription className="text-sm text-gray-500">
                Are you sure you want to delete this team?
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter className="gap-2 sm:gap-2">
              <AlertDialogCancel onClick={() => setDeleteTarget(null)}>
                Cancel
              </AlertDialogCancel>
              <AlertDialogAction onClick={handleConfirmDelete}>
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Heading level={2} text="Small Teams" />
          <Input
            placeholder="Search by Small Team, Member"
            leftIcon={<Search className="w-4 h-4" />}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-[300px]"
          />
        </div>
        <div className="flex items-center gap-3">
          <Button variant="ghost" className="hidden sm:flex items-center gap-2">
            Filter
            <ChevronDown className="w-4 h-4" />
          </Button>
          <AddSmallTeamDialog onSave={handleAddTeam} />
        </div>
      </div>

      <div className="max-h-[65vh] overflow-auto">
        <Table
          columns={columns}
          data={filtered}
          rowKey={(row) => row.id}
          showCheckbox
        />
      </div>

      <AlertDialog
        open={!!deleteTarget}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
      >
        <AlertDialogContent className="max-w-sm rounded-2xl">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-base font-semibold">
              Delete team?
            </AlertDialogTitle>
            <AlertDialogDescription className="text-sm">
              Are you sure you want to delete this team?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="gap-2 sm:gap-2">
            <AlertDialogCancel onClick={() => setDeleteTarget(null)}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmDelete}>
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <ManageTeamMembersDialog
        open={!!manageTarget}
        onOpenChange={(open) => !open && setManageTarget(null)}
        team={manageTarget}
        memberIds={manageTarget ? teamMembers[manageTarget.id] || [] : []}
        onSave={handleUpdateMembers}
      />

      <MarkTeamAttendanceDialog
        open={!!markTarget}
        onOpenChange={(open) => !open && setMarkTarget(null)}
        team={markTarget}
        teamMemberIds={markTarget ? teamMembers[markTarget.id] || [] : []}
      />
    </div>
  );
}
