"use client";

import { ExternalLink, Plus, RefreshCw, X } from "lucide-react";
import { useState } from "react";

import {
  MemberMultiSelect,
  MemberSingleSelect,
} from "@/components/features/dashboard/departments/member-selectors";
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
import { Span } from "@/components/ui/typography/Text";
import { useIsMobile } from "@/hooks/use-mobile";
import { useToast } from "@/hooks/use-toast";
import { createDepartment } from "@/services/departmentService";
import { fetchMembers } from "@/services/memberService";
import { fetchAdmins } from "@/services/userServices";
import { MemberProfile } from "@/types";
import { InviteFormData, PendingInvite } from "@/types/user";

import { InviteUserDialog } from "../admin/invite-user";

interface Props {
  onSave?: (payload: {
    name: string;
    hodId: string;
    memberIds: string[];
    status: string;
    description: string;
  }) => void;
}

interface Member {
  id: string;
  fullName: string;
  email?: string;
  role?: string;
}

interface PaginationControlsProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  totalItems: number;
  itemsPerPage: number;
}

const getVisibleMembers = <T extends Member>(
  memberIds: string[],
  memberMap: Record<string, T>,
  currentPage: number,
  itemsPerPage: number,
): T[] => {
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const visibleIds = memberIds.slice(startIndex, endIndex);

  return visibleIds
    .map((id) => memberMap[id])
    .filter((member) => member !== undefined);
};

export default function AddDepartmentDialog({ onSave }: Props) {
  const { toast } = useToast();
  const isMobile = useIsMobile();
  const [open, setOpen] = useState(false);
  const [departmentName, setDepartmentName] = useState("");
  const [hodId, setHodId] = useState("");
  const [memberIds, setMemberIds] = useState<string[]>([]);
  const [memberMap, setMemberMap] = useState<Record<string, MemberProfile>>({});
  const [status, setStatus] = useState("active");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [inviteOpen, setInviteOpen] = useState(false);
  const [pendingInvites, setPendingInvites] = useState<PendingInvite[]>([]);
  const [isInviteLoading, setIsInviteLoading] = useState(false);
  const [selectedMembersPage, setSelectedMembersPage] = useState(1);

  function handleInviteSubmit(formData: InviteFormData) {
    setIsInviteLoading(true);

    setTimeout(() => {
      const newInvite: PendingInvite = {
        id: crypto.randomUUID(),
        name:
          [formData.title, formData.firstName, formData.lastName]
            .filter(Boolean)
            .join(" ") || formData.email,
        email: formData.email,
        role: formData.role,
        status: "pending",
      };

      setPendingInvites((prev) => [...prev, newInvite]);
      setIsInviteLoading(false);
    }, 600);
  }

  async function handleSave() {
    if (!departmentName.trim() || !hodId) {
      return;
    }
    setLoading(true);

    try {
      await createDepartment({
        name: departmentName,
        description,
        hod: hodId,
        memberIds,
      });

      if (onSave) {
        await onSave({
          name: departmentName,
          hodId,
          memberIds,
          status,
          description,
        });
      }

      toast({
        title: "Success",
        description: "Department created successfully",
      });

      setOpen(false);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }
  function handleResetHod() {
    setHodId("");
  }

  function removeSelectedMember(id: string) {
    setMemberIds((prev) => prev.filter((mid) => mid !== id));

    setMemberMap((prev) => {
      const updated = { ...prev };
      delete updated[id];
      return updated;
    });
  }

  return (
    <>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button className="flex items-center gap-2">
            <Plus className="w-4 h-4" />
            {isMobile ? "Add" : "Add a department"}
          </Button>
        </DialogTrigger>

        <DialogContent
          showClose={false}
          className="sm:max-w-[480px] overflow-hidden p-0"
        >
          <div className="flex justify-between items-center border-b p-3">
            <Heading level={2}>Add a department</Heading>

            <DialogClose asChild>
              <Button size="icon" variant="outline">
                <X className="w-4 h-4" />
              </Button>
            </DialogClose>
          </div>

          <div className="max-h-[70vh] space-y-5 overflow-y-auto px-6 py-5">
            <div className="space-y-1.5">
              <Label>Department Name</Label>
              <Input
                placeholder="e.g. ushering department"
                value={departmentName}
                onChange={(e) => setDepartmentName(e.target.value)}
              />
            </div>

            <div className="space-y-1.5">
              <Label>Assign HOD</Label>

              <div className="flex gap-2">
                <div className="flex-1">
                  <MemberSingleSelect
                    fetchOptions={fetchAdmins}
                    value={hodId}
                    onChange={setHodId}
                    placeholder="Search member..."
                  />
                </div>

                <Button size="icon" variant="outline" onClick={handleResetHod}>
                  <RefreshCw className="h-4 w-4" />
                </Button>
              </div>

              <a
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  setInviteOpen(true);
                }}
                className="text-xs text-primary flex items-center gap-1"
              >
                Invite new HOD <ExternalLink className="h-3 w-3" />
              </a>
            </div>

            {/* {memberIds.length > 0 && (
							<div className="space-y-2">
								<Label>Selected Members</Label>
								<div className="flex flex-wrap gap-2">
									{memberIds.map((id) => {
										const member = memberMap[id];
										if (!member) return null;

										return (
											<Span
												key={id}
												variant="chip">
												{member.fullName}
												<Button
													size="icon"
													variant="ghost"
													onClick={() => removeSelectedMember(id)}>
													<X className="h-3 w-3" />
												</Button>
											</Span>
										);
									})}
								</div>
							</div>
						)} */}

            {memberIds.length > 0 && (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label>Selected Members ({memberIds.length})</Label>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setMemberIds([]);
                      setMemberMap({});
                      setSelectedMembersPage(1);
                    }}
                    className="text-xs h-auto py-1 px-2 text-muted-foreground hover:text-destructive"
                  >
                    Clear all
                  </Button>
                </div>

                <div className="rounded-lg border bg-muted/30 p-3">
                  <div className="flex flex-col gap-2">
                    <div className="flex flex-wrap gap-2">
                      {getVisibleMembers(
                        memberIds,
                        memberMap,
                        selectedMembersPage,
                        6,
                      ).map((member) => (
                        <div
                          key={member.id}
                          className="group flex items-center gap-2 rounded-full bg-background border shadow-sm pl-3 pr-1 py-1 transition-all hover:shadow-md hover:border-primary/20"
                        >
                          <div className="w-6 h-6 rounded-full bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center">
                            <span className="text-xs font-medium text-primary">
                              {member.fullName.charAt(0).toUpperCase()}
                            </span>
                          </div>

                          <span className="text-sm font-medium">
                            {member.fullName}
                          </span>

                          <Button
                            size="icon"
                            variant="ghost"
                            onClick={() => {
                              const remainingCount = memberIds.length - 1;
                              const itemsPerPage = 6;
                              const newTotalPages = Math.ceil(
                                remainingCount / itemsPerPage,
                              );
                              removeSelectedMember(member.id);
                              if (
                                selectedMembersPage > newTotalPages &&
                                newTotalPages > 0
                              ) {
                                setSelectedMembersPage(newTotalPages);
                              }
                            }}
                            className="h-5 w-5 rounded-full hover:bg-destructive/10 hover:text-destructive transition-colors"
                          >
                            <X className="h-3 w-3" />
                          </Button>
                        </div>
                      ))}
                    </div>

                    <PaginationControls
                      currentPage={selectedMembersPage}
                      totalPages={Math.ceil(memberIds.length / 6)}
                      onPageChange={setSelectedMembersPage}
                      totalItems={memberIds.length}
                      itemsPerPage={6}
                    />
                  </div>
                </div>
              </div>
            )}

            <div className="space-y-1.5">
              <Label>Add Members</Label>
              <MemberMultiSelect
                fetchOptions={fetchMembers}
                value={memberIds}
                onChange={(ids, members) => {
                  setMemberIds(ids);

                  setMemberMap((prev) => {
                    const updated = { ...prev };
                    members.forEach((m) => {
                      updated[m.id] = m;
                    });
                    return updated;
                  });
                }}
                placeholder="Search members..."
              />
            </div>

            <div className="space-y-1.5">
              <Label>Status</Label>
              <Select value={status} onValueChange={setStatus}>
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label>Description</Label>
              <Textarea
                rows={4}
                placeholder="Add description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>
          </div>

          <div className="flex justify-end border-t px-6 py-4">
            <Button onClick={handleSave} disabled={loading}>
              {loading ? "Saving..." : "Save"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <InviteUserDialog
        open={inviteOpen}
        onOpenChange={setInviteOpen}
        onSubmit={handleInviteSubmit}
        pendingInvites={pendingInvites}
        isLoading={isInviteLoading}
        title="Invite New HOD"
      />
    </>
  );
}

const PaginationControls = ({
  currentPage,
  totalPages,
  onPageChange,
  totalItems,
  itemsPerPage,
}: PaginationControlsProps) => {
  if (totalPages <= 1) return null;

  const startItem = (currentPage - 1) * itemsPerPage + 1;
  const endItem = Math.min(currentPage * itemsPerPage, totalItems);

  const getPageNumbers = () => {
    const delta = 2;
    const pages = [];

    for (let i = 1; i <= totalPages; i++) {
      if (
        i === 1 ||
        i === totalPages ||
        (i >= currentPage - delta && i <= currentPage + delta)
      ) {
        pages.push(i);
      } else if (pages[pages.length - 1] !== "ellipsis") {
        pages.push("ellipsis");
      }
    }

    return pages;
  };

  return (
    <div className="flex items-center justify-between gap-2 mt-2 pt-2 border-t">
      <div className="text-xs text-muted-foreground">
        Showing {startItem}-{endItem} of {totalItems}
      </div>

      <div className="flex items-center gap-1">
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="h-7 px-2 text-xs"
        >
          Prev
        </Button>

        {getPageNumbers().map((page, idx) =>
          page === "ellipsis" ? (
            <span
              key={`ellipsis-${idx}`}
              className="px-1 text-xs text-muted-foreground"
            >
              ...
            </span>
          ) : (
            <Button
              key={page}
              variant={currentPage === page ? "default" : "outline"}
              size="sm"
              onClick={() => onPageChange(Number(page))}
              className="h-7 w-7 p-0 text-xs"
            >
              {page}
            </Button>
          ),
        )}

        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="h-7 px-2 text-xs"
        >
          Next
        </Button>
      </div>
    </div>
  );
};
