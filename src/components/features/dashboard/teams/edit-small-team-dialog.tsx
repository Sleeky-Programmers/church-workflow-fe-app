"use client";

import { X } from "lucide-react";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Dialog, DialogClose, DialogContent } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Loader } from "@/components/ui/loader";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import Heading from "@/components/ui/typography/Heading";
import { Text } from "@/components/ui/typography/Text";
import { useHasAccess } from "@/lib/access-control";
import { useIsMobile } from "@/hooks/use-mobile";
import { cn } from "@/lib/utils";
import { MemberProfile, TeamRow } from "@/types";
import { editSmallTeamSchema, EditSmallTeamFormValues } from "@/types/schema";

import { TeamLeaderPicker } from "./team-leader-picker";

interface EditSmallTeamDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  team: TeamRow | null;
  members: MemberProfile[];
  currentMemberIds: string[];
  onSave: (data: {
    name: string;
    leaderId: string | null;
    pendingLeaderEmail: string | null;
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
  const canChangeLeader = useHasAccess("SMALL_TEAMS", "FULL_ACCESS");

  const form = useForm<EditSmallTeamFormValues>({
    resolver: zodResolver(editSmallTeamSchema),
    defaultValues: {
      name: "",
      leaderId: null,
      pendingLeaderEmail: null,
      memberIds: [],
      status: "ACTIVE",
      description: "",
    },
  });

  useEffect(() => {
    if (open && team) {
      form.reset({
        name: team.name,
        status: team.status.toUpperCase() as "ACTIVE" | "INACTIVE",
        memberIds: currentMemberIds,
        description: team.description || "",
        leaderId: team.leader?.id || null,
        pendingLeaderEmail: team.pendingLeaderEmail || null,
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, team, currentMemberIds]);

  const selectedMemberIds = form.watch("memberIds");
  const leaderId = form.watch("leaderId");
  const pendingLeaderEmail = form.watch("pendingLeaderEmail");

  const handleSubmit = async (values: EditSmallTeamFormValues) => {
    await onSave({
      name: values.name.trim(),
      leaderId: values.leaderId || null,
      pendingLeaderEmail: values.pendingLeaderEmail || null,
      memberIds: values.memberIds,
      status: values.status,
      description: (values.description || "").trim(),
    });
  };

  const toggleMember = (memberId: string) => {
    const current = form.getValues("memberIds");
    form.setValue(
      "memberIds",
      current.includes(memberId)
        ? current.filter((id) => id !== memberId)
        : [...current, memberId],
      { shouldValidate: true },
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
          <Form {...form}>
            <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-3 sm:py-4 space-y-3 sm:space-y-4 bg-white">
              {/* Team Name */}
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem className="space-y-1 w-full">
                    <FormLabel className="text-sm font-medium">
                      Team Name <span className="text-red-500">*</span>
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Enter team name"
                        className="w-full"
                        disabled={isSaving}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Status */}
              <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                  <FormItem className="space-y-1 w-full">
                    <FormLabel className="text-sm font-medium">
                      Status
                    </FormLabel>
                    <Select
                      value={field.value}
                      onValueChange={field.onChange}
                      disabled={isSaving}
                    >
                      <FormControl>
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Select status" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="ACTIVE">Active</SelectItem>
                        <SelectItem value="INACTIVE">Inactive</SelectItem>
                      </SelectContent>
                    </Select>
                  </FormItem>
                )}
              />

              {/* Description */}
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem className="space-y-1 w-full">
                    <FormLabel className="text-sm font-medium">
                      Description
                    </FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Enter team description (optional)"
                        className="resize-y w-full min-h-[60px]"
                        rows={2}
                        disabled={isSaving}
                        {...field}
                      />
                    </FormControl>
                    <div className="flex justify-between">
                      <FormMessage />
                      <Text
                        variant="muted"
                        className={cn(
                          "text-xs ml-auto",
                          (field.value?.length || 0) > 2000
                            ? "text-red-500"
                            : "",
                        )}
                      >
                        {field.value?.length || 0}/2000
                      </Text>
                    </div>
                  </FormItem>
                )}
              />

              {/* Leader */}
              <TeamLeaderPicker
                leaderId={leaderId || ""}
                leaderName={team.leader?.name}
                readOnly={!canChangeLeader}
                onLeaderIdChange={(id) =>
                  form.setValue("leaderId", id || null, {
                    shouldValidate: true,
                  })
                }
                pendingLeaderEmail={pendingLeaderEmail || null}
                onPendingLeaderEmailChange={(email) =>
                  form.setValue("pendingLeaderEmail", email, {
                    shouldValidate: true,
                  })
                }
                disabled={isSaving}
              />

              {/* Members */}
              <FormField
                control={form.control}
                name="memberIds"
                render={() => (
                  <FormItem className="space-y-1 w-full">
                    <div className="flex items-center justify-between">
                      <FormLabel className="text-sm font-medium">
                        Team Members <span className="text-red-500">*</span>
                      </FormLabel>
                      <Text variant="muted" className="text-xs">
                        {selectedMemberIds.length} selected
                      </Text>
                    </div>
                    <FormMessage />
                    <div className="border rounded-lg max-h-[150px] overflow-y-auto divide-y">
                      {members.map((member) => {
                        const isSelected = selectedMemberIds.includes(
                          member.id,
                        );
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
                                <Text
                                  variant="muted"
                                  className="text-xs truncate"
                                >
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
                  </FormItem>
                )}
              />
            </div>
          </Form>

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
              onClick={form.handleSubmit(handleSubmit)}
              disabled={isSaving}
              className="px-4 sm:px-6"
              size="sm"
            >
              {isSaving ? (
                <span className="flex items-center gap-2">
                  <Loader size="w-4 h-4" showShadow={false} />
                  Saving...
                </span>
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
