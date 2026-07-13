"use client";

import { useEffect, useState } from "react";
import { format } from "date-fns";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Calendar, Clock, MapPin, Route } from "lucide-react";
import { RegularService } from "@/types";
import { getMyChurch } from "@/lib/api";
export type GivingValues = {
  tithe: string;
  offering: string;
  specialOffering: string;
  thanksgivingOffering: string;
};
import { getCurrencySymbol } from "@/utils/currency";

type GivingRecordModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  service: RegularService | null;
  date: string | null;
  initialValues?: GivingValues;
  onSave?: (values: GivingValues) => void;
};

export function GivingRecordModal({
  open,
  onOpenChange,
  service,
  date,
  initialValues,
  onSave,
}: GivingRecordModalProps) {
  const [values, setValues] = useState<GivingValues>({
    tithe: "",
    offering: "",
    specialOffering: "",
    thanksgivingOffering: "",
  });

  useEffect(() => {
    if (open) {
      setValues(
        initialValues || {
          tithe: "",
          offering: "",
          specialOffering: "",
          thanksgivingOffering: "",
        },
      );
    }
  }, [open, initialValues]);

  const [currency, setCurrency] = useState("NGN");

  useEffect(() => {
    const loadChurch = async () => {
      try {
        const church = await getMyChurch();
        if (church?.defaultCurrency) {
          setCurrency(church.defaultCurrency);
        }
      } catch {}
    };

    if (open) {
      loadChurch();
    }
  }, [open]);

  if (!service || !date) return null;

  const parsedDate = new Date(date);

  const handleSave = () => {
    onSave?.(values);
    onOpenChange(false);
  };

  const updateValue = (field: keyof GivingValues, value: string) => {
    setValues((prev) => ({ ...prev, [field]: value }));
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
            {service.serviceName} Giving Record
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
            <h3 className="text-3xl font-semibold mb-4">Giving Summary</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="mb-2 block text-sm font-medium">Tithe</label>
                <Input
                  placeholder="Enter amount"
                  value={values.tithe}
                  onChange={(e) => updateValue("tithe", e.target.value)}
                  leftIcon={
                    <span className="text-sm text-gray-500">
                      {getCurrencySymbol(currency)}
                    </span>
                  }
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium">
                  Offering
                </label>
                <Input
                  placeholder="Enter amount"
                  value={values.offering}
                  onChange={(e) => updateValue("offering", e.target.value)}
                  leftIcon={
                    <span className="text-sm text-gray-500">
                      {getCurrencySymbol(currency)}
                    </span>
                  }
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium">
                  Special Offering
                </label>
                <Input
                  placeholder="Enter amount"
                  value={values.specialOffering}
                  onChange={(e) =>
                    updateValue("specialOffering", e.target.value)
                  }
                  leftIcon={
                    <span className="text-sm text-gray-500">
                      {getCurrencySymbol(currency)}
                    </span>
                  }
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium">
                  Thanksgiving Offering
                </label>
                <Input
                  placeholder="Enter amount"
                  value={values.thanksgivingOffering}
                  onChange={(e) =>
                    updateValue("thanksgivingOffering", e.target.value)
                  }
                  leftIcon={
                    <span className="text-sm text-gray-500">
                      {getCurrencySymbol(currency)}
                    </span>
                  }
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end">
            <Button onClick={handleSave} className="min-w-32">
              Save
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
