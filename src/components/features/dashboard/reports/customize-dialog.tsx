"use client";

import { useEffect, useMemo, useState } from "react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import {
  fetchReportPreferences,
  saveReportPreferences,
  type DigestFrequency,
  type ReportPreferences,
} from "@/services/reportService";

import { GROUP_LABELS } from "./format";

interface CustomizeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSaved: () => void;
}

const DIGEST_OPTIONS: { value: DigestFrequency; label: string }[] = [
  { value: "none", label: "No emails" },
  { value: "weekly", label: "Every week" },
  { value: "monthly", label: "Every month" },
  { value: "both", label: "Weekly and monthly" },
];

export function CustomizeDialog({
  open,
  onOpenChange,
  onSaved,
}: CustomizeDialogProps) {
  const { toast } = useToast();
  const [prefs, setPrefs] = useState<ReportPreferences | null>(null);
  const [target, setTarget] = useState<"personal" | "church">("personal");
  const [excluded, setExcluded] = useState<Set<string>>(new Set());
  const [useChurchDefault, setUseChurchDefault] = useState(true);
  const [digest, setDigest] = useState<DigestFrequency>("none");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!open) return;
    let cancelled = false;
    fetchReportPreferences()
      .then((data) => {
        if (cancelled) return;
        setPrefs(data);
        setTarget("personal");
        setUseChurchDefault(data.personal.useChurchDefault);
        setExcluded(
          new Set(
            data.personal.useChurchDefault
              ? data.church.excludedSections
              : data.personal.excludedSections,
          ),
        );
        setDigest(data.personal.digestFrequency);
      })
      .catch((error: any) =>
        toast({
          title: "Error",
          description: error.message || "Could not load your report settings",
          variant: "destructive",
        }),
      );
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const switchTarget = (next: "personal" | "church") => {
    if (!prefs) return;
    setTarget(next);
    setExcluded(
      new Set(
        next === "church"
          ? prefs.church.excludedSections
          : useChurchDefault
            ? prefs.church.excludedSections
            : prefs.personal.excludedSections,
      ),
    );
  };

  const grouped = useMemo(() => {
    const groups: Record<string, ReportPreferences["sections"]> = {};
    for (const s of prefs?.sections ?? []) {
      (groups[s.group] ||= []).push(s);
    }
    return groups;
  }, [prefs]);

  const toggle = (key: string, included: boolean) => {
    setExcluded((prev) => {
      const next = new Set(prev);
      if (included) next.delete(key);
      else next.add(key);
      return next;
    });
    if (target === "personal") setUseChurchDefault(false);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      if (target === "church") {
        await saveReportPreferences({
          scope: "church",
          excludedSections: [...excluded],
        });
      } else {
        await saveReportPreferences({
          scope: "personal",
          useChurchDefault,
          digestFrequency: digest,
          ...(useChurchDefault ? {} : { excludedSections: [...excluded] }),
        });
      }
      toast({ title: "Saved", description: "Your report settings are updated." });
      onSaved();
      onOpenChange(false);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Could not save your report settings",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const editingChurch = target === "church";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent showClose={false} className="max-h-[90vh] overflow-y-auto sm:max-w-[666px]">
        <DialogHeader>
          <DialogTitle>Customize your report</DialogTitle>
          <DialogDescription>
            Switch off anything you do not want in your reports. This applies
            to the weekly and monthly feeds and to exports.
          </DialogDescription>
        </DialogHeader>

        {prefs?.canEditChurch && (
          <div className="mt-5 inline-flex rounded-lg bg-muted p-1 text-sm">
            {(["personal", "church"] as const).map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => switchTarget(t)}
                className={cn(
                  "rounded-md px-3 py-1 font-medium",
                  target === t
                    ? "bg-background text-foreground shadow"
                    : "text-muted-foreground",
                )}
              >
                {t === "personal" ? "Just for me" : "Church default"}
              </button>
            ))}
          </div>
        )}

        {!editingChurch && useChurchDefault && (
          <p className="rounded-lg bg-blue-50 px-3 py-2 text-xs text-blue-800">
            You are following your church&apos;s default. Change any switch to
            make your own selection.
          </p>
        )}
        {editingChurch && (
          <p className="rounded-lg bg-amber-50 px-3 py-2 text-xs text-amber-800">
            This is the default for everyone who has not set their own
            selection. People still only see sections their role allows.
          </p>
        )}

        <div className="space-y-4">
          {Object.entries(grouped).map(([group, sections]) => (
            <div key={group}>
              <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-gray-400">
                {GROUP_LABELS[group] ?? group}
              </p>
              <div className="divide-y rounded-xl border">
                {sections.map((s) => {
                  const locked = !s.permitted && !editingChurch;
                  return (
                    <div
                      key={s.key}
                      className="flex items-center justify-between gap-3 px-3 py-2.5"
                    >
                      <div className={cn("min-w-0", locked && "opacity-50")}>
                        <p className="text-sm font-medium text-gray-900">
                          {s.title}
                        </p>
                        <p className="text-xs text-gray-500">
                          {locked
                            ? "Your role does not include this section"
                            : s.description}
                        </p>
                      </div>
                      <Switch
                        checked={!excluded.has(s.key)}
                        disabled={locked}
                        onCheckedChange={(v) => toggle(s.key, v)}
                        aria-label={`Include ${s.title}`}
                      />
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {!editingChurch && (
          <div className="mt-6">
            <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-gray-400">
              Email me a summary
            </p>
            <div className="flex flex-wrap gap-2">
              {DIGEST_OPTIONS.map((o) => (
                <button
                  key={o.value}
                  type="button"
                  onClick={() => setDigest(o.value)}
                  className={cn(
                    "rounded-full border px-3 py-1 text-sm",
                    digest === o.value
                      ? "border-blue-600 bg-blue-50 text-blue-700"
                      : "text-gray-600",
                  )}
                >
                  {o.label}
                </button>
              ))}
            </div>
          </div>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={saving || !prefs}>
            {saving ? "Saving..." : "Save"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
