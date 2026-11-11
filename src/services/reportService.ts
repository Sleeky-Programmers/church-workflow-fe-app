import { authenticatedFetch } from "@/lib/api";
import { trackAction } from "@/lib/usage-tracker";

export type MetricFormat = "number" | "currency" | "percent";
export type SectionGroup = "people" | "finance" | "operations";
export type FeedPeriod = "weekly" | "monthly";
export type DigestFrequency = "none" | "weekly" | "monthly" | "both";

export interface ReportMetric {
  key: string;
  label: string;
  value: number;
  format: MetricFormat;
  currency?: string;
  previous?: number | null;
  changePct?: number | null;
}

export interface ReportSeries {
  key: string;
  label: string;
  currency?: string;
  points: { label: string; value: number }[];
}

export interface ReportBreakdown {
  key: string;
  label: string;
  format: MetricFormat;
  currency?: string;
  items: { label: string; value: number }[];
}

export interface SectionResult {
  key: string;
  title: string;
  group: SectionGroup;
  metrics: ReportMetric[];
  series: ReportSeries[];
  breakdowns: ReportBreakdown[];
  notes: string[];
}

export interface SectionInfo {
  key: string;
  title: string;
  group: SectionGroup;
  description: string;
}

export interface FeedPeriodData {
  start: string;
  end: string;
  label: string;
  isCurrent: boolean;
  sections: Record<string, SectionResult>;
}

export interface FeedResponse {
  period: FeedPeriod;
  scope: { label: string };
  sections: SectionInfo[];
  periods: FeedPeriodData[];
}

export interface SummaryResponse {
  title: string;
  scope: { label: string };
  period: FeedPeriod | "custom";
  range: { start: string; end: string; label: string };
  previousRange: { start: string; end: string; label: string };
  sections: SectionResult[];
}

export interface ReportPreferences {
  sections: (SectionInfo & { permitted: boolean })[];
  church: { excludedSections: string[] };
  personal: {
    useChurchDefault: boolean;
    excludedSections: string[];
    digestFrequency: DigestFrequency;
  };
  effectiveIncluded: string[];
  canEditChurch: boolean;
}

export interface ReportRequest {
  period?: FeedPeriod | "custom";
  anchor?: string;
  from?: string;
  to?: string;
  sections?: string[];
  branch?: string;
}

export function fetchReportFeed(
  period: FeedPeriod,
  opts: { count?: number; branch?: string } = {},
) {
  const params = new URLSearchParams({ period });
  if (opts.count) {
    params.set("count", String(opts.count));
  }
  if (opts.branch) {
    params.set("branch", opts.branch);
  }
  return authenticatedFetch<FeedResponse>(`/reports/feed?${params}`, {
    method: "GET",
  });
}

export function fetchReportSummary(req: ReportRequest) {
  const params = new URLSearchParams();
  if (req.period) {
    params.set("period", req.period);
  }
  if (req.anchor) {
    params.set("anchor", req.anchor);
  }
  if (req.from) {
    params.set("from", req.from);
  }
  if (req.to) {
    params.set("to", req.to);
  }
  if (req.sections?.length) {
    params.set("sections", req.sections.join(","));
  }
  if (req.branch) {
    params.set("branch", req.branch);
  }
  return authenticatedFetch<SummaryResponse>(`/reports/summary?${params}`, {
    method: "GET",
  });
}

export function fetchReportPreferences() {
  return authenticatedFetch<ReportPreferences>("/reports/preferences", {
    method: "GET",
  });
}

export function saveReportPreferences(payload: {
  scope: "personal" | "church";
  excludedSections?: string[];
  useChurchDefault?: boolean;
  digestFrequency?: DigestFrequency;
}) {
  return authenticatedFetch<ReportPreferences>("/reports/preferences", {
    method: "PUT",
    body: JSON.stringify(payload),
  });
}

export async function exportReport(
  format: "xlsx" | "pdf" | "csv",
  req: ReportRequest,
): Promise<{ blob: Blob; fileName: string }> {
  const blob = await authenticatedFetch<Blob>("/reports/export", {
    method: "POST",
    body: JSON.stringify({ format, ...req }),
    // The shared fetch helper omits the JSON header for file downloads, which
    // Would leave the server unable to read this request body.
    headers: { "Content-Type": "application/json" },
    responseType: "blob",
  });
  trackAction("report.export");

  const stamp = req.from && req.to ? `${req.from}-to-${req.to}` : req.anchor;
  return {
    blob,
    fileName: `church-report-${stamp ?? new Date().toISOString().slice(0, 10)}.${format}`,
  };
}

export function saveBlob(blob: Blob, fileName: string) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}
