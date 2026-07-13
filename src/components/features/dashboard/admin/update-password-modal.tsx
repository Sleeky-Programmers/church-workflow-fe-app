"use client";

import { useForm } from "react-hook-form";
import { useIsMobile } from "@/hooks/use-mobile";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { EyeOff } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { updatePassword } from "@/services/authService";

type FormValues = {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
};

export function UpdatePasswordModal({ open, onOpenChange }: any) {
  const { toast } = useToast();
  const isMobile = useIsMobile();

  const {
    register,
    handleSubmit,
    watch,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>();

  const onSubmit = async (data: FormValues) => {
    try {
      await updatePassword({
        currentPassword: data.currentPassword,
        newPassword: data.newPassword,
        confirmNewPassword: data.confirmPassword,
      });

      toast({
        title: "Success",
        description: "Password updated successfully",
      });

      reset();
      onOpenChange(false);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to update password",
        variant: "destructive",
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent mobileSheet={isMobile} className="sm:max-w-md p-0">
        <DialogHeader className="px-6 pt-6 pb-2">
          <DialogTitle>Update Password</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="px-6 space-y-4">
          <div>
            <Label>Current Password</Label>
            <Input
              type="password"
              {...register("currentPassword", {
                required: "Current password is required",
              })}
              className="bg-gray-100"
            />
            {errors.currentPassword && (
              <p className="text-red-500 text-sm">
                {errors.currentPassword.message}
              </p>
            )}
          </div>

          <div>
            <Label>New Password</Label>
            <div className="relative">
              <Input
                type="password"
                {...register("newPassword", {
                  required: "Password is required",
                  minLength: {
                    value: 6,
                    message: "Minimum 6 characters",
                  },
                })}
                className="bg-gray-100 pr-10"
              />
              <EyeOff className="absolute right-3 top-3 w-4 h-4 text-gray-500" />
            </div>
            {errors.newPassword && (
              <p className="text-red-500 text-sm">
                {errors.newPassword.message}
              </p>
            )}
          </div>

          <div>
            <Label>Confirm Password</Label>
            <Input
              type="password"
              {...register("confirmPassword", {
                required: "Confirm password is required",
                validate: (val) =>
                  val === watch("newPassword") || "Passwords do not match",
              })}
              className="bg-gray-100"
            />
            {errors.confirmPassword && (
              <p className="text-red-500 text-sm">
                {errors.confirmPassword.message}
              </p>
            )}
          </div>

          <DialogFooter className="pt-4 border-t mt-4">
            <Button
              type="button"
              variant="destructive"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>

            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Saving..." : "Save"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
