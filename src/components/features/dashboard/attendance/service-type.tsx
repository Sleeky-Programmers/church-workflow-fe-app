"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { RefreshCw, Star } from "lucide-react";
import { Span } from "@/components/ui/typography/Text";
import { Button } from "@/components/ui/button";

type ServiceTypeModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelectType: (type: "regular" | "special") => void;
};

export function ServiceTypeModal({
  open,
  onOpenChange,
  onSelectType,
}: ServiceTypeModalProps) {
  const handleTypeSelect = (type: "regular" | "special") => {
    onSelectType(type);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent showClose={false} className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-center text-xl font-semibold">
            Service Type
          </DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-2 gap-4 py-6">
          <Button
            onClick={() => handleTypeSelect("regular")}
            className="flex flex-col items-center gap-4 p-8 rounded-lg border border-primary-200 bg-primary-50 hover:bg-primary-100 hover:border-primary-300 transition-colors"
          >
            <RefreshCw className="h-10 w-10 text-primary-600" />

            <Span variant="blue">Regular Service</Span>
          </Button>

          <Button
            onClick={() => handleTypeSelect("special")}
            className="flex flex-col items-center gap-4 p-8 rounded-lg border border-primary-200 bg-primary-50 hover:bg-primary-100 hover:border-primary-300 transition-colors"
          >
            <Star className="h-10 w-10 text-primary-600" />

            <Span variant="blue">Special Service</Span>
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
