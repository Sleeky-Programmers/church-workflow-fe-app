"use client";

import { X } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import { CreateRoleForm } from "./create-role-form";

type CreateRoleDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onRoleCreated?: (role: any) => void;
};

export function CreateRoleDialog({
  open,
  onOpenChange,
  onRoleCreated,
}: CreateRoleDialogProps) {
  const handleSuccess = (newRole: any) => {
    if (onRoleCreated) {
      onRoleCreated(newRole);
    }
    onOpenChange(false);
  };

  const handleCancel = () => {
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        showClose={false}
        className="max-w-4xl max-h-[90vh] overflow-y-auto"
      >
        <DialogHeader className="mb-10">
          <div className="flex justify-between items-center">
            <DialogTitle>Create New Role</DialogTitle>
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6"
              onClick={handleCancel}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </DialogHeader>

        <CreateRoleForm
          mode="create"
          onSuccess={handleSuccess}
          onCancel={handleCancel}
          showCancelButton={false}
          submitButtonText="Create Role"
          isDialog={true}
        />
      </DialogContent>
    </Dialog>
  );
}
