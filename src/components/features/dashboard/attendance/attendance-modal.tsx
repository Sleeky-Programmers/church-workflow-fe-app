"use client";

import { useState } from "react";
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
  } = useAttendanceModal();

  const [isSaving, setIsSaving] = useState(false);
  const [hasMembersLoaded, setHasMembersLoaded] = useState(false);
  const [isMembersOpen, setIsMembersOpen] = useState(false);
  const [membersViewMode, setMembersViewMode] = useState<
    "select" | "present" | "absent"
  >("select");
  const [absentSelections, setAbsentSelections] = useState<string[]>([]);

  const loadAllMembers = async () => {
    setLoading(true);
    try {
      const data = await fetchMembers(1, 100);
      setMembers(data.members);
      setHasMembersLoaded(true);
      setSearch("");
      setMembersViewMode("select");
      setIsMembersOpen(true);
    } catch (error) {
      console.error("Failed to load members:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleMarkPresent = () => {
    markPresent(state.presentMembers);
    setIsMembersOpen(false);
  };

  const handleUpdatePresentRecord = () => {
    setIsMembersOpen(false);
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
    setIsMembersOpen(false);
  };

  const openPresentMembersView = () => {
    setMembersViewMode("present");
    setSearch("");
    setIsMembersOpen(true);
  };

  const openAbsentMembersView = () => {
    setMembersViewMode("absent");
    setSearch("");
    setAbsentSelections([]);
    setIsMembersOpen(true);
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
    } catch (error) {
      console.error("Failed to save attendance:", error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleClose = () => {
    reset();
    setHasMembersLoaded(false);
    setIsMembersOpen(false);
    setSearch("");
    setMembersViewMode("select");
    setAbsentSelections([]);
    onClose();
  };

  if (!service || !date) return null;

  const admin = getCurrentAdmin();
  const parsedDate = new Date(date);
  const presentMembers = getPresentMembers();
  const absentMembers = getAbsentMembers();

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
      ? "Update Record"
      : membersViewMode === "absent"
        ? "Mark as Present"
        : "Mark as present";

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      {/*
        The DialogContent is made transparent and borderless so we can render
        two independent card panels side by side inside it, matching the design
        where each panel is its own floating card.
      */}
      <DialogContent
        showClose={false}
        className="!p-0 !bg-transparent !shadow-none !border-none !max-w-none !w-auto !h-auto"
      >
        <div className="flex items-start gap-4">
          <div className="rounded-xl shadow-lg w-[420px] h-full flex flex-col overflow-hidden">
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

            <div className="p-6">
              <div className="grid grid-cols-2 gap-x-6 gap-y-3 text-sm">
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
              isMembersLoaded={hasMembersLoaded}
              isAttendanceMarked={state.hasChanges}
              onLoadMembers={loadAllMembers}
              onOpenPresentMembers={openPresentMembersView}
              onOpenAbsentMembers={openAbsentMembersView}
            />

            <div className="px-6 py-4 mt-auto">
              <Button
                onClick={handleSave}
                disabled={isSaving || !state.hasChanges}
                className="w-full"
              >
                {isSaving ? "Saving..." : "Save"}
              </Button>
            </div>
          </div>

          {isMembersOpen && (
            <div className="rounded-xl shadow-lg w-[480px] h-[80vh] flex flex-col overflow-hidden">
              <SelectMembersView
                mode={membersViewMode}
                title={panelTitle}
                actionLabel={panelActionLabel}
                members={panelMembers}
                selectedMembers={
                  membersViewMode === "absent"
                    ? absentSelections
                    : state.presentMembers
                }
                onToggleMember={
                  membersViewMode === "absent"
                    ? handleAbsentSelection
                    : (memberId, selected) => {
                        if (
                          !selected &&
                          state.presentMembers.includes(memberId)
                        ) {
                          toggleMember(memberId);
                        }

                        if (
                          selected &&
                          !state.presentMembers.includes(memberId)
                        ) {
                          toggleMember(memberId);
                        }
                      }
                }
                onAction={
                  membersViewMode === "present"
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
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
