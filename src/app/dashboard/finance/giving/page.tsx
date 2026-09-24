"use client";

import { format, startOfMonth } from "date-fns";
import { Plus, Settings as SettingsIcon } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import { BatchStatusBadge } from "@/components/features/dashboard/finance/giving/batch-status-badge";
import Table, { Column } from "@/components/features/dashboard/Table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Pills } from "@/components/ui/pills";
import { SidebarTrigger } from "@/components/ui/sidebar";
import Heading from "@/components/ui/typography/Heading";
import { Text } from "@/components/ui/typography/Text";
import { useToast } from "@/hooks/use-toast";
import { useHasAccess } from "@/lib/access-control";
import { getMyChurch } from "@/lib/api";
import {
  fetchGivingBatches,
  GivingBatch,
  GivingBatchStatus,
} from "@/services/givingService";
import { formatCurrency } from "@/utils/currency";

type StatusFilter = "all" | GivingBatchStatus;

const STATUS_OPTIONS: { label: string; value: StatusFilter }[] = [
  { label: "All", value: "all" },
  { label: "Draft", value: "draft" },
  { label: "Submitted", value: "submitted" },
  { label: "Confirmed", value: "confirmed" },
  { label: "Voided", value: "voided" },
];

export default function GivingBatchesPage() {
  const router = useRouter();
  const { toast } = useToast();
  const canManage = useHasAccess("GIVING", "MANAGE");
  const canFullAccess = useHasAccess("GIVING", "FULL_ACCESS");

  const [currency, setCurrency] = useState("NGN");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [startDate, setStartDate] = useState(
    format(startOfMonth(new Date()), "yyyy-MM-dd"),
  );
  const [endDate, setEndDate] = useState(format(new Date(), "yyyy-MM-dd"));

  const [batches, setBatches] = useState<GivingBatch[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    getMyChurch()
      .then((church) => {
        if (church?.defaultCurrency) setCurrency(church.defaultCurrency);
      })
      .catch(() => {});
  }, []);

  const loadBatches = async () => {
    setIsLoading(true);
    try {
      const res = await fetchGivingBatches({
        startDate,
        endDate,
        status: statusFilter === "all" ? undefined : statusFilter,
        limit: 100,
      });
      setBatches(res.data);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to load giving batches",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadBatches();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [statusFilter]);

  const columns: Column<GivingBatch>[] = [
    {
      key: "date",
      header: "Date",
      render: (row) => format(new Date(row.date), "MMM d, yyyy"),
      width: "w-32",
    },
    {
      key: "service",
      header: "Service",
      render: (row) => row.serviceTitle || "-",
    },
    {
      key: "status",
      header: "Status",
      render: (row) => <BatchStatusBadge status={row.status} />,
    },
    {
      key: "totalAmount",
      header: "Total",
      render: (row) => (
        <span className="font-semibold">
          {formatCurrency(row.totalAmount, currency)}
        </span>
      ),
      align: "right",
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <SidebarTrigger className="sm:hidden" />
          <Heading level={2} text="Giving Batches" />
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" asChild>
            <Link href="/dashboard/finance/giving/reports">Reports</Link>
          </Button>
          {canFullAccess && (
            <Button variant="outline" size="icon" asChild>
              <Link href="/dashboard/finance/giving/settings">
                <SettingsIcon className="w-4 h-4" />
              </Link>
            </Button>
          )}
          {canManage && (
            <Button asChild>
              <Link href="/dashboard/finance/giving/new">
                <Plus className="w-4 h-4" />
                New Batch
              </Link>
            </Button>
          )}
        </div>
      </div>

      <div className="flex flex-wrap items-end justify-between gap-3">
        <Pills
          options={STATUS_OPTIONS}
          value={statusFilter}
          onChange={setStatusFilter}
        />

        <div className="flex flex-wrap items-end gap-3">
          <div className="space-y-1.5">
            <Label>From</Label>
            <Input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-40"
            />
          </div>
          <div className="space-y-1.5">
            <Label>To</Label>
            <Input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-40"
            />
          </div>
          <Button onClick={loadBatches} disabled={isLoading}>
            Apply
          </Button>
        </div>
      </div>

      <div className="max-h-[65vh] overflow-auto">
        <Table
          columns={columns}
          data={batches}
          rowKey={(row) => row.id}
          isLoading={isLoading}
          onRowClick={(row) =>
            router.push(`/dashboard/finance/giving/${row.id}`)
          }
          emptyState={
            <div className="py-10 text-center">
              <Text variant="muted">
                No giving batches for this date range yet
                {canManage ? " - create one with New Batch." : "."}
              </Text>
            </div>
          }
        />
      </div>
    </div>
  );
}
