"use client";

import { format } from "date-fns";
import { Calendar, Clock, MapPin, Star, User, X } from "lucide-react";
import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Span } from "@/components/ui/typography/Text";
import { useIsMobile } from "@/hooks/use-mobile";
import { useToast } from "@/hooks/use-toast";
import { useAttendanceModal } from "@/hooks/useAttendanceModal";
import {
  fetchMembers,
  getAttendanceRecord,
  saveAbsentAttendance,
  saveAttendance,
} from "@/lib/api";
import { getCurrentUserProfile } from "@/lib/auth/session";
import { AttendanceRecord, SpecialServiceEvent } from "@/types";

import { AttendanceStatsView } from "./attendance-stats";
import { SelectMembersView } from "./select-member-view";

type SpecialAttendanceModalProps = {
  isOpen: boolean;
  onClose: () => void;
  service: SpecialServiceEvent | null;
  date: string | null;
  onSave: (payload: {
    serviceId: string;
    date: string;
    presentMembers: string[];
    absentMembers: string[];
  }) => void;
};

export function SpecialAttendanceModal({
  isOpen,
  onClose,
  service,
  date,
  onSave,
}: SpecialAttendanceModalProps) {
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

  const userProfile = getCurrentUserProfile();
  const admin = userProfile?.fullName || "Unknown";
  const [isSaving, setIsSaving] = useState(false);
  const [hasMembersLoaded, setHasMembersLoaded] = useState(false);
  const [isMembersDialogOpen, setIsMembersDialogOpen] = useState(false);
  const [membersViewMode, setMembersViewMode] = useState<
    "select" | "present" | "absent"
  >("select");
  const [absentSelections, setAbsentSelections] = useState<string[]>([]);
  const [isEditMode, setIsEditMode] = useState(false);
  const [attendanceRecord, setAttendanceRecord] =
    useState<AttendanceRecord | null>(null);
  const [attendanceStats, setAttendanceStats] = useState<{
    presentCount: number;
    absentCount: number;
  } | null>(null);

  const hasExistingAttendance = Boolean(attendanceRecord);
  const { toast } = useToast();

  // Helper to get schedule for the specific date
  const getScheduleForDate = (
    service: SpecialServiceEvent,
    dateStr: string,
  ) => {
    return service.daySchedules?.find((s) => s.date === dateStr);
  };

  // Helper to load members
  const ensureMembersLoaded = async (skipIfLoaded: boolean = true) => {
    if (skipIfLoaded && hasMembersLoaded) return;
    setLoading(true);
    try {
      const data = await fetchMembers(1, 100);
      setMembers(data.members);

      if (attendanceRecord?.presentMembers?.length) {
        initializeAttendance(attendanceRecord.presentMembers);
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

  useEffect(() => {
    if (!isOpen) return;
    setIsEditMode(false);
    setIsMembersDialogOpen(false);
    setMembersViewMode("select");
    setAbsentSelections([]);
    setHasMembersLoaded(false);
    setAttendanceRecord(null);
    setAttendanceStats(null);
  }, [isOpen]);

  const isFutureDate = (dateString: string): boolean => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const selectedDate = new Date(dateString);
    selectedDate.setHours(0, 0, 0, 0);
    return selectedDate > today;
  };

  useEffect(() => {
    if (!isOpen || !service || !date) return;

    if (isFutureDate(date)) {
      toast({
        title: "Cannot Mark Attendance",
        description:
          "You cannot mark attendance for future dates. Please select a past or current date.",
        variant: "destructive",
      });
      handleClose();
      return;
    }

    let isActive = true;

    const loadAttendance = async () => {
      try {
        const result = await getAttendanceRecord(service.id, date);
        if (!isActive) return;

        if (result.stats) {
          setAttendanceStats({
            presentCount: result.stats.present.total,
            absentCount: result.stats.absent.total,
          });
        } else {
          setAttendanceStats(null);
        }

        if (result.attendance) {
          const schedule = getScheduleForDate(service, date);
          const record: AttendanceRecord = {
            serviceId: service.id,
            date,
            presentMembers: result.attendance.attendees || [],
            absentMembers: [],
            recordedBy: result.attendance.recordedBy,
            location: service.location || "",
            startTime: schedule?.startTime || "",
            endTime: schedule?.endTime || "",
          };
          setAttendanceRecord(record);
          setIsEditMode(false);
        } else {
          setAttendanceRecord(null);
          setIsEditMode(true);
        }

        // Load members immediately after attendance is loaded
        await ensureMembersLoaded(false);
      } catch (error: any) {
        if (!isActive) return;
        toast({
          title: "Error",
          description: error.message || "Failed to load attendance",
          variant: "destructive",
        });
        setAttendanceRecord(null);
        setAttendanceStats(null);
        setIsEditMode(true);
        // Still try to load members even if attendance failed
        await ensureMembersLoaded(false);
      }
    };

    loadAttendance();

    return () => {
      isActive = false;
    };
  }, [isOpen, service, date, toast]);

  const loadAllMembers = async () => {
    await ensureMembersLoaded(false);
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
    await ensureMembersLoaded(false);
    setMembersViewMode("present");
    setSearch("");
    setIsMembersDialogOpen(true);
  };

  const openAbsentMembersView = async () => {
    await ensureMembersLoaded(false);
    setMembersViewMode("absent");
    setSearch("");
    setAbsentSelections([]);
    setIsMembersDialogOpen(true);
  };

  const handleSave = async () => {
    if (!service || !date) return;
    setIsSaving(true);

    try {
      if (state.presentMembers.length > 0) {
        await saveAttendance({
          serviceId: service.id,
          date,
          presentMembers: state.presentMembers,
        });
      }

      if (absentSelections.length > 0) {
        await saveAbsentAttendance({
          serviceId: service.id,
          date,
          absentMembers: absentSelections,
        });
      }

      onSave({
        serviceId: service.id,
        date,
        presentMembers: state.presentMembers,
        absentMembers: absentSelections,
      });

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

  const schedule = getScheduleForDate(service, date);
  const serviceName = service.serviceName;
  const serviceLocation = service.location || "";
  const serviceStartTime = schedule?.startTime || "";
  const serviceEndTime = schedule?.endTime || "";

  const parsedDate = new Date(date);
  const presentMembers = getPresentMembers();
  const absentMembers = getAbsentMembers();
  const presentCount =
    hasMembersLoaded || !hasExistingAttendance
      ? presentMembers.length
      : (attendanceStats?.presentCount ??
          attendanceRecord?.presentMembers.length) ||
        0;
  const absentCount =
    hasMembersLoaded || !hasExistingAttendance
      ? absentMembers.length
      : (attendanceStats?.absentCount ??
          attendanceRecord?.absentMembers.length) ||
        0;

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
            <DialogTitle className="text-xl font-semibold mb-3 flex items-center gap-2">
              <Star className="h-5 w-5 text-primary" />
              {serviceName} attendance
            </DialogTitle>
            <DialogDescription className="sr-only">
              Review attendance details and manage present or absent members.
            </DialogDescription>
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
            <Span>Recorded by: {admin}</Span>
          </div>
          {serviceStartTime && (
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4" />
              <Span>
                {serviceStartTime}
                {serviceEndTime && ` - ${serviceEndTime}`}
              </Span>
            </div>
          )}
          {serviceLocation && (
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4" />
              <Span className="truncate">{serviceLocation}</Span>
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
        showLoadMembersButton={!hasMembersLoaded}
        loadMembersMuted={isEditMode}
        onLoadMembers={loadAllMembers}
        onOpenPresentMembers={openPresentMembersView}
        onOpenAbsentMembers={openAbsentMembersView}
      />

      <div className="px-6 py-4 mt-auto">
        {isFutureDate(date) ? (
          <Button disabled className="w-full opacity-50 cursor-not-allowed">
            Cannot Edit Future Dates
          </Button>
        ) : hasExistingAttendance && !isEditMode ? (
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
            : (memberId: any, selected: any) => {
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

  // Mobile view
  if (isMobile) {
    const isSummaryOpen = isOpen && !isMembersDialogOpen;
    const isMembersOpen = isOpen && isMembersDialogOpen;

    return (
      <>
        {/* Summary Dialog */}
        <Dialog
          open={isSummaryOpen}
          onOpenChange={(open) => {
            if (!open) handleClose();
          }}
        >
          <DialogContent
            showClose={false}
            mobileSheet
            className="w-full max-w-[420px] p-0 overflow-hidden max-sm:max-h-[88vh]"
          >
            <DialogDescription className="sr-only">
              Attendance summary for the selected service.
            </DialogDescription>
            {summaryCard}
          </DialogContent>
        </Dialog>

        {/* Members Selection Dialog */}
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
            <DialogDescription className="sr-only">
              Select members to mark attendance as present or absent.
            </DialogDescription>
            {membersCard}
          </DialogContent>
        </Dialog>
      </>
    );
  }

  // Desktop view
  return (
    <Dialog
      open={isOpen}
      onOpenChange={(open) => {
        if (!open) handleClose();
      }}
    >
      <DialogContent
        showClose={false}
        className="!p-0 !bg-transparent !shadow-none !border-none !max-w-none !w-auto !h-auto"
      >
        <DialogDescription className="sr-only">
          Attendance details for the selected service.
        </DialogDescription>
        <div className="flex items-start gap-4">
          {summaryCard}
          {isMembersDialogOpen && membersCard}
        </div>
      </DialogContent>
    </Dialog>
  );
}
