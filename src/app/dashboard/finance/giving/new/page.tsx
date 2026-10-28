"use client";

import { format } from "date-fns";
import { Plus } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useMemo, useState } from "react";

import { DuplicateWarningBanner } from "@/components/features/dashboard/finance/giving/duplicate-warning-banner";
import { EntryLine } from "@/components/features/dashboard/finance/giving/entry-line";
import { Button } from "@/components/ui/button";
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
import { Textarea } from "@/components/ui/textarea";
import Heading from "@/components/ui/typography/Heading";
import { Text } from "@/components/ui/typography/Text";
import { useToast } from "@/hooks/use-toast";
import { fetchAllServices } from "@/lib/api";
import {
  checkDuplicateGivingBatch,
  createGivingBatch,
  Currency,
  fetchCurrencies,
  fetchOfferingTypes,
  GivingBatchEntryPayload,
  OfferingType,
  submitGivingBatch,
} from "@/services/givingService";
import {
  fetchPaymentMethods,
  PaymentMethod,
} from "@/services/paymentMethodService";
import { formatCurrency } from "@/utils/currency";

type ServiceOption = { id: string; title: string };

function emptyEntry(
  offeringTypes: OfferingType[],
  defaultCurrency: string,
  paymentMethods: PaymentMethod[],
): GivingBatchEntryPayload {
  return {
    offeringTypeId:
      offeringTypes.find((t) => t.isDefault)?.id || offeringTypes[0]?.id || "",
    currencyCode: defaultCurrency,
    amount: 0,
    paymentMethod: paymentMethods[0]?.code || "",
  };
}

export default function NewGivingBatchPage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center py-20">
          <Loader size="w-10 h-10" showShadow={false} />
        </div>
      }
    >
      <NewGivingBatchContent />
    </Suspense>
  );
}

function NewGivingBatchContent() {
  const router = useRouter();
  const { toast } = useToast();
  const searchParams = useSearchParams();

  const [services, setServices] = useState<ServiceOption[]>([]);
  const [offeringTypes, setOfferingTypes] = useState<OfferingType[]>([]);
  const [currencies, setCurrencies] = useState<Currency[]>([]);
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [isLoadingOptions, setIsLoadingOptions] = useState(true);

  const [churchServiceId, setChurchServiceId] = useState(
    searchParams.get("churchServiceId") || "",
  );
  // The date is fixed to the service occurrence this batch is being
  // Recorded for - it's never editable in this form (see the read-only
  // Date field below).
  const [date] = useState(
    searchParams.get("date") || format(new Date(), "yyyy-MM-dd"),
  );
  const [countedWith, setCountedWith] = useState("");
  const [notes, setNotes] = useState("");
  const [entries, setEntries] = useState<GivingBatchEntryPayload[]>([]);

  const [duplicateBatchId, setDuplicateBatchId] = useState<string | undefined>(
    undefined,
  );
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    async function loadOptions() {
      setIsLoadingOptions(true);
      try {
        const [servicesData, offeringTypesData, currenciesData, paymentMethodsData] =
          await Promise.all([
            fetchAllServices(format(new Date(), "yyyy-MM")),
            fetchOfferingTypes(),
            fetchCurrencies(),
            fetchPaymentMethods(),
          ]);

        setServices(
          servicesData.map((s: any) => ({ id: s._id, title: s.title })),
        );

        const activeOfferingTypes = offeringTypesData.filter((t) => t.isActive);
        setOfferingTypes(activeOfferingTypes);

        const activeCurrencies = currenciesData.filter((c) => c.isActive);
        setCurrencies(activeCurrencies);

        const activePaymentMethods = paymentMethodsData.filter(
          (m) => m.isActive,
        );
        setPaymentMethods(activePaymentMethods);

        const defaultCurrency =
          activeCurrencies.find((c) => c.isDefault)?.code ||
          activeCurrencies[0]?.code ||
          "NGN";

        setEntries([
          emptyEntry(activeOfferingTypes, defaultCurrency, activePaymentMethods),
        ]);
      } catch (error: any) {
        toast({
          title: "Error",
          description: error.message || "Failed to load form options",
          variant: "destructive",
        });
      } finally {
        setIsLoadingOptions(false);
      }
    }

    loadOptions();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!churchServiceId || !date) {
      setDuplicateBatchId(undefined);
      return;
    }

    let cancelled = false;
    checkDuplicateGivingBatch({ churchServiceId, date })
      .then((res) => {
        if (!cancelled)
          setDuplicateBatchId(res.exists ? res.batchId : undefined);
      })
      .catch(() => {
        if (!cancelled) setDuplicateBatchId(undefined);
      });

    return () => {
      cancelled = true;
    };
  }, [churchServiceId, date]);

  const defaultCurrencyCode = useMemo(
    () =>
      currencies.find((c) => c.isDefault)?.code || currencies[0]?.code || "NGN",
    [currencies],
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
    setEntries((prev) => [
      ...prev,
      emptyEntry(offeringTypes, defaultCurrencyCode, paymentMethods),
    ]);
  };

  const handleEntryChange = (index: number, entry: GivingBatchEntryPayload) => {
    setEntries((prev) => prev.map((e, i) => (i === index ? entry : e)));
  };

  const handleRemoveEntry = (index: number) => {
    setEntries((prev) => prev.filter((_, i) => i !== index));
  };

  const isFormValid =
    churchServiceId &&
    date &&
    entries.length > 0 &&
    entries.every(
      (entry) =>
        entry.offeringTypeId &&
        entry.currencyCode &&
        entry.paymentMethod &&
        entry.amount > 0,
    );

  const handleSave = async (submitAfterSave: boolean) => {
    if (!isFormValid) {
      toast({
        title: "Missing information",
        description:
          "Select a service, date, and make sure every entry has a type, amount and payment method",
        variant: "destructive",
      });
      return;
    }

    setIsSaving(true);
    try {
      const batch = await createGivingBatch({
        churchServiceId,
        date,
        countedWith: countedWith.trim() || undefined,
        notes: notes.trim() || undefined,
        entries,
      });

      if (submitAfterSave) {
        await submitGivingBatch(batch.id);
      }

      toast({
        title: "Success",
        description: submitAfterSave
          ? "Giving batch submitted for confirmation"
          : "Giving batch saved as draft",
      });
      router.push(`/dashboard/finance/giving/${batch.id}`);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to save giving batch",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Heading level={2} text="New Giving Batch" />
      </div>

      {isLoadingOptions ? (
        <div className="flex items-center justify-center py-20">
          <Loader size="w-10 h-10" showShadow={false} />
        </div>
      ) : (
        <div className="space-y-6">
          {duplicateBatchId !== undefined && (
            <DuplicateWarningBanner batchId={duplicateBatchId} />
          )}

          <div className="bg-white rounded-2xl border border-gray-300 p-5 grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="space-y-1.5">
              <Label>Service</Label>
              <Select
                value={churchServiceId}
                onValueChange={setChurchServiceId}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a service" />
                </SelectTrigger>
                <SelectContent>
                  {services.map((service) => (
                    <SelectItem key={service.id} value={service.id}>
                      {service.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label>Date</Label>
              <Input type="date" value={date} disabled readOnly />
              <Text variant="muted" className="text-xs">
                Fixed to the service occurrence being recorded and can&apos;t
                be changed.
              </Text>
            </div>

            <div className="space-y-1.5">
              <Label>Counted With (optional)</Label>
              <Input
                placeholder="e.g. Second counter's name"
                value={countedWith}
                onChange={(e) => setCountedWith(e.target.value)}
              />
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-gray-300 p-5 space-y-4">
            <div className="flex items-center justify-between">
              <Text className="font-bold text-black">Entries</Text>
              <Button variant="outline" size="sm" onClick={handleAddEntry}>
                <Plus className="w-4 h-4" />
                Add Entry
              </Button>
            </div>

            <div className="space-y-3">
              {entries.map((entry, index) => (
                <EntryLine
                  key={index}
                  entry={entry}
                  offeringTypes={offeringTypes}
                  currencies={currencies}
                  paymentMethods={paymentMethods}
                  onChange={(next) => handleEntryChange(index, next)}
                  onRemove={() => handleRemoveEntry(index)}
                  canRemove={entries.length > 1}
                  disabled={isSaving}
                />
              ))}
            </div>

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
            <Label>Notes (optional)</Label>
            <Textarea
              rows={3}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Any additional context about this batch"
            />
          </div>

          <div className="flex justify-end gap-3">
            <Button
              variant="outline"
              disabled={isSaving}
              onClick={() => handleSave(false)}
            >
              Save as Draft
            </Button>
            <Button disabled={isSaving} onClick={() => handleSave(true)}>
              {isSaving ? "Saving..." : "Submit"}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
