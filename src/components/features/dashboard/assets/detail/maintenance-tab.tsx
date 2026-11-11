"use client";

import { CalendarDays, Clock, Wrench } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { updateMaintenanceNotifications } from "@/services/assetService";

import { Asset } from "../data";

import { ServiceRecordDrawer } from "./service-record-drawer";

function Card({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section
      className={cn(
        "rounded-xl border border-gray-200 bg-white p-5 shadow-[0_1px_4px_rgba(0,0,0,0.04)]",
        className,
      )}
    >
      {children}
    </section>
  );
}

const HEAD_CLASS =
  "px-4 py-3 text-[11px] font-medium uppercase tracking-wide text-gray-400";

const initialsOf = (name: string) => {
  return name
    .split(" ")
    .map((part) => {
      return part.charAt(0);
    })
    .join("")
    .slice(0, 2)
    .toUpperCase();
};

export function MaintenanceTab({
  asset,
  onChange,
  onLogService,
}: {
  asset: Asset;
  onChange: (next: Asset) => void;
  onLogService: () => void;
}) {
  const { toast } = useToast();
  const schedule = asset.schedule;

  const [enabled, setEnabled] = useState(schedule.notificationsEnabled);
  const [upcoming, setUpcoming] = useState(schedule.notifyUpcoming);
  const [due, setDue] = useState(schedule.notifyDue);
  const [overdue, setOverdue] = useState(schedule.notifyOverdue);
  const [days, setDays] = useState(String(schedule.notifyDaysBefore));
  const [recipients, setRecipients] = useState<string[]>(schedule.recipients);
  const [detailIndex, setDetailIndex] = useState<number | null>(null);

  const [savingNotifications, setSavingNotifications] = useState(false);

  const saveNotifications = async () => {
    setSavingNotifications(true);
    try {
      const updated = await updateMaintenanceNotifications(asset.id, {
        notificationsEnabled: enabled,
        notifyUpcoming: upcoming,
        notifyDue: due,
        notifyOverdue: overdue,
        notifyDaysBefore: Number(days) || 0,
        recipients,
      });

      onChange(updated);

      toast({
        title: "Notification settings saved",
        description: `${asset.name} maintenance alerts were updated`,
      });
    } catch {
      toast({
        title: "Failed to save notification settings",
        description: "Please try again",
        variant: "destructive",
      });
    } finally {
      setSavingNotifications(false);
    }
  };

  const scheduleItems = [
    {
      label: "Frequency",
      value: schedule.frequency ?? "None",
      icon: Clock,
    },
    { label: "Last Service", value: schedule.lastService, icon: CalendarDays },
    { label: "Next Service", value: schedule.nextDue, icon: CalendarDays },
    { label: "Last Review", value: schedule.lastReview, icon: CalendarDays },
  ];

  return (
    <div className="space-y-5">
      {/* Maintenance Schedule */}
      <Card>
        <h2 className="flex items-center gap-2 text-base font-semibold text-gray-900">
          <Wrench className="h-4 w-4 text-gray-500" />
          Maintenance Schedule
        </h2>

        <div className="mt-4 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {scheduleItems.map((item) => {
            return (
              <div key={item.label} className="flex items-start gap-3">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-gray-100 text-gray-500">
                  <item.icon className="h-4 w-4" />
                </span>

                <div className="min-w-0">
                  <p className="text-[11px] font-medium uppercase tracking-wide text-gray-400">
                    {item.label}
                  </p>
                  <p className="mt-0.5 text-sm font-semibold text-gray-900">
                    {item.value}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        <p className="mt-5 flex items-center gap-2 text-xs text-gray-400">
          <span
            className={cn(
              "h-2 w-2 rounded-full",
              enabled ? "bg-emerald-500" : "bg-gray-300",
            )}
          />
          {enabled ? "Notifications enabled" : "Notifications disabled"}
        </p>
      </Card>

      {/* Service History */}
      <Card>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-base font-semibold text-gray-900">
            Service History
          </h2>

          <Button
            type="button"
            onClick={onLogService}
            className="h-10 rounded-lg bg-primary px-5 text-sm font-medium text-white-600 hover:bg-primary-600"
          >
            Log Service
          </Button>
        </div>

        <div className="mt-4 overflow-x-auto">
          <table className="w-full min-w-[720px] border-collapse text-left">
            <thead>
              <tr className="border-b border-gray-200">
                <th className={HEAD_CLASS}>Date</th>
                <th className={HEAD_CLASS}>Performed By</th>
                <th className={HEAD_CLASS}>Notes</th>
                <th className={cn(HEAD_CLASS, "text-right")}>Actions</th>
              </tr>
            </thead>

            <tbody>
              {asset.services.length === 0 ? (
                <tr>
                  <td
                    colSpan={4}
                    className="px-4 py-8 text-center text-sm text-gray-500"
                  >
                    No services logged yet.
                  </td>
                </tr>
              ) : (
                asset.services.map((service, serviceIndex) => {
                  return (
                    <tr
                      key={service.id}
                      className="border-b border-gray-100 last:border-0"
                    >
                      <td className="px-4 py-4 text-sm text-gray-700">
                        {service.date}
                      </td>

                      <td className="px-4 py-4">
                        <div className="flex items-center gap-3">
                          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-semibold text-white-600">
                            {initialsOf(service.performedBy)}
                          </span>
                          <span className="text-sm font-medium text-gray-700">
                            {service.performedBy}
                          </span>
                        </div>
                      </td>

                      <td className="max-w-[360px] truncate px-4 py-4 text-sm text-gray-600">
                        {service.notes}
                      </td>

                      <td className="px-4 py-4 text-right">
                        <button
                          type="button"
                          onClick={() => {
                            return setDetailIndex(serviceIndex);
                          }}
                          className="text-sm font-medium text-blue-600 transition-colors hover:text-blue-700"
                        >
                          View Details
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Maintenance Notifications */}
      <Card>
        <h2 className="text-base font-semibold text-gray-900">
          Maintenance Notifications
        </h2>

        <div className="mt-4 flex items-center justify-between gap-4">
          <span className="text-sm text-gray-700">
            Enable maintenance notifications
          </span>
          <Switch checked={enabled} onCheckedChange={setEnabled} />
        </div>

        {enabled && (
          <>
            <div className="mt-4 space-y-3 pl-1">
              <label className="flex cursor-pointer items-center gap-3 text-sm text-gray-700">
                <Checkbox
                  checked={upcoming}
                  onCheckedChange={(value) => {
                    return setUpcoming(value === true);
                  }}
                />
                Upcoming ({Number(days) || 0} days before)
              </label>

              <label className="flex cursor-pointer items-center gap-3 text-sm text-gray-700">
                <Checkbox
                  checked={due}
                  onCheckedChange={(value) => {
                    return setDue(value === true);
                  }}
                />
                Due
              </label>

              <label className="flex cursor-pointer items-center gap-3 text-sm text-gray-700">
                <Checkbox
                  checked={overdue}
                  onCheckedChange={(value) => {
                    return setOverdue(value === true);
                  }}
                />
                Overdue
              </label>
            </div>

            <div className="mt-5 border-t border-gray-100 pt-5">
              <label
                htmlFor="notify-days"
                className="block text-sm text-gray-700"
              >
                Days before to notify
              </label>
              <Input
                id="notify-days"
                type="number"
                min={0}
                value={days}
                onChange={(event) => {
                  return setDays(event.target.value);
                }}
                className="mt-2 h-10 w-28 rounded-lg border-gray-300 bg-white text-sm shadow-none"
              />
            </div>

            <div className="mt-5">
              <p className="text-sm text-gray-700">Notify recipient</p>

              <div className="mt-2 space-y-2">
                {recipients.map((recipient, index) => {
                  return (
                    <div
                      key={`${recipient}-${index}`}
                      className="flex items-center gap-3"
                    >
                      <Input
                        value={recipient}
                        onChange={(event) => {
                          return setRecipients((prev) => {
                            return prev.map((item, position) => {
                              return position === index
                                ? event.target.value
                                : item;
                            });
                          });
                        }}
                        className="h-10 w-full max-w-sm rounded-lg border-gray-300 bg-white text-sm shadow-none"
                        aria-label={`Notify recipient ${index + 1}`}
                      />
                      {recipients.length > 1 && (
                        <button
                          type="button"
                          onClick={() => {
                            return setRecipients((prev) => {
                              return prev.filter((_, position) => {
                                return position !== index;
                              });
                            });
                          }}
                          className="text-sm font-medium text-red-600 transition-colors hover:text-red-700"
                        >
                          Remove
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>

              <button
                type="button"
                onClick={() => {
                  return setRecipients((prev) => {
                    return [...prev, ""];
                  });
                }}
                className="mt-3 text-sm font-medium text-blue-600 transition-colors hover:text-blue-700"
              >
                Add another email
              </button>
            </div>

            <Button
              type="button"
              onClick={saveNotifications}
              disabled={savingNotifications}
              className="mt-6 h-11 w-full rounded-lg bg-primary text-sm font-medium text-white-600 hover:bg-primary-600"
            >
              {savingNotifications ? "Saving..." : "Save Notification Settings"}
            </Button>
          </>
        )}
      </Card>

      {/* View Details drawer */}
      <ServiceRecordDrawer
        open={detailIndex !== null}
        onOpenChange={(open) => {
          return !open && setDetailIndex(null);
        }}
        asset={asset}
        records={asset.services}
        index={detailIndex ?? 0}
        onNavigate={setDetailIndex}
      />
    </div>
  );
}
