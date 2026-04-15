"use client";

import { useEffect, useMemo, useState } from "react";
import Table from "@/components/features/dashboard/Table";
import Heading from "@/components/ui/typography/Heading";
import { MoreVertical } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { MemberProfile, RegularService, TeamRow } from "@/types";
import { Button } from "@/components/ui/button";
import AddSmallTeamDialog from "@/components/features/dashboard/teams/add-small-team-dialog";
import { getTeamColumns } from "@/components/features/dashboard/teams/team-columns";
import ManageTeamMembersDialog from "@/components/features/dashboard/teams/manage-team-members-dialog";
import MarkTeamAttendanceDialog from "@/components/features/dashboard/teams/mark-team-attendance-dialog";
import TeamActionsSheet from "@/components/features/dashboard/teams/team-actions-sheet";
import { useIsMobile } from "@/hooks/use-mobile";
import { TeamStatus } from "@/lib/enums";
import { SidebarTrigger } from "@/components/ui/sidebar";
import {
  createSmallTeam,
  deleteSmallTeam,
  fetchServices,
  fetchSmallTeamReport,
  fetchSmallTeams,
  markSmallTeamAttendance,
  updateSmallTeamMembers,
} from "@/lib/api";
import { fetchMembers as fetchMemberProfiles } from "@/services/memberService";
import TeamsDeleteDialog from "@/components/features/dashboard/teams/team-delete-dialog";
import TeamsMobileCard from "@/components/features/dashboard/teams/teams-mobile-card";
import TeamsSearchBar from "@/components/features/dashboard/teams/teams-search-bar";

function getInitials(fullName: string) {
  const names = fullName.trim().split(" ").filter(Boolean);
  if (!names.length) return "?";
  if (names.length === 1) return names[0][0].toUpperCase();
  return `${names[0][0]}${names[names.length - 1][0]}`.toUpperCase();
}

type TeamApiEntity = {
  _id: string;
  name: string;
  status: "ACTIVE" | "INACTIVE";
  leader: { id: string; fullName: string } | null;
  members: { id: string; fullName: string; email: string }[];
  membersCount: number;
};

export default function TeamsPage() {
  const isMobile = useIsMobile();
  const { toast } = useToast();
  const [query, setQuery] = useState("");
  const [data, setData] = useState<TeamRow[]>([]);
  const [members, setMembers] = useState<MemberProfile[]>([]);
  const [services, setServices] = useState<RegularService[]>([]);
  const [deleteTarget, setDeleteTarget] = useState<TeamRow | null>(null);
  const [manageTarget, setManageTarget] = useState<TeamRow | null>(null);
  const [markTarget, setMarkTarget] = useState<TeamRow | null>(null);
  const [mobileActionTarget, setMobileActionTarget] = useState<TeamRow | null>(
    null,
  );
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [teamMembers, setTeamMembers] = useState<Record<string, string[]>>({});
  const [isLoading, setIsLoading] = useState(true);

  const mapTeamToRow = (team: TeamApiEntity): TeamRow => ({
    id: team._id,
    name: team.name,
    leader: team.leader
      ? {
          name: team.leader.fullName,
          initials: getInitials(team.leader.fullName),
        }
      : null,
    members: team.membersCount,
    status: team.status === "ACTIVE" ? TeamStatus.ACTIVE : TeamStatus.INACTIVE,
  });

  const loadAllMembers = async () => {
    const pageSize = 100;
    const firstPage = await fetchMemberProfiles(1, pageSize);
    const allMembers = [...(firstPage.data || [])];
    const totalPages = firstPage.pagination?.totalPages || 1;
    if (totalPages > 1) {
      for (let page = 2; page <= totalPages; page++) {
        const nextPage = await fetchMemberProfiles(page, pageSize);
        allMembers.push(...(nextPage.data || []));
      }
    }
    return allMembers;
  };

  const loadTeams = async () => {
    const pageSize = 100;
    const firstPage = await fetchSmallTeams(1, pageSize);
    const allTeams = [...(firstPage.data || [])];
    const totalPages = firstPage.pagination?.totalPages || 1;
    if (totalPages > 1) {
      for (let page = 2; page <= totalPages; page++) {
        const nextPage = await fetchSmallTeams(page, pageSize);
        allTeams.push(...(nextPage.data || []));
      }
    }
    const membersMap = Object.fromEntries(
      allTeams.map((team) => [team._id, (team.members || []).map((m) => m.id)]),
    );
    setTeamMembers(membersMap);
    setData(allTeams.map((team) => mapTeamToRow(team as TeamApiEntity)));
  };

  const loadPageData = async () => {
    setIsLoading(true);
    try {
      const [allMembers, serviceResponse] = await Promise.all([
        loadAllMembers(),
        fetchServices(""),
      ]);
      setMembers(allMembers);
      setServices(serviceResponse || []);
      await loadTeams();
    } catch (error: any) {
      toast({
        title: "Failed to load teams",
        description: error?.message || "Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadPageData();
  }, []);

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
      description: `Edit ${row.name} is not enabled yet.`,
    });
  };

  const handleManageMembers = (row: TeamRow) => setManageTarget(row);
  const handleMarkAttendance = (row: TeamRow) => setMarkTarget(row);

  const handleViewReport = async (row: TeamRow) => {
    try {
      const report = await fetchSmallTeamReport(row.id);
      toast({
        title: `${row.name} Attendance`,
        description: `${report.attendancePercentage}% attendance, ${report.lowAttendanceMembers.length} low-attendance members.`,
      });
    } catch (error: any) {
      toast({
        title: "Unable to load report",
        description: error?.message || "Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;
    try {
      await deleteSmallTeam(deleteTarget.id);
      await loadTeams();
      setDeleteTarget(null);
      toast({
        title: "Team deleted",
        description: `${deleteTarget.name} has been deleted.`,
      });
    } catch (error: any) {
      toast({
        title: "Delete failed",
        description: error?.message || "Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleAddTeam = async (payload: {
    name: string;
    leaderId: string;
    memberIds: string[];
    status: string;
    description: string;
  }) => {
    await createSmallTeam({
      name: payload.name.trim(),
      leaderId: payload.leaderId || undefined,
      memberIds: payload.memberIds,
      status: payload.status.toLowerCase() === "active" ? "ACTIVE" : "INACTIVE",
      description: payload.description,
    });
    await loadTeams();
    toast({
      title: "Team created",
      description: `${payload.name} has been created.`,
    });
  };

  const handleUpdateMembers = async (memberIds: string[]) => {
    if (!manageTarget) return;
    await updateSmallTeamMembers(manageTarget.id, memberIds);
    await loadTeams();
    setManageTarget(null);
    toast({
      title: "Members updated",
      description: `Team members for ${manageTarget.name} have been updated.`,
    });
  };

  const handleSaveTeamAttendance = async (payload: {
    serviceId: string;
    date: string;
    memberIds: string[];
  }) => {
    if (!markTarget) return;
    await markSmallTeamAttendance({
      teamId: markTarget.id,
      serviceId: payload.serviceId,
      date: payload.date,
      memberIds: payload.memberIds,
    });
    toast({
      title: "Attendance saved",
      description: `${markTarget.name} attendance has been recorded.`,
    });
  };

  const columns = getTeamColumns({
    onEdit: handleEdit,
    onManageMembers: handleManageMembers,
    onMarkAttendance: handleMarkAttendance,
    onViewReport: handleViewReport,
    onDeleteRequest: setDeleteTarget,
  });

  const sharedDialogs = (
    <>
      <ManageTeamMembersDialog
        open={!!manageTarget}
        onOpenChange={(open) => !open && setManageTarget(null)}
        team={manageTarget}
        members={members}
        memberIds={manageTarget ? teamMembers[manageTarget.id] || [] : []}
        onSave={handleUpdateMembers}
      />

      <MarkTeamAttendanceDialog
        open={!!markTarget}
        onOpenChange={(open) => !open && setMarkTarget(null)}
        team={markTarget}
        members={members}
        services={services}
        teamMemberIds={markTarget ? teamMembers[markTarget.id] || [] : []}
        onSaveAttendance={handleSaveTeamAttendance}
      />

      <TeamsDeleteDialog
        target={deleteTarget}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        onConfirm={handleConfirmDelete}
      />
    </>
  );

  if (isMobile) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="bg-white">
          <div className="px-4 py-4 flex items-center justify-between gap-2">
            <div className="flex items-center gap-3">
              <SidebarTrigger />
              <Heading level={3}>Small Teams</Heading>
            </div>
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
              {isLoading ? (
                <div className="px-4 py-6 text-sm text-gray-500">
                  Loading teams...
                </div>
              ) : (
                filtered.map((team) => (
                  <TeamsMobileCard
                    key={team.id}
                    team={team}
                    onViewTeam={(t) => setMobileActionTarget(t)}
                  />
                ))
              )}
            </div>
          </div>
        </div>

        <AddSmallTeamDialog
          open={isAddOpen}
          onOpenChange={setIsAddOpen}
          hideTrigger
          triggerLabel="Add"
          members={members}
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
          onViewReport={async () => {
            if (!mobileActionTarget) return;
            await handleViewReport(mobileActionTarget);
            setMobileActionTarget(null);
          }}
          onDelete={() => {
            if (!mobileActionTarget) return;
            setDeleteTarget(mobileActionTarget);
            setMobileActionTarget(null);
          }}
        />

        {sharedDialogs}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Heading level={2} text="Small Teams" />
        <TeamsSearchBar
          query={query}
          onQueryChange={setQuery}
          members={members}
          onSave={handleAddTeam}
        />
      </div>

      <div className="max-h-[65vh] overflow-auto">
        {isLoading ? (
          <div className="rounded-xl border bg-white px-4 py-6 text-sm text-gray-500">
            Loading teams...
          </div>
        ) : (
          <Table
            columns={columns}
            data={filtered}
            rowKey={(row) => row.id}
            showCheckbox
          />
        )}
      </div>

      {sharedDialogs}
    </div>
  );
}
