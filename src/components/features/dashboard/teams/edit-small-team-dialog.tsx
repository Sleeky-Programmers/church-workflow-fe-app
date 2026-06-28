"use client";

import { X } from "lucide-react";
import { useEffect, useState } from "react";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Dialog, DialogClose, DialogContent } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader } from "@/components/ui/loader";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import Heading from "@/components/ui/typography/Heading";
import { Text } from "@/components/ui/typography/Text";
import { useIsMobile } from "@/hooks/use-mobile";
import { cn } from "@/lib/utils";
import { MemberProfile, TeamRow } from "@/types";

interface EditSmallTeamDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  team: TeamRow | null;
  members: MemberProfile[];
  currentMemberIds: string[];
  onSave: (data: {
    name: string;
    leaderId: string | null;
    memberIds: string[];
    status: "ACTIVE" | "INACTIVE";
    description: string;
  }) => Promise<void>;
  isSaving?: boolean;
}

const getInitials = (fullName: string) => {
  const names = fullName.trim().split(" ").filter(Boolean);
  if (!names.length) return "?";
  if (names.length === 1) return names[0][0].toUpperCase();
  return `${names[0][0]}${names[names.length - 1][0]}`.toUpperCase();
};

export function EditSmallTeamDialog({
  open,
  onOpenChange,
  team,
  members,
  currentMemberIds,
  onSave,
  isSaving = false,
}: EditSmallTeamDialogProps) {
  const isMobile = useIsMobile();

  const [name, setName] = useState("");
  const [leaderId, setLeaderId] = useState<string | null>(null);
  const [selectedMemberIds, setSelectedMemberIds] = useState<string[]>([]);
  const [status, setStatus] = useState<"ACTIVE" | "INACTIVE">("ACTIVE");
  const [description, setDescription] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (open && team) {
      setName(team.name);
      setStatus(team.status.toUpperCase() as "ACTIVE" | "INACTIVE");
      setSelectedMemberIds(currentMemberIds);
      setDescription(team.description || "");
      if (team.leader) {
        const leaderMember = members.find(
          (m) => m.fullName === team.leader?.name,
        );
        setLeaderId(leaderMember?.id || null);
      } else {
        setLeaderId(null);
      }
      setErrors({});
    }
  }, [open, team, members, currentMemberIds]);

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!name.trim()) {
      newErrors.name = "Team name is required";
    } else if (name.trim().length > 120) {
      newErrors.name = "Team name must be less than 120 characters";
    }

    if (selectedMemberIds.length === 0) {
      newErrors.members = "At least one member is required";
    }

    if (description && description.length > 2000) {
      newErrors.description = "Description must be less than 2000 characters";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;

    await onSave({
      name: name.trim(),
      leaderId: leaderId || null,
      memberIds: selectedMemberIds,
      status,
      description: description.trim(),
    });
  };

  const toggleMember = (memberId: string) => {
    setSelectedMemberIds((prev) =>
      prev.includes(memberId)
        ? prev.filter((id) => id !== memberId)
        : [...prev, memberId],
    );
  };

  if (!team) {
    return null;
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        showClose={false}
        mobileSheet={isMobile}
        className={cn(
          "!p-0 !bg-white !shadow-lg !border !border-gray-200",
          isMobile && "!rounded-t-2xl",
          "w-[95vw] max-w-[95vw] sm:w-[510px] sm:max-w-[510px]",
          "lg:w-[560px] lg:max-w-[560px]",
          "xl:w-[600px] xl:max-w-[600px]",
          "h-auto max-h-[85vh] sm:max-h-[80vh]",
        )}
      >
        <div className="flex flex-col h-full max-h-[85vh] sm:max-h-[80vh]">
          {/* Header - Fixed */}
          <div className="flex justify-between items-center border-b px-4 sm:px-6 py-3 sm:py-4 bg-white shrink-0 rounded-t-xl">
            <Heading level={2} className="text-lg sm:text-xl">
              Edit Team
            </Heading>
            <DialogClose asChild>
              <Button
                className="p-2"
                size="icon"
                variant="ghost"
                aria-label="Close dialog"
                onClick={() => onOpenChange(false)}
              >
                <X className="w-4 h-4" />
              </Button>
            </DialogClose>
          </div>

          {/* Content - Scrollable */}
          <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-3 sm:py-4 space-y-3 sm:space-y-4 bg-white">
            {/* Team Name */}
            <div className="space-y-1 w-full">
              <Label htmlFor="team-name" className="text-sm font-medium">
                Team Name <span className="text-red-500">*</span>
              </Label>
              <Input
                id="team-name"
                placeholder="Enter team name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className={cn("w-full", errors.name && "border-red-500")}
                disabled={isSaving}
              />
              {errors.name && (
                <Text variant="muted" className="text-xs text-red-500">
                  {errors.name}
                </Text>
              )}
            </div>

            {/* Status */}
            <div className="space-y-1 w-full">
              <Label htmlFor="team-status" className="text-sm font-medium">
                Status
              </Label>
              <Select
                value={status}
                onValueChange={(value) =>
                  setStatus(value as "ACTIVE" | "INACTIVE")
                }
                disabled={isSaving}
              >
                <SelectTrigger id="team-status" className="w-full">
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ACTIVE">Active</SelectItem>
                  <SelectItem value="INACTIVE">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Description */}
            <div className="space-y-1 w-full">
              <Label htmlFor="team-description" className="text-sm font-medium">
                Description
              </Label>
              <Textarea
                id="team-description"
                placeholder="Enter team description (optional)"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className={cn(
                  "resize-y w-full min-h-[60px]",
                  errors.description && "border-red-500",
                )}
                rows={2}
                disabled={isSaving}
              />
              <div className="flex justify-between">
                {errors.description && (
                  <Text variant="muted" className="text-xs text-red-500">
                    {errors.description}
                  </Text>
                )}
                <Text
                  variant="muted"
                  className={cn(
                    "text-xs ml-auto",
                    description.length > 2000 ? "text-red-500" : "",
                  )}
                >
                  {description.length}/2000
                </Text>
              </div>
            </div>

            {/* Leader */}
            <div className="space-y-1 w-full">
              <Label htmlFor="team-leader" className="text-sm font-medium">
                Team Leader
              </Label>
              <Select
                value={leaderId || "none"}
                onValueChange={(value) =>
                  setLeaderId(value === "none" ? null : value)
                }
                disabled={isSaving}
              >
                <SelectTrigger id="team-leader" className="w-full">
                  <SelectValue placeholder="Select team leader" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">None</SelectItem>
                  {members.map((member) => (
                    <SelectItem key={member.id} value={member.id}>
                      <div className="flex items-center gap-2">
                        <Avatar className="h-6 w-6">
                          <AvatarFallback className="bg-blue-100 text-blue-700 text-xs">
                            {getInitials(member.fullName)}
                          </AvatarFallback>
                        </Avatar>
                        <span>{member.fullName}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Text variant="muted" className="text-xs">
                Only members of this team can be assigned as leader
              </Text>
            </div>

            {/* Members */}
            <div className="space-y-1 w-full">
              <div className="flex items-center justify-between">
                <Label className="text-sm font-medium">
                  Team Members <span className="text-red-500">*</span>
                </Label>
                <Text variant="muted" className="text-xs">
                  {selectedMemberIds.length} selected
                </Text>
              </div>
              {errors.members && (
                <Text variant="muted" className="text-xs text-red-500">
                  {errors.members}
                </Text>
              )}
              <div className="border rounded-lg max-h-[150px] overflow-y-auto divide-y">
                {members.map((member) => {
                  const isSelected = selectedMemberIds.includes(member.id);
                  const isLeader = leaderId === member.id;

                  return (
                    <div
                      key={member.id}
                      className={cn(
                        "flex items-center justify-between px-3 py-2 cursor-pointer hover:bg-gray-50 transition-colors",
                        isSelected && "bg-blue-50/50",
                      )}
                      onClick={() => toggleMember(member.id)}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <Avatar className="h-8 w-8">
                          <AvatarFallback className="bg-gray-200 text-gray-700 text-xs">
                            {getInitials(member.fullName)}
                          </AvatarFallback>
                        </Avatar>
                        <div className="min-w-0">
                          <Text className="text-sm truncate">
                            {member.fullName}
                            {isLeader && (
                              <span className="ml-2 text-xs text-blue-600 font-medium">
                                (Leader)
                              </span>
                            )}
                          </Text>
                          <Text variant="muted" className="text-xs truncate">
                            {member.email}
                          </Text>
                        </div>
                      </div>
                      <div
                        className={cn(
                          "w-4 h-4 rounded border flex items-center justify-center flex-shrink-0",
                          isSelected
                            ? "bg-blue-600 border-blue-600"
                            : "border-gray-300",
                        )}
                      >
                        {isSelected && (
                          <svg
                            className="w-3 h-3 text-white"
                            fill="none"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path d="M5 13l4 4L19 7" />
                          </svg>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
              <Text variant="muted" className="text-xs">
                Click a member to toggle selection
              </Text>
            </div>
          </div>

          {/* Footer - Fixed */}
          <div className="flex justify-end gap-3 border-t border-gray-200 px-4 sm:px-6 py-3 sm:py-4 bg-gray-50 shrink-0 rounded-b-xl">
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isSaving}
              size="sm"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={isSaving}
              className="px-4 sm:px-6"
              size="sm"
            >
              {isSaving ? (
                <>
                  <Loader className="h-4 w-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                "Save Changes"
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
