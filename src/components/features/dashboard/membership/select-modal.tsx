"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { BookPlus, UploadIcon } from "lucide-react";
import { Span } from "@/components/ui/typography/Text";
import { Button } from "@/components/ui/button";

type AddMemberFormatModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelectFormat: (format: "form" | "csv") => void;
};

export function AddMemberFormatModal({
  open,
  onOpenChange,
  onSelectFormat,
}: AddMemberFormatModalProps) {
  const handleFormatSelect = (format: "form" | "csv") => {
    onSelectFormat(format);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent showClose={false} className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-center text-xl font-semibold">
            Add A Member
          </DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-2 gap-4 py-6">
          <Button
            variant="outline"
            onClick={() => handleFormatSelect("form")}
            className="flex flex-col items-center gap-4 p-8 "
          >
            <BookPlus className="h-10 w-10 text-primary-600" />

            <Span variant="blue">Create A form</Span>
          </Button>

          <Button
            variant="outline"
            onClick={() => handleFormatSelect("csv")}
            className="flex flex-col items-center gap-4 p-8 "
          >
            <UploadIcon className="h-10 w-10 text-primary-600" />

            <Span variant="blue">Upload CSV</Span>
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
