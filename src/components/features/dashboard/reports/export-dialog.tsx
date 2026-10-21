"use client";

import { Download } from "lucide-react";
import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import {
  exportReport,
  fetchReportPreferences,
  saveBlob,
  type ReportPreferences,
  type ReportRequest,
} from "@/services/reportService";

type Format = "xlsx" | "pdf" | "csv";
type Mode = "mine" | "everything" | "pick";

interface ExportDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** What to export: the period (or custom range) currently on screen. */
  request: ReportRequest;
  periodLabel: string;
}

const FORMATS: { value: Format; label: string; hint: string }[] = [
  { value: "pdf", label: "PDF", hint: "A polished summary with charts" },
  { value: "xlsx", label: "Excel", hint: "Every figure, one sheet per section" },
  { value: "csv", label: "CSV", hint: "One section as a simple spreadsheet" },
];

export function ExportDialog({
  open,
  onOpenChange,
  request,
  periodLabel,
}: ExportDialogProps) {
  const { toast } = useToast();
  const [prefs, setPrefs] = useState<ReportPreferences | null>(null);
  const [format, setFormat] = useState<Format>("pdf");
  const [mode, setMode] = useState<Mode>("mine");
  const [picked, setPicked] = useState<Set<string>>(new Set());
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!open) return;
    fetchReportPreferences()
      .then((data) => {
        setPrefs(data);
        setPicked(new Set(data.effectiveIncluded));
      })
      .catch(() => undefined);
  }, [open]);

  const permitted = (prefs?.sections ?? []).filter((s) => s.permitted);

  const sectionsToSend = (): string[] | undefined => {
    if (mode === "mine") return undefined;
    if (mode === "everything") return permitted.map((s) => s.key);
    return [...picked];
  };

  const sectionCount =
    mode === "pick"
      ? picked.size
      : mode === "everything"
        ? permitted.length
        : (prefs?.effectiveIncluded.length ?? 0);
  const csvNeedsOne = format === "csv" && sectionCount !== 1;

  const handleExport = async () => {
    setBusy(true);
    try {
      const { blob, fileName } = await exportReport(format, {
        ...request,
        sections: sectionsToSend(),
      });
      saveBlob(blob, fileName);
      onOpenChange(false);
    } catch (error: any) {
      toast({
        title: "Export failed",
        description: error.message || "Could not create the report",
        variant: "destructive",
      });
    } finally {
      setBusy(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-[493px]">
        <DialogHeader>
          <DialogTitle>Export report</DialogTitle>
          <DialogDescription>{periodLabel}</DialogDescription>
        </DialogHeader>

        <div>
          <p className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-gray-400">
            Format
          </p>
          <div className="grid grid-cols-3 gap-2">
            {FORMATS.map((f) => (
              <button
                key={f.value}
                type="button"
                onClick={() => setFormat(f.value)}
                className={cn(
                  "rounded-xl border p-2.5 text-left",
                  format === f.value
                    ? "border-blue-600 bg-blue-50"
                    : "hover:bg-gray-50",
                )}
              >
                <p className="text-sm font-semibold text-gray-900">{f.label}</p>
                <p className="text-[11px] leading-tight text-gray-500">
                  {f.hint}
                </p>
              </button>
            ))}
          </div>
        </div>

        <div>
          <p className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-gray-400">
            What to include
          </p>
          <div className="space-y-1.5">
            {(
              [
                ["mine", "My selection", "The sections currently switched on for you"],
                ["everything", "Full report", "Every section your role can see"],
                ["pick", "Choose sections", "Pick exactly what goes in"],
              ] as [Mode, string, string][]
            ).map(([value, label, hint]) => (
              <label
                key={value}
                className={cn(
                  "flex cursor-pointer items-start gap-3 rounded-xl border p-2.5",
                  mode === value && "border-blue-600 bg-blue-50",
                )}
              >
                <input
                  type="radio"
                  name="export-mode"
                  className="mt-1"
                  checked={mode === value}
                  onChange={() => setMode(value)}
                />
                <span>
                  <span className="block text-sm font-medium text-gray-900">
                    {label}
                  </span>
                  <span className="block text-xs text-gray-500">{hint}</span>
                </span>
              </label>
            ))}
          </div>

          {mode === "pick" && (
            <div className="mt-2 grid grid-cols-2 gap-1.5 rounded-xl border p-3">
              {permitted.map((s) => (
                <label key={s.key} className="flex items-center gap-2 text-sm">
                  <Checkbox
                    checked={picked.has(s.key)}
                    onCheckedChange={(v) =>
                      setPicked((prev) => {
                        const next = new Set(prev);
                        if (v) next.add(s.key);
                        else next.delete(s.key);
                        return next;
                      })
                    }
                  />
                  {s.title}
                </label>
              ))}
            </div>
          )}

          {csvNeedsOne && (
            <p className="mt-2 text-xs text-amber-700">
              CSV holds one section at a time. Choose a single section, or use
              PDF or Excel for several.
            </p>
          )}
        </div>

        <DialogFooter className="mt-4 gap-2 sm:gap-0">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            onClick={handleExport}
            disabled={
              busy || !prefs || csvNeedsOne || (mode === "pick" && !picked.size)
            }
          >
            <Download className="mr-2 h-4 w-4" />
            {busy ? "Preparing..." : "Download"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
