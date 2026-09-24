"use client";

import { format } from "date-fns";
import { Calendar, Clock, MapPin, Route } from "lucide-react";
import { useRouter } from "next/navigation";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { RegularService } from "@/types";

// Retained for backwards compatibility with any code still importing this
// type - the inline giving form has moved to the Giving Batch workflow.
export type GivingValues = {
  tithe: string;
  offering: string;
  specialOffering: string;
  thanksgivingOffering: string;
};

type GivingRecordModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  service: RegularService | null;
  date: string | null;
};

export function GivingRecordModal({
  open,
  onOpenChange,
  service,
  date,
}: GivingRecordModalProps) {
  const router = useRouter();

  if (!service || !date) return null;

  const parsedDate = new Date(date);

  const handleRecordGiving = () => {
    onOpenChange(false);
    router.push(
      `/dashboard/finance/giving/new?churchServiceId=${service.id}&date=${date}`,
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        showClose={false}
        mobileSheet
        className="max-w-2xl p-0 overflow-hidden max-sm:max-h-[88vh]"
      >
        <DialogHeader className="px-6 py-4 border-b">
          <DialogTitle className="text-2xl">
            {service.title} Giving Record
          </DialogTitle>
        </DialogHeader>

        <div className="p-4 sm:p-6 space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
            <div className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              {format(parsedDate, "MMM. d, yyyy")}
            </div>
            <div className="flex items-center gap-2">
              <MapPin className="h-5 w-5" />
              {service.location ? "Offline" : "No location"}
            </div>
            <div className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              {service.startTime}
              {service.endTime ? ` - ${service.endTime}` : ""}
            </div>
            <div className="flex items-center gap-2">
              <Route className="h-5 w-5" />
              {service.location || "No address provided"}
            </div>
          </div>

          <div>
            <h3 className="text-xl font-semibold mb-2">Giving</h3>
            <p className="text-sm text-gray-500">
              Giving is now recorded through a counting-room batch, which
              supports multiple offering types, currencies and a confirmation
              workflow.
            </p>
          </div>

          <div className="flex justify-end">
            <Button onClick={handleRecordGiving} className="min-w-32">
              Record Giving
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
