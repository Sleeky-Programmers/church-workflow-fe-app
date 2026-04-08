"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
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
import { useToast } from "@/hooks/use-toast";
import { updateProfile } from "@/services/userServices";

type FormValues = {
  firstName: string;
  lastName: string;
  email: string;
};

export function EditPersonalInfoModal({
  open,
  onOpenChange,
  user,
  onUpdated,
}: any) {
  const { toast } = useToast();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>();

  useEffect(() => {
    if (open) {
      reset({
        firstName: user?.firstName || "",
        lastName: user?.lastName || "",
        email: user?.email || "",
      });
    }
  }, [open, user, reset]);

  const onSubmit = async (data: FormValues) => {
    try {
      const updated = await updateProfile(data);

      toast({
        title: "Success",
        description: "Profile updated successfully",
      });

      onUpdated?.(updated);
      onOpenChange(false);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Update failed",
        variant: "destructive",
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent mobileSheet className="sm:max-w-lg p-0">
        <DialogHeader className="px-6 pt-6 pb-2">
          <DialogTitle>Update Personal Information</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="px-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>First Name</Label>
              <Input
                {...register("firstName", {
                  required: "First name is required",
                })}
                className="bg-gray-100"
              />
              {errors.firstName && (
                <p className="text-red-500 text-sm">
                  {errors.firstName.message}
                </p>
              )}
            </div>

            <div>
              <Label>Last Name</Label>
              <Input
                {...register("lastName", {
                  required: "Last name is required",
                })}
                className="bg-gray-100"
              />
              {errors.lastName && (
                <p className="text-red-500 text-sm">
                  {errors.lastName.message}
                </p>
              )}
            </div>
          </div>

          <div>
            <Label>Email</Label>
            <Input
              {...register("email", {
                required: "Email is required",
                pattern: {
                  value: /^\S+@\S+$/i,
                  message: "Invalid email",
                },
              })}
              className="bg-gray-100"
            />
            {errors.email && (
              <p className="text-red-500 text-sm">{errors.email.message}</p>
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
