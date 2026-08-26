"use client";

import { useEffect, useState } from "react";

import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Loader } from "@/components/ui/loader";
import { Text } from "@/components/ui/typography/Text";
import { useToast } from "@/hooks/use-toast";
import { fetchRoleById } from "@/lib/api/admin-settings";
import {
  backendToFrontendModule,
  MODULE_PERMISSIONS,
} from "@/lib/role-constants";
import { PermissionLevel, Role } from "@/types";

import { CreateRoleForm } from "./create-role-form";

type EditRoleSliderProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  role: Role | null;
  onRoleUpdated: () => void;
};

type EditRoleFormData = {
  name: string;
  description?: string;
  permissions: Record<string, PermissionLevel>;
};

export function EditRoleSlider({
  open,
  onOpenChange,
  role,
  onRoleUpdated,
}: EditRoleSliderProps) {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [initialData, setInitialData] = useState<EditRoleFormData | null>(null);

  useEffect(() => {
    if (!open || !role) {
      setInitialData(null);
      return;
    }

    let cancelled = false;

    async function loadRole() {
      setIsLoading(true);
      try {
        const fetchedRole = await fetchRoleById(role!.id);

        const permissions = MODULE_PERMISSIONS.reduce(
          (acc, module) => ({
            ...acc,
            [module.module]: "no_access" as PermissionLevel,
          }),
          {} as Record<string, PermissionLevel>,
        );

        fetchedRole.permissions?.forEach((p) => {
          const frontendModule = backendToFrontendModule[p.moduleSection];
          if (frontendModule) {
            permissions[frontendModule] =
              p.accessLevel.toLowerCase() as PermissionLevel;
          }
        });

        if (!cancelled) {
          setInitialData({
            name: fetchedRole.roleName,
            description: fetchedRole.description || "",
            permissions,
          });
        }
      } catch (error: any) {
        if (!cancelled) {
          toast({
            title: "Error",
            description: error.message || "Failed to load role details",
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

    loadRole();

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, role?.id]);

  const handleSuccess = () => {
    onOpenChange(false);
    onRoleUpdated();
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full sm:max-w-xl overflow-y-auto">
        <SheetHeader className="mb-6">
          <SheetTitle>Edit Role{role ? `: ${role.name}` : ""}</SheetTitle>
        </SheetHeader>

        {isLoading || !initialData ? (
          <div className="flex flex-col items-center justify-center py-16 gap-2">
            <Loader size="w-10 h-10" showShadow={false} />
            <Text variant="muted">Loading role...</Text>
          </div>
        ) : (
          <CreateRoleForm
            mode="edit"
            roleId={role?.id}
            initialData={initialData}
            onSuccess={handleSuccess}
            onCancel={() => onOpenChange(false)}
            showCancelButton={true}
            submitButtonText="Save Changes"
            isDialog={true}
          />
        )}
      </SheetContent>
    </Sheet>
  );
}
