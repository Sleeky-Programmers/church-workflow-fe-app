"use client";

import { useState } from "react";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ExternalLink, X } from "lucide-react";
import {
  ROLE_PERMISSIONS,
  TITLE_OPTIONS,
  ROLE_OPTIONS,
} from "@/lib/permissions";
import { InviteFormData, PendingInvite } from "@/types/user";
import { PendingInvitesList } from "./mini-components/pending-invite";
import { RolePermissionsView } from "./role-permission";

type InviteUserDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: InviteFormData) => void;
  pendingInvites?: PendingInvite[];
  isLoading?: boolean;
};

export function InviteUserDialog({
  open,
  onOpenChange,
  onSubmit,
  pendingInvites = [],
  isLoading = false,
}: InviteUserDialogProps) {
  const [showPermissions, setShowPermissions] = useState(false);
  const [selectedRole, setSelectedRole] = useState("");

  const [formData, setFormData] = useState<InviteFormData>({
    title: "",
    firstName: "",
    lastName: "",
    email: "",
    role: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.email && formData.role) {
      onSubmit(formData);
      resetForm();
    }
  };

  const resetForm = () => {
    setFormData({
      title: "",
      firstName: "",
      lastName: "",
      email: "",
      role: "",
    });
    setSelectedRole("");
  };

  const handleCancel = () => {
    resetForm();
    onOpenChange(false);
  };

  const handleViewPermissions = () => {
    if (formData.role) {
      setSelectedRole(formData.role);
      setShowPermissions(true);
    }
  };

  const handleBackFromPermissions = () => {
    setShowPermissions(false);
  };

  const rolePermissions = selectedRole ? ROLE_PERMISSIONS[selectedRole] : null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        showClose={false}
        className="max-w-md max-h-[90vh] overflow-y-auto"
      >
        {!showPermissions ? (
          <>
            <DialogHeader>
              <div className="flex justify-between items-center">
                <DialogTitle>Invite User</DialogTitle>
                <DialogDescription className="sr-only">
                  Send an invitation to a new user to join the platform.
                </DialogDescription>
                <DialogClose asChild>
                  <Button
                    className="p-2 rounded-md"
                    size="icon"
                    variant="outline"
                    aria-label="Close dialog"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </DialogClose>
              </div>
            </DialogHeader>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-3 gap-3">
                <div className="space-y-2">
                  <Label htmlFor="title" className="text-xs">
                    Title (Optional)
                  </Label>
                  <Select
                    value={formData.title}
                    onValueChange={(value) =>
                      setFormData({ ...formData, title: value })
                    }
                  >
                    <SelectTrigger id="title" className="h-9">
                      <SelectValue placeholder="Title" />
                    </SelectTrigger>
                    <SelectContent>
                      {TITLE_OPTIONS.map((title) => (
                        <SelectItem key={title} value={title}>
                          {title}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="firstName" className="text-xs">
                    First name (Optional)
                  </Label>
                  <Input
                    id="firstName"
                    placeholder="e.g. John"
                    value={formData.firstName}
                    onChange={(e) =>
                      setFormData({ ...formData, firstName: e.target.value })
                    }
                    className="h-9"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="lastName" className="text-xs">
                    Last name (Optional)
                  </Label>
                  <Input
                    id="lastName"
                    placeholder="e.g. Doe"
                    value={formData.lastName}
                    onChange={(e) =>
                      setFormData({ ...formData, lastName: e.target.value })
                    }
                    className="h-9"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="email" className="text-xs">
                  Email Address
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="john@example.com"
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                  required
                  className="h-9"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="role" className="text-xs">
                  Role
                </Label>
                <Select
                  value={formData.role}
                  onValueChange={(value) =>
                    setFormData({ ...formData, role: value })
                  }
                  required
                >
                  <SelectTrigger id="role" className="h-9">
                    <SelectValue placeholder="Select a role" />
                  </SelectTrigger>
                  <SelectContent>
                    {ROLE_OPTIONS.map((role) => (
                      <SelectItem key={role} value={role}>
                        {role}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {formData.role && (
                <Button
                  type="button"
                  variant="link"
                  onClick={handleViewPermissions}
                  className="flex items-center gap-1.5 hover:underline"
                >
                  View Role Permissions
                  <ExternalLink className="h-3.5 w-3.5" />
                </Button>
              )}

              <Button
                type="submit"
                disabled={isLoading || !formData.email || !formData.role}
                className="w-full"
              >
                {isLoading ? "Sending..." : "Send Invite"}
              </Button>

              {pendingInvites.length > 0 && (
                <div className="pt-4 border-t">
                  <PendingInvitesList invites={pendingInvites} />
                </div>
              )}

              <div className="flex justify-end pt-2">
                <Button
                  type="button"
                  onClick={handleCancel}
                  disabled={isLoading}
                >
                  Done
                </Button>
              </div>
            </form>
          </>
        ) : (
          rolePermissions && (
            <RolePermissionsView
              rolePermissions={rolePermissions}
              onBack={handleBackFromPermissions}
            />
          )
        )}
      </DialogContent>
    </Dialog>
  );
}
