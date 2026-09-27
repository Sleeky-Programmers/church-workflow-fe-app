"use client";

import { AlertCircle, EyeOff } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
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
import { getFriendlyErrorMessage } from "@/lib/api-errors";
import { updatePassword } from "@/services/authService";
import { updatePasswordSchema, UpdatePasswordFormValues } from "@/types/schema";

type FormValues = UpdatePasswordFormValues;

export function UpdatePasswordModal({ open, onOpenChange }: any) {
  const [submitError, setSubmitError] = useState<string | null>(null);
  const isMobile = useIsMobile();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({ resolver: zodResolver(updatePasswordSchema) });

  const onSubmit = async (data: FormValues) => {
    setSubmitError(null);

    try {
      await updatePassword({
        currentPassword: data.currentPassword,
        newPassword: data.newPassword,
        confirmNewPassword: data.confirmPassword,
      });

      reset();
      onOpenChange(false);
    } catch (error: any) {
      setSubmitError(
        getFriendlyErrorMessage(error, "Couldn't update your password. Please try again."),
      );
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent mobileSheet={isMobile} className="sm:max-w-md p-0">
        <DialogHeader className="px-6 pt-6 pb-2">
          <DialogTitle>Update Password</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="px-6 space-y-4">
          {submitError && (
            <div
              role="alert"
              className="flex items-start gap-2 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-600"
            >
              <AlertCircle className="mt-0.5 h-4 w-4 flex-shrink-0" />
              <span>{submitError}</span>
            </div>
          )}

          <div>
            <Label>Current Password</Label>
            <Input
              type="password"
              {...register("currentPassword")}
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
                {...register("newPassword")}
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
              {...register("confirmPassword")}
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
