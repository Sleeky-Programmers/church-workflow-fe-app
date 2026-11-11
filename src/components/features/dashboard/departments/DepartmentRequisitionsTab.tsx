"use client";

import { format } from "date-fns";
import { Plus, X } from "lucide-react";
import { useEffect, useState } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader } from "@/components/ui/loader";
import { Textarea } from "@/components/ui/textarea";
import Heading from "@/components/ui/typography/Heading";
import { Text } from "@/components/ui/typography/Text";
import { useIsMobile } from "@/hooks/use-mobile";
import { useToast } from "@/hooks/use-toast";
import { useHasAccess } from "@/lib/access-control";
import { RequisitionStatus } from "@/lib/enums";
import {
  createRequisition,
  fetchRequisitions,
  RequisitionResponse,
} from "@/services/requisitionService";
import { formatCurrency } from "@/utils/currency";

const STATUS_STYLES: Record<RequisitionStatus, string> = {
  [RequisitionStatus.PENDING]: "border-amber-400 text-amber-600 bg-transparent",
  [RequisitionStatus.APPROVED]:
    "border-success-400 text-success-600 bg-transparent",
  [RequisitionStatus.REJECTED]: "border-red-400 text-red-600 bg-transparent",
};

function NewRequestDialog({
  departmentId,
  onCreated,
}: {
  departmentId: string;
  onCreated: () => void | Promise<void>;
}) {
  const { toast } = useToast();
  const isMobile = useIsMobile();
  const [open, setOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState("");

  async function handleSave() {
    const parsedAmount = Number(amount);
    if (!title.trim() || !parsedAmount || parsedAmount <= 0) {
      toast({
        title: "Missing information",
        description: "Title and a valid amount are required",
        variant: "destructive",
      });
      return;
    }

    setIsSaving(true);
    try {
      await createRequisition({
        departmentId,
        title: title.trim(),
        description: description.trim(),
        amount: parsedAmount,
      });
      await onCreated();
      toast({ title: "Success", description: "Request submitted for review" });
      setTitle("");
      setDescription("");
      setAmount("");
      setOpen(false);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to submit request",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="gap-2">
          <Plus className="w-4 h-4" />
          New Request
        </Button>
      </DialogTrigger>

      <DialogContent
        showClose={false}
        mobileSheet={isMobile}
        className="sm:max-w-[480px] overflow-hidden p-0"
      >
        <div className="flex justify-between items-center border-b p-3">
          <Heading level={2}>New Request</Heading>
          <DialogClose asChild>
            <Button size="icon" variant="outline">
              <X className="w-4 h-4" />
            </Button>
          </DialogClose>
        </div>

        <div className="max-h-[70vh] space-y-5 overflow-y-auto px-6 py-5">
          <div className="space-y-1.5">
            <Label>Title</Label>
            <Input
              placeholder="What is this request for?"
              value={title}
              onChange={(e) => {
                return setTitle(e.target.value);
              }}
              disabled={isSaving}
            />
          </div>

          <div className="space-y-1.5">
            <Label>Description</Label>
            <Textarea
              rows={3}
              value={description}
              onChange={(e) => {
                return setDescription(e.target.value);
              }}
              disabled={isSaving}
            />
          </div>

          <div className="space-y-1.5">
            <Label>Amount</Label>
            <Input
              type="number"
              min={0}
              placeholder="0.00"
              value={amount}
              onChange={(e) => {
                return setAmount(e.target.value);
              }}
              disabled={isSaving}
            />
          </div>
        </div>

        <div className="flex justify-end border-t px-6 py-4">
          <Button onClick={handleSave} disabled={isSaving}>
            {isSaving ? (
              <span className="flex items-center gap-2">
                <Loader size="w-4 h-4" showShadow={false} />
                Submitting...
              </span>
            ) : (
              "Submit Request"
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export function DepartmentRequisitionsTab({
  departmentId,
}: {
  departmentId: string;
}) {
  const { toast } = useToast();
  const canSubmit = useHasAccess("REQUESTS", "MANAGE");

  const [requisitions, setRequisitions] = useState<RequisitionResponse[]>([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    try {
      const { data } = await fetchRequisitions({ departmentId, limit: 50 });
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
  }, [departmentId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {canSubmit && (
        <div className="flex justify-end">
          <NewRequestDialog departmentId={departmentId} onCreated={load} />
        </div>
      )}

      {requisitions.length === 0 ? (
        <div className="p-6 text-center text-gray-500">
          No requests yet
          {canSubmit ? " - use New Request to submit one." : "."}
        </div>
      ) : (
        <div className="divide-y border rounded-xl overflow-hidden bg-white">
          {requisitions.map((req) => {
            return (
              <div key={req.id} className="p-4 space-y-1">
                <div className="flex items-center justify-between gap-3">
                  <Text className="font-semibold">{req.title}</Text>
                  <Badge
                    variant="outline"
                    className={STATUS_STYLES[req.status]}
                  >
                    {req.status}
                  </Badge>
                </div>
                {req.description && (
                  <Text variant="muted" className="text-sm">
                    {req.description}
                  </Text>
                )}
                <div className="flex items-center justify-between text-sm text-gray-500">
                  <span>{format(new Date(req.createdAt), "MMM d, yyyy")}</span>
                  <span className="font-medium text-gray-900">
                    {formatCurrency(req.amount, req.currency)}
                  </span>
                </div>
                {req.status === RequisitionStatus.REJECTED &&
                  req.reviewNote && (
                    <Text className="text-sm text-red-600">
                      Reason: {req.reviewNote}
                    </Text>
                  )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
