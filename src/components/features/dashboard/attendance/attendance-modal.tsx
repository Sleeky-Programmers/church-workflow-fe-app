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
    setLoading,
    setSearch,
    reset,
    getPresentMembers,
    getAbsentMembers,
  } = useAttendanceModal();

  const [isSaving, setIsSaving] = useState(false);
  const [hasMembersLoaded, setHasMembersLoaded] = useState(false);
  const [isMembersModalOpen, setIsMembersModalOpen] = useState(false);

  const loadAllMembers = async () => {
    setLoading(true);
    try {
      const data = await fetchMembers(1, 100);
      setMembers(data.members);
      setHasMembersLoaded(true);
      setIsMembersModalOpen(true);
    } catch (error) {
      console.error("Failed to load members:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleMarkPresent = () => {
    markPresent(state.presentMembers);
    setIsMembersModalOpen(false);
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
    setIsMembersModalOpen(false);
    onClose();
  };

  if (!service || !date) return null;

  const admin = getCurrentAdmin();
  const parsedDate = new Date(date);
  const presentMembers = getPresentMembers();
  const absentMembers = getAbsentMembers();

  return (
    <>
      <Dialog open={isOpen} onOpenChange={handleClose}>
        <DialogContent showClose={false} className="max-w-md h-[80vh] p-0">
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
          />

          <div className="px-6 py-4">
            <Button
              onClick={handleSave}
              disabled={isSaving || !state.hasChanges}
              className="w-full"
            >
              {isSaving ? "Saving..." : "Save"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={isMembersModalOpen} onOpenChange={setIsMembersModalOpen}>
        <DialogContent showClose={false} className="max-w-md h-[80vh] p-0">
          <SelectMembersView
            isOpen={isMembersModalOpen}
            selectedMembers={state.presentMembers}
            onToggleMember={toggleMember}
            onMarkPresent={handleMarkPresent}
            searchQuery={state.searchQuery}
            onSearchChange={setSearch}
          />
        </DialogContent>
      </Dialog>
    </>
  );
}
