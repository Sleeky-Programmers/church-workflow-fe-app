"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Loader } from "@/components/ui/loader";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { changeRoleSchema, ChangeRoleFormValues } from "@/types/schema";

type ChangeRoleDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  userName: string;
  currentRoleId: string;
  roles: any[];
  onConfirm: (newRoleId: string) => void;
  isLoading?: boolean;
};

export function ChangeRoleDialog({
  open,
  onOpenChange,
  userName,
  currentRoleId,
  roles,
  onConfirm,
  isLoading,
}: ChangeRoleDialogProps) {
  const form = useForm<ChangeRoleFormValues>({
    resolver: zodResolver(changeRoleSchema),
    defaultValues: { roleId: currentRoleId },
  });

  useEffect(() => {
    form.reset({ roleId: currentRoleId });
  }, [currentRoleId, open, form]);

  const selectedRole = form.watch("roleId");

  const handleSubmit = ({ roleId }: ChangeRoleFormValues) => {
    if (roleId !== currentRoleId) {
      onConfirm(roleId);
    } else {
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Change Role for {userName}</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleSubmit)}
            className="space-y-4"
          >
            <FormField
              control={form.control}
              name="roleId"
              render={({ field }) => {
                return (
                  <FormItem>
                    <FormLabel>Select New Role</FormLabel>
                    <Select value={field.value} onValueChange={field.onChange}>
                      <FormControl>
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Select a role" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {roles.map((role: any) => {
                          return (
                            <SelectItem key={role._id} value={role._id}>
                              {role.roleName}
                            </SelectItem>
                          );
                        })}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                );
              }}
            />
            <DialogFooter className="sm:justify-end">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  return onOpenChange(false);
                }}
                disabled={isLoading}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isLoading || selectedRole === currentRoleId}
              >
                {isLoading ? (
                  <span className="flex items-center gap-2">
                    <Loader size="w-4 h-4" showShadow={false} />
                    Saving...
                  </span>
                ) : (
                  "Save Changes"
                )}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
