"use client";

import { ExternalLink, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
import { useToast } from "@/hooks/use-toast";
import { ROLE_PERMISSIONS, TITLE_OPTIONS } from "@/lib/permissions";
import { backendToFrontendModule } from "@/lib/role-constants";
import { fetchRoles } from "@/services/rolesService";
import { InviteFormData, PendingInvite } from "@/types/user";

import { CreateRoleDialog } from "./mini-components/create-role-dialog";
import { PendingInvitesList } from "./mini-components/pending-invite";
import { RolePermissionsView } from "./role-permission";

type InviteUserDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: InviteFormData) => Promise<any> | void;
  pendingInvites?: PendingInvite[];
  isLoading?: boolean;
  title?: string;
  onRoleCreated?: () => Promise<void> | void;
};

const CREATE_ROLE_VALUE = "__create_role__";

export function InviteUserDialog({
  open,
  onOpenChange,
  onRoleCreated,
  onSubmit,
  pendingInvites = [],
  isLoading = false,
  title = "Invite User",
}: InviteUserDialogProps) {
  const [showPermissions, setShowPermissions] = useState(false);
  const [selectedRole, setSelectedRole] = useState("");
  const [localInvites, setLocalInvites] = useState<PendingInvite[]>([]);
  const [isCreateRoleDialogOpen, setIsCreateRoleDialogOpen] = useState(false);
  const [roles, setRoles] = useState<any[]>([]);
  const [isLoadingRoles, setIsLoadingRoles] = useState(false);
  const router = useRouter();

  const [formData, setFormData] = useState<InviteFormData>({
    title: "",
    firstName: "",
    lastName: "",
    email: "",
    role: "",
  });

  const { toast } = useToast();

  // Fetch roles when dialog opens
  useEffect(() => {
    if (open) {
      loadRoles();
    }
  }, [open]);

  const loadRoles = async () => {
    setIsLoadingRoles(true);
    try {
      const data = await fetchRoles();
      setRoles(data);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to load roles",
        variant: "destructive",
      });
    } finally {
      setIsLoadingRoles(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.email && formData.role) {
      try {
        const result = await Promise.resolve(onSubmit(formData));
        const roleObj = roles.find((r) => r._id === formData.role);
        setLocalInvites((prev) => [
          ...prev,
          {
            id: result?._id || Date.now().toString(),
            name: formData.firstName
              ? `${formData.firstName} ${formData.lastName || ""}`.trim()
              : formData.email.split("@")[0],
            email: formData.email,
            role: roleObj ? roleObj.roleName : formData.role,
            status: "pending",
          },
        ]);
        resetForm();
      } catch (error: any) {
        toast({
          title: "Error",
          description: error.message || "Failed to invite user",
          variant: "destructive",
        });
      }
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
    setLocalInvites([]);
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

  let rolePermissions = null;
  const targetRole = roles.find(
    (r) => r._id === selectedRole || r.roleName === selectedRole,
  );
  if (targetRole) {
    rolePermissions = {
      role: targetRole.roleName,
      description:
        targetRole.description ||
        "Permissions are automatically assigned based on role.",
      permissions:
        targetRole.permissions?.map((p: any) => ({
          module: backendToFrontendModule[p.moduleSection] || p.moduleSection,
          level: p.accessLevel?.toLowerCase(),
          description: `Access Level: ${p.accessLevel}`,
        })) || [],
    };
  }

  const handleRoleCreated = async (newRole: any) => {
    if (onRoleCreated) {
      await onRoleCreated();
    }
    // Refresh roles list
    await loadRoles();
    setFormData({ ...formData, role: newRole._id });
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent
          showClose={false}
          className="max-w-md max-h-[90vh] overflow-y-auto"
        >
          {!showPermissions ? (
            <>
              <DialogHeader>
                <div className="flex justify-between items-center">
                  <DialogTitle>{title}</DialogTitle>
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
                        {TITLE_OPTIONS.map((t) => (
                          <SelectItem key={t} value={t}>
                            {t}
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
                    onValueChange={(value) => {
                      if (value === CREATE_ROLE_VALUE) return;
                      setFormData({ ...formData, role: value });
                    }}
                    required
                  >
                    <SelectTrigger id="role" className="h-9">
                      <SelectValue
                        placeholder={
                          isLoadingRoles ? "Loading roles..." : "Select a role"
                        }
                      />
                    </SelectTrigger>
                    <SelectContent>
                      {isLoadingRoles ? (
                        <div className="px-2 py-4 flex items-center justify-center gap-2 text-sm text-muted-foreground">
                          <Loader size="w-4 h-4" showShadow={false} />
                          Loading roles...
                        </div>
                      ) : (
                        <>
                          {roles.map((role: any) => (
                            <SelectItem key={role._id} value={role._id}>
                              {role.type === "CUSTOM" ? (
                                <>
                                  {role.roleName}
                                  <span className="text-muted-foreground ml-1">
                                    - Custom Role
                                  </span>
                                </>
                              ) : (
                                role.roleName
                              )}
                            </SelectItem>
                          ))}

                          <div className="border-t pt-2 mt-1">
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              className="w-full justify-start text-primary text-xs"
                              onClick={(e) => {
                                e.stopPropagation();
                                const selectTrigger = document.querySelector(
                                  "[data-radix-select-trigger]",
                                );
                                if (selectTrigger) {
                                  (selectTrigger as HTMLElement).click();
                                }
                                setTimeout(() => {
                                  setIsCreateRoleDialogOpen(true);
                                }, 50);
                              }}
                            >
                              <ExternalLink className="h-3 w-3 mr-2" />
                              Add new role
                            </Button>
                          </div>
                        </>
                      )}
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
                  disabled={
                    isLoading ||
                    !formData.email ||
                    !formData.role ||
                    isLoadingRoles
                  }
                  className="w-full"
                >
                  {isLoading ? (
                    <span className="flex items-center gap-2">
                      <Loader size="w-4 h-4" showShadow={false} />
                      Sending...
                    </span>
                  ) : (
                    "Send Invite"
                  )}
                </Button>

                {localInvites.length > 0 && (
                  <div className="pt-4 border-t mt-4">
                    <PendingInvitesList invites={localInvites} />
                  </div>
                )}

                {localInvites.length > 0 && (
                  <div className="flex justify-end pt-2">
                    <Button
                      type="button"
                      onClick={handleCancel}
                      disabled={isLoading}
                    >
                      Done
                    </Button>
                  </div>
                )}
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

      {isCreateRoleDialogOpen && (
        <CreateRoleDialog
          open={isCreateRoleDialogOpen}
          onOpenChange={setIsCreateRoleDialogOpen}
          onRoleCreated={handleRoleCreated}
        />
      )}
    </>
  );
}
