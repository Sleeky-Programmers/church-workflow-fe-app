"use client";

import { useEffect } from "react";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Text } from "@/components/ui/typography/Text";
import { TitleCombobox } from "@/components/ui/title-combobox";
import { useIsMobile } from "@/hooks/use-mobile";
import { useToast } from "@/hooks/use-toast";
import { updateProfile } from "@/services/userServices";
import {
  editPersonalInfoSchema,
  EditPersonalInfoFormValues,
} from "@/types/schema";

type FormValues = EditPersonalInfoFormValues;

export function EditPersonalInfoModal({
  open,
  onOpenChange,
  user,
  onUpdated,
}: any) {
  const { toast } = useToast();

  const {
    register,
    control,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({ resolver: zodResolver(editPersonalInfoSchema) });

  useEffect(() => {
    if (open) {
      reset({
        title: user?.title || "",
        firstName: user?.firstName || "",
        lastName: user?.lastName || "",
        email: user?.email || "",
      });
    }
  }, [open, user, reset]);
  const isMobile = useIsMobile();
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
      <DialogContent mobileSheet={isMobile} className="sm:max-w-lg p-0">
        <DialogHeader className="px-6 pt-6 pb-2">
          <DialogTitle>Update Personal Information</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="px-6 pb-5 space-y-4">
          <div>
            <Label>Title</Label>
            <Controller
              control={control}
              name="title"
              render={({ field }) => (
                <TitleCombobox value={field.value} onChange={field.onChange} />
              )}
            />
            {errors.title && (
              <Text variant="error">{errors.title.message}</Text>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>First Name</Label>
              <Input {...register("firstName")} className="bg-gray-100" />
              {errors.firstName && (
                <Text variant="error">{errors.firstName.message}</Text>
              )}
            </div>

            <div>
              <Label>Last Name</Label>
              <Input {...register("lastName")} className="bg-gray-100" />
              {errors.lastName && (
                <Text variant="error">{errors.lastName.message}</Text>
              )}
            </div>
          </div>

          <div>
            <Label>Email</Label>
            <Input
              {...register("email")}
              disabled
              readOnly
              className="bg-gray-100 cursor-not-allowed text-gray-500"
            />
            <Text variant="muted" className="text-xs mt-1">
              Email address can&apos;t be changed here.
            </Text>
          </div>

          <DialogFooter className="pt-4 border-t mt-4">
            <Button
              type="button"
              variant="destructive"
              onClick={() => onOpenChange(false)}
              size="sm"
            >
              Cancel
            </Button>

            <Button type="submit" size={"sm"} disabled={isSubmitting}>
              {isSubmitting ? "Saving..." : "Save"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
