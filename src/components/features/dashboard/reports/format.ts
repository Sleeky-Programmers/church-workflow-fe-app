import type { MetricFormat } from "@/services/reportService";

export function formatMetricValue(
  value: number,
  format: MetricFormat,
  currency?: string,
): string {
  if (format === "percent") {
    return `${(Math.round(value * 10) / 10).toLocaleString("en-US")}%`;
  }

  if (format === "currency") {
    if (currency) {
      try {
        return new Intl.NumberFormat("en-US", {
          style: "currency",
          currency,
          maximumFractionDigits: 0,
        }).format(value);
      } catch {
        return `${currency} ${value.toLocaleString("en-US", { maximumFractionDigits: 0 })}`;
      }
    }
    return value.toLocaleString("en-US", { maximumFractionDigits: 0 });
  }

  return value.toLocaleString("en-US", { maximumFractionDigits: 1 });
}

export function formatShortDate(iso: string): string {
  const date = new Date(`${iso}T00:00:00Z`);
  return date.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    timeZone: "UTC",
  });
}

export const GROUP_LABELS: Record<string, string> = {
  people: "People",
  finance: "Finance",
  operations: "Operations",
};
