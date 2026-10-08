"use client";

import { useState } from "react";

import { Button } from "@/components/ui/button";
import { DatePicker } from "@/components/ui/date-picker";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { logAssetService } from "@/services/assetService";
import { useUserStore } from "@/stores/useUserStore";

import { Asset, MAINTENANCE_TYPES } from "../data";

const controlClass =
  "h-9 rounded-lg border-gray-300 bg-white text-sm text-gray-900 shadow-none";

export function LogServiceModal({
  open,
  onOpenChange,
  asset,
  onLogged,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  asset: Asset;
  onLogged: (asset: Asset) => void;
}) {
  const { toast } = useToast();
  const { user, getUserFullName } = useUserStore();
  const [date, setDate] = useState("");
  const [maintenanceType, setMaintenanceType] = useState("");
  const [notes, setNotes] = useState("");
  const [nextDate, setNextDate] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const isValid = Boolean(date && maintenanceType);

  const reset = () => {
    setDate("");
    setMaintenanceType("");
    setNotes("");
    setNextDate("");
  };

  const submit = async () => {
    if (!isValid) {
      toast({
        title: "Missing information",
        description: "Service date and maintenance type are required",
        variant: "destructive",
      });
      return;
    }

    setSubmitting(true);
    try {
      const updated = await logAssetService(asset.id, {
        date,
        maintenanceType,
        notes: notes.trim() || undefined,
        nextServiceDate: nextDate || undefined,
      });

      onLogged(updated);

      toast({
        title: "Service logged",
        description: `${asset.name} service history was updated`,
      });

      reset();
      onOpenChange(false);
    } catch {
      toast({
        title: "Failed to log service",
        description: "Please try again",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (!next) reset();
        onOpenChange(next);
      }}
    >
      <DialogContent
        showClose={false}
        className="flex max-h-[85vh] w-[min(92vw,520px)] flex-col gap-0 overflow-hidden rounded-2xl border-0 bg-[#fff] p-0 shadow-2xl backdrop-blur-none"
      >
        <div className="flex items-start justify-between px-6 pb-2 pt-6">
          <DialogTitle className="pr-8 text-xl font-bold text-gray-900">
            Log Maintenance
          </DialogTitle>

          <button
            type="button"
            aria-label="Close"
            onClick={() => onOpenChange(false)}
            className="-mr-1 rounded-md p-1 text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-800"
          >
            ✕
          </button>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto px-6 pb-6">
          <div className="space-y-4 pt-3">
            <div className="space-y-2">
              <Label className="block text-[13px] font-medium leading-none text-gray-700">
                Asset
              </Label>
              <p className="rounded-lg bg-gray-50 px-3.5 py-2.5 text-sm font-medium text-gray-900">
                {asset.name}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label
                  htmlFor="service-date"
                  className="block text-[13px] font-medium leading-none text-gray-700"
                >
                  Service Date
                  <span className="ml-0.5 align-super text-red-500">*</span>
                </Label>
                <DatePicker id="service-date" value={date} onChange={setDate} />
              </div>

              <div className="space-y-2">
                <Label
                  htmlFor="maintenance-type"
                  className="block text-[13px] font-medium leading-none text-gray-700"
                >
                  Maintenance Type
                  <span className="ml-0.5 align-super text-red-500">*</span>
                </Label>
                <Select
                  value={maintenanceType}
                  onValueChange={setMaintenanceType}
                >
                  <SelectTrigger
                    id="maintenance-type"
                    className={controlClass}
                  >
                    <SelectValue placeholder="Select Type" />
                  </SelectTrigger>
                  <SelectContent>
                    {MAINTENANCE_TYPES.map((option) => (
                      <SelectItem key={option} value={option}>
                        {option}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label className="block text-[13px] font-medium leading-none text-gray-700">
                Logged By
              </Label>
              <div className="rounded-lg bg-gray-50 px-3.5 py-2.5">
                <p className="text-sm font-medium text-gray-900">
                  {getUserFullName() || "You"}
                </p>
                <p className="text-xs text-gray-500">{user?.email}</p>
              </div>
            </div>

            <div className="space-y-2">
              <Label
                htmlFor="service-notes"
                className="block text-[13px] font-medium leading-none text-gray-700"
              >
                Notes
              </Label>
              <Textarea
                id="service-notes"
                rows={4}
                value={notes}
                onChange={(event) => setNotes(event.target.value)}
                placeholder="Describe the maintenance work performed..."
                className={`${controlClass} h-auto resize-none py-2`}
              />
            </div>

            <div className="space-y-2">
              <Label
                htmlFor="next-service-date"
                className="block text-[13px] font-medium leading-none text-gray-700"
              >
                Next Service Date
              </Label>
              <DatePicker
                id="next-service-date"
                value={nextDate}
                onChange={setNextDate}
              />
              <p className="text-xs text-gray-400">
                Optional. If blank, system will auto-calculate based on
                frequency
              </p>
            </div>
          </div>

          <div className="mt-6 flex justify-end gap-3 border-t border-gray-100 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="h-10 rounded-lg border-gray-300 px-5 text-sm font-medium"
            >
              Cancel
            </Button>

            <Button
              type="button"
              disabled={!isValid || submitting}
              onClick={submit}
              className="h-10 rounded-lg bg-primary px-5 text-sm font-medium text-white-600 hover:bg-primary-600"
            >
              {submitting ? "Saving..." : "Save Record"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
