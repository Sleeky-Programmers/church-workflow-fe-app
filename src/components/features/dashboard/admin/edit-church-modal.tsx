"use client";

import { Camera } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
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
import { useIsMobile } from "@/hooks/use-mobile";
import { useToast } from "@/hooks/use-toast";
import { updateChurch } from "@/services/churchService";
import { editChurchSchema, EditChurchFormValues } from "@/types/schema";

type FormValues = EditChurchFormValues;

export function EditChurchModal({
  open,
  onOpenChange,
  church,
  onUpdated,
}: any) {
  const { toast } = useToast();
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
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
    }
  }, [open, church, reset]);

  // Selecting a new logo swaps the preview to that file's image; the
  // Object URL is revoked whenever it's replaced or the modal closes.
  useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0] || null;
    setFile(selected);
    setPreviewUrl((current) => {
      if (current) URL.revokeObjectURL(current);
      return selected ? URL.createObjectURL(selected) : null;
    });
  };

  const isMobile = useIsMobile();
  const displayedLogo = previewUrl || church?.logoUrl;

  const onSubmit = async (data: FormValues) => {
    try {
      const updated = await updateChurch(data, file || undefined);

      toast({
        title: "Success",
        description: "Church updated successfully",
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
          <DialogTitle>Edit Church</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="px-6 pb-5 space-y-4">
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
                Selected: {file.name}
              </Text>
            )}

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
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

          <DialogFooter className="pt-4 border-t mt-4">
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
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
