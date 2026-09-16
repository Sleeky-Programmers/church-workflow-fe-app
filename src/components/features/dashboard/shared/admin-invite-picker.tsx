"use client";

import { ExternalLink, RefreshCw } from "lucide-react";
import { useState } from "react";

import { InviteUserDialog } from "@/components/features/dashboard/admin/invite-user";
import { MemberSingleSelect } from "@/components/features/dashboard/departments/member-selectors";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Text } from "@/components/ui/typography/Text";
import { useToast } from "@/hooks/use-toast";
import { createAdminInvite } from "@/lib/api/admin-settings";
import { fetchAdmins } from "@/services/userServices";
import { InviteFormData } from "@/types/user";

interface AdminInvitePickerProps {
  label: string;
  adminId: string;
  adminName?: string | null;
  onAdminIdChange: (id: string) => void;
  pendingEmail: string | null;
  onPendingEmailChange: (email: string | null) => void;
  disabled?: boolean;
  // Reassigning this role is an org-wide administrative action (matches the
  // backend's FULL_ACCESS requirement) - the person actually holding it can
  // edit everything else but not reassign themselves or anyone else, so
  // this renders as plain text instead of an editable picker for them.
  readOnly?: boolean;
  inviteDialogTitle?: string;
  readOnlyHint?: string;
}

// Shared "pick an existing admin, or invite someone new" control - used for
// small-team leaders and department heads/assistant heads so the picker
// can't drift between the different forms that need it.
export function AdminInvitePicker({
  label,
  adminId,
  adminName,
  onAdminIdChange,
  pendingEmail,
  onPendingEmailChange,
  disabled = false,
  readOnly = false,
  inviteDialogTitle,
  readOnlyHint,
}: AdminInvitePickerProps) {
  const { toast } = useToast();
  const [inviteOpen, setInviteOpen] = useState(false);
  const [isInviteLoading, setIsInviteLoading] = useState(false);

  if (readOnly) {
    return (
      <div className="space-y-1.5 w-full">
        <Label className="text-sm sm:text-base">{label}</Label>
        <div className="rounded-md border bg-muted/30 px-3 py-2">
          <Text variant="default" className="text-sm">
            {pendingEmail
              ? `Invitation pending — ${pendingEmail}`
              : adminName || "Not set"}
          </Text>
        </div>
        <Text variant="muted" className="text-xs">
          {readOnlyHint ||
            `Only a full-access admin can change the ${label.toLowerCase()}.`}
        </Text>
      </div>
    );
  }

  const handleInviteSubmit = async (data: InviteFormData) => {
    setIsInviteLoading(true);
    try {
      const payload: {
        email: string;
        title?: string;
        firstName?: string;
        lastName?: string;
      } = { email: data.email };
      if (data.title) payload.title = data.title;
      if (data.firstName) payload.firstName = data.firstName;
      if (data.lastName) payload.lastName = data.lastName;

      const result = await createAdminInvite(data.role, payload);
      onAdminIdChange("");
      onPendingEmailChange(data.email);
      toast({
        title: "Invitation sent",
        description: `${data.email} will become ${label.toLowerCase()} once they accept.`,
      });
      return result;
    } catch (error: any) {
      toast({
        title: "Error",
        description:
          error.message || "Failed to send invitation. Please try again.",
        variant: "destructive",
      });
      throw error;
    } finally {
      setIsInviteLoading(false);
    }
  };

  return (
    <div className="space-y-1.5 w-full">
      <Label className="text-sm sm:text-base">{label}</Label>

      {pendingEmail ? (
        <div className="flex items-center justify-between gap-2 rounded-md border px-3 py-2">
          <Text variant="muted" className="text-sm truncate">
            Invitation pending — {pendingEmail}
          </Text>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            disabled={disabled}
            onClick={() => onPendingEmailChange(null)}
          >
            Cancel
          </Button>
        </div>
      ) : (
        <div className="flex items-center gap-2 w-full">
          <div className="flex-1 min-w-0">
            <MemberSingleSelect
              fetchOptions={fetchAdmins}
              value={adminId}
              onChange={onAdminIdChange}
              placeholder="Select or search"
            />
          </div>
          <Button
            type="button"
            size="icon"
            title={`Clear ${label.toLowerCase()}`}
            variant="outline"
            disabled={disabled}
            onClick={() => onAdminIdChange("")}
            className="shrink-0"
          >
            <RefreshCw className="h-4 w-4 text-gray-500" />
          </Button>
        </div>
      )}

      {!pendingEmail && (
        <a
          href="#"
          onClick={(e) => {
            e.preventDefault();
            setInviteOpen(true);
          }}
          className="mt-0.5 inline-flex items-center gap-1 text-xs text-primary hover:underline"
        >
          Add New {label}
          <ExternalLink className="h-3 w-3" />
        </a>
      )}

      <InviteUserDialog
        open={inviteOpen}
        onOpenChange={setInviteOpen}
        onSubmit={handleInviteSubmit}
        isLoading={isInviteLoading}
        title={inviteDialogTitle || `Invite New ${label}`}
      />
    </div>
  );
}
