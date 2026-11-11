"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { FileUp, FolderPlus } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";
import { cn } from "@/lib/utils";

import { MemberFormType } from "@/lib/enums";

type AddMemberFormatModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelectFormat: (format: MemberFormType.FORM | MemberFormType.CSV) => void;
};

// Per the Figma design: a centered "Add Member" dialog with two large square
// Tiles - "Create a Form" and "Upload CSV" - each with a big blue icon and a
// Bordered card; the hovered/selected tile gets a light blue fill.
export function AddMemberFormatModal({
  open,
  onOpenChange,
  onSelectFormat,
}: AddMemberFormatModalProps) {
  const isMobile = useIsMobile();

  const handleFormatSelect = (
    format: MemberFormType.FORM | MemberFormType.CSV,
  ) => {
    onSelectFormat(format);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        showClose={false}
        mobileSheet
        className="sm:max-w-lg max-sm:max-h-[70vh] max-sm:p-4"
      >
        <DialogHeader className="sm:border-b-0">
          <DialogTitle className="text-center text-xl font-bold text-gray-900">
            Add Member
          </DialogTitle>
        </DialogHeader>

        <div
          className={cn(
            "grid gap-6",
            isMobile ? "grid-cols-1 py-4" : "grid-cols-2 py-8 px-2",
          )}
        >
          <button
            type="button"
            onClick={() => {
              return handleFormatSelect(MemberFormType.FORM);
            }}
            className={cn(
              "flex flex-col items-center justify-center gap-5 rounded-lg border border-gray-200 bg-white transition-colors hover:bg-blue-50/60 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-200",
              isMobile ? "h-40 w-full" : "h-44 w-full",
            )}
          >
            <FolderPlus
              className="h-12 w-12 text-primary-400"
              strokeWidth={1.5}
            />
            <span className="text-xs font-bold tracking-wide text-primary-400 uppercase">
              Create a Form
            </span>
          </button>

          <button
            type="button"
            onClick={() => {
              return handleFormatSelect(MemberFormType.CSV);
            }}
            className={cn(
              "flex flex-col items-center justify-center gap-5 rounded-lg border border-gray-200 bg-blue-50/60 transition-colors hover:bg-blue-100/70 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-200",
              isMobile ? "h-40 w-full" : "h-44 w-full",
            )}
          >
            <FileUp className="h-12 w-12 text-primary-400" strokeWidth={1.5} />
            <span className="text-xs font-bold tracking-wide text-primary-400 uppercase">
              Upload CSV
            </span>
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
