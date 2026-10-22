"use client";

import {
  CalendarDays,
  MapPin,
  Package,
  Shield,
  TriangleAlert,
  User,
  Wrench,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

import { Asset, AssetCondition, ConditionBreakdown } from "../data";

interface DetailItem {
  label: string;
  value: string;
  icon: React.ComponentType<{ className?: string }>;
}

function Card({
  title,
  children,
  className,
}: {
  title?: string;
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
      {title && (
        <h2 className="text-base font-semibold text-gray-900">{title}</h2>
      )}
      {children}
    </section>
  );
}

function DetailRow({ item }: { item: DetailItem }) {
  return (
    <div className="flex items-start gap-3 py-3">
      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-gray-100 text-gray-500">
        <item.icon className="h-4 w-4" />
      </span>

      <div className="min-w-0">
        <p className="text-[11px] font-medium uppercase tracking-wide text-gray-400">
          {item.label}
        </p>
        <p className="mt-0.5 truncate text-sm font-semibold text-gray-900">
          {item.value}
        </p>
      </div>
    </div>
  );
}

const CONDITION_META: {
  key: keyof ConditionBreakdown;
  label: string;
  dotClass: string;
}[] = [
  { key: "good", label: "Good", dotClass: "bg-emerald-500" },
  { key: "fair", label: "Fair", dotClass: "bg-blue-500" },
  { key: "repair", label: "Needs Repair", dotClass: "bg-amber-500" },
  { key: "damaged", label: "Damaged", dotClass: "bg-red-500" },
];

/** Worst condition first, so items needing attention are at the top. */
const UNIT_RANK: Record<AssetCondition, number> = {
  Damaged: 3,
  Repair: 2,
  Fair: 1,
  Good: 0,
};

const UNIT_PILL: Record<AssetCondition, string> = {
  Good: "bg-emerald-50 text-emerald-700",
  Fair: "bg-blue-50 text-blue-700",
  Repair: "bg-amber-50 text-amber-700",
  Damaged: "bg-red-50 text-red-700",
};

const BAR_CLASSES: Record<keyof ConditionBreakdown, string> = {
  good: "bg-emerald-500",
  fair: "bg-blue-500",
  repair: "bg-amber-500",
  damaged: "bg-red-500",
};

export function OverviewTab({
  asset,
  onLogService,
}: {
  asset: Asset;
  onLogService: () => void;
}) {
  const total = Object.values(asset.conditions).reduce(
    (sum, value) => sum + value,
    0,
  );

  const left: DetailItem[] = [
    { label: "Category", value: asset.category, icon: Package },
    { label: "Department", value: asset.department, icon: User },
    { label: "Date Added", value: asset.dateAdded, icon: CalendarDays },
  ];

  const right: DetailItem[] = [
    { label: "Location", value: asset.location, icon: MapPin },
    { label: "Owner", value: asset.owner, icon: Shield },
    { label: "Missing Risk", value: asset.risk, icon: TriangleAlert },
  ];

  const statusRows: { label: string; value: string; badge?: string }[] = [
    {
      label: "Frequency",
      value: asset.schedule.frequency ?? "None",
      badge: "freq",
    },
    { label: "Last Service", value: asset.schedule.lastService },
    { label: "Last Review", value: asset.schedule.lastReview },
    { label: "Next Due", value: asset.schedule.nextDue, badge: "due" },
  ];

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        {/* Left column */}
        <div className="space-y-5">
          <Card title="Details">
            <div className="mt-2 grid grid-cols-1 gap-x-8 sm:grid-cols-2">
              <div className="divide-y divide-gray-100">
                {left.map((item) => (
                  <DetailRow key={item.label} item={item} />
                ))}
              </div>

              <div className="divide-y divide-gray-100">
                {right.map((item) => (
                  <DetailRow key={item.label} item={item} />
                ))}
              </div>
            </div>
          </Card>

          <Card title="Responsible Person">
            <div className="mt-4 flex items-center gap-4">
              <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-primary text-sm font-semibold text-white-600">
                {asset.responsible.initials}
              </span>

              <div className="min-w-0">
                <p className="text-base font-semibold text-gray-900">
                  {asset.responsible.name}
                </p>
                <p className="truncate text-sm text-gray-500">
                  {asset.responsible.email}
                </p>

                <span className="mt-2 inline-block rounded-md bg-blue-50 px-2.5 py-1 text-xs font-medium text-blue-700">
                  {asset.responsible.isSystem ? "System User" : "Manual Entry"}
                </span>
              </div>
            </div>
          </Card>
        </div>

        {/* Right column */}
        <div className="space-y-5">
          <Card title="Condition Breakdown">
            <p className="mt-1 text-sm text-gray-400">Total: {total}</p>

            <div className="mt-4 flex h-3 w-full overflow-hidden rounded-full bg-gray-100">
              {total > 0 &&
                CONDITION_META.map(({ key }) => {
                  const value = asset.conditions[key];

                  if (!value) return null;

                  return (
                    <span
                      key={key}
                      style={{ width: `${(value / total) * 100}%` }}
                      className={cn("h-full", BAR_CLASSES[key])}
                    />
                  );
                })}
            </div>

            <div className="mt-5 grid grid-cols-2 gap-x-8 gap-y-3">
              {CONDITION_META.map(({ key, label, dotClass }) => (
                <div
                  key={key}
                  className="flex items-center justify-between gap-3 text-sm"
                >
                  <span className="flex items-center gap-2 text-gray-600">
                    <span
                      className={cn("h-2.5 w-2.5 rounded-full", dotClass)}
                    />
                    {label}
                  </span>
                  <span className="font-semibold text-gray-900">
                    {asset.conditions[key]}
                  </span>
                </div>
              ))}
            </div>
          </Card>

          <Card title="Maintenance Status">
            <div className="mt-3 divide-y divide-gray-100">
              {statusRows.map((row) => (
                <div
                  key={row.label}
                  className="flex items-center justify-between gap-3 py-3"
                >
                  <span className="text-sm text-gray-500">{row.label}</span>

                  <span className="flex items-center gap-2">
                    <span
                      className={cn(
                        "text-sm font-medium text-gray-900",
                        row.label === "Next Due" && "text-gray-500",
                      )}
                    >
                      {row.value}
                    </span>

                    {row.badge === "freq" && asset.schedule.frequency && (
                      <span className="rounded-md border border-blue-200 bg-blue-50 px-2 py-0.5 text-xs font-medium text-blue-700">
                        {asset.schedule.frequency}
                      </span>
                    )}

                    {row.badge === "due" && (
                      <span className="rounded-md border border-blue-200 bg-blue-50 px-2 py-0.5 text-xs font-medium text-blue-700">
                        {asset.schedule.dueState}
                      </span>
                    )}
                  </span>
                </div>
              ))}
            </div>

            <Button
              type="button"
              onClick={onLogService}
              className="mt-3 h-11 w-full rounded-lg bg-primary text-sm font-medium text-white-600 hover:bg-primary-600"
            >
              <Wrench className="mr-2 h-4 w-4" />
              Log Service
            </Button>
          </Card>
        </div>
      </div>

      {asset.units?.length > 0 && (
        <Card title="Items">
          <p className="mt-1 text-sm text-gray-400">
            Each item&apos;s own condition and details. Use Edit to update them.
          </p>

          <div className="mt-4 divide-y divide-gray-100">
            {[...asset.units]
              .map((unit, index) => ({ unit, index }))
              .sort(
                (a, b) =>
                  UNIT_RANK[b.unit.condition] - UNIT_RANK[a.unit.condition] ||
                  a.index - b.index,
              )
              .map(({ unit, index }) => (
                <div
                  key={unit.id ?? index}
                  className="flex flex-col gap-1 py-3 sm:flex-row sm:items-start sm:justify-between sm:gap-6"
                >
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-gray-900">
                      {unit.serial || `Item ${index + 1}`}
                    </p>
                    {unit.conditionNote && (
                      <p className="mt-0.5 text-sm text-gray-600">
                        {unit.conditionNote}
                      </p>
                    )}
                    {(unit.purchaseDate || unit.value !== null) && (
                      <p className="mt-0.5 text-xs text-gray-400">
                        {unit.purchaseDate && `Bought ${unit.purchaseDate}`}
                        {unit.purchaseDate && unit.value !== null && " · "}
                        {unit.value !== null && `Value ${unit.value}`}
                      </p>
                    )}
                  </div>

                  <span
                    className={cn(
                      "inline-flex w-fit shrink-0 items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium",
                      UNIT_PILL[unit.condition],
                    )}
                  >
                    {unit.condition === "Repair"
                      ? "Needs Repair"
                      : unit.condition}
                  </span>
                </div>
              ))}
          </div>
        </Card>
      )}

      <Card title="Remarks">
        <p className="mt-3 text-sm leading-relaxed text-gray-600">
          {asset.remarks || "No remarks recorded for this asset."}
        </p>
      </Card>
    </div>
  );
}
