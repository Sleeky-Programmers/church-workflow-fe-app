"use client";

import { AdminInvitePicker } from "@/components/features/dashboard/shared/admin-invite-picker";

interface TeamLeaderPickerProps {
  leaderId: string;
  leaderName?: string | null;
  onLeaderIdChange: (id: string) => void;
  pendingLeaderEmail: string | null;
  onPendingLeaderEmailChange: (email: string | null) => void;
  disabled?: boolean;
  readOnly?: boolean;
}

// Thin wrapper around the shared AdminInvitePicker, kept so existing
// Small-team call sites don't need to change.
export function TeamLeaderPicker({
  leaderId,
  leaderName,
  onLeaderIdChange,
  pendingLeaderEmail,
  onPendingLeaderEmailChange,
  disabled = false,
  readOnly = false,
}: TeamLeaderPickerProps) {
  return (
    <AdminInvitePicker
      label="Team Leader"
      adminId={leaderId}
      adminName={leaderName}
      onAdminIdChange={onLeaderIdChange}
      pendingEmail={pendingLeaderEmail}
      onPendingEmailChange={onPendingLeaderEmailChange}
      disabled={disabled}
      readOnly={readOnly}
      inviteDialogTitle="Invite New Team Lead"
      readOnlyHint="Only an admin with full access to Small Teams can change the leader."
    />
  );
}
