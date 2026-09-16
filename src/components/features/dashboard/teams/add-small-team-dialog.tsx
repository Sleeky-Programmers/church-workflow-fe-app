"use client";

import { ChevronRight, Plus, Search, X } from "lucide-react";
import { useMemo, useState } from "react";

import { MemberMultiSelect } from "@/components/features/dashboard/departments/member-selectors";
import { TeamLeaderPicker } from "@/components/features/dashboard/teams/team-leader-picker";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import Heading from "@/components/ui/typography/Heading";
import { Span, Text } from "@/components/ui/typography/Text";
import { useHasAccess } from "@/lib/access-control";
import { useIsMobile } from "@/hooks/use-mobile";
import { cn } from "@/lib/utils";
import { fetchMembers } from "@/services/memberService";
import { MemberProfile } from "@/types";

const PANEL_PAGE_SIZE = 8;

interface Props {
  members: MemberProfile[];
  onSave?: (payload: {
    name: string;
    leaderId: string;
    pendingLeaderEmail: string | null;
    memberIds: string[];
    status: string;
    description: string;
  }) => void | Promise<void>;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  hideTrigger?: boolean;
  triggerLabel?: string;
}

export default function AddSmallTeamDialog({
  members,
  onSave,
  open: controlledOpen,
  onOpenChange,
  hideTrigger = false,
  triggerLabel = "Add a Team",
}: Props) {
  const isMobile = useIsMobile();
  const canCreate = useHasAccess("SMALL_TEAMS", "FULL_ACCESS");
  const [open, setOpen] = useState(false);
  const [teamName, setTeamName] = useState("");
  const [leaderId, setLeaderId] = useState("");
  const [pendingLeaderEmail, setPendingLeaderEmail] = useState<string | null>(
    null,
  );
  const [memberIds, setMemberIds] = useState<string[]>([]);
  const [status, setStatus] = useState("active");
  const [description, setDescription] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [showSelectedPanel, setShowSelectedPanel] = useState(false);
  const [panelQuery, setPanelQuery] = useState("");
  const [panelPage, setPanelPage] = useState(1);

  const selectedMembers = useMemo(() => {
    if (!memberIds.length) {
      return [];
    }
    return members.filter((member) => memberIds.includes(member.id));
  }, [memberIds, members]);

  const filteredPanelMembers = useMemo(() => {
    if (!panelQuery.trim()) {
      return selectedMembers;
    }
    const query = panelQuery.toLowerCase();
    return selectedMembers.filter(
      (member) =>
        member.fullName.toLowerCase().includes(query) ||
        member.email.toLowerCase().includes(query),
    );
  }, [panelQuery, selectedMembers]);

  const totalPanelPages = Math.max(
    1,
    Math.ceil(filteredPanelMembers.length / PANEL_PAGE_SIZE),
  );

  const safePage = Math.min(panelPage, totalPanelPages);

  const pagedPanelMembers = useMemo(() => {
    const start = (safePage - 1) * PANEL_PAGE_SIZE;
    return filteredPanelMembers.slice(start, start + PANEL_PAGE_SIZE);
  }, [filteredPanelMembers, safePage]);

  // Creating a team is an org-wide administrative action (matches the
  // backend's FULL_ACCESS requirement on POST /small-teams) - team leaders
  // scoped to their own team(s) never see the entry point for it.
  if (!canCreate) {
    return null;
  }

  function handlePageChange(p: number) {
    setPanelPage(Math.max(1, Math.min(p, totalPanelPages)));
  }

  function handlePanelQueryChange(q: string) {
    setPanelQuery(q);
    setPanelPage(1);
  }

  async function handleSave() {
    setIsSaving(true);
    try {
      if (onSave) {
        await onSave({
          name: teamName,
          leaderId,
          pendingLeaderEmail,
          memberIds,
          status,
          description,
        });
      }
      setTeamName("");
      setLeaderId("");
      setPendingLeaderEmail(null);
      setMemberIds([]);
      setStatus("active");
      setDescription("");
      setShowSelectedPanel(false);
      setPanelQuery("");
      setPanelPage(1);
      setIsOpen(false);
    } finally {
      setIsSaving(false);
    }
  }

  function removeSelectedMember(id: string) {
    setMemberIds((prev) => prev.filter((memberId) => memberId !== id));
  }

  const isOpen = controlledOpen ?? open;
  const setIsOpen = onOpenChange ?? setOpen;

  const SelectedMembersList = () => (
    <>
      {pagedPanelMembers.length === 0 ? (
        <div className="px-4 py-6 text-center">
          <Text variant="muted">No members found.</Text>
        </div>
      ) : (
        pagedPanelMembers.map((member) => (
          <div
            key={member.id}
            className="flex items-center justify-between gap-3 px-4 py-2.5"
          >
            <div className="flex items-center gap-3 min-w-0">
              <Avatar className="h-8 w-8 shrink-0">
                <AvatarFallback className="bg-gray-200 text-gray-700 text-xs">
                  {member.initials}
                </AvatarFallback>
              </Avatar>
              <div className="min-w-0">
                <Text variant="default" className="truncate">
                  {member.fullName}
                </Text>
                <Text variant="muted" className="truncate text-xs">
                  {member.email}
                </Text>
              </div>
            </div>
            <Button
              variant="rowRemove"
              onClick={() => removeSelectedMember(member.id)}
              aria-label={`Remove ${member.fullName}`}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        ))
      )}
    </>
  );

  const PaginationFooter = () => {
    if (totalPanelPages <= 1) {
      return null;
    }

    return (
      <div className="flex items-center justify-between border-t px-4 py-3">
        <Button
          variant="ghost"
          size="sm"
          className="h-7 px-2 text-xs"
          disabled={safePage <= 1}
          onClick={() => handlePageChange(safePage - 1)}
        >
          {"< Previous"}
        </Button>

        <div className="flex items-center gap-1.5 text-xs">
          {Array.from({ length: totalPanelPages }).map((_, i) => {
            const pageNum = i + 1;
            const isActive = pageNum === safePage;
            return (
              <Button
                key={pageNum}
                onClick={() => handlePageChange(pageNum)}
                className={cn(
                  "px-2 py-0.5 text-xs",
                  isActive
                    ? "bg-gray-200 text-gray-800 font-medium"
                    : "text-gray-500 hover:text-gray-700",
                )}
              >
                {pageNum}
              </Button>
            );
          })}
        </div>

        <Button
          variant="ghost"
          size="sm"
          className="h-7 px-2 text-xs"
          disabled={safePage >= totalPanelPages}
          onClick={() => handlePageChange(safePage + 1)}
        >
          {"Next >"}
        </Button>
      </div>
    );
  };

  const PanelContent = () => (
    <div className="rounded-xl shadow-lg flex flex-col overflow-hidden bg-white w-full h-full">
      <div className="flex items-center justify-between border-b px-4 py-3">
        <Heading level={3}>Selected Members</Heading>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setShowSelectedPanel(false)}
        >
          <X className="h-4 w-4" />
        </Button>
      </div>

      <div className="relative p-4 border-b">
        <Search className="absolute left-7 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
        <Input
          placeholder="Select or search"
          value={panelQuery}
          onChange={(e) => handlePanelQueryChange(e.target.value)}
          className="pl-8"
        />
      </div>

      <div className="flex-1 overflow-y-auto py-1">
        <SelectedMembersList />
      </div>

      <PaginationFooter />
    </div>
  );

  return (
    <>
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        {!hideTrigger && (
          <DialogTrigger asChild>
            <Button className="flex items-center gap-2">
              <Plus className="w-4 h-4" />
              {triggerLabel}
            </Button>
          </DialogTrigger>
        )}

        <DialogContent
          showClose={false}
          mobileSheet={isMobile}
          className={cn(
            "!p-0 !bg-white !shadow-lg !border !border-gray-200",
            isMobile && "!rounded-t-2xl",
            // Make modal responsive - full width on mobile, fixed max-width on desktop
            "w-[95vw] max-w-[95vw] sm:w-[510px] sm:max-w-[510px]",
            "lg:w-[560px] lg:max-w-[560px]",
            "xl:w-[600px] xl:max-w-[600px]",
          )}
        >
          <div className="flex items-start gap-4 w-full">
            <div className="rounded-xl w-full h-full flex flex-col overflow-hidden bg-white">
              <div className="flex justify-between items-center border-b px-4 sm:px-6 py-4">
                <Heading level={2}>Add a Small Team</Heading>

                <DialogClose asChild>
                  <Button
                    className="p-2"
                    size="icon"
                    variant="ghost"
                    aria-label="Close dialog"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </DialogClose>
              </div>

              <div className="max-h-[70vh] space-y-4 sm:space-y-5 overflow-y-auto px-4 sm:px-6 py-4 sm:py-5">
                {/* Team Name - Full width */}
                <div className="space-y-1.5 w-full">
                  <Label className="text-sm sm:text-base">Team Name</Label>
                  <Input
                    placeholder="e.g. Youth Group A"
                    value={teamName}
                    onChange={(e) => setTeamName(e.target.value)}
                    className="w-full"
                  />
                </div>

                {/* Assign Leader - Full width */}
                <TeamLeaderPicker
                  leaderId={leaderId}
                  onLeaderIdChange={setLeaderId}
                  pendingLeaderEmail={pendingLeaderEmail}
                  onPendingLeaderEmailChange={setPendingLeaderEmail}
                  disabled={isSaving}
                />

                {/* Members Section - Full width */}
                <div className="space-y-2 w-full">
                  {memberIds.length > 0 && (
                    <div className="space-y-2">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <Span
                          variant="default"
                          className="text-sm sm:text-base"
                        >
                          Selected Members
                        </Span>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setShowSelectedPanel(true)}
                          className="h-7 text-xs sm:text-sm"
                        >
                          View All Members
                          <ChevronRight className="h-3 w-3 ml-1" />
                        </Button>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {memberIds.slice(0, 3).map((id) => {
                          const member = members.find((m) => m.id === id);
                          if (!member) {
                            return null;
                          }

                          return (
                            <Span
                              key={id}
                              variant="chip"
                              className="flex items-center gap-1 text-xs sm:text-sm"
                            >
                              {member.fullName.split(" ")[0]}
                              <Button
                                variant="chipRemove"
                                onClick={() => removeSelectedMember(id)}
                                aria-label={`Remove ${member.fullName}`}
                              >
                                <X className="h-3 w-3" />
                              </Button>
                            </Span>
                          );
                        })}
                        {memberIds.length > 3 && (
                          <Span
                            variant="chip"
                            className="inline-flex text-xs sm:text-sm"
                          >
                            +{memberIds.length - 3} others
                          </Span>
                        )}
                      </div>
                    </div>
                  )}
                  <Label className="text-sm sm:text-base">Add Members</Label>

                  <MemberMultiSelect
                    fetchOptions={fetchMembers}
                    value={memberIds}
                    onChange={(ids) => setMemberIds(ids)}
                    placeholder="Select or search"
                  />
                </div>

                {/* Status - Full width */}
                <div className="space-y-1.5 w-full">
                  <Label className="text-sm sm:text-base">Status</Label>
                  <Select value={status} onValueChange={setStatus}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="inactive">Inactive</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Description - Full width */}
                <div className="space-y-1.5 w-full">
                  <Label className="text-sm sm:text-base">Description</Label>
                  <Textarea
                    rows={4}
                    placeholder="Add description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="flex w-full px-3 py-2 resize-y"
                  />
                </div>
              </div>

              {/* Footer - Full width */}
              <div className="flex justify-end border-t border-gray-200 px-4 sm:px-6 py-4">
                <Button
                  onClick={handleSave}
                  disabled={!teamName.trim() || isSaving}
                  className="px-4 sm:px-6 w-full sm:w-auto"
                >
                  {isSaving ? "Saving..." : "Add Team"}
                </Button>
              </div>
            </div>

            {/* Side Panel - Dynamic width */}
            {!isMobile && showSelectedPanel && (
              <div className="hidden sm:flex w-[280px] sm:w-[320px] md:w-[340px] lg:w-[380px] max-h-[80vh] h-[80vh]">
                <PanelContent />
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Mobile Panel - Full width */}
      {isMobile && showSelectedPanel && (
        <Dialog open={showSelectedPanel} onOpenChange={setShowSelectedPanel}>
          <DialogContent
            showClose={false}
            mobileSheet
            className="w-[95vw] max-w-[95vw] sm:w-[520px] sm:max-w-[520px] p-0 overflow-hidden max-sm:max-h-[88vh] h-[80vh] !bg-transparent !shadow-none !border-none"
          >
            <PanelContent />
          </DialogContent>
        </Dialog>
      )}
    </>
  );
}
