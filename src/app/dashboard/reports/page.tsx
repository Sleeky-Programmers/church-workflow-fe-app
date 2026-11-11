"use client";

import { Download, SlidersHorizontal } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";

import { CustomizeDialog } from "@/components/features/dashboard/reports/customize-dialog";
import { ExportDialog } from "@/components/features/dashboard/reports/export-dialog";
import { GROUP_LABELS } from "@/components/features/dashboard/reports/format";
import {
  ReportSectionCard,
  type TrendPoint,
} from "@/components/features/dashboard/reports/report-section-card";
import { Button } from "@/components/ui/button";
import { Loader } from "@/components/ui/loader";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import {
  fetchReportFeed,
  fetchReportSummary,
  type FeedResponse,
  type ReportRequest,
  type SectionResult,
  type SummaryResponse,
} from "@/services/reportService";

type View = "weekly" | "monthly" | "custom";

const VIEWS: { value: View; label: string }[] = [
  { value: "weekly", label: "Weekly" },
  { value: "monthly", label: "Monthly" },
  { value: "custom", label: "Custom range" },
];

function isoDate(d: Date) {
  return d.toISOString().slice(0, 10);
}

function groupSections<T extends { group: string }>(items: T[]) {
  const out: Record<string, T[]> = {};
  for (const item of items) {
    (out[item.group] ||= []).push(item);
  }
  return out;
}

export default function ReportsPage() {
  const { toast } = useToast();

  const [view, setView] = useState<View>("weekly");
  const [branch, setBranch] = useState<"active" | "all">("active");
  const [feed, setFeed] = useState<FeedResponse | null>(null);
  const [selected, setSelected] = useState(0);
  const [summary, setSummary] = useState<SummaryResponse | null>(null);
  const [loading, setLoading] = useState(false);

  const [from, setFrom] = useState(
    isoDate(new Date(Date.now() - 29 * 24 * 60 * 60 * 1000)),
  );
  const [to, setTo] = useState(isoDate(new Date()));

  const [customizeOpen, setCustomizeOpen] = useState(false);
  const [exportOpen, setExportOpen] = useState(false);

  const branchParam = branch === "all" ? "all" : undefined;

  const fail = useCallback(
    (error: any) => {
      return toast({
        title: "Error",
        description: error?.message || "Could not load the report",
        variant: "destructive",
      });
    },
    [toast],
  );

  const loadFeed = useCallback(
    async (period: "weekly" | "monthly") => {
      setLoading(true);
      try {
        const data = await fetchReportFeed(period, { branch: branchParam });
        setFeed(data);
        setSelected(Math.max(data.periods.length - 1, 0));
      } catch (error) {
        fail(error);
      } finally {
        setLoading(false);
      }
    },
    [branchParam, fail],
  );

  const loadCustom = useCallback(async () => {
    setLoading(true);
    try {
      setSummary(
        await fetchReportSummary({
          period: "custom",
          from,
          to,
          branch: branchParam,
        }),
      );
    } catch (error) {
      fail(error);
    } finally {
      setLoading(false);
    }
  }, [from, to, branchParam, fail]);

  useEffect(() => {
    if (view === "custom") {
      return;
    }
    loadFeed(view);
  }, [view, loadFeed]);

  const period = feed?.periods[selected];
  const sections: SectionResult[] = useMemo(() => {
    if (view === "custom") {
      return summary?.sections ?? [];
    }
    if (!period || !feed) {
      return [];
    }
    return feed.sections
      .map((s) => {
        return period.sections[s.key];
      })
      .filter(Boolean) as SectionResult[];
  }, [view, summary, period, feed]);

  const trendFor = (section: SectionResult) => {
    if (view === "custom" || !feed) {
      return undefined;
    }
    const headline =
      section.metrics.find((m) => {
        return m.format === "currency";
      }) ?? section.metrics[0];
    if (!headline) {
      return undefined;
    }

    const points: TrendPoint[] = feed.periods.map((p) => {
      return {
        label: p.label.split(" - ")[0],
        value:
          p.sections[section.key]?.metrics.find((m) => {
            return m.key === headline.key;
          })?.value ?? 0,
      };
    });
    return { points, label: headline.label };
  };

  const exportRequest: ReportRequest =
    view === "custom"
      ? { period: "custom", from, to, branch: branchParam }
      : { period: view, anchor: period?.start, branch: branchParam };

  const periodLabel =
    view === "custom"
      ? `${from} to ${to}`
      : (period?.label ?? "Choose a period");

  const grouped = groupSections(sections);

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Reports</h1>
          <p className="text-sm text-gray-500">
            {view === "custom" ? summary?.scope.label : feed?.scope.label}
            {" · "}
            How things are going, at a glance.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div className="inline-flex rounded-lg bg-muted p-1 text-sm">
            {(
              [
                ["active", "This branch"],
                ["all", "All branches"],
              ] as const
            ).map(([value, label]) => {
              return (
                <button
                  key={value}
                  type="button"
                  onClick={() => {
                    return setBranch(value);
                  }}
                  className={cn(
                    "rounded-md px-3 py-1 font-medium",
                    branch === value
                      ? "bg-background text-foreground shadow"
                      : "text-muted-foreground",
                  )}
                >
                  {label}
                </button>
              );
            })}
          </div>
          <Button
            variant="outline"
            onClick={() => {
              return setCustomizeOpen(true);
            }}
          >
            <SlidersHorizontal className="mr-2 h-4 w-4" />
            Customize
          </Button>
          <Button
            onClick={() => {
              return setExportOpen(true);
            }}
            disabled={view === "custom" ? !summary : !period}
          >
            <Download className="mr-2 h-4 w-4" />
            Export
          </Button>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <div className="inline-flex rounded-lg bg-muted p-1 text-sm">
          {VIEWS.map((v) => {
            return (
              <button
                key={v.value}
                type="button"
                onClick={() => {
                  return setView(v.value);
                }}
                className={cn(
                  "rounded-md px-3 py-1 font-medium",
                  view === v.value
                    ? "bg-background text-foreground shadow"
                    : "text-muted-foreground",
                )}
              >
                {v.label}
              </button>
            );
          })}
        </div>

        {view === "custom" ? (
          <div className="flex flex-wrap items-center gap-2 text-sm">
            <input
              type="date"
              value={from}
              max={to}
              onChange={(e) => {
                return setFrom(e.target.value);
              }}
              className="rounded-md border bg-white px-2 py-1"
              aria-label="From"
            />
            <span className="text-gray-400">to</span>
            <input
              type="date"
              value={to}
              min={from}
              onChange={(e) => {
                return setTo(e.target.value);
              }}
              className="rounded-md border bg-white px-2 py-1"
              aria-label="To"
            />
            <Button size="sm" onClick={loadCustom} disabled={loading}>
              Run report
            </Button>
          </div>
        ) : (
          <div className="flex max-w-full gap-1.5 overflow-x-auto pb-1">
            {feed?.periods
              .map((p, i) => {
                return { p, i };
              })
              .reverse()
              .map(({ p, i }) => {
                return (
                  <button
                    key={p.start}
                    type="button"
                    onClick={() => {
                      return setSelected(i);
                    }}
                    className={cn(
                      "shrink-0 rounded-full border px-3 py-1 text-xs",
                      selected === i
                        ? "border-blue-600 bg-blue-50 font-semibold text-blue-700"
                        : "bg-white text-gray-600 hover:bg-gray-50",
                    )}
                  >
                    {p.label}
                    {p.isCurrent && (
                      <span className="ml-1 text-[10px] text-amber-600">
                        in progress
                      </span>
                    )}
                  </button>
                );
              })}
          </div>
        )}
      </div>

      {view !== "custom" && period?.isCurrent && (
        <p className="rounded-xl bg-amber-50 px-3 py-2 text-xs text-amber-800">
          This {view === "weekly" ? "week" : "month"} is still in progress, so
          figures may change. Closed periods are saved as they were and stay
          steady.
        </p>
      )}

      {loading ? (
        <div className="flex h-64 items-center justify-center">
          <Loader size="w-12 h-12" />
        </div>
      ) : sections.length === 0 ? (
        <div className="rounded-3xl bg-white p-10 text-center text-sm text-gray-500">
          {view === "custom" && !summary
            ? "Choose a date range and run the report."
            : "No sections to show. Use Customize to switch sections back on."}
        </div>
      ) : (
        Object.entries(grouped).map(([group, items]) => {
          return (
            <section key={group} className="space-y-3">
              <h2 className="text-sm font-semibold uppercase tracking-wide text-gray-400">
                {GROUP_LABELS[group] ?? group}
              </h2>
              <div className="space-y-8">
                {items.map((section) => {
                  const trend = trendFor(section);
                  return (
                    <ReportSectionCard
                      key={section.key}
                      section={section}
                      trend={trend?.points}
                      trendLabel={trend?.label}
                    />
                  );
                })}
              </div>
            </section>
          );
        })
      )}

      <CustomizeDialog
        open={customizeOpen}
        onOpenChange={setCustomizeOpen}
        onSaved={() => {
          return view === "custom" ? loadCustom() : loadFeed(view);
        }}
      />
      <ExportDialog
        open={exportOpen}
        onOpenChange={setExportOpen}
        request={exportRequest}
        periodLabel={periodLabel}
      />
    </div>
  );
}
