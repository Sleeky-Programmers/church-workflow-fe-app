"use client";

import {
  AlertTriangle,
  CalendarDays,
  CalendarOff,
  FileText,
  TrendingDown,
  UserX,
} from "lucide-react";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import {
  fadeUp,
  staggerContainer,
  hoverLift,
  hoverSpring,
} from "@/components/features/dashboard/membership/animations";

import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import Heading from "@/components/ui/typography/Heading";
import { useIsMobile } from "@/hooks/use-mobile";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import {
  fetchPastoralImpactCounts,
  fetchPastoralSettings,
  updatePastoralSettings,
  type PastoralSettings,
} from "@/services/pastoralService";

// ─────────────────────────────────────────────────────────────────────────────
// Membership settings per the Figma design, fully wired: values persist to the
// backend, threshold ordering is validated, toggles auto-sync with the tracking
// mode, live member counts preview each threshold's impact, and unsaved edits
// are guarded on navigation.
// ─────────────────────────────────────────────────────────────────────────────

const THRESHOLDS = [
  {
    key: "needs-follow-up" as const,
    label: "Needs Follow-Up",
    description:
      "After this many consecutive absences, a member is flagged for a caring check-in",
    icon: AlertTriangle,
    iconClass: "bg-amber-100 text-amber-500",
    badgeClass: "bg-amber-100 text-amber-600",
    defaultValue: 2,
  },
  {
    key: "at-risk" as const,
    label: "At Risk",
    description:
      "After this many consecutive absences, a member is considered at risk",
    icon: TrendingDown,
    iconClass: "bg-orange-100 text-orange-500",
    badgeClass: "bg-orange-100 text-orange-600",
    defaultValue: 4,
  },
  {
    key: "inactive" as const,
    label: "Inactive",
    description:
      "After this many consecutive absences, a member is marked inactive",
    icon: UserX,
    iconClass: "bg-red-100 text-red-500",
    badgeClass: "bg-red-100 text-red-600",
    defaultValue: 8,
  },
];

const SERVICE_TRACKING_OPTIONS = [
  {
    key: "SUNDAYS_ONLY" as const,
    label: "Sundays Only",
    description: "Only Sunday services count toward absence tracking",
  },
  {
    key: "SUNDAYS_MIDWEEK" as const,
    label: "Sundays + Midweek",
    description: "Sunday services and midweek services both count",
  },
  {
    key: "ALL_SERVICES" as const,
    label: "All Services",
    description: "Every service type counts towards absence tracking",
  },
];

type ThresholdKey = (typeof THRESHOLDS)[number]["key"];

export default function MembershipSettingsPage() {
  const isMobile = useIsMobile();
  const { toast } = useToast();

  const [thresholds, setThresholds] = useState<Record<ThresholdKey, number>>({
    "needs-follow-up": 2,
    "at-risk": 4,
    inactive: 8,
  });
  const [trackingMode, setTrackingMode] =
    useState<PastoralSettings["trackingMode"]>("SUNDAYS_ONLY");
  const [countSpecialEvents, setCountSpecialEvents] = useState(false);
  const [countSmallTeams, setCountSmallTeams] = useState(false);
  const [archiveAfterDays, setArchiveAfterDays] = useState(90);
  const archiveDaysInvalid =
    !Number.isInteger(archiveAfterDays) ||
    archiveAfterDays < 30 ||
    archiveAfterDays > 180;

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [dirty, setDirty] = useState(false);
  const [counts, setCounts] = useState<{
    needsFollowUp: number;
    atRisk: number;
    inactive: number;
    totalMembers: number;
  } | null>(null);
  const [validationError, setValidationError] = useState<string | null>(null);

  const settingsKey = JSON.stringify({
    thresholds,
    trackingMode,
    countSpecialEvents,
  });

  // Load saved settings once
  useEffect(() => {
    fetchPastoralSettings()
      .then((saved) => {
        setThresholds({
          "needs-follow-up": saved.needsFollowUpThreshold,
          "at-risk": saved.atRiskThreshold,
          inactive: saved.inactiveThreshold,
        });
        setTrackingMode(saved.trackingMode);
        setCountSpecialEvents(saved.countSpecialEvents);
        setCountSmallTeams(saved.countSmallTeams);
        setArchiveAfterDays(saved.archiveAfterDays ?? 90);
      })
      .catch(() => {
        // First visit: server creates defaults on read
      })
      .finally(() => setIsLoading(false));
  }, []);

  // Live impact counts, debounced so dragging a slider doesn't hammer the API
  const countsTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => {
    if (isLoading) return;
    if (countsTimer.current) clearTimeout(countsTimer.current);
    countsTimer.current = setTimeout(() => {
      fetchPastoralImpactCounts({
        needsFollowUpThreshold: thresholds["needs-follow-up"],
        atRiskThreshold: thresholds["at-risk"],
        inactiveThreshold: thresholds.inactive,
        trackingMode,
        countSpecialEvents,
      })
        .then(setCounts)
        .catch(() => {});
    }, 400);
    return () => {
      if (countsTimer.current) clearTimeout(countsTimer.current);
    };
  }, [settingsKey, isLoading]);

  // Ordering rule: needs-follow-up <= at-risk <= inactive
  const orderingError = (() => {
    const { "needs-follow-up": nfu, "at-risk": ar, inactive: ina } = thresholds;
    if (nfu > ar)
      return "Needs Follow-Up threshold cannot be greater than the At Risk threshold.";
    if (ar > ina)
      return "At Risk threshold cannot be greater than the Inactive threshold.";
    return null;
  })();

  useEffect(() => {
    setValidationError(orderingError);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [settingsKey]);

  // Auto-sync: All Services implies counting special events; narrower modes
  // default it back off unless the user explicitly re-enables it afterwards.
  const applyTrackingMode = (mode: PastoralSettings["trackingMode"]) => {
    setTrackingMode(mode);
    if (mode === "ALL_SERVICES") {
      setCountSpecialEvents(true);
    } else {
      setCountSpecialEvents(false);
    }
    setDirty(true);
  };

  const handleSave = async () => {
    if (validationError || archiveDaysInvalid) return;
    setIsSaving(true);
    try {
      await updatePastoralSettings({
        needsFollowUpThreshold: thresholds["needs-follow-up"],
        atRiskThreshold: thresholds["at-risk"],
        inactiveThreshold: thresholds.inactive,
        trackingMode,
        countSpecialEvents,
        countSmallTeams,
        archiveAfterDays,
      });
      setDirty(false);
      toast({
        title: "Settings saved",
        description:
          "Membership attention settings updated. The dashboard now uses these thresholds.",
      });
    } catch (err: any) {
      const message =
        err?.message || "Failed to save settings. Please try again.";
      setValidationError(message);
      toast({ title: message, variant: "destructive" });
    } finally {
      setIsSaving(false);
    }
  };

  // Unsaved-changes guard: warn on tab close/reload, and intercept in-app
  // link clicks with a confirm dialog (Next App Router has no router-level
  // blocker, so we listen at the capture phase before Next handles the nav).
  const dirtyRef = useRef(dirty);
  dirtyRef.current = dirty && !isSaving;

  useEffect(() => {
    const onBeforeUnload = (e: BeforeUnloadEvent) => {
      if (dirtyRef.current) {
        e.preventDefault();
        e.returnValue = "";
      }
    };

    const onClickCapture = (e: MouseEvent) => {
      if (!dirtyRef.current) return;
      const anchor = (e.target as HTMLElement)?.closest?.("a");
      if (!anchor) return;
      const href = anchor.getAttribute("href");
      if (!href || href.startsWith("#") || href.startsWith("http")) return;
      if (!window.confirm("You have unsaved changes. Leave without saving?")) {
        e.preventDefault();
        e.stopPropagation();
      }
    };

    window.addEventListener("beforeunload", onBeforeUnload);
    document.addEventListener("click", onClickCapture, true);
    return () => {
      window.removeEventListener("beforeunload", onBeforeUnload);
      document.removeEventListener("click", onClickCapture, true);
    };
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 pb-10">
      <div className="bg-white border-b border-gray-200">
        <div className="px-4 sm:px-6 py-4 flex items-center gap-2">
          <Heading level={3} className="leading-none m-0">
            Settings
          </Heading>
          {dirty && !validationError && (
            <span className="ml-2 text-xs font-medium text-amber-600 bg-amber-50 border border-amber-200 rounded px-2 py-0.5">
              Unsaved changes
            </span>
          )}
        </div>
      </div>

      <div className="px-3 sm:px-6 py-5 flex flex-col gap-5">
        {/* ── Absence Thresholds ── */}
        <motion.section
          variants={fadeUp}
          initial="hidden"
          animate="visible"
          className="bg-white rounded-xl border border-gray-200 p-5 sm:p-6"
        >
          <div className="flex items-start gap-3">
            <CalendarOff className="h-5 w-5 text-gray-700 mt-1" />
            <div>
              <h2 className="text-xl font-bold text-gray-900">
                Absence Thresholds
              </h2>
              <p className="text-sm text-gray-500 mt-0.5">
                Set how many consecutive absences trigger each engagement status
                level
              </p>
            </div>
          </div>

          {validationError && (
            <div className="mt-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-600">
              {validationError}
            </div>
          )}

          <div className="mt-6 flex flex-col gap-7">
            {THRESHOLDS.map((t) => {
              const value = thresholds[t.key];
              const Icon = t.icon;
              const count =
                counts === null
                  ? null
                  : t.key === "needs-follow-up"
                    ? counts.needsFollowUp
                    : t.key === "at-risk"
                      ? counts.atRisk
                      : counts.inactive;

              return (
                <div key={t.key}>
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-3 min-w-0">
                      <div
                        className={cn(
                          "w-10 h-10 rounded-lg flex items-center justify-center shrink-0",
                          t.iconClass,
                        )}
                      >
                        <Icon className="h-5 w-5" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-base font-bold text-gray-900">
                          {t.label}
                          {count !== null && (
                            <span className="ml-2 text-xs font-medium text-gray-400">
                              {count} member{count === 1 ? "" : "s"} currently
                            </span>
                          )}
                        </p>
                        <p className="text-sm text-gray-500">{t.description}</p>
                      </div>
                    </div>
                    <span
                      className={cn(
                        "w-10 h-9 rounded-lg flex items-center justify-center text-sm font-semibold shrink-0",
                        t.badgeClass,
                      )}
                    >
                      {value}
                    </span>
                  </div>

                  <div className="mt-4 px-0.5">
                    <Slider
                      value={[value]}
                      min={1}
                      max={12}
                      step={1}
                      onValueChange={(vals) => {
                        setThresholds((prev) => ({
                          ...prev,
                          [t.key]: vals[0],
                        }));
                        setDirty(true);
                      }}
                    />
                    <div className="flex items-center justify-between mt-1.5 text-xs text-gray-500">
                      <span>1 absence</span>
                      <span>12 absences</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </motion.section>

        {/* ── Service Tracking ── */}
        <motion.section
          variants={fadeUp}
          initial="hidden"
          animate="visible"
          className="bg-white rounded-xl border border-gray-200 p-5 sm:p-6"
        >
          <div className="flex items-start gap-3">
            <CalendarDays className="h-5 w-5 text-gray-700 mt-1" />
            <div>
              <h2 className="text-xl font-bold text-gray-900">
                Service Tracking
              </h2>
              <p className="text-sm text-gray-500 mt-0.5">
                Choose which services count toward a member's absence tally
              </p>
            </div>
          </div>

          <div className="mt-5 flex flex-col gap-3">
            {SERVICE_TRACKING_OPTIONS.map((option) => {
              const selected = trackingMode === option.key;

              return (
                <motion.button
                  key={option.key}
                  type="button"
                  onClick={() => applyTrackingMode(option.key)}
                  whileHover={selected ? undefined : hoverLift}
                  transition={hoverSpring}
                  className={cn(
                    "flex items-center justify-between gap-4 rounded-lg border px-4 py-3.5 text-left transition-colors",
                    selected
                      ? "border-primary-400 bg-blue-50/60"
                      : "border-gray-200 bg-white hover:border-primary-300 hover:shadow-sm",
                  )}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div
                      className={cn(
                        "w-9 h-9 rounded-md flex items-center justify-center shrink-0",
                        selected
                          ? "bg-blue-100 text-primary-400"
                          : "bg-blue-50 text-primary-400",
                      )}
                    >
                      <CalendarDays className="h-4.5 w-4.5" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-[15px] font-semibold text-gray-900">
                        {option.label}
                      </p>
                      <p className="text-xs text-gray-500 mt-0.5">
                        {option.description}
                      </p>
                    </div>
                  </div>
                  <span
                    className={cn(
                      "w-4 h-4 rounded-full border-2 shrink-0 flex items-center justify-center",
                      selected ? "border-primary-400" : "border-gray-300",
                    )}
                  >
                    {selected && (
                      <span className="w-2 h-2 rounded-full bg-primary-400" />
                    )}
                  </span>
                </motion.button>
              );
            })}
          </div>

          <div className="mt-6 pt-2 flex flex-col gap-5">
            <div className="flex items-center justify-between gap-4">
              <div className="min-w-0">
                <p className="text-[15px] font-semibold text-gray-900">
                  Count Special Events
                  {trackingMode === "ALL_SERVICES" && (
                    <span className="ml-2 text-xs font-normal text-gray-400">
                      (included in All Services)
                    </span>
                  )}
                </p>
                <p className="text-sm text-gray-500 mt-0.5">
                  Conferences, outreaches, and special services count toward
                  absences
                </p>
              </div>
              <Switch
                checked={
                  trackingMode === "ALL_SERVICES" ? true : countSpecialEvents
                }
                disabled={trackingMode === "ALL_SERVICES"}
                onCheckedChange={(v) => {
                  setCountSpecialEvents(v);
                  setDirty(true);
                }}
              />
            </div>

            <div className="flex items-center justify-between gap-4">
              <div className="min-w-0">
                <p className="text-[15px] font-semibold text-gray-900">
                  Count Small Teams Meetings
                </p>
                <p className="text-sm text-gray-500 mt-0.5">
                  Small teams attendance (or absence) is factored into engagement
                  tracking
                </p>
              </div>
              <Switch
                checked={countSmallTeams}
                onCheckedChange={(v) => {
                  setCountSmallTeams(v);
                  setDirty(true);
                }}
              />
            </div>
          </div>
        </motion.section>

        {/* ── Guests ── */}
        <motion.section
          variants={fadeUp}
          initial="hidden"
          animate="visible"
          className="bg-white rounded-xl border border-gray-200 p-5 sm:p-6"
        >
          <h2 className="text-base font-semibold text-gray-900">Guests</h2>
          <p className="text-sm text-gray-500 mt-0.5">
            Guests are people with the Visitor status. They count towards your
            guest limit, not your member limit.
          </p>

          <div className="mt-5 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div className="min-w-0">
              <label
                htmlFor="archive-after-days"
                className="text-[15px] font-semibold text-gray-900"
              >
                Archive inactive guests after
              </label>
              <p className="text-sm text-gray-500 mt-0.5">
                Guests with no attendance for this long move to the archive and
                stop counting towards your guest limit. You can restore them
                any time. Between 30 and 180 days.
              </p>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <input
                id="archive-after-days"
                type="number"
                min={30}
                max={180}
                step={1}
                value={Number.isNaN(archiveAfterDays) ? "" : archiveAfterDays}
                onChange={(e) => {
                  setArchiveAfterDays(parseInt(e.target.value, 10));
                  setDirty(true);
                }}
                className="w-20 h-10 rounded-lg border border-gray-300 px-3 text-sm"
              />
              <span className="text-sm text-gray-600">days</span>
            </div>
          </div>
          {archiveDaysInvalid && (
            <p className="mt-2 text-sm text-red-600">
              Enter a whole number of days between 30 and 180.
            </p>
          )}

          <div className="mt-5 rounded-lg bg-gray-50 p-3 text-sm text-gray-600 space-y-1">
            <p>
              <span className="font-semibold text-gray-800">
                Frequent guests count as members.
              </span>{" "}
              A guest who attends 4 or more services in 60 days counts towards
              your member limit, even if still marked as a guest. This rule is
              fixed.
            </p>
            <p>
              Archived guests are permanently deleted after 12 months in the
              archive. You&apos;ll get an in-app and email reminder 30 days
              before, with the option to export the list.
            </p>
          </div>
        </motion.section>

        {/* ── Save ── */}
        <motion.div variants={fadeUp} initial="hidden" animate="visible">
        <Button
          onClick={handleSave}
          disabled={
            isSaving ||
            isLoading ||
            Boolean(validationError) ||
            archiveDaysInvalid ||
            !dirty
          }
          className="w-full h-11 rounded-lg text-sm font-semibold"
        >
          <FileText className="h-4 w-4 mr-2" />
          {isSaving
            ? "Saving…"
            : dirty
              ? "Save Changes"
              : "All changes saved"}
        </Button>

        <p className="text-xs text-gray-400 text-center mt-3">
          Changes take effect immediately on the{" "}
          <Link
            href="/dashboard/membership/dashboard"
            className="text-primary-400 hover:underline"
          >
            Pastoral Dashboard
          </Link>{" "}
          and Attention Center once saved.
        </p>
        </motion.div>
      </div>
    </div>
  );
}
