"use client";

import { useEffect, useMemo, useState } from "react";

import Table from "@/components/features/dashboard/Table";
import AddSmallTeamDialog from "@/components/features/dashboard/teams/add-small-team-dialog";
import ManageTeamMembersDialog from "@/components/features/dashboard/teams/manage-team-members-dialog";
import MarkTeamAttendanceDialog from "@/components/features/dashboard/teams/mark-team-attendance-dialog";
import { getTeamColumns } from "@/components/features/dashboard/teams/team-columns";
import TeamsDeleteDialog from "@/components/features/dashboard/teams/team-delete-dialog";
import { TeamStatusFilter } from "@/components/features/dashboard/teams/teams-filter-dropdown";
import TeamsSearchBar from "@/components/features/dashboard/teams/teams-search-bar";
import { ViewTeamReportDialog } from "@/components/features/dashboard/teams/view-team-report-dialog";
import { Button } from "@/components/ui/button";
import { Loader } from "@/components/ui/loader";
import Heading from "@/components/ui/typography/Heading";
import { useIsMobile } from "@/hooks/use-mobile";
import { useToast } from "@/hooks/use-toast";
import {
  createSmallTeam,
  deleteSmallTeam,
  fetchServices,
  fetchSmallTeamReport,
  fetchSmallTeams,
  markSmallTeamAttendance,
  updateSmallTeamMembers,
} from "@/lib/api";
import { TeamStatus } from "@/lib/enums";
import { fetchMembers as fetchMemberProfiles } from "@/services/memberService";
import { MemberProfile, RegularService, TeamRow } from "@/types";

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

  // Search and filters
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<TeamStatusFilter>("all");
  const [selectedMemberId, setSelectedMemberId] = useState("all");
  const [minMembers, setMinMembers] = useState(0);

  const [data, setData] = useState<TeamRow[]>([]);
  const [members, setMembers] = useState<MemberProfile[]>([]);
  const [services, setServices] = useState<RegularService[]>([]);
  const [deleteTarget, setDeleteTarget] = useState<TeamRow | null>(null);
  const [manageTarget, setManageTarget] = useState<TeamRow | null>(null);
  const [markTarget, setMarkTarget] = useState<TeamRow | null>(null);
  const [teamMembers, setTeamMembers] = useState<Record<string, string[]>>({});
  const [isLoading, setIsLoading] = useState(true);

  const [reportTarget, setReportTarget] = useState<TeamRow | null>(null);
  const [reportData, setReportData] = useState<any>(null);
  const [isReportLoading, setIsReportLoading] = useState(false);

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
    let filteredTeams = data;

    // Search filter
    if (query) {
      const q = query.toLowerCase();
      filteredTeams = filteredTeams.filter(
        (team) =>
          team.name.toLowerCase().includes(q) ||
          (team.leader?.name ?? "").toLowerCase().includes(q) ||
          String(team.members).includes(q) ||
          team.status.toLowerCase().includes(q),
      );
    }

    // Status filter
    if (statusFilter !== "all") {
      filteredTeams = filteredTeams.filter(
        (team) => team.status === statusFilter,
      );
    }

    // Member filter
    if (selectedMemberId !== "all") {
      filteredTeams = filteredTeams.filter((team) => {
        const teamMemberIds = teamMembers[team.id] || [];
        return teamMemberIds.includes(selectedMemberId);
      });
    }

    // Min members filter
    if (minMembers > 0) {
      filteredTeams = filteredTeams.filter(
        (team) => team.members >= minMembers,
      );
    }

    return filteredTeams;
  }, [data, query, statusFilter, selectedMemberId, minMembers, teamMembers]);

  const handleClearFilters = () => {
    setQuery("");
    setStatusFilter("all");
    setSelectedMemberId("all");
    setMinMembers(0);
  };

  const handleEdit = (row: TeamRow) => {
    toast({
      title: "Edit Team",
      description: `Edit ${row.name} is not enabled yet.`,
    });
  };

  const handleManageMembers = (row: TeamRow) => setManageTarget(row);
  const handleMarkAttendance = (row: TeamRow) => setMarkTarget(row);

  const handleViewReport = async (row: TeamRow) => {
    setReportTarget(row);
    setIsReportLoading(true);
    try {
      const report = await fetchSmallTeamReport(row.id);
      setReportData(report);
    } catch (error: any) {
      toast({
        title: "Unable to load report",
        description: error?.message || "Please try again.",
        variant: "destructive",
      });
      setReportTarget(null);
    } finally {
      setIsReportLoading(false);
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

      <ViewTeamReportDialog
        open={!!reportTarget}
        onOpenChange={(open) => {
          if (!open) {
            setReportTarget(null);
            setReportData(null);
          }
        }}
        team={reportTarget}
        reportData={reportData}
        isLoading={isReportLoading}
      />
    </>
  );

  // For non-mobile view (desktop)
  return (
    <div className="space-y-6">
      <TeamsSearchBar
        query={query}
        onQueryChange={setQuery}
        members={members}
        onSave={handleAddTeam}
        statusFilter={statusFilter}
        setStatusFilter={setStatusFilter}
        selectedMemberId={selectedMemberId}
        setSelectedMemberId={setSelectedMemberId}
        minMembers={minMembers}
        setMinMembers={setMinMembers}
        onClearFilters={handleClearFilters}
      />

      <div className="max-h-[65vh] overflow-auto">
        {isLoading ? (
          <div className="rounded-xl border bg-white px-4 py-6 text-sm text-gray-500">
            <div className="absolute inset-0 flex items-center justify-center bg-white/60 z-10">
              <Loader className="h-6 w-6" />
            </div>
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
