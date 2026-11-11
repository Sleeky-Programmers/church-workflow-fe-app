"use client";

import { useEffect, useState } from "react";
import { X } from "lucide-react";

import { AdminInvitePicker } from "@/components/features/dashboard/shared/admin-invite-picker";
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
import { useHasAccess } from "@/lib/access-control";
import { useIsMobile } from "@/hooks/use-mobile";
import { useToast } from "@/hooks/use-toast";
import {
  fetchDepartmentById,
  updateDepartment,
  updateDepartmentStatus,
} from "@/services/departmentService";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  departmentId: string | null;
  onSaved: () => void | Promise<void>;
}

export function EditDepartmentDialog({
  open,
  onOpenChange,
  departmentId,
  onSaved,
}: Props) {
  const { toast } = useToast();
  const isMobile = useIsMobile();
  const canChangeHod = useHasAccess("DEPARTMENTS", "FULL_ACCESS");

  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [status, setStatus] = useState("ACTIVE");
  const [initialStatus, setInitialStatus] = useState("ACTIVE");
  const [hodId, setHodId] = useState("");
  const [hodName, setHodName] = useState<string | null>(null);
  const [pendingHodEmail, setPendingHodEmail] = useState<string | null>(null);
  const [assistantHodId, setAssistantHodId] = useState("");
  const [assistantHodName, setAssistantHodName] = useState<string | null>(null);
  const [pendingAssistantHodEmail, setPendingAssistantHodEmail] = useState<
    string | null
  >(null);

  useEffect(() => {
    if (!open || !departmentId) {
      return;
    }
    let cancelled = false;

    async function load() {
      setIsLoading(true);
      try {
        const dept = await fetchDepartmentById(departmentId!);
        if (cancelled) {
          return;
        }

        setName(dept.name);
        setDescription(dept.description || "");
        setStatus(dept.status || "ACTIVE");
        setInitialStatus(dept.status || "ACTIVE");
        setHodId(dept.hod?.id || "");
        setHodName(dept.hod?.name || null);
        setPendingHodEmail(dept.pendingHodEmail || null);
        setAssistantHodId(dept.assistantHod?.id || "");
        setAssistantHodName(dept.assistantHod?.name || null);
        setPendingAssistantHodEmail(dept.pendingAssistantHodEmail || null);
      } catch (error: any) {
        if (!cancelled) {
          toast({
            title: "Error",
            description: error.message || "Failed to load department",
            variant: "destructive",
          });
          onOpenChange(false);
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    }

    load();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, departmentId]);

  async function handleSave() {
    if (!departmentId || !name.trim()) {
      return;
    }
    setIsSaving(true);
    try {
      await updateDepartment(departmentId, {
        name: name.trim(),
        description,
        hod: hodId || null,
        pendingHodEmail: pendingHodEmail || null,
        assistantHod: assistantHodId || null,
        pendingAssistantHodEmail: pendingAssistantHodEmail || null,
      });

      if (status !== initialStatus) {
        await updateDepartmentStatus(
          departmentId,
          status as "ACTIVE" | "INACTIVE",
        );
      }

      await onSaved();

      toast({
        title: "Success",
        description: "Department updated successfully",
      });
      onOpenChange(false);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to update department",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        showClose={false}
        mobileSheet={isMobile}
        className="sm:max-w-[480px] overflow-hidden p-0"
      >
        <div className="flex justify-between items-center border-b p-3">
          <Heading level={2}>Edit Department</Heading>
          <DialogClose asChild>
            <Button size="icon" variant="outline">
              <X className="w-4 h-4" />
            </Button>
          </DialogClose>
        </div>

        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-16 gap-2">
            <Loader size="w-10 h-10" showShadow={false} />
            <Text variant="muted">Loading department...</Text>
          </div>
        ) : (
          <>
            <div className="max-h-[70vh] space-y-5 overflow-y-auto px-6 py-5">
              <div className="space-y-1.5">
                <Label>Department Name</Label>
                <Input
                  value={name}
                  onChange={(e) => {
                    return setName(e.target.value);
                  }}
                  disabled={isSaving}
                />
              </div>

              <AdminInvitePicker
                label="Head of Department"
                adminId={hodId}
                adminName={hodName}
                onAdminIdChange={setHodId}
                pendingEmail={pendingHodEmail}
                onPendingEmailChange={setPendingHodEmail}
                disabled={isSaving}
                readOnly={!canChangeHod}
                inviteDialogTitle="Invite New Head of Department"
              />

              <AdminInvitePicker
                label="Assistant Head of Department"
                adminId={assistantHodId}
                adminName={assistantHodName}
                onAdminIdChange={setAssistantHodId}
                pendingEmail={pendingAssistantHodEmail}
                onPendingEmailChange={setPendingAssistantHodEmail}
                disabled={isSaving}
                readOnly={!canChangeHod}
                inviteDialogTitle="Invite New Assistant Head of Department"
              />

              <div className="space-y-1.5">
                <Label>Status</Label>
                <Select value={status} onValueChange={setStatus}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ACTIVE">Active</SelectItem>
                    <SelectItem value="INACTIVE">Inactive</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <Label>Description</Label>
                <Textarea
                  rows={4}
                  value={description}
                  onChange={(e) => {
                    return setDescription(e.target.value);
                  }}
                  disabled={isSaving}
                />
              </div>
            </div>

            <div className="flex justify-end border-t px-6 py-4">
              <Button onClick={handleSave} disabled={isSaving}>
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
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
