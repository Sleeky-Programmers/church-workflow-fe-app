"use client";

import { ExternalLink, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Loader } from "@/components/ui/loader";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { ROLE_PERMISSIONS } from "@/lib/permissions";
import { backendToFrontendModule } from "@/lib/role-constants";
import { TitleCombobox } from "@/components/ui/title-combobox";
import { fetchRoles } from "@/services/rolesService";
import { InviteFormData, PendingInvite } from "@/types/user";
import { inviteUserSchema } from "@/types/schema";

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

  const form = useForm<InviteFormData>({
    resolver: zodResolver(inviteUserSchema),
    defaultValues: {
      title: "",
      firstName: "",
      lastName: "",
      email: "",
      role: "",
    },
  });
  const formData = form.watch();

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

  const handleSubmit = async (data: InviteFormData) => {
    try {
      const result = await Promise.resolve(onSubmit(data));
      const roleObj = roles.find((r) => r._id === data.role);
      setLocalInvites((prev) => [
        ...prev,
        {
          id: result?._id || Date.now().toString(),
          name: data.firstName
            ? `${data.firstName} ${data.lastName || ""}`.trim()
            : data.email.split("@")[0],
          email: data.email,
          role: roleObj ? roleObj.roleName : data.role,
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
  };

  const resetForm = () => {
    form.reset({
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
    form.setValue("role", newRole._id, { shouldValidate: true });
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

              <Form {...form}>
                <form
                  onSubmit={form.handleSubmit(handleSubmit)}
                  className="space-y-4"
                >
                  <div className="grid grid-cols-3 gap-3">
                    <FormField
                      control={form.control}
                      name="title"
                      render={({ field }) => (
                        <FormItem className="space-y-2">
                          <FormLabel className="text-xs">
                            Title (Optional)
                          </FormLabel>
                          <FormControl>
                            <TitleCombobox
                              value={field.value}
                              onChange={field.onChange}
                              placeholder="Title"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="firstName"
                      render={({ field }) => (
                        <FormItem className="space-y-2">
                          <FormLabel className="text-xs">
                            First name (Optional)
                          </FormLabel>
                          <FormControl>
                            <Input
                              placeholder="e.g. John"
                              className="h-9"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="lastName"
                      render={({ field }) => (
                        <FormItem className="space-y-2">
                          <FormLabel className="text-xs">
                            Last name (Optional)
                          </FormLabel>
                          <FormControl>
                            <Input
                              placeholder="e.g. Doe"
                              className="h-9"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem className="space-y-2">
                        <FormLabel className="text-xs">Email Address</FormLabel>
                        <FormControl>
                          <Input
                            type="email"
                            placeholder="john@example.com"
                            className="h-9"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="role"
                    render={({ field }) => (
                      <FormItem className="space-y-2">
                        <FormLabel className="text-xs">Role</FormLabel>
                        <Select
                          value={field.value}
                          onValueChange={(value) => {
                            if (value === CREATE_ROLE_VALUE) return;
                            field.onChange(value);
                          }}
                        >
                          <FormControl>
                            <SelectTrigger className="h-9">
                              <SelectValue
                                placeholder={
                                  isLoadingRoles
                                    ? "Loading roles..."
                                    : "Select a role"
                                }
                              />
                            </SelectTrigger>
                          </FormControl>
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
                                      const selectTrigger =
                                        document.querySelector(
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
                        <FormMessage />
                      </FormItem>
                    )}
                  />

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
                    disabled={isLoading || isLoadingRoles}
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
              </Form>
            </>
          ) : (
            rolePermissions && (
              <RolePermissionsView
                rolePermissions={rolePermissions}
                onBack={handleBackFromPermissions}
                headerNote="Preview of what this role will be able to access."
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
