"use client";

import { Download } from "lucide-react";
import { useCallback, useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import { Loader } from "@/components/ui/loader";
import { Text } from "@/components/ui/typography/Text";
import { useToast } from "@/hooks/use-toast";
import {
  exportArchivedGuestsCsv,
  fetchArchivedGuests,
  restoreArchivedGuest,
} from "@/services/memberService";
import { ArchivedGuest } from "@/types";

const day = (value?: string | null) =>
  value
    ? new Date(value).toLocaleDateString(undefined, {
        day: "numeric",
        month: "short",
        year: "numeric",
      })
    : "—";

/**
 * Guests auto-archived for inactivity. They don't count towards the guest
 * limit; restoring one counts against it again. Archived guests are deleted
 * 12 months after archiving.
 */
export function ArchivedGuestsPanel({
  onRestored,
}: {
  onRestored?: () => void;
}) {
  const { toast } = useToast();
  const [rows, setRows] = useState<ArchivedGuest[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [exporting, setExporting] = useState(false);

  const load = useCallback(async (p: number) => {
    setLoading(true);
    try {
      const res = await fetchArchivedGuests(p, 10);
      setRows(res.data || []);
      setTotalPages(Math.max(res.pagination?.totalPages || 1, 1));
      setTotal(res.pagination?.itemCount || 0);
    } catch {
      setRows([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load(page);
  }, [page, load]);

  const restore = async (guest: ArchivedGuest) => {
    setBusyId(guest._id);
    try {
      await restoreArchivedGuest(guest._id);
      toast({
        title: "Guest restored",
        description: `${guest.fullName} counts towards your guest limit again.`,
      });
      await load(page);
      onRestored?.();
    } catch (err: any) {
      toast({
        title: "Couldn't restore guest",
        description: err?.message || "Please try again.",
        variant: "destructive",
      });
    } finally {
      setBusyId(null);
    }
  };

  const exportCsv = async () => {
    setExporting(true);
    try {
      const blob = await exportArchivedGuestsCsv();
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = "archived-guests.csv";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (err: any) {
      toast({
        title: "Export failed",
        description: err?.message || "Please try again.",
        variant: "destructive",
      });
    } finally {
      setExporting(false);
    }
  };

  return (
    <div className="rounded-xl border border-gray-200 bg-white">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-gray-100 p-4">
        <div>
          <Text className="font-semibold text-gray-900">
            Archived guests ({total.toLocaleString()})
          </Text>
          <Text className="text-xs text-gray-500">
            Guests with no recent attendance. They don&apos;t count towards your
            guest limit and are deleted 12 months after archiving. You&apos;ll
            get a reminder 30 days before.
          </Text>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={exportCsv}
          disabled={exporting || total === 0}
        >
          <Download className="mr-2 h-4 w-4" />
          {exporting ? "Exporting…" : "Export CSV"}
        </Button>
      </div>

      <div className="relative">
        {loading && (
          <div className="absolute inset-0 z-10 flex items-center justify-center bg-white/60">
            <Loader size="w-8 h-8" showShadow={false} />
          </div>
        )}

        {rows.length === 0 && !loading ? (
          <Text className="p-6 text-center text-sm text-gray-500">
            No archived guests.
          </Text>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[560px] text-left text-sm">
              <thead className="bg-gray-50 text-xs text-gray-600">
                <tr>
                  <th className="px-4 py-2 font-medium">Name</th>
                  <th className="px-4 py-2 font-medium">Phone</th>
                  <th className="px-4 py-2 font-medium">Archived</th>
                  <th className="px-4 py-2 font-medium">Deletes on</th>
                  <th className="px-4 py-2" />
                </tr>
              </thead>
              <tbody>
                {rows.map((guest) => (
                  <tr key={guest._id} className="border-t border-gray-100">
                    <td className="px-4 py-2 text-gray-900">
                      {guest.fullName}
                    </td>
                    <td className="px-4 py-2 text-gray-700">
                      {guest.phoneNumber || "—"}
                    </td>
                    <td className="px-4 py-2 text-gray-700">
                      {day(guest.archivedAt)}
                    </td>
                    <td className="px-4 py-2 text-gray-700">
                      {day(guest.deletesOn)}
                    </td>
                    <td className="px-4 py-2 text-right">
                      <Button
                        size="sm"
                        variant="outline"
                        disabled={busyId === guest._id}
                        onClick={() => restore(guest)}
                      >
                        {busyId === guest._id ? "Restoring…" : "Restore"}
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-end gap-2 border-t border-gray-100 p-3">
          <Button
            size="sm"
            variant="outline"
            disabled={page <= 1}
            onClick={() => setPage((p) => p - 1)}
          >
            Previous
          </Button>
          <Text className="text-xs text-gray-500">
            Page {page} of {totalPages}
          </Text>
          <Button
            size="sm"
            variant="outline"
            disabled={page >= totalPages}
            onClick={() => setPage((p) => p + 1)}
          >
            Next
          </Button>
        </div>
      )}
    </div>
  );
}
