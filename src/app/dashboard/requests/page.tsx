"use client";

import { format } from "date-fns";
import { useEffect, useState } from "react";

import Table, { Column } from "@/components/features/dashboard/Table";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogClose, DialogContent } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Textarea } from "@/components/ui/textarea";
import Heading from "@/components/ui/typography/Heading";
import { Text } from "@/components/ui/typography/Text";
import { useToast } from "@/hooks/use-toast";
import { useHasAccess } from "@/lib/access-control";
import { RequisitionStatus } from "@/lib/enums";
import { fetchDepartments } from "@/services/departmentService";
import {
  approveRequisition,
  fetchRequisitions,
  rejectRequisition,
  RequisitionResponse,
} from "@/services/requisitionService";
import { formatCurrency } from "@/utils/currency";

const STATUS_STYLES: Record<RequisitionStatus, string> = {
  [RequisitionStatus.PENDING]: "border-amber-400 text-amber-600 bg-transparent",
  [RequisitionStatus.APPROVED]:
    "border-success-400 text-success-600 bg-transparent",
  [RequisitionStatus.REJECTED]: "border-red-400 text-red-600 bg-transparent",
};

function RequesterName(row: RequisitionResponse) {
  if (typeof row.requestedBy === "string") return "-";
  return row.requestedBy?.name || "-";
}

export default function RequestsPage() {
  const { toast } = useToast();
  const canApprove = useHasAccess("REQUESTS", "FULL_ACCESS");

  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [departmentFilter, setDepartmentFilter] = useState<string>("ALL");
  const [departments, setDepartments] = useState<
    { id: string; name: string }[]
  >([]);

  const [requisitions, setRequisitions] = useState<RequisitionResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [approveTarget, setApproveTarget] =
    useState<RequisitionResponse | null>(null);
  const [rejectTarget, setRejectTarget] = useState<RequisitionResponse | null>(
    null,
  );
  const [reviewNote, setReviewNote] = useState("");
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    fetchDepartments({ page: 1, limit: 100 })
      .then((res) =>
        setDepartments(res.data.map((d) => ({ id: d.id, name: d.name }))),
      )
      .catch(() => {});
  }, []);

  const load = async () => {
    setLoading(true);
    try {
      const { data } = await fetchRequisitions({
        limit: 50,
        status:
          statusFilter === "ALL"
            ? undefined
            : (statusFilter as RequisitionStatus),
        departmentId: departmentFilter === "ALL" ? undefined : departmentFilter,
      });
      setRequisitions(data);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to load requests",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [statusFilter, departmentFilter]);

  const handleApprove = async () => {
    if (!approveTarget) return;
    setActionLoading(true);
    try {
      await approveRequisition(approveTarget.id);
      await load();
      toast({
        title: "Approved",
        description: "Request approved and recorded as an expense",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to approve request",
        variant: "destructive",
      });
    } finally {
      setActionLoading(false);
      setApproveTarget(null);
    }
  };

  const handleReject = async () => {
    if (!rejectTarget || !reviewNote.trim()) {
      toast({
        title: "Reason required",
        description: "Please explain why this request is being rejected",
        variant: "destructive",
      });
      return;
    }
    setActionLoading(true);
    try {
      await rejectRequisition(rejectTarget.id, reviewNote.trim());
      await load();
      toast({ title: "Rejected", description: "Request rejected" });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to reject request",
        variant: "destructive",
      });
    } finally {
      setActionLoading(false);
      setRejectTarget(null);
      setReviewNote("");
    }
  };

  const columns: Column<RequisitionResponse>[] = [
    {
      key: "date",
      header: "Date",
      render: (row) => format(new Date(row.createdAt), "MMM d, yyyy"),
      width: "w-32",
    },
    {
      key: "title",
      header: "Title",
      accessor: "title",
    },
    {
      key: "department",
      header: "Department",
      render: (row) => row.departmentName || "-",
    },
    {
      key: "requestedBy",
      header: "Requested By",
      render: (row) => RequesterName(row),
    },
    {
      key: "amount",
      header: "Amount",
      render: (row) => (
        <span className="font-semibold">
          {formatCurrency(row.amount, row.currency)}
        </span>
      ),
      align: "right",
    },
    {
      key: "status",
      header: "Status",
      render: (row) => (
        <Badge variant="outline" className={STATUS_STYLES[row.status]}>
          {row.status}
        </Badge>
      ),
      align: "center",
    },
    ...(canApprove
      ? [
          {
            key: "actions",
            header: "",
            render: (row: RequisitionResponse) =>
              row.status === RequisitionStatus.PENDING ? (
                <div className="flex justify-end gap-2 w-full">
                  <Button
                    size="sm"
                    variant="outline"
                    className="text-red-600 border-red-300 hover:bg-red-50"
                    onClick={() => setRejectTarget(row)}
                  >
                    Reject
                  </Button>
                  <Button size="sm" onClick={() => setApproveTarget(row)}>
                    Approve
                  </Button>
                </div>
              ) : null,
            align: "right" as const,
          },
        ]
      : []),
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <SidebarTrigger className="sm:hidden" />
        <Heading level={2} text="Requests" />
      </div>

      <div className="flex flex-wrap items-end gap-3">
        <div className="space-y-1.5">
          <Label>Status</Label>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All statuses</SelectItem>
              <SelectItem value={RequisitionStatus.PENDING}>Pending</SelectItem>
              <SelectItem value={RequisitionStatus.APPROVED}>
                Approved
              </SelectItem>
              <SelectItem value={RequisitionStatus.REJECTED}>
                Rejected
              </SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1.5">
          <Label>Department</Label>
          <Select value={departmentFilter} onValueChange={setDepartmentFilter}>
            <SelectTrigger className="w-48">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All departments</SelectItem>
              {departments.map((dept) => (
                <SelectItem key={dept.id} value={dept.id}>
                  {dept.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="max-h-[65vh] overflow-auto">
        <Table
          columns={columns}
          data={requisitions}
          rowKey={(row) => row.id}
          isLoading={loading}
          emptyState={
            <div className="py-10 text-center">
              <Text variant="muted">
                No requests {statusFilter === "ALL" ? "yet" : "in this status"}
                {canApprove ? "." : " - submit one from a department you head."}
              </Text>
            </div>
          }
        />
      </div>

      <AlertDialog
        open={!!approveTarget}
        onOpenChange={(open) => !open && setApproveTarget(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Approve this request?</AlertDialogTitle>
            <AlertDialogDescription>
              Approving "{approveTarget?.title}" for{" "}
              {formatCurrency(
                approveTarget?.amount || 0,
                approveTarget?.currency || "NGN",
              )}{" "}
              will record it as an expense under {approveTarget?.departmentName}
              .
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setApproveTarget(null)}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction onClick={handleApprove} disabled={actionLoading}>
              Approve
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Dialog
        open={!!rejectTarget}
        onOpenChange={(open) => {
          if (!open) {
            setRejectTarget(null);
            setReviewNote("");
          }
        }}
      >
        <DialogContent className="sm:max-w-[420px]">
          <div className="space-y-4 p-2">
            <Heading level={3}>Reject "{rejectTarget?.title}"</Heading>
            <div className="space-y-1.5">
              <Label>Reason</Label>
              <Textarea
                rows={3}
                value={reviewNote}
                onChange={(e) => setReviewNote(e.target.value)}
                placeholder="Let the requester know why this was rejected"
              />
            </div>
            <div className="flex justify-end gap-2">
              <DialogClose asChild>
                <Button variant="outline">Cancel</Button>
              </DialogClose>
              <Button
                variant="destructive"
                onClick={handleReject}
                disabled={actionLoading}
              >
                Reject Request
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
