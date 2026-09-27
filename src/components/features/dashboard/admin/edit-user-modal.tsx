"use client";

import { AlertCircle } from "lucide-react";
import { useEffect, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Text } from "@/components/ui/typography/Text";
import { TitleCombobox } from "@/components/ui/title-combobox";
import { getFriendlyErrorMessage } from "@/lib/api-errors";
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
  const [submitError, setSubmitError] = useState<string | null>(null);

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
        phoneNumber: user?.phoneNumber || "",
      });
    }
  }, [open, user, reset]);

  const onSubmit = async (data: FormValues) => {
    setSubmitError(null);

    try {
      const updated = await updateProfile(data);
      onUpdated?.(updated);
      onOpenChange(false);
    } catch (error: any) {
      setSubmitError(
        getFriendlyErrorMessage(error, "Couldn't update your profile. Please try again."),
      );
    }
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        className="flex w-full flex-col gap-0 p-0 sm:max-w-lg"
      >
        <SheetHeader className="px-6 pt-6 pb-4 border-b">
          <SheetTitle>Update Personal Information</SheetTitle>
        </SheetHeader>

        <form
          onSubmit={handleSubmit(onSubmit)}
          className="flex min-h-0 flex-1 flex-col"
        >
          <div className="flex-1 space-y-4 overflow-y-auto px-6 py-5">
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
            <Label>Phone Number</Label>
            <Input
              {...register("phoneNumber")}
              type="tel"
              placeholder="e.g. +234 801 234 5678"
              className="bg-gray-100"
            />
            {errors.phoneNumber && (
              <Text variant="error">{errors.phoneNumber.message}</Text>
            )}
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

          </div>

          <SheetFooter className="mt-0 flex-row items-center justify-end gap-2 border-t px-6 py-4">
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
          </SheetFooter>
        </form>
      </SheetContent>
    </Sheet>
  );
}
