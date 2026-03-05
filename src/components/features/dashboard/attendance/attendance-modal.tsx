"use client";

import { useEffect, useMemo, useState } from "react";
import { format } from "date-fns";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Calendar, Clock, MapPin, User, X } from "lucide-react";
import { RegularService } from "@/types";
import { useAttendanceModal } from "@/hooks/useAttendanceModal";
import { fetchMembers, getCurrentAdmin, saveAttendance } from "@/lib/api";
import { SelectMembersView } from "./select-member-view";
import { AttendanceStatsView } from "./attendance-stats";
import { Span } from "@/components/ui/typography/Text";
import Heading from "@/components/ui/typography/Heading";
import { useToast } from "@/hooks/use-toast";
import { useIsMobile } from "@/hooks/use-mobile";

type AttendanceModalProps = {
  isOpen: boolean;
  onClose: () => void;
  service: RegularService | null;
  date: string | null;
  onSave: () => void;
};

export function AttendanceModal({
  isOpen,
  onClose,
  service,
  date,
  onSave,
}: AttendanceModalProps) {
  const isMobile = useIsMobile();
  const {
    state,
    setMembers,
    toggleMember,
    markPresent,
    removeMember,
    undoRemove,
    moveToPresent,
    setLoading,
    setSearch,
    reset,
    getPresentMembers,
    getAbsentMembers,
    initializeAttendance,
  } = useAttendanceModal();

  const [isSaving, setIsSaving] = useState(false);
  const [hasMembersLoaded, setHasMembersLoaded] = useState(false);
  const [isMembersDialogOpen, setIsMembersDialogOpen] = useState(false);
  const [membersViewMode, setMembersViewMode] = useState<
    "select" | "present" | "absent"
  >("select");
  const [absentSelections, setAbsentSelections] = useState<string[]>([]);
  const [isEditMode, setIsEditMode] = useState(false);

  const existingRecord = useMemo(() => {
    if (!service || !date) return null;
    return (
      service.attendanceRecords?.find((record) => record.date === date) || null
    );
  }, [service, date]);

  const hasExistingAttendance = Boolean(existingRecord);

  const { toast } = useToast();

  useEffect(() => {
    if (!isOpen) return;
    setIsEditMode(!hasExistingAttendance);
    setIsMembersDialogOpen(false);
    setMembersViewMode("select");
    setAbsentSelections([]);
    setHasMembersLoaded(false);
  }, [isOpen, hasExistingAttendance]);

  const ensureMembersLoaded = async () => {
    if (hasMembersLoaded) return;
    setLoading(true);
    try {
      const data = await fetchMembers(1, 100);
      setMembers(data.members);

      if (existingRecord?.presentMembers?.length) {
        initializeAttendance(existingRecord.presentMembers);
      }
      setHasMembersLoaded(true);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to load members",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const loadAllMembers = async () => {
    await ensureMembersLoaded();
    setSearch("");
    setMembersViewMode("select");
    setIsMembersDialogOpen(true);
  };

  const handleMarkPresent = () => {
    markPresent(state.presentMembers);
    if (isMobile) {
      setIsMembersDialogOpen(false);
    }
  };

  const handleUpdatePresentRecord = () => {
    if (isMobile) {
      setIsMembersDialogOpen(false);
    }
  };

  const handleAbsentSelection = (memberId: string, selected: boolean) => {
    setAbsentSelections((prev) =>
      selected
        ? prev.includes(memberId)
          ? prev
          : [...prev, memberId]
        : prev.filter((id) => id !== memberId),
    );
  };

  const handleMarkAbsentAsPresent = () => {
    moveToPresent(absentSelections);
    setAbsentSelections([]);
    if (isMobile) {
      setIsMembersDialogOpen(false);
    }
  };

  const openPresentMembersView = async () => {
    await ensureMembersLoaded();
    setMembersViewMode("present");
    setSearch("");
    setIsMembersDialogOpen(true);
  };

  const openAbsentMembersView = async () => {
    await ensureMembersLoaded();
    setMembersViewMode("absent");
    setSearch("");
    setAbsentSelections([]);
    setIsMembersDialogOpen(true);
  };

  const handleSave = async () => {
    if (!service || !date) return;

    setIsSaving(true);
    try {
      const admin = getCurrentAdmin();
      await saveAttendance({
        serviceId: service.id,
        date,
        presentMembers: state.presentMembers,
        recordedBy: admin.name,
        location: service.location || "",
        startTime: service.startTime,
        endTime: service.endTime,
      });

      const nextRecord = {
        serviceId: service.id,
        date,
        presentMembers: state.presentMembers,
        absentMembers: state.allMembers
          .map((member) => member.id)
          .filter((id) => !state.presentMembers.includes(id)),
        recordedBy: admin.name,
        location: service.location || "",
        startTime: service.startTime,
        endTime: service.endTime,
      };

      if (!service.attendanceRecords) {
        service.attendanceRecords = [nextRecord];
      } else {
        const recordIndex = service.attendanceRecords.findIndex(
          (record) => record.date === date,
        );

        if (recordIndex >= 0) {
          service.attendanceRecords[recordIndex] = nextRecord;
        } else {
          service.attendanceRecords.push(nextRecord);
        }
      }

      onSave();
      handleClose();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to save attendance",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleClose = () => {
    reset();
    setHasMembersLoaded(false);
    setIsMembersDialogOpen(false);
    setSearch("");
    setMembersViewMode("select");
    setAbsentSelections([]);
    setIsEditMode(false);
    onClose();
  };

  if (!service || !date) return null;

  const admin = getCurrentAdmin();
  const parsedDate = new Date(date);
  const presentMembers = getPresentMembers();
  const absentMembers = getAbsentMembers();
  const presentCount =
    hasMembersLoaded || !hasExistingAttendance
      ? presentMembers.length
      : existingRecord?.presentMembers.length || 0;
  const absentCount =
    hasMembersLoaded || !hasExistingAttendance
      ? absentMembers.length
      : existingRecord?.absentMembers.length || 0;

  const panelMembers =
    membersViewMode === "present"
      ? presentMembers
      : membersViewMode === "absent"
        ? absentMembers
        : state.allMembers;

  const panelTitle =
    membersViewMode === "present"
      ? "Present Members"
      : membersViewMode === "absent"
        ? "Absent Members"
        : "Select Members";

  const panelActionLabel =
    membersViewMode === "present"
      ? isEditMode
        ? "Update Record"
        : "Close"
      : membersViewMode === "absent"
        ? isEditMode
          ? "Mark as present"
          : "Close"
        : "Mark as present";

  const summaryCard = (
    <div className="rounded-xl shadow-lg w-full sm:w-[400px] h-full flex flex-col overflow-hidden bg-gray-50">
      <DialogHeader className="px-6 py-4 border-b">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <DialogTitle className="text-xl font-semibold mb-3">
              {service.serviceName} attendance
            </DialogTitle>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={handleClose}
            className="flex-shrink-0"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </DialogHeader>

      <div className="p-4 sm:p-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-3 text-sm">
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            <Span>{format(parsedDate, "MMM. d, yyyy")}</Span>
          </div>
          <div className="flex items-center gap-2">
            <User className="h-4 w-4" />
            <Span>Recorded by: {admin.name}</Span>
          </div>
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4" />
            <Span>
              {service.startTime}
              {service.endTime && ` - ${service.endTime}`}
            </Span>
          </div>
          {service.location && (
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4" />
              <Span className="truncate">{service.location}</Span>
            </div>
          )}
        </div>
      </div>

      <AttendanceStatsView
        presentMembers={presentMembers}
        absentMembers={absentMembers}
        presentCount={presentCount}
        absentCount={absentCount}
        isMembersLoaded={hasMembersLoaded}
        isAttendanceMarked={hasExistingAttendance || state.hasChanges}
        showLoadMembersButton={isEditMode || !hasExistingAttendance}
        loadMembersMuted={isEditMode}
        onLoadMembers={loadAllMembers}
        onOpenPresentMembers={openPresentMembersView}
        onOpenAbsentMembers={openAbsentMembersView}
      />

      <div className="px-6 py-4 mt-auto">
        {hasExistingAttendance && !isEditMode ? (
          <Button onClick={() => setIsEditMode(true)} className="w-full">
            Edit
          </Button>
        ) : (
          <Button
            onClick={handleSave}
            disabled={isSaving || !state.hasChanges}
            className="w-full"
          >
            {isSaving ? "Saving..." : "Save"}
          </Button>
        )}
      </div>
    </div>
  );
  const membersCard = (
    <div className="rounded-xl shadow-lg w-full sm:w-[480px] h-[80vh] flex flex-col overflow-hidden bg-gray-50">
      <SelectMembersView
        mode={membersViewMode}
        title={panelTitle}
        actionLabel={panelActionLabel}
        editable={isEditMode}
        members={panelMembers}
        selectedMembers={
          membersViewMode === "absent"
            ? absentSelections
            : membersViewMode === "select"
              ? state.presentMembers
              : []
        }
        onToggleMember={
          membersViewMode === "absent"
            ? handleAbsentSelection
            : (memberId, selected) => {
                if (!selected && state.presentMembers.includes(memberId)) {
                  toggleMember(memberId);
                }

                if (selected && !state.presentMembers.includes(memberId)) {
                  toggleMember(memberId);
                }
              }
        }
        onAction={
          !isEditMode
            ? () => setIsMembersDialogOpen(false)
            : membersViewMode === "present"
              ? handleUpdatePresentRecord
              : membersViewMode === "absent"
                ? handleMarkAbsentAsPresent
                : handleMarkPresent
        }
        searchQuery={state.searchQuery}
        onSearchChange={setSearch}
        removedCount={state.removedMembers.length}
        onUndoRemove={undoRemove}
        onRemoveMember={removeMember}
      />
    </div>
  );

  if (isMobile) {
    const isSummaryOpen = isOpen && !isMembersDialogOpen;
    const isMembersOpen = isOpen && isMembersDialogOpen;

    return (
      <>
        <Dialog open={isSummaryOpen} onOpenChange={handleClose}>
          <DialogContent
            showClose={false}
            mobileSheet
            className="w-full max-w-[420px] p-0 overflow-hidden max-sm:max-h-[88vh]"
          >
            {summaryCard}
          </DialogContent>
        </Dialog>

        <Dialog
          open={isMembersOpen}
          onOpenChange={(open) => {
            if (!open) setIsMembersDialogOpen(false);
          }}
        >
          <DialogContent
            showClose={false}
            mobileSheet
            className="w-full max-w-[520px] p-0 overflow-hidden max-sm:max-h-[88vh] h-[80vh]"
          >
            {membersCard}
          </DialogContent>
        </Dialog>
      </>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent
        showClose={false}
        className="!p-0 !bg-transparent !shadow-none !border-none !max-w-none !w-auto !h-auto"
      >
        <div className="flex items-start gap-4">
          {summaryCard}
          {isMembersDialogOpen && membersCard}
        </div>
      </DialogContent>
    </Dialog>
  );
}
