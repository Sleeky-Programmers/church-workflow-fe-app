import { trackAction } from "@/lib/usage-tracker";
import { authenticatedFetch } from "@/lib/api";

// ─────────────────────────────────────────────────────────────────────────────
// Types mirroring the backend pastoral endpoints
// ─────────────────────────────────────────────────────────────────────────────

export type PastoralAlertCategory =
  | "critical"
  | "absences"
  | "decline"
  | "first-timers"
  | "positive"
  | "returning";

export type PastoralAlertSeverity = "urgent" | "high" | "medium" | "info";

export type AttentionLevel = "inactive" | "at-risk" | "needs-follow-up";

export interface PastoralAlert {
  alertId: string;
  memberId: string;
  memberName: string;
  memberEmail: string | null;
  memberPhone: string | null;
  category: PastoralAlertCategory;
  categoryLabel: string;
  severity: PastoralAlertSeverity;
  message: string;
  resolved: boolean;
  read: boolean;
  notes: {
    id: string;
    body: string;
    authorName: string;
    createdAt: string;
    updatedAt?: string | null;
    kind?: "general" | "resolve-outcome";
  }[];
}

export interface PastoralDashboard {
  stats: {
    totalMembers: number;
    needAttention: number;
    highlyEngaged: number;
    firstTimeGuests: number;
    atRisk: number;
    pendingFollowUps: number;
  };
  attention: {
    memberId: string;
    fullName: string;
    initials: string;
    level: AttentionLevel;
    absences: number;
  }[];
  recentAlerts: PastoralAlert[];
  trend: { label: string; attendance: number; firstTimers: number }[];
  engagement: {
    active: number;
    growing: number;
    needsFollowUp: number;
    atRisk: number;
    inactive: number;
  };
}

export interface PastoralSettings {
  churchId: string;
  needsFollowUpThreshold: number;
  atRiskThreshold: number;
  inactiveThreshold: number;
  trackingMode: "SUNDAYS_ONLY" | "SUNDAYS_MIDWEEK" | "ALL_SERVICES";
  countSpecialEvents: boolean;
  countSmallTeams: boolean;
  /** Guests with no attendance for this many days are archived (30-180, default 90). */
  archiveAfterDays?: number;
}

// ─────────────────────────────────────────────────────────────────────────────
// Endpoints
// ─────────────────────────────────────────────────────────────────────────────

export async function fetchPastoralDashboard(): Promise<PastoralDashboard> {
  return authenticatedFetch<PastoralDashboard>("/members/pastoral/dashboard", {
    method: "GET",
  });
}

export async function fetchPastoralSettings(): Promise<PastoralSettings> {
  return authenticatedFetch<PastoralSettings>("/members/pastoral/settings", {
    method: "GET",
  });
}

export async function updatePastoralSettings(
  settings: Partial<Omit<PastoralSettings, "churchId">>,
): Promise<PastoralSettings> {
  return authenticatedFetch<PastoralSettings>("/members/pastoral/settings", {
    method: "PUT",
    body: JSON.stringify(settings),
  });
}

export async function fetchPastoralImpactCounts(options?: {
  needsFollowUpThreshold?: number;
  atRiskThreshold?: number;
  inactiveThreshold?: number;
  trackingMode?: PastoralSettings["trackingMode"];
  countSpecialEvents?: boolean;
}): Promise<{
  needsFollowUp: number;
  atRisk: number;
  inactive: number;
  totalMembers: number;
}> {
  const params = new URLSearchParams();
  if (options?.needsFollowUpThreshold !== undefined) {
    params.set(
      "needsFollowUpThreshold",
      String(options.needsFollowUpThreshold),
    );
  }
  if (options?.atRiskThreshold !== undefined) {
    params.set("atRiskThreshold", String(options.atRiskThreshold));
  }
  if (options?.inactiveThreshold !== undefined) {
    params.set("inactiveThreshold", String(options.inactiveThreshold));
  }
  if (options?.trackingMode) {
    params.set("trackingMode", options.trackingMode);
  }
  if (options?.countSpecialEvents !== undefined) {
    params.set("countSpecialEvents", String(options.countSpecialEvents));
  }

  const qs = params.toString();
  return authenticatedFetch(
    `/members/pastoral/settings/impact${qs ? `?${qs}` : ""}`,
    { method: "GET" },
  );
}

export async function fetchPastoralAlerts(options?: {
  category?: PastoralAlertCategory;
  includeResolved?: boolean;
}): Promise<PastoralAlert[]> {
  const params = new URLSearchParams();
  if (options?.category) {
    params.set("category", options.category);
  }
  if (options?.includeResolved) {
    params.set("includeResolved", String(options.includeResolved));
  }

  const qs = params.toString();
  return authenticatedFetch<PastoralAlert[]>(
    `/members/pastoral/alerts${qs ? `?${qs}` : ""}`,
    { method: "GET" },
  );
}

export async function setAlertResolved(
  alertId: string,
  resolved: boolean,
  outcomeNote?: string,
): Promise<PastoralAlert> {
  const alert = await authenticatedFetch<PastoralAlert>(
    `/members/pastoral/alerts/${alertId}/resolve`,
    {
      method: "PUT",
      body: JSON.stringify({ resolved, outcomeNote }),
    },
  );
  if (resolved) {
    trackAction("alert.resolve");
  }
  return alert;
}

export async function setAlertRead(
  alertId: string,
  read: boolean,
): Promise<PastoralAlert> {
  return authenticatedFetch<PastoralAlert>(
    `/members/pastoral/alerts/${alertId}/read`,
    { method: "PUT", body: JSON.stringify({ read }) },
  );
}

export async function addAlertNote(
  alertId: string,
  body: string,
): Promise<PastoralAlert["notes"]> {
  return authenticatedFetch<PastoralAlert["notes"]>(
    `/members/pastoral/alerts/${alertId}/notes`,
    { method: "POST", body: JSON.stringify({ body }) },
  );
}

export async function updateAlertNote(
  alertId: string,
  noteIndex: number,
  body: string,
): Promise<PastoralAlert["notes"]> {
  return authenticatedFetch<PastoralAlert["notes"]>(
    `/members/pastoral/alerts/${alertId}/notes/${noteIndex}`,
    { method: "PUT", body: JSON.stringify({ body }) },
  );
}

export async function deleteAlertNote(
  alertId: string,
  noteIndex: number,
): Promise<PastoralAlert["notes"]> {
  return authenticatedFetch<PastoralAlert["notes"]>(
    `/members/pastoral/alerts/${alertId}/notes/${noteIndex}`,
    { method: "DELETE" },
  );
}
