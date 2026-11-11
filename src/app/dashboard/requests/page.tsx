"use client";

import { format } from "date-fns";
import { Check, X } from "lucide-react";
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
import { Textarea } from "@/components/ui/textarea";
import Heading from "@/components/ui/typography/Heading";
import { Text } from "@/components/ui/typography/Text";
import { useToast } from "@/hooks/use-toast";
import { useHasAccess } from "@/lib/access-control";
import { RequisitionStatus } from "@/lib/enums";
import { fetchDepartments } from "@/services/departmentService";
import {
  addRequisitionComment,
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
  if (typeof row.requestedBy === "string") {
    return "-";
  }
  return row.requestedBy?.name || "-";
}

function DetailItem({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-0.5">
      <dt className="text-muted-foreground">{label}</dt>
      <dd className="font-medium break-words">{children}</dd>
    </div>
  );
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
  const [detailTarget, setDetailTarget] = useState<RequisitionResponse | null>(
    null,
  );
  const [commentDraft, setCommentDraft] = useState("");
  const [commentLoading, setCommentLoading] = useState(false);

  const handleAddComment = async () => {
    const body = commentDraft.trim();
    if (!detailTarget || !body) {
      return;
    }
    setCommentLoading(true);
    try {
      const updated = await addRequisitionComment(detailTarget.id, body);
      setDetailTarget(updated);
      setRequisitions((prev) => {
        return prev.map((r) => {
          return r.id === updated.id ? updated : r;
        });
      });
      setCommentDraft("");
      toast({
        title: "Comment added",
        description: "The requester has been notified",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to add comment",
        variant: "destructive",
      });
    } finally {
      setCommentLoading(false);
    }
  };

  // Close the detail view first so the confirm dialogs don't stack on it.
  const openApprove = (row: RequisitionResponse) => {
    setDetailTarget(null);
    setApproveTarget(row);
  };
  const openReject = (row: RequisitionResponse) => {
    setDetailTarget(null);
    setRejectTarget(row);
  };

  useEffect(() => {
    fetchDepartments({ page: 1, limit: 100 })
      .then((res) => {
        return setDepartments(
          res.data.map((d) => {
            return { id: d.id, name: d.name };
          }),
        );
      })
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
    if (!approveTarget) {
      return;
    }
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
      render: (row) => {
        return format(new Date(row.createdAt), "MMM d, yyyy");
      },
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
      render: (row) => {
        return row.departmentName || "-";
      },
    },
    {
      key: "requestedBy",
      header: "Requested By",
      render: (row) => {
        return RequesterName(row);
      },
    },
    {
      key: "amount",
      header: "Amount",
      render: (row) => {
        return (
          <span className="font-semibold">
            {formatCurrency(row.amount, row.currency)}
          </span>
        );
      },
      align: "right",
    },
    {
      key: "status",
      header: "Status",
      render: (row) => {
        return (
          <Badge variant="outline" className={STATUS_STYLES[row.status]}>
            {row.status}
          </Badge>
        );
      },
      align: "center",
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
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
              {departments.map((dept) => {
                return (
                  <SelectItem key={dept.id} value={dept.id}>
                    {dept.name}
                  </SelectItem>
                );
              })}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="max-h-[65vh] overflow-auto">
        <Table
          columns={columns}
          data={requisitions}
          rowKey={(row) => {
            return row.id;
          }}
          onRowClick={setDetailTarget}
          minWidth="min-w-[760px]"
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

      <Dialog
        open={!!detailTarget}
        onOpenChange={(open) => {
          if (!open) {
            setDetailTarget(null);
            setCommentDraft("");
          }
        }}
      >
        <DialogContent className="sm:max-w-[560px] max-h-[85vh] overflow-y-auto">
          {detailTarget && (
            <div className="space-y-5 p-2">
              <div className="space-y-2 pr-6">
                <Badge
                  variant="outline"
                  className={STATUS_STYLES[detailTarget.status]}
                >
                  {detailTarget.status}
                </Badge>
                <Heading level={3} className="break-words">
                  {detailTarget.title}
                </Heading>
                <p className="text-2xl font-semibold">
                  {formatCurrency(detailTarget.amount, detailTarget.currency)}
                </p>
              </div>

              <dl className="grid grid-cols-1 gap-4 text-sm sm:grid-cols-2">
                <DetailItem label="Department">
                  {detailTarget.departmentName || "-"}
                </DetailItem>
                <DetailItem label="Requested by">
                  {RequesterName(detailTarget)}
                  {typeof detailTarget.requestedBy !== "string" &&
                    detailTarget.requestedBy?.email && (
                      <span className="block text-muted-foreground break-all">
                        {detailTarget.requestedBy.email}
                      </span>
                    )}
                </DetailItem>
                <DetailItem label="Submitted">
                  {format(
                    new Date(detailTarget.createdAt),
                    "MMM d, yyyy 'at' h:mm a",
                  )}
                </DetailItem>
                {detailTarget.reviewedAt && (
                  <DetailItem label="Reviewed">
                    {format(
                      new Date(detailTarget.reviewedAt),
                      "MMM d, yyyy 'at' h:mm a",
                    )}
                  </DetailItem>
                )}
              </dl>

              <div className="space-y-1.5">
                <Label>Description</Label>
                <p className="whitespace-pre-wrap break-words rounded-md border bg-muted/30 p-3 text-sm">
                  {detailTarget.description || (
                    <span className="text-muted-foreground">
                      No description provided.
                    </span>
                  )}
                </p>
              </div>

              {detailTarget.reviewNote && (
                <div className="space-y-1.5">
                  <Label>Review note</Label>
                  <p className="whitespace-pre-wrap break-words rounded-md border border-red-200 bg-red-50/50 p-3 text-sm">
                    {detailTarget.reviewNote}
                  </p>
                </div>
              )}

              <div className="space-y-2">
                <Label>
                  Comments
                  {detailTarget.comments?.length
                    ? ` (${detailTarget.comments.length})`
                    : ""}
                </Label>
                {detailTarget.comments?.length ? (
                  <ul className="space-y-2">
                    {detailTarget.comments.map((c) => {
                      return (
                        <li
                          key={c.id}
                          className="rounded-md border p-3 text-sm"
                        >
                          <div className="mb-1 flex flex-wrap items-baseline justify-between gap-2">
                            <span className="font-medium">{c.authorName}</span>
                            <span className="text-xs text-muted-foreground">
                              {format(
                                new Date(c.createdAt),
                                "MMM d, yyyy h:mm a",
                              )}
                            </span>
                          </div>
                          <p className="whitespace-pre-wrap break-words">
                            {c.body}
                          </p>
                        </li>
                      );
                    })}
                  </ul>
                ) : (
                  <Text variant="muted">
                    No comments yet. Ask for clarification before deciding.
                  </Text>
                )}
                <Textarea
                  rows={2}
                  maxLength={2000}
                  value={commentDraft}
                  onChange={(e) => {
                    return setCommentDraft(e.target.value);
                  }}
                  placeholder="Ask a question or explain a concern…"
                />
                <div className="flex justify-end">
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={handleAddComment}
                    disabled={commentLoading || !commentDraft.trim()}
                  >
                    {commentLoading ? "Posting…" : "Post comment"}
                  </Button>
                </div>
              </div>

              <div className="flex flex-wrap justify-end gap-2 border-t pt-4">
                <DialogClose asChild>
                  <Button variant="outline">Close</Button>
                </DialogClose>
                {canApprove &&
                  detailTarget.status === RequisitionStatus.PENDING && (
                    <>
                      <Button
                        variant="outline"
                        className="text-red-600 border-red-300 hover:bg-red-50 hover:text-red-700"
                        onClick={() => {
                          return openReject(detailTarget);
                        }}
                      >
                        <X className="mr-1 h-4 w-4" />
                        Reject
                      </Button>
                      <Button
                        onClick={() => {
                          return openApprove(detailTarget);
                        }}
                      >
                        <Check className="mr-1 h-4 w-4" />
                        Approve
                      </Button>
                    </>
                  )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <AlertDialog
        open={!!approveTarget}
        onOpenChange={(open) => {
          return !open && setApproveTarget(null);
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Approve this request?</AlertDialogTitle>
            <AlertDialogDescription>
              Approving &quot;{approveTarget?.title}&quot; for{" "}
              {formatCurrency(
                approveTarget?.amount || 0,
                approveTarget?.currency || "NGN",
              )}{" "}
              will record it as an expense under {approveTarget?.departmentName}
              .
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel
              onClick={() => {
                return setApproveTarget(null);
              }}
            >
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
            <Heading level={3}>
              Reject &quot;{rejectTarget?.title}&quot;
            </Heading>
            <div className="space-y-1.5">
              <Label>Reason</Label>
              <Textarea
                rows={3}
                value={reviewNote}
                onChange={(e) => {
                  return setReviewNote(e.target.value);
                }}
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
