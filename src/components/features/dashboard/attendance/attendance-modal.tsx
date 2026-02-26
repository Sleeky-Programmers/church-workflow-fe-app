"use client";

import { useEffect, useState } from "react";
import { format } from "date-fns";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Calendar,
  Clock,
  MapPin,
  User,
  X,
  AlertCircle,
  Search,
} from "lucide-react";
import { RegularService } from "@/types";
import { useAttendanceModal } from "@/hooks/useAttendanceModal";
import { fetchMembers, getCurrentAdmin, saveAttendance } from "@/lib/api";
import { SelectMembersView } from "./select-member-view";
import { AttendanceStatsView } from "./attendance-stats";
import { MemberListItem } from "./member-list";
import { Span } from "@/components/ui/typography/Text";
import Heading from "@/components/ui/typography/Heading";

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
    setView,
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
    getFilteredMembers,
  } = useAttendanceModal();

  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (isOpen && service) {
      loadAllMembers();
    }
  }, [isOpen, service]);

  const loadAllMembers = async () => {
    setLoading(true);
    try {
      const data = await fetchMembers(1, 100);
      setMembers(data.members);
    } catch (error) {
      console.error("Failed to load members:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleMarkPresent = () => {
    markPresent(state.presentMembers);
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
    onClose();
  };

  if (!service || !date) return null;

  const admin = getCurrentAdmin();
  const parsedDate = new Date(date);
  const presentMembers = getPresentMembers();
  const absentMembers = getAbsentMembers();
  const filteredMembers = getFilteredMembers();

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent
        showClose={false}
        className="max-w-4xl h-[80vh] flex flex-col p-0"
      >
        <DialogHeader className="px-6 py-4 border-b">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <DialogTitle className="text-xl font-semibold mb-3">
                {service.serviceName} attendance
              </DialogTitle>
              <div className="grid grid-cols-2 gap-x-6 gap-y-2 text-sm">
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

        <div className="flex-1 flex min-h-0">
          <div className="flex-1 flex flex-col min-h-0">
            {(state.view === "stats" || state.view === "select") && (
              <AttendanceStatsView
                presentMembers={presentMembers}
                absentMembers={absentMembers}
                onViewPresent={() => setView("present")}
                onViewAbsent={() => setView("absent")}
                onLoadMembers={loadAllMembers}
              />
            )}

            {state.view === "present" && (
              <div className="flex-1 flex flex-col">
                <div className="p-4 flex items-center justify-between">
                  <Heading level={3} className="font-semibold text-base">
                    Present Members
                  </Heading>
                  <Button
                    variant="default"
                    size="sm"
                    onClick={() => setView("stats")}
                  >
                    Update Record
                  </Button>
                </div>

                {state.removedMembers.length > 0 && (
                  <Alert variant="destructive" className="mx-4 mt-4">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription className="flex items-center justify-between">
                      <Span variant="error">
                        You removed {state.removedMembers.length} member(s)
                      </Span>
                      <Button
                        variant="link"
                        size="sm"
                        onClick={undoRemove}
                        className="p-0 h-auto"
                      >
                        Undo
                      </Button>
                    </AlertDescription>
                  </Alert>
                )}

                <div className="p-4">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      placeholder="Select or search"
                      value={state.searchQuery}
                      onChange={(e) => setSearch(e.target.value)}
                      className="pl-9"
                    />
                  </div>
                </div>

                <div className="flex-1 overflow-y-auto p-4">
                  {presentMembers
                    .filter(
                      (m) =>
                        !state.searchQuery ||
                        m.name
                          .toLowerCase()
                          .includes(state.searchQuery.toLowerCase()) ||
                        m.email
                          .toLowerCase()
                          .includes(state.searchQuery.toLowerCase()),
                    )
                    .map((member) => (
                      <MemberListItem
                        key={member.id}
                        member={member}
                        mode="view-present"
                        onRemove={removeMember}
                      />
                    ))}
                </div>
              </div>
            )}

            {state.view === "absent" && (
              <div className="flex-1 flex flex-col">
                <div className="p-4 flex items-center justify-between">
                  <Heading level={3} className="font-semibold text-base">
                    Absent Members
                  </Heading>
                  <Button
                    variant="default"
                    size="sm"
                    onClick={() => {
                      const selected = state.allMembers
                        .filter((m) => state.presentMembers.includes(m.id))
                        .map((m) => m.id);
                      if (selected.length > 0) {
                        moveToPresent(selected);
                      }
                    }}
                    disabled={state.presentMembers.length === 0}
                  >
                    Mark as present
                  </Button>
                </div>

                <div className="p-4">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      placeholder="Select or search"
                      value={state.searchQuery}
                      onChange={(e) => setSearch(e.target.value)}
                      className="pl-9"
                    />
                  </div>
                </div>

                <div className="flex-1 overflow-y-auto p-4">
                  {absentMembers
                    .filter(
                      (m) =>
                        !state.searchQuery ||
                        m.name
                          .toLowerCase()
                          .includes(state.searchQuery.toLowerCase()) ||
                        m.email
                          .toLowerCase()
                          .includes(state.searchQuery.toLowerCase()),
                    )
                    .map((member) => (
                      <MemberListItem
                        key={member.id}
                        member={member}
                        mode="view-absent"
                        isSelected={state.presentMembers.includes(member.id)}
                        onSelect={toggleMember}
                      />
                    ))}
                </div>
              </div>
            )}
          </div>

          {state.view === "select" && (
            <div className="w-96 flex flex-col min-h-0 border-l-0">
              <SelectMembersView
                selectedMembers={state.presentMembers}
                onToggleMember={toggleMember}
                onMarkPresent={handleMarkPresent}
                searchQuery={state.searchQuery}
                onSearchChange={setSearch}
              />
            </div>
          )}
        </div>

        <div className="px-6 py-4">
          <Button
            onClick={handleSave}
            disabled={isSaving || state.presentMembers.length === 0}
            className="w-full"
          >
            {isSaving ? "Saving..." : "Save"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
