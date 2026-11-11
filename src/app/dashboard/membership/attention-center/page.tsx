"use client";

import {
  AlertCircle,
  Bell,
  CalendarClock,
  CheckCircle2,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Eye,
  Mail,
  MessageCircle,
  MessageSquareText,
  Phone,
  RotateCcw,
  SlidersHorizontal,
  Star,
  TrendingDown,
  UserPlus,
  UserCheck,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import {
  fadeUpBounce,
  staggerContainer,
  hoverLift,
  hoverSpring,
} from "@/components/features/dashboard/membership/animations";

import { AddNoteDialog } from "@/components/features/dashboard/membership/add-note-dialog";
import { EmptyState } from "@/components/features/dashboard/empty-state";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
} from "@/components/ui/pagination";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import Heading from "@/components/ui/typography/Heading";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import {
  addAlertNote,
  deleteAlertNote,
  fetchPastoralAlerts,
  setAlertRead,
  setAlertResolved,
  updateAlertNote,
  type PastoralAlert,
  type PastoralAlertCategory,
} from "@/services/pastoralService";

// ─────────────────────────────────────────────────────────────────────────────
// Attention Center - alerts are computed server-side and persisted. Actions
// (note / resolve / read) hit real endpoints, so state survives refreshes.
// ─────────────────────────────────────────────────────────────────────────────

type TabKey = "all" | PastoralAlertCategory;

const TABS: {
  key: TabKey;
  label: string;
  icon: typeof Bell;
}[] = [
  { key: "all", label: "All Alerts", icon: Bell },
  { key: "critical", label: "Critical", icon: AlertCircle },
  { key: "absences", label: "Absences", icon: CalendarClock },
  { key: "decline", label: "Decline", icon: TrendingDown },
  { key: "first-timers", label: "First Timers", icon: UserPlus },
  { key: "positive", label: "Positive", icon: Star },
  { key: "returning", label: "Returning", icon: UserCheck },
];

const SEVERITY_STYLES: Record<
  PastoralAlert["severity"],
  { chip: string; border: string; iconTile: string }
> = {
  urgent: {
    chip: "bg-red-50 text-red-600 border-red-200",
    border: "border-l-red-500",
    iconTile: "bg-red-50 text-red-500",
  },
  high: {
    chip: "bg-orange-50 text-orange-600 border-orange-200",
    border: "border-l-orange-500",
    iconTile: "bg-orange-50 text-orange-500",
  },
  medium: {
    chip: "bg-amber-50 text-amber-600 border-amber-200",
    border: "border-l-amber-400",
    iconTile: "bg-amber-50 text-amber-500",
  },
  info: {
    chip: "bg-blue-50 text-blue-600 border-blue-200",
    border: "border-l-blue-500",
    iconTile: "bg-blue-50 text-blue-500",
  },
};

const CATEGORY_CHIP: Record<PastoralAlertCategory, string> = {
  critical: "bg-red-50 text-red-500 border-red-100",
  absences: "bg-orange-50 text-orange-500 border-orange-100",
  decline: "bg-amber-50 text-amber-600 border-amber-100",
  "first-timers": "bg-purple-50 text-purple-500 border-purple-100",
  positive: "bg-blue-50 text-blue-500 border-blue-100",
  returning: "bg-teal-50 text-teal-600 border-teal-100",
};

function getAlertIcon(alert: PastoralAlert): typeof Bell {
  switch (alert.category) {
    case "critical":
      return AlertCircle;
    case "absences":
      return CalendarClock;
    case "decline":
      return TrendingDown;
    case "first-timers":
      return UserPlus;
    case "returning":
      return UserCheck;
    case "positive":
      return Star;
    default:
      return Bell;
  }
}

function AlertCard({
  alert,
  onResolve,
  onUnresolve,
  onMarkRead,
  onAddNote,
  onEditNote,
  onDeleteNote,
  busy,
}: {
  alert: PastoralAlert;
  onResolve: (outcomeNote: string) => void;
  onUnresolve: () => void;
  onMarkRead: () => void;
  onAddNote: () => void;
  onEditNote: (index: number, currentBody: string) => void;
  onDeleteNote: (index: number) => void;
  busy: boolean;
}) {
  const severity = SEVERITY_STYLES[alert.severity];
  const Icon = getAlertIcon(alert);
  const [contactOpen, setContactOpen] = useState(false);

  const hasPhone = Boolean(alert.memberPhone);
  const hasEmail = Boolean(alert.memberEmail);
  const waNumber = alert.memberPhone?.replace(/[^0-9]/g, "");

  return (
    <div
      className={cn(
        "bg-white rounded-xl border border-gray-200 border-l-4 p-4 sm:p-5 flex flex-col sm:flex-row gap-4 transition-shadow hover:shadow-md",
        severity.border,
        alert.resolved && "opacity-60",
      )}
    >
      <div
        className={cn(
          "w-10 h-10 rounded-lg flex items-center justify-center shrink-0",
          severity.iconTile,
        )}
      >
        <Icon className="h-5 w-5" />
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-base font-bold text-gray-900">
            {alert.memberName}
          </span>
          <span
            className={cn(
              "px-2 py-0.5 rounded border text-[11px] font-medium",
              severity.chip,
            )}
          >
            {alert.severity}
          </span>
          <span
            className={cn(
              "px-2 py-0.5 rounded border text-[11px] font-medium",
              CATEGORY_CHIP[alert.category],
            )}
          >
            {alert.categoryLabel}
          </span>
        </div>

        <p className="text-sm text-gray-500 mt-1.5">{alert.message}</p>

        {alert.notes.length > 0 && (
          <div className="mt-3 flex flex-col gap-2">
            {alert.notes.map((note, index) => {
              return (
                <div
                  key={note.id}
                  className="rounded-lg bg-gray-50 border border-gray-100 px-3 py-2"
                >
                  <p className="text-xs text-gray-700">
                    {note.body}
                    {note.updatedAt && (
                      <span className="text-gray-400 italic"> (edited)</span>
                    )}
                  </p>
                  <div className="flex items-center justify-between gap-2 mt-1">
                    <p className="text-[11px] text-gray-400">
                      {note.kind === "resolve-outcome" && (
                        <span className="text-green-600 font-medium">
                          Outcome ·{" "}
                        </span>
                      )}
                      {note.authorName} ·{" "}
                      {new Date(note.createdAt).toLocaleDateString(undefined, {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </p>
                    {note.kind !== "resolve-outcome" && (
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => {
                            return onEditNote(index, note.body);
                          }}
                          className="text-[11px] font-medium text-gray-500 hover:text-primary-400"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => {
                            return onDeleteNote(index);
                          }}
                          className="text-[11px] font-medium text-gray-400 hover:text-red-500"
                        >
                          Delete
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        <div className="flex flex-wrap items-center gap-2 mt-3">
          <button
            onClick={onAddNote}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-md border border-gray-200 text-xs font-medium text-gray-700 hover:bg-gray-50 transition-colors"
          >
            <MessageSquareText className="h-3.5 w-3.5" />
            Add Note
          </button>

          {/* Contact menu - call / email / WhatsApp depending on data on file */}
          <div className="relative">
            <button
              onClick={() => {
                return setContactOpen((v) => {
                  return !v;
                });
              }}
              disabled={!hasPhone && !hasEmail}
              className={cn(
                "flex items-center gap-1.5 px-2.5 py-1.5 rounded-md border border-gray-200 text-xs font-medium text-gray-700 transition-colors",
                hasPhone || hasEmail
                  ? "hover:bg-gray-50"
                  : "opacity-50 cursor-not-allowed",
              )}
            >
              <Phone className="h-3.5 w-3.5" />
              Contact
              {(hasPhone || hasEmail) && (
                <ChevronDown className="h-3 w-3 text-gray-400" />
              )}
            </button>

            {contactOpen && (hasPhone || hasEmail) && (
              <>
                <div
                  className="fixed inset-0 z-10"
                  onClick={() => {
                    return setContactOpen(false);
                  }}
                />
                <div className="absolute left-0 top-full mt-1 z-20 w-44 rounded-lg border border-gray-200 bg-popover shadow-lg py-1">
                  {hasPhone && (
                    <a
                      href={`tel:${alert.memberPhone}`}
                      onClick={() => {
                        return setContactOpen(false);
                      }}
                      className="flex items-center gap-2 px-3 py-2 text-xs text-gray-700 hover:bg-gray-50"
                    >
                      <Phone className="h-3.5 w-3.5 text-gray-400" />
                      Call {alert.memberPhone}
                    </a>
                  )}
                  {waNumber && (
                    <a
                      href={`https://wa.me/${waNumber}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={() => {
                        return setContactOpen(false);
                      }}
                      className="flex items-center gap-2 px-3 py-2 text-xs text-gray-700 hover:bg-gray-50"
                    >
                      <MessageCircle className="h-3.5 w-3.5 text-green-500" />
                      WhatsApp
                    </a>
                  )}
                  {hasEmail && (
                    <a
                      href={`mailto:${alert.memberEmail}`}
                      onClick={() => {
                        return setContactOpen(false);
                      }}
                      className="flex items-center gap-2 px-3 py-2 text-xs text-gray-700 hover:bg-gray-50"
                    >
                      <Mail className="h-3.5 w-3.5 text-gray-400" />
                      Email
                    </a>
                  )}
                </div>
              </>
            )}
          </div>

          <button
            onClick={onMarkRead}
            disabled={alert.read || busy}
            className={cn(
              "flex items-center gap-1.5 px-2.5 py-1.5 rounded-md border text-xs font-medium transition-colors",
              alert.read
                ? "border-transparent text-gray-300 cursor-default"
                : "border-gray-200 text-gray-700 hover:bg-gray-50",
            )}
          >
            <Eye className="h-3.5 w-3.5" />
            {alert.read ? "Read" : "Mark Read"}
          </button>
          {alert.resolved ? (
            <button
              onClick={onUnresolve}
              disabled={busy}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-xs font-medium text-gray-500 hover:bg-gray-50 transition-colors"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              Unresolve
            </button>
          ) : (
            <button
              onClick={() => {
                return onResolve("");
              }}
              disabled={busy}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-xs font-medium text-green-600 hover:bg-green-50 transition-colors"
            >
              <CheckCircle2 className="h-3.5 w-3.5" />
              Resolve
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default function AttentionCenterPage() {
  const { toast } = useToast();
  const [alerts, setAlerts] = useState<PastoralAlert[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [tab, setTab] = useState<TabKey>("all");
  const [showResolved, setShowResolved] = useState(false);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [pageSize, setPageSize] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);

  // Dialog state: null = closed. noteTarget carries { alert, editIndex, initialBody }
  // So the same dialog handles add and edit.
  const [noteTarget, setNoteTarget] = useState<{
    alert: PastoralAlert;
    editIndex: number | null;
    initialBody: string;
  } | null>(null);
  const [resolveTarget, setResolveTarget] = useState<PastoralAlert | null>(
    null,
  );
  const [outcomeNote, setOutcomeNote] = useState("");

  const load = (silent = false) => {
    if (!silent) {
      setIsLoading(true);
    }
    fetchPastoralAlerts({ includeResolved: true })
      .then(setAlerts)
      .catch(() => {
        return toast({ title: "Failed to load alerts" });
      })
      .finally(() => {
        return setIsLoading(false);
      });
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const counts = useMemo(() => {
    const map: Record<string, number> = { all: alerts.length };
    for (const alert of alerts) {
      map[alert.category] = (map[alert.category] ?? 0) + 1;
    }
    return map;
  }, [alerts]);

  const filtered = useMemo(() => {
    return tab === "all"
      ? alerts
      : alerts.filter((a) => {
          return a.category === tab;
        });
  }, [alerts, tab]);

  const visible = useMemo(() => {
    return showResolved
      ? filtered
      : filtered.filter((a) => {
          return !a.resolved;
        });
  }, [filtered, showResolved]);

  // Reset to page 1 whenever the active tab or resolved-filter changes so a
  // Deep page number from a previous view never leaves the list looking empty.
  useEffect(() => {
    setCurrentPage(1);
  }, [tab, showResolved]);

  const totalPages = Math.max(1, Math.ceil(visible.length / pageSize));

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

  const paginated = useMemo(() => {
    return visible.slice((currentPage - 1) * pageSize, currentPage * pageSize);
  }, [visible, currentPage, pageSize]);

  const withBusy = async (id: string, fn: () => Promise<void>) => {
    setBusyId(id);
    try {
      await fn();
    } finally {
      setBusyId(null);
    }
  };

  const handleResolve = (alert: PastoralAlert, outcome: string) => {
    return withBusy(alert.alertId, async () => {
      try {
        await setAlertResolved(alert.alertId, true, outcome);
        setAlerts((prev) => {
          return prev.map((a) => {
            return a.alertId === alert.alertId ? { ...a, resolved: true } : a;
          });
        });
        toast({ title: `Alert for ${alert.memberName} resolved` });
        setResolveTarget(null);
        setOutcomeNote("");
      } catch {
        toast({ title: "Failed to resolve alert", variant: "destructive" });
      }
    });
  };

  const handleUnresolve = (alert: PastoralAlert) => {
    return withBusy(alert.alertId, async () => {
      try {
        await setAlertResolved(alert.alertId, false);
        setAlerts((prev) => {
          return prev.map((a) => {
            return a.alertId === alert.alertId ? { ...a, resolved: false } : a;
          });
        });
      } catch {
        toast({ title: "Failed to unresolve alert", variant: "destructive" });
      }
    });
  };

  const handleMarkRead = (alert: PastoralAlert) => {
    return withBusy(alert.alertId, async () => {
      try {
        await setAlertRead(alert.alertId, true);
        setAlerts((prev) => {
          return prev.map((a) => {
            return a.alertId === alert.alertId ? { ...a, read: true } : a;
          });
        });
      } catch {
        toast({ title: "Failed to mark as read", variant: "destructive" });
      }
    });
  };

  const handleNoteSubmit = async (body: string) => {
    if (!noteTarget) {
      return;
    }
    const { alert, editIndex } = noteTarget;
    try {
      const notes =
        editIndex !== null
          ? await updateAlertNote(alert.alertId, editIndex, body)
          : await addAlertNote(alert.alertId, body);
      setAlerts((prev) => {
        return prev.map((a) => {
          return a.alertId === alert.alertId ? { ...a, notes } : a;
        });
      });
      toast({ title: editIndex !== null ? "Note updated" : "Note added" });
    } catch {
      toast({
        title: "Failed to save note - you can only edit your own notes",
        variant: "destructive",
      });
    }
  };

  const handleDeleteNote = (alert: PastoralAlert, index: number) => {
    return withBusy(alert.alertId, async () => {
      try {
        const notes = await deleteAlertNote(alert.alertId, index);
        setAlerts((prev) => {
          return prev.map((a) => {
            return a.alertId === alert.alertId ? { ...a, notes } : a;
          });
        });
        toast({ title: "Note deleted" });
      } catch {
        toast({ title: "Failed to delete note", variant: "destructive" });
      }
    });
  };

  const activeTabMeta = TABS.find((t) => {
    return t.key === tab;
  });

  return (
    <div className="min-h-screen bg-gray-50 pb-10">
      <div className="bg-white border-b border-gray-200">
        <div className="px-4 sm:px-6 py-4 flex items-center gap-2">
          <Heading level={3} className="leading-none m-0">
            Attention Center
          </Heading>
        </div>
      </div>

      <div className="px-3 sm:px-6 py-5 flex flex-col gap-4">
        {/* Tabs + Show Resolved */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap gap-1.5">
            {TABS.map(({ key, label, icon: Icon }) => {
              return (
                <motion.button
                  key={key}
                  onClick={() => {
                    return setTab(key);
                  }}
                  whileHover={tab === key ? undefined : { y: -1 }}
                  whileTap={{ scale: 0.97 }}
                  transition={hoverSpring}
                  className={cn(
                    "flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-xs font-medium transition-colors",
                    tab === key
                      ? "bg-white text-gray-900 border-gray-300 shadow-sm"
                      : "bg-gray-100 text-gray-500 border-transparent hover:bg-white hover:text-gray-800 hover:border-gray-200",
                  )}
                >
                  <Icon className="h-3.5 w-3.5" />
                  {label}
                  {counts[key] ? ` (${counts[key]})` : ""}
                </motion.button>
              );
            })}
          </div>

          <button
            onClick={() => {
              return setShowResolved((v) => {
                return !v;
              });
            }}
            className={cn(
              "flex items-center gap-1.5 text-xs font-medium shrink-0 transition-colors",
              showResolved
                ? "text-primary-400"
                : "text-gray-500 hover:text-gray-700",
            )}
          >
            <SlidersHorizontal className="h-3.5 w-3.5" />
            {showResolved ? "Hide Resolved" : "Show Resolved"}
          </button>
        </div>

        {/* Alert list */}
        {isLoading ? (
          <div className="bg-white rounded-xl border border-gray-200 flex items-center justify-center py-16">
            <div className="animate-pulse text-gray-400">Loading alerts…</div>
          </div>
        ) : visible.length === 0 ? (
          <div className="bg-white rounded-xl border border-gray-200">
            <EmptyState
              icon={activeTabMeta?.icon ?? Bell}
              title="No alerts in this category"
              description={
                tab === "all"
                  ? "Members needing pastoral care will appear here automatically."
                  : `No members currently fall under “${activeTabMeta?.label}”.`
              }
              className="py-16"
            />
          </div>
        ) : (
          <motion.div
            variants={staggerContainer}
            initial="hidden"
            animate="visible"
            className="flex flex-col gap-3"
          >
            {paginated.map((alert) => {
              return (
                <motion.div
                  key={alert.alertId}
                  variants={fadeUpBounce}
                  layout
                  whileHover={hoverLift}
                  transition={hoverSpring}
                >
                  <AlertCard
                    alert={alert}
                    busy={busyId === alert.alertId}
                    onResolve={() => {
                      setOutcomeNote("");
                      setResolveTarget(alert);
                    }}
                    onUnresolve={() => {
                      return handleUnresolve(alert);
                    }}
                    onMarkRead={() => {
                      return handleMarkRead(alert);
                    }}
                    onAddNote={() => {
                      return setNoteTarget({
                        alert,
                        editIndex: null,
                        initialBody: "",
                      });
                    }}
                    onEditNote={(index, currentBody) => {
                      return setNoteTarget({
                        alert,
                        editIndex: index,
                        initialBody: currentBody,
                      });
                    }}
                    onDeleteNote={(index) => {
                      return handleDeleteNote(alert, index);
                    }}
                  />
                </motion.div>
              );
            })}
          </motion.div>
        )}

        {!isLoading && visible.length > 0 && (
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-2">
              <span className="text-xs font-medium text-gray-500 whitespace-nowrap">
                Rows per page
              </span>
              <Select
                value={String(pageSize)}
                onValueChange={(value) => {
                  setPageSize(Number(value));
                  setCurrentPage(1);
                }}
              >
                <SelectTrigger className="w-[72px] h-8 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {[10, 25].map((size) => {
                    return (
                      <SelectItem key={size} value={String(size)}>
                        {size}
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>
              <span className="text-xs text-gray-400 whitespace-nowrap">
                Showing {Math.min(paginated.length, visible.length)} of{" "}
                {visible.length}
              </span>
            </div>

            {totalPages > 1 && (
              <Pagination className="sm:justify-end m-0">
                <PaginationContent>
                  <PaginationItem>
                    <button
                      onClick={() => {
                        return setCurrentPage((p) => {
                          return Math.max(1, p - 1);
                        });
                      }}
                      disabled={currentPage === 1}
                      className={cn(
                        "flex items-center justify-center h-8 w-8 rounded-md border border-gray-200 text-gray-500 transition-colors",
                        currentPage === 1
                          ? "opacity-40 cursor-not-allowed"
                          : "hover:bg-gray-50",
                      )}
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </button>
                  </PaginationItem>

                  {Array.from({ length: totalPages }, (_, i) => {
                    return i + 1;
                  }).map((page) => {
                    return (
                      <PaginationItem key={page}>
                        <button
                          onClick={() => {
                            return setCurrentPage(page);
                          }}
                          className={cn(
                            "flex items-center justify-center h-8 w-8 rounded-md text-xs font-medium border transition-colors",
                            currentPage === page
                              ? "bg-primary-400 text-white border-primary-400"
                              : "border-gray-200 text-gray-600 hover:bg-gray-50",
                          )}
                        >
                          {page}
                        </button>
                      </PaginationItem>
                    );
                  })}

                  <PaginationItem>
                    <button
                      onClick={() => {
                        return setCurrentPage((p) => {
                          return Math.min(totalPages, p + 1);
                        });
                      }}
                      disabled={currentPage === totalPages}
                      className={cn(
                        "flex items-center justify-center h-8 w-8 rounded-md border border-gray-200 text-gray-500 transition-colors",
                        currentPage === totalPages
                          ? "opacity-40 cursor-not-allowed"
                          : "hover:bg-gray-50",
                      )}
                    >
                      <ChevronRight className="h-4 w-4" />
                    </button>
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            )}
          </div>
        )}
      </div>

      {noteTarget && (
        <AddNoteDialog
          open
          memberName={noteTarget.alert.memberName}
          initialBody={noteTarget.initialBody}
          onClose={() => {
            return setNoteTarget(null);
          }}
          onSubmit={async (body) => {
            await handleNoteSubmit(body);
            setNoteTarget(null);
          }}
        />
      )}

      {/* Resolve requires an outcome note for accountability */}
      {resolveTarget && (
        <Dialog
          open
          onOpenChange={(next) => {
            return !next && setResolveTarget(null);
          }}
        >
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="text-lg font-bold text-gray-900">
                Resolve alert for {resolveTarget.memberName}
              </DialogTitle>
              <DialogDescription className="text-sm text-gray-500">
                Add a quick outcome note - it&apos;s saved to this alert&apos;s
                history so the team knows what happened.
              </DialogDescription>
            </DialogHeader>

            <textarea
              value={outcomeNote}
              onChange={(e) => {
                return setOutcomeNote(e.target.value);
              }}
              rows={4}
              placeholder="e.g. Visited on Sunday - doing well, will join a small team…"
              className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-100 resize-none"
            />

            <div className="flex justify-end gap-2 mt-2">
              <Button
                variant="outline"
                onClick={() => {
                  return setResolveTarget(null);
                }}
              >
                Cancel
              </Button>
              <Button
                onClick={() => {
                  return handleResolve(resolveTarget, outcomeNote);
                }}
                disabled={
                  !outcomeNote.trim() || busyId === resolveTarget.alertId
                }
                className="bg-green-600 hover:bg-green-700"
              >
                {busyId === resolveTarget.alertId ? "Resolving…" : "Resolve"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
