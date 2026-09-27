"use client";

import { format } from "date-fns";
import { Plus } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

import { BatchStatusBadge } from "@/components/features/dashboard/finance/giving/batch-status-badge";
import { EntryLine } from "@/components/features/dashboard/finance/giving/entry-line";
import { VoidDialog } from "@/components/features/dashboard/finance/giving/void-dialog";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader } from "@/components/ui/loader";
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
import { fetchAllServices } from "@/lib/api";
import {
  confirmGivingBatch,
  Currency,
  fetchCurrencies,
  fetchGivingBatch,
  fetchOfferingTypes,
  GivingBatch,
  GivingBatchEntryPayload,
  OfferingType,
  submitGivingBatch,
  updateGivingBatch,
  voidGivingBatch,
} from "@/services/givingService";
import {
  fetchPaymentMethods,
  PaymentMethod,
} from "@/services/paymentMethodService";
import { formatCurrency } from "@/utils/currency";

type ServiceOption = { id: string; title: string };

export default function GivingBatchDetailPage() {
  const params = useParams();
  const id = Array.isArray(params?.id) ? params.id[0] : params?.id || "";
  const router = useRouter();
  const { toast } = useToast();
  const canManage = useHasAccess("GIVING", "MANAGE");
  const canFullAccess = useHasAccess("GIVING", "FULL_ACCESS");

  const [batch, setBatch] = useState<GivingBatch | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isActionLoading, setIsActionLoading] = useState(false);

  const [services, setServices] = useState<ServiceOption[]>([]);
  const [offeringTypes, setOfferingTypes] = useState<OfferingType[]>([]);
  const [currencies, setCurrencies] = useState<Currency[]>([]);
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);

  const [isEditing, setIsEditing] = useState(false);
  const [date, setDate] = useState("");
  const [countedWith, setCountedWith] = useState("");
  const [notes, setNotes] = useState("");
  const [entries, setEntries] = useState<GivingBatchEntryPayload[]>([]);

  const [voidDialogOpen, setVoidDialogOpen] = useState(false);
  const [editReasonDialogOpen, setEditReasonDialogOpen] = useState(false);
  const [editReason, setEditReason] = useState("");

  const load = async () => {
    setIsLoading(true);
    try {
      const [batchData, servicesData, offeringTypesData, currenciesData, paymentMethodsData] =
        await Promise.all([
          fetchGivingBatch(id),
          fetchAllServices(format(new Date(), "yyyy-MM")),
          fetchOfferingTypes(),
          fetchCurrencies(),
          fetchPaymentMethods(),
        ]);

      setBatch(batchData);
      setServices(
        servicesData.map((s: any) => ({ id: s._id, title: s.title })),
      );
      setOfferingTypes(offeringTypesData);
      setCurrencies(currenciesData);
      setPaymentMethods(paymentMethodsData);

      setDate(batchData.date?.slice(0, 10) || "");
      setCountedWith(batchData.countedWith || "");
      setNotes(batchData.notes || "");
      setEntries(
        (batchData.entries || []).map((entry) => ({
          offeringTypeId: entry.offeringTypeId,
          currencyCode: entry.currencyCode,
          amount: entry.amount,
          paymentMethod: entry.paymentMethod,
          note: entry.note,
        })),
      );
      setIsEditing(batchData.status === "draft");
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to load giving batch",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const activeOfferingTypes = useMemo(
    () => offeringTypes.filter((t) => t.isActive),
    [offeringTypes],
  );
  const activeCurrencies = useMemo(
    () => currencies.filter((c) => c.isActive),
    [currencies],
  );
  const activePaymentMethods = useMemo(
    () => paymentMethods.filter((m) => m.isActive),
    [paymentMethods],
  );

  const totalsByCurrency = useMemo(() => {
    const totals: Record<string, number> = {};
    for (const entry of entries) {
      if (!entry.currencyCode) continue;
      totals[entry.currencyCode] =
        (totals[entry.currencyCode] || 0) + (entry.amount || 0);
    }
    return totals;
  }, [entries]);

  const handleAddEntry = () => {
    const defaultCurrency =
      activeCurrencies.find((c) => c.isDefault)?.code ||
      activeCurrencies[0]?.code ||
      "NGN";
    setEntries((prev) => [
      ...prev,
      {
        offeringTypeId:
          activeOfferingTypes.find((t) => t.isDefault)?.id ||
          activeOfferingTypes[0]?.id ||
          "",
        currencyCode: defaultCurrency,
        amount: 0,
        paymentMethod: activePaymentMethods[0]?.code || "",
      },
    ]);
  };

  const handleEntryChange = (index: number, entry: GivingBatchEntryPayload) => {
    setEntries((prev) => prev.map((e, i) => (i === index ? entry : e)));
  };

  const handleRemoveEntry = (index: number) => {
    setEntries((prev) => prev.filter((_, i) => i !== index));
  };

  const isFormValid =
    date &&
    entries.length > 0 &&
    entries.every(
      (entry) =>
        entry.offeringTypeId &&
        entry.currencyCode &&
        entry.paymentMethod &&
        entry.amount > 0,
    );

  const persistChanges = async (reason?: string) => {
    if (!batch || !isFormValid) {
      toast({
        title: "Missing information",
        description:
          "Make sure every entry has a type, amount and payment method",
        variant: "destructive",
      });
      return;
    }

    setIsActionLoading(true);
    try {
      const updated = await updateGivingBatch(batch.id, {
        churchServiceId: batch.churchServiceId,
        date,
        countedWith: countedWith.trim() || undefined,
        notes: notes.trim() || undefined,
        entries,
        editReason: reason,
      });
      setBatch(updated);
      setIsEditing(updated.status === "draft");
      toast({ title: "Success", description: "Giving batch updated" });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to update giving batch",
        variant: "destructive",
      });
    } finally {
      setIsActionLoading(false);
      setEditReasonDialogOpen(false);
      setEditReason("");
    }
  };

  const handleSaveEdit = () => {
    if (!batch) return;
    if (batch.status === "confirmed") {
      setEditReasonDialogOpen(true);
      return;
    }
    persistChanges();
  };

  const handleSubmit = async () => {
    if (!batch) return;
    setIsActionLoading(true);
    try {
      const updated = await submitGivingBatch(batch.id);
      setBatch(updated);
      setIsEditing(false);
      toast({
        title: "Success",
        description: "Giving batch submitted for confirmation",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to submit giving batch",
        variant: "destructive",
      });
    } finally {
      setIsActionLoading(false);
    }
  };

  const handleConfirm = async () => {
    if (!batch) return;
    setIsActionLoading(true);
    try {
      const updated = await confirmGivingBatch(batch.id);
      setBatch(updated);
      toast({ title: "Success", description: "Giving batch confirmed" });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to confirm giving batch",
        variant: "destructive",
      });
    } finally {
      setIsActionLoading(false);
    }
  };

  const handleVoid = async (reason: string) => {
    if (!batch) return;
    setIsActionLoading(true);
    try {
      const updated = await voidGivingBatch(batch.id, reason);
      setBatch(updated);
      setVoidDialogOpen(false);
      toast({ title: "Success", description: "Giving batch voided" });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to void giving batch",
        variant: "destructive",
      });
    } finally {
      setIsActionLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader size="w-10 h-10" showShadow={false} />
      </div>
    );
  }

  if (!batch) {
    return (
      <div className="py-10 text-center">
        <Text variant="muted">Giving batch not found.</Text>
      </div>
    );
  }

  const canEditBatch =
    canManage && (batch.status === "draft" || batch.status === "confirmed");

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <SidebarTrigger className="sm:hidden" />
          <Heading level={2} text={batch.serviceTitle || "Giving Batch"} />
          <BatchStatusBadge status={batch.status} />
        </div>

        <div className="flex items-center gap-2">
          {canEditBatch && !isEditing && (
            <Button variant="outline" onClick={() => setIsEditing(true)}>
              Edit
            </Button>
          )}
          {canManage && batch.status === "draft" && !isEditing && (
            <Button onClick={handleSubmit} disabled={isActionLoading}>
              Submit
            </Button>
          )}
          {canManage && batch.status === "submitted" && (
            <Button onClick={handleConfirm} disabled={isActionLoading}>
              Confirm
            </Button>
          )}
          {canFullAccess && batch.status !== "voided" && (
            <Button
              variant="destructive"
              onClick={() => setVoidDialogOpen(true)}
              disabled={isActionLoading}
            >
              Void
            </Button>
          )}
        </div>
      </div>

      {batch.status === "voided" && batch.voidReason && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          <span className="font-semibold">Void reason: </span>
          {batch.voidReason}
        </div>
      )}

      <div className="bg-white rounded-2xl border border-gray-300 p-5 grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="space-y-1.5">
          <Label>Service</Label>
          {isEditing ? (
            <Select value={batch.churchServiceId} disabled>
              <SelectTrigger>
                <SelectValue
                  placeholder={
                    services.find((s) => s.id === batch.churchServiceId)
                      ?.title || batch.serviceTitle
                  }
                />
              </SelectTrigger>
              <SelectContent>
                {services.map((service) => (
                  <SelectItem key={service.id} value={service.id}>
                    {service.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          ) : (
            <Text>{batch.serviceTitle || "-"}</Text>
          )}
        </div>

        <div className="space-y-1.5">
          <Label>Date</Label>
          <Text>{format(new Date(batch.date), "MMM d, yyyy")}</Text>
          {isEditing && (
            <Text variant="muted" className="text-xs">
              Fixed to the service occurrence being recorded and can&apos;t be
              changed.
            </Text>
          )}
        </div>

        <div className="space-y-1.5">
          <Label>Counted With</Label>
          {isEditing ? (
            <Input
              value={countedWith}
              onChange={(e) => setCountedWith(e.target.value)}
            />
          ) : (
            <Text>{batch.countedWith || "-"}</Text>
          )}
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-300 p-5 space-y-4">
        <div className="flex items-center justify-between">
          <Text className="font-bold text-black">Entries</Text>
          {isEditing && (
            <Button variant="outline" size="sm" onClick={handleAddEntry}>
              <Plus className="w-4 h-4" />
              Add Entry
            </Button>
          )}
        </div>

        {isEditing ? (
          <div className="space-y-3">
            {entries.map((entry, index) => (
              <EntryLine
                key={index}
                entry={entry}
                offeringTypes={activeOfferingTypes}
                currencies={activeCurrencies}
                paymentMethods={activePaymentMethods}
                onChange={(next) => handleEntryChange(index, next)}
                onRemove={() => handleRemoveEntry(index)}
                canRemove={entries.length > 1}
                disabled={isActionLoading}
              />
            ))}
          </div>
        ) : (
          <div className="divide-y">
            {(batch.entries || []).map((entry, index) => (
              <div
                key={entry.id || index}
                className="flex items-center justify-between py-2 text-sm"
              >
                <div>
                  <span className="font-medium">
                    {entry.offeringTypeName || entry.offeringTypeId}
                  </span>
                  <span className="text-gray-400 ml-2">
                    {entry.paymentMethod}
                  </span>
                  {entry.note && (
                    <span className="text-gray-400 ml-2">- {entry.note}</span>
                  )}
                </div>
                <span className="font-semibold">
                  {formatCurrency(entry.amount, entry.currencyCode)}
                </span>
              </div>
            ))}
            {!(batch.entries || []).length && (
              <Text variant="muted" className="text-sm py-2">
                No entries recorded.
              </Text>
            )}
          </div>
        )}

        <div className="flex flex-wrap items-center gap-4 pt-2 border-t">
          {Object.entries(totalsByCurrency).map(([code, amount]) => (
            <div key={code} className="text-sm">
              <span className="text-gray-500">Total {code}: </span>
              <span className="font-semibold">
                {formatCurrency(amount, code)}
              </span>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-300 p-5 space-y-1.5">
        <Label>Notes</Label>
        {isEditing ? (
          <Textarea
            rows={3}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
          />
        ) : (
          <Text variant="muted">{batch.notes || "No notes"}</Text>
        )}
      </div>

      {isEditing && (
        <div className="flex justify-end gap-3">
          {batch.status !== "draft" && (
            <Button
              variant="outline"
              disabled={isActionLoading}
              onClick={() => {
                setIsEditing(false);
                load();
              }}
            >
              Cancel
            </Button>
          )}
          <Button onClick={handleSaveEdit} disabled={isActionLoading}>
            {isActionLoading ? "Saving..." : "Save Changes"}
          </Button>
        </div>
      )}

      <VoidDialog
        open={voidDialogOpen}
        onOpenChange={setVoidDialogOpen}
        onConfirm={handleVoid}
        isSubmitting={isActionLoading}
      />

      <Dialog
        open={editReasonDialogOpen}
        onOpenChange={setEditReasonDialogOpen}
      >
        <DialogContent className="sm:max-w-[420px]">
          <DialogHeader>
            <DialogTitle>Reason for editing a confirmed batch</DialogTitle>
          </DialogHeader>
          <div className="space-y-1.5">
            <Label>Reason</Label>
            <Textarea
              rows={3}
              value={editReason}
              onChange={(e) => setEditReason(e.target.value)}
              placeholder="e.g. Correcting a miscounted entry"
            />
          </div>
          <DialogFooter>
            <Button
              onClick={() => persistChanges(editReason.trim())}
              disabled={!editReason.trim() || isActionLoading}
            >
              {isActionLoading ? "Saving..." : "Save Changes"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
