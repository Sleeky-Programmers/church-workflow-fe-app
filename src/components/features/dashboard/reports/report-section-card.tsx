"use client";

import {
  ArrowDownRight,
  ArrowUpRight,
  BarChart3,
  Calendar,
  CalendarCheck2,
  Gift,
  HeartHandshake,
  Layers,
  Minus,
  Package,
  Users,
  UsersRound,
  Wallet,
  FileText,
  type LucideIcon,
} from "lucide-react";
import type { ReactNode } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { Card, CardContent } from "@/components/ui/card";
import { ChartContainer, ChartTooltipContent } from "@/components/ui/chart";
import { cn } from "@/lib/utils";
import type { ReportMetric, SectionResult } from "@/services/reportService";

import { formatMetricValue, formatShortDate } from "./format";

export interface TrendPoint {
  label: string;
  value: number;
}

interface ReportSectionCardProps {
  section: SectionResult;
  /** Headline measure across the periods in the feed, oldest first. */
  trend?: TrendPoint[];
  trendLabel?: string;
}

const SECTION_ICONS: Record<string, LucideIcon> = {
  attendance: CalendarCheck2,
  members: Users,
  attention: HeartHandshake,
  giving: Gift,
  expenses: Wallet,
  requests: FileText,
  events: Calendar,
  departments: Layers,
  teams: UsersRound,
  assets: Package,
};

function ChangeBadge({ metric }: { metric: ReportMetric }) {
  if (metric.previous === undefined) return null;

  if (metric.changePct === null || metric.changePct === undefined) {
    return (
      <span className="mt-2 text-xs font-medium text-gray-400">
        {metric.value > 0 ? "New this period" : "No change"}
      </span>
    );
  }

  const up = metric.changePct > 0;
  const flat = metric.changePct === 0;
  const Icon = flat ? Minus : up ? ArrowUpRight : ArrowDownRight;

  return (
    <span
      className={cn(
        "mt-2 inline-flex items-center gap-0.5 rounded-full px-2 py-0.5 text-xs font-semibold",
        flat
          ? "bg-gray-100 text-gray-500"
          : up
            ? "bg-emerald-50 text-emerald-600"
            : "bg-red-50 text-red-500",
      )}
      title="Compared with the previous period"
    >
      <Icon className="h-3 w-3" />
      {Math.abs(metric.changePct)}%
    </span>
  );
}

/** Matches the dashboard StatCard: white card, coloured icon box, big number. */
function MetricCard({
  metric,
  icon: Icon,
  variant,
}: {
  metric: ReportMetric;
  icon: LucideIcon;
  variant: "blue" | "orange";
}) {
  return (
    <div
      className={cn(
        "flex flex-col items-center rounded-2xl border border-gray-300 bg-white p-5 text-center",
        "shadow-[0_1px_4px_rgba(0,0,0,0.06)] transition-shadow duration-200 hover:shadow-[0_4px_16px_rgba(0,0,0,0.08)]",
      )}
    >
      <div
        className={cn(
          "mb-2 flex h-12 w-12 shrink-0 items-center justify-center rounded-[13px]",
          variant === "blue" ? "bg-primary-400" : "bg-secondary-400",
        )}
      >
        <Icon className="h-5 w-5 text-white" color="#ffffff" stroke="#ffffff" />
      </div>
      <p className="mb-1 max-w-full truncate text-[13px] font-bold text-black">
        {metric.label}
      </p>
      <span className="max-w-full truncate text-[28px] font-bold leading-none tracking-tight text-black">
        {formatMetricValue(metric.value, metric.format, metric.currency)}
      </span>
      <ChangeBadge metric={metric} />
    </div>
  );
}

/** Matches the dashboard TrendChart card. */
function ChartCard({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <Card className="rounded-3xl border-0 px-1 py-4">
      <CardContent>
        <p className="mb-3 text-sm font-semibold text-gray-700">{title}</p>
        {children}
      </CardContent>
    </Card>
  );
}

export function ReportSectionCard({
  section,
  trend,
  trendLabel,
}: ReportSectionCardProps) {
  const Icon = SECTION_ICONS[section.key] ?? BarChart3;
  const series = section.series.find((s) => s.points.some((p) => p.value > 0));
  const breakdown = section.breakdowns.find((b) =>
    b.items.some((i) => i.value > 0),
  );
  const showTrend =
    !!trend && trend.length > 1 && trend.some((t) => t.value > 0);
  const maxBreakdown = breakdown
    ? Math.max(...breakdown.items.map((i) => i.value), 1)
    : 1;
  const hasCharts = !!series || !!breakdown || showTrend;

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-gray-900">{section.title}</h3>

      <div className="grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-4">
        {section.metrics.map((m, i) => (
          <MetricCard
            key={m.key}
            metric={m}
            icon={Icon}
            variant={i % 2 === 0 ? "blue" : "orange"}
          />
        ))}
      </div>

      {hasCharts && (
        <div className="grid gap-4 lg:grid-cols-2">
          {series && (
            <ChartCard title={series.label}>
              <ChartContainer
                className="aspect-auto h-[240px] w-full overflow-hidden p-2"
                config={{ value: { label: series.label, color: "#2563EB" } }}
              >
                <BarChart
                  data={series.points.map((p) => ({
                    day: formatShortDate(p.label),
                    value: p.value,
                  }))}
                  margin={{ top: 10, right: 8, left: -16, bottom: 0 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#E6E6E6" />
                  <XAxis
                    dataKey="day"
                    tickLine={false}
                    axisLine={false}
                    interval="preserveStartEnd"
                  />
                  <YAxis tickLine={false} axisLine={false} width={40} />
                  <Tooltip content={<ChartTooltipContent />} />
                  <Bar dataKey="value" fill="var(--color-value)" radius={4} />
                </BarChart>
              </ChartContainer>
            </ChartCard>
          )}

          {showTrend && (
            <ChartCard title={`Trend: ${trendLabel}`}>
              <ChartContainer
                className="aspect-auto h-[240px] w-full overflow-hidden p-2"
                config={{ value: { label: trendLabel, color: "#2563EB" } }}
              >
                <LineChart
                  data={trend}
                  margin={{ top: 10, right: 8, left: -16, bottom: 0 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#E6E6E6" />
                  <XAxis dataKey="label" tickLine={false} axisLine={false} />
                  <YAxis tickLine={false} axisLine={false} width={40} />
                  <Tooltip content={<ChartTooltipContent />} />
                  <Line
                    type="monotone"
                    dataKey="value"
                    stroke="var(--color-value)"
                    strokeWidth={2.5}
                    dot={{ r: 3 }}
                  />
                </LineChart>
              </ChartContainer>
            </ChartCard>
          )}

          {breakdown && (
            <ChartCard title={breakdown.label}>
              <div className="space-y-3 py-1">
                {breakdown.items.slice(0, 6).map((item) => (
                  <div key={item.label} className="flex items-center gap-3">
                    <span className="w-1/3 truncate text-sm text-gray-700">
                      {item.label}
                    </span>
                    <div className="h-2.5 flex-1 rounded-full bg-primary-50">
                      <div
                        className="h-2.5 rounded-full bg-primary-400"
                        style={{
                          width: `${Math.max((item.value / maxBreakdown) * 100, 2)}%`,
                        }}
                      />
                    </div>
                    <span className="w-24 text-right text-sm font-semibold text-black">
                      {formatMetricValue(
                        item.value,
                        breakdown.format,
                        breakdown.currency,
                      )}
                    </span>
                  </div>
                ))}
              </div>
            </ChartCard>
          )}
        </div>
      )}

      {section.notes.map((note) => (
        <p key={note} className="text-xs italic text-gray-400">
          {note}
        </p>
      ))}
    </div>
  );
}
