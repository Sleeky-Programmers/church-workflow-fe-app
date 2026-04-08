"use client";

import { useState } from "react";
import { Plus, RefreshCw, ExternalLink, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { fetchMembers } from "@/services/memberService";
import { fetchAdmins } from "@/services/adminServices";
import { useToast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogClose,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { MemberProfile } from "@/types";
import { Textarea } from "@/components/ui/textarea";
import Heading from "@/components/ui/typography/Heading";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  MemberMultiSelect,
  MemberSingleSelect,
} from "@/components/features/dashboard/departments/member-selectors";
import { InviteUserDialog } from "../admin/invite-user";
import { InviteFormData, PendingInvite } from "@/types/user";
import { Span } from "@/components/ui/typography/Text";

interface Props {
  onSave?: (payload: {
    name: string;
    hodId: string;
    memberIds: string[];
    status: string;
    description: string;
  }) => void;
}

export default function AddDepartmentDialog({ onSave }: Props) {
  const { toast } = useToast();

  const [open, setOpen] = useState(false);
  const [departmentName, setDepartmentName] = useState("");
  const [hodId, setHodId] = useState("");
  const [memberIds, setMemberIds] = useState<string[]>([]);
  const [memberMap, setMemberMap] = useState<Record<string, MemberProfile>>({});
  const [status, setStatus] = useState("active");
  const [description, setDescription] = useState("");

  const [inviteOpen, setInviteOpen] = useState(false);
  const [pendingInvites, setPendingInvites] = useState<PendingInvite[]>([]);
  const [isInviteLoading, setIsInviteLoading] = useState(false);

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

  function handleSave() {
    if (!departmentName.trim() || !hodId) {
      toast({
        title: "Missing fields",
        description: "Department name and HOD are required",
        variant: "destructive",
      });
      return;
    }

    onSave?.({
      name: departmentName,
      hodId,
      memberIds,
      status,
      description,
    });

    toast({
      title: "Success",
      description: "Department created successfully",
    });

    setDepartmentName("");
    setHodId("");
    setMemberIds([]);
    setMemberMap({});
    setStatus("active");
    setDescription("");
    setOpen(false);
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
            Add a department
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

            {memberIds.length > 0 && (
              <div className="space-y-2">
                <Label>Selected Members</Label>
                <div className="flex flex-wrap gap-2">
                  {memberIds.map((id) => {
                    const member = memberMap[id];
                    if (!member) return null;

                    return (
                      <Span key={id} variant="chip">
                        {member.fullName}
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => removeSelectedMember(id)}
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </Span>
                    );
                  })}
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
            <Button onClick={handleSave} disabled={!departmentName.trim()}>
              Save
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
