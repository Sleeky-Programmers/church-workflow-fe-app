"use client";

import { AlertCircle, Camera } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
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
import {
  getFriendlyErrorMessage,
  MAX_IMAGE_SIZE_MB,
} from "@/lib/api-errors";
import { updateChurch } from "@/services/churchService";
import { editChurchSchema, EditChurchFormValues } from "@/types/schema";

type FormValues = EditChurchFormValues;

const MAX_IMAGE_SIZE_BYTES = MAX_IMAGE_SIZE_MB * 1024 * 1024;
const ACCEPTED_IMAGE_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
];

function formatFileSize(bytes: number): string {
  if (bytes < 1024 * 1024) {
    return `${(bytes / 1024).toFixed(0)}KB`;
  }
  return `${(bytes / (1024 * 1024)).toFixed(1)}MB`;
}

export function EditChurchModal({
  open,
  onOpenChange,
  church,
  onUpdated,
}: any) {
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [fileError, setFileError] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({ resolver: zodResolver(editChurchSchema) });

  useEffect(() => {
    if (open) {
      reset({
        name: church?.name || "",
        alias: church?.alias || "",
        address: church?.address || "",
        state: church?.state || "",
        country: church?.country || "",
      });
      setFile(null);
      setPreviewUrl(null);
      setFileError(null);
      setSubmitError(null);
    }
  }, [open, church, reset]);

  // Selecting a new logo swaps the preview to that file's image; the
  // Object URL is revoked whenever it's replaced or the drawer closes.
  useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0] || null;

    // Reset previous errors and selection state before validating
    setFileError(null);
    setSubmitError(null);
    setFile(null);
    setPreviewUrl((current) => {
      if (current) URL.revokeObjectURL(current);
      return null;
    });

    if (!selected) return;

    // Client-side validation: type
    if (!ACCEPTED_IMAGE_TYPES.includes(selected.type)) {
      setFileError(
        `"${selected.name}" is not a supported image. Please upload a JPG, PNG, WEBP, or GIF file.`,
      );
      e.target.value = "";
      return;
    }

    // Client-side validation: size
    if (selected.size > MAX_IMAGE_SIZE_BYTES) {
      setFileError(
        `"${selected.name}" is ${formatFileSize(selected.size)}, which exceeds the ${MAX_IMAGE_SIZE_MB}MB limit. Please choose a smaller image.`,
      );
      e.target.value = "";
      return;
    }

    setFile(selected);
    setPreviewUrl(URL.createObjectURL(selected));
  };

  const displayedLogo = previewUrl || church?.logoUrl;

  const onSubmit = async (data: FormValues) => {
    setSubmitError(null);

    try {
      const updated = await updateChurch(data, file || undefined);
      onUpdated?.(updated);
      onOpenChange(false);
    } catch (error: any) {
      // 413 can come from a proxy before our client-side check triggers,
      // so map it to the same clear, size-specific message.
      const status = error?.status;
      const isTooLarge =
        status === 413 || /too large|file size/i.test(error?.message || "");

      setSubmitError(
        isTooLarge
          ? `The selected image is too large. Please choose an image smaller than ${MAX_IMAGE_SIZE_MB}MB.`
          : getFriendlyErrorMessage(error, "Couldn't update the church. Please try again."),
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
          <SheetTitle>Edit Church</SheetTitle>
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

          <div className="flex flex-col items-center gap-2">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="group relative h-24 w-24 rounded-full overflow-hidden ring-2 ring-gray-200 focus:outline-none focus:ring-primary-400"
            >
              {displayedLogo ? (
                <img
                  src={displayedLogo}
                  alt="Church logo preview"
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="h-full w-full flex items-center justify-center bg-primary-100 text-primary-700 text-2xl font-bold">
                  {church?.name?.charAt(0).toUpperCase() || "C"}
                </div>
              )}

              <div className="absolute inset-0 flex items-center justify-center bg-black/0 group-hover:bg-black/40 transition-colors">
                <Camera className="h-5 w-5 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
            </button>

            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => fileInputRef.current?.click()}
            >
              {displayedLogo ? "Change Logo" : "Upload Logo"}
            </Button>
            {file && (
              <Text variant="muted" className="text-xs">
                Selected: {file.name} ({formatFileSize(file.size)})
              </Text>
            )}

            {fileError && (
              <p
                role="alert"
                className="flex items-start gap-1.5 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-600"
              >
                <AlertCircle className="mt-0.5 h-4 w-4 flex-shrink-0" />
                <span>{fileError}</span>
              </p>
            )}
            {!fileError && (
              <Text variant="muted" className="text-xs">
                JPG, PNG, WEBP, or GIF up to {MAX_IMAGE_SIZE_MB}MB
              </Text>
            )}

            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp,image/gif"
              className="hidden"
              onChange={handleLogoChange}
            />
          </div>

          <div>
            <Label>Church Name</Label>
            <Input {...register("name")} className="bg-gray-100" />
            {errors.name && (
              <p className="text-red-500 text-sm">{errors.name.message}</p>
            )}
          </div>

          <div>
            <Label>Church Address</Label>
            <Input {...register("address")} className="bg-gray-100" />
            {errors.address && (
              <p className="text-red-500 text-sm">{errors.address.message}</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Input placeholder="State" {...register("state")} />
            <div>
              <Input placeholder="Country" {...register("country")} />
              {errors.country && (
                <p className="text-red-500 text-sm">{errors.country.message}</p>
              )}
            </div>
          </div>

          </div>

          <SheetFooter className="mt-0 flex-row items-center justify-end gap-2 border-t px-6 py-4">
            <Button
              type="button"
              variant="destructive"
              size={"sm"}
              onClick={() => onOpenChange(false)}
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
