"use client";

import { ChevronLeft, ChevronRight, Image as ImageIcon } from "lucide-react";

import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { cn } from "@/lib/utils";

import { Asset, ConditionBreakdown, ServiceRecord } from "../data";

function Card({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-xl border border-gray-200 bg-white p-4">
      <h3 className="text-sm font-semibold text-gray-900">{title}</h3>
      {subtitle && <p className="mt-0.5 text-xs text-gray-400">{subtitle}</p>}
      {children}
    </section>
  );
}

const CONDITION_META: { key: keyof ConditionBreakdown; label: string }[] = [
  { key: "good", label: "Good" },
  { key: "fair", label: "Fair" },
  { key: "repair", label: "Needs Repair" },
  { key: "damaged", label: "Damaged" },
];

function daysFromToday(dateLabel: string): number | null {
  const parsed = new Date(dateLabel);
  if (Number.isNaN(parsed.getTime())) {
    return null;
  }

  const diff = parsed.getTime() - Date.now();
  return Math.round(diff / (1000 * 60 * 60 * 24));
}

function ChangeCell({ value }: { value: number }) {
  if (value === 0) {
    return <span className="text-sm text-gray-400">-</span>;
  }

  return (
    <span
      className={cn(
        "text-sm font-medium",
        value > 0 ? "text-emerald-600" : "text-red-600",
      )}
    >
      {value > 0 ? `+${value}` : value}
    </span>
  );
}

export function ServiceRecordDrawer({
  open,
  onOpenChange,
  asset,
  records,
  index,
  onNavigate,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  asset: Asset;
  records: ServiceRecord[];
  index: number;
  onNavigate: (nextIndex: number) => void;
}) {
  const record = records[index];

  if (!record) {
    return null;
  }

  const atServiceTotal = Object.values(record.conditionAtService).reduce(
    (sum, value) => {
      return sum + value;
    },
    0,
  );
  const currentTotal = Object.values(asset.conditions).reduce((sum, value) => {
    return sum + value;
  }, 0);
  const totalChange = currentTotal - atServiceTotal;

  const reviewDays = daysFromToday(record.nextReviewDate);

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        className="flex h-full w-full flex-col gap-0 border-l border-gray-200 bg-[#fff] p-0 shadow-2xl sm:max-w-[480px]"
      >
        <SheetHeader className="space-y-1 border-b border-gray-100 px-6 py-5 text-left">
          <SheetTitle className="pr-6 text-xl font-bold text-gray-900">
            Service Record
          </SheetTitle>
          <p className="text-sm text-gray-500">
            {asset.name} - {asset.location}
          </p>
        </SheetHeader>

        <div className="min-h-0 flex-1 space-y-5 overflow-y-auto px-6 py-5">
          {/* Info strip */}
          <div className="grid grid-cols-3 gap-4 rounded-lg bg-gray-50 p-4">
            <div>
              <p className="text-[11px] font-medium uppercase tracking-wide text-gray-400">
                Record ID
              </p>
              <span className="mt-1.5 inline-block rounded-md bg-gray-200 px-2 py-0.5 text-xs font-semibold text-gray-700">
                {record.recordId}
              </span>
            </div>

            <div>
              <p className="text-[11px] font-medium uppercase tracking-wide text-gray-400">
                Service Date
              </p>
              <p className="mt-1.5 text-sm font-semibold text-gray-900">
                {record.date}
              </p>
            </div>

            <div>
              <p className="text-[11px] font-medium uppercase tracking-wide text-gray-400">
                Logged By
              </p>
              <p className="mt-1.5 text-sm font-semibold text-gray-900">
                {record.performedBy}
              </p>
            </div>
          </div>

          {/* Service Details */}
          <Card title="Service Details">
            <dl className="mt-3 divide-y divide-gray-100">
              {[
                { label: "Service Date", value: record.date },
                { label: "Time Logged", value: record.timeLogged },
                { label: "Logged By", value: record.performedBy },
                { label: "Maintenance Type", value: record.maintenanceType },
              ].map((row) => {
                return (
                  <div
                    key={row.label}
                    className="flex items-center justify-between gap-4 py-2.5"
                  >
                    <dt className="text-sm text-gray-500">{row.label}</dt>
                    <dd className="text-sm font-medium text-gray-900">
                      {row.value}
                    </dd>
                  </div>
                );
              })}

              <div className="flex items-center justify-between gap-4 py-2.5">
                <dt className="text-sm text-gray-500">Next Review Date</dt>
                <dd className="text-right">
                  <p className="text-sm font-medium text-gray-900">
                    {record.nextReviewDate}
                  </p>
                  {reviewDays !== null && (
                    <p className="text-xs text-gray-400">
                      {reviewDays >= 0
                        ? `In ${reviewDays} days`
                        : `${Math.abs(reviewDays)} days ago`}
                    </p>
                  )}
                </dd>
              </div>
            </dl>
          </Card>

          {/* Service Notes */}
          <Card title="Service Notes">
            <p className="mt-3 text-sm leading-relaxed text-gray-600">
              {record.notes || "No notes recorded for this service."}
            </p>
          </Card>

          {/* Asset Condition Snapshot */}
          <Card
            title="Asset Condition Snapshot"
            subtitle="Condition recorded at time of service"
          >
            <div className="mt-3 overflow-x-auto">
              <table className="w-full min-w-[320px] border-collapse text-left">
                <thead>
                  <tr className="border-b border-gray-100">
                    <th className="py-2 text-[11px] font-medium uppercase tracking-wide text-gray-400">
                      Condition
                    </th>
                    <th className="py-2 text-right text-[11px] font-medium uppercase tracking-wide text-gray-400">
                      At Service
                    </th>
                    <th className="py-2 text-right text-[11px] font-medium uppercase tracking-wide text-gray-400">
                      Current
                    </th>
                    <th className="py-2 text-right text-[11px] font-medium uppercase tracking-wide text-gray-400">
                      Change
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {CONDITION_META.map(({ key, label }) => {
                    const atService = record.conditionAtService[key];
                    const current = asset.conditions[key];

                    return (
                      <tr key={key} className="border-b border-gray-50">
                        <td className="py-2.5 text-sm text-gray-700">
                          {label}
                        </td>
                        <td className="py-2.5 text-right text-sm text-gray-700">
                          {atService}
                        </td>
                        <td className="py-2.5 text-right text-sm text-gray-700">
                          {current}
                        </td>
                        <td className="py-2.5 text-right">
                          <ChangeCell value={current - atService} />
                        </td>
                      </tr>
                    );
                  })}

                  <tr>
                    <td className="py-2.5 text-sm font-semibold text-gray-900">
                      Total
                    </td>
                    <td className="py-2.5 text-right text-sm font-semibold text-gray-900">
                      {atServiceTotal}
                    </td>
                    <td className="py-2.5 text-right text-sm font-semibold text-gray-900">
                      {currentTotal}
                    </td>
                    <td className="py-2.5 text-right text-sm font-medium text-gray-500">
                      {totalChange === 0 ? (
                        "No change"
                      ) : (
                        <ChangeCell value={totalChange} />
                      )}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            <p className="mt-3 rounded-lg bg-blue-50 px-3.5 py-2.5 text-xs leading-relaxed text-blue-800">
              These values were recorded when this service entry was logged and
              may differ from the current asset condition.
            </p>
          </Card>

          {/* Attachments */}
          {record.attachments.length > 0 && (
            <Card title="Attachments">
              <div className="mt-3 flex flex-wrap gap-3">
                {record.attachments.map((attachment) => {
                  return (
                    <figure
                      key={attachment.id}
                      className="flex h-24 w-24 flex-col items-center justify-center gap-1 overflow-hidden rounded-lg border border-gray-200 bg-gray-50 text-gray-400"
                      title={attachment.name}
                    >
                      <ImageIcon className="h-6 w-6" />
                      <figcaption className="max-w-[88px] truncate px-1 text-[10px] text-gray-400">
                        {attachment.name}
                      </figcaption>
                    </figure>
                  );
                })}
              </div>
            </Card>
          )}
        </div>

        {/* Footer navigation */}
        <div className="flex items-center justify-between border-t border-gray-100 px-6 py-4">
          <button
            type="button"
            disabled={index === 0}
            onClick={() => {
              return onNavigate(index - 1);
            }}
            className="flex items-center gap-1 text-sm font-medium text-gray-600 transition-colors hover:text-gray-900 disabled:cursor-not-allowed disabled:opacity-40"
          >
            <ChevronLeft className="h-4 w-4" />
            Previous Record
          </button>

          <span className="text-xs text-gray-400">
            Record {index + 1} of {records.length}
          </span>

          <button
            type="button"
            disabled={index === records.length - 1}
            onClick={() => {
              return onNavigate(index + 1);
            }}
            className="flex items-center gap-1 text-sm font-medium text-blue-600 transition-colors hover:text-blue-700 disabled:cursor-not-allowed disabled:opacity-40"
          >
            Next Record
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </SheetContent>
    </Sheet>
  );
}
