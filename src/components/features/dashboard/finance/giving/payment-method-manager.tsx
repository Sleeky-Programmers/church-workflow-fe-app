"use client";

import { AlertTriangle, ChevronLeft, ChevronRight, Trash2 } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { Loader } from "@/components/ui/loader";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Text } from "@/components/ui/typography/Text";
import { useToast } from "@/hooks/use-toast";
import {
  createPaymentMethod,
  deletePaymentMethod,
  fetchPaymentMethodPresets,
  fetchPaymentMethods,
  PaymentMethod,
  PaymentMethodPreset,
  updatePaymentMethod,
} from "@/services/paymentMethodService";

const PAGE_SIZE = 9;

export function PaymentMethodManager() {
  const { toast } = useToast();
  const [methods, setMethods] = useState<PaymentMethod[]>([]);
  const [presets, setPresets] = useState<PaymentMethodPreset[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [pendingDelete, setPendingDelete] = useState<PaymentMethod | null>(
    null,
  );
  const [selectedPreset, setSelectedPreset] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  const totalPages = Math.max(1, Math.ceil(methods.length / PAGE_SIZE));
  const pagedMethods = useMemo(() => {
    return methods.slice(
      (currentPage - 1) * PAGE_SIZE,
      currentPage * PAGE_SIZE,
    );
  }, [methods, currentPage]);

  const load = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const [methodsData, presetsData] = await Promise.all([
        fetchPaymentMethods(),
        fetchPaymentMethodPresets(),
      ]);
      setMethods(
        [...methodsData].sort((a, b) => {
          return a.sortOrder - b.sortOrder;
        }),
      );
      setPresets(presetsData);
    } catch (err: any) {
      setError(err.message || "Failed to load payment methods");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

  const availablePresets = useMemo(() => {
    return presets.filter((preset) => {
      return !methods.some((m) => {
        return m.code === preset.code;
      });
    });
  }, [presets, methods]);

  const handleAdd = async () => {
    if (!selectedPreset) {
      return;
    }
    setIsSaving(true);
    setError(null);
    try {
      await createPaymentMethod({
        code: selectedPreset,
        sortOrder: methods.length,
      });
      setSelectedPreset("");
      await load();
      toast({ title: "Success", description: "Payment method added" });
    } catch (err: any) {
      setError(err.message || "Failed to add payment method");
    } finally {
      setIsSaving(false);
    }
  };

  const handleToggleActive = async (method: PaymentMethod) => {
    setError(null);
    try {
      await updatePaymentMethod(method.id, { isActive: !method.isActive });
      await load();
    } catch (err: any) {
      setError(err.message || "Failed to update payment method");
    }
  };

  const handleConfirmDelete = async () => {
    if (!pendingDelete) {
      return;
    }
    const method = pendingDelete;
    setDeletingId(method.id);
    setError(null);
    try {
      await deletePaymentMethod(method.id);
      await load();
      toast({ title: "Success", description: "Payment method deleted" });
    } catch (err: any) {
      setError(err.message || "Failed to delete payment method");
    } finally {
      setDeletingId(null);
      setPendingDelete(null);
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-300 p-5 space-y-4">
      <div className="flex items-center justify-between">
        <Text className="font-bold text-black">Payment Methods</Text>
        <Text variant="muted" className="text-sm">
          {methods.length} total
        </Text>
      </div>

      {error && (
        <div className="flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
          <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      <div className="flex items-center gap-2 pb-4 border-b">
        <Select
          value={selectedPreset}
          onValueChange={setSelectedPreset}
          disabled={isSaving || !availablePresets.length}
        >
          <SelectTrigger>
            <SelectValue
              placeholder={
                availablePresets.length
                  ? "Select a payment method to add"
                  : "All presets added"
              }
            />
          </SelectTrigger>
          <SelectContent>
            {availablePresets.map((preset) => {
              return (
                <SelectItem key={preset.code} value={preset.code}>
                  {preset.name}
                </SelectItem>
              );
            })}
          </SelectContent>
        </Select>
        <Button onClick={handleAdd} disabled={isSaving || !selectedPreset}>
          Add
        </Button>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-10">
          <Loader size="w-8 h-8" showShadow={false} />
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3">
            {pagedMethods.map((method) => {
              return (
                <div
                  key={method.id}
                  className="rounded-xl border border-gray-200 p-3 flex flex-col gap-2 hover:border-gray-300 transition-colors"
                >
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-gray-900 truncate">
                      {method.name}
                    </p>
                    <span
                      className={`inline-block mt-1 text-[11px] px-1.5 py-0.5 rounded-full ${
                        method.isActive
                          ? "bg-green-50 text-green-700"
                          : "bg-gray-100 text-gray-500"
                      }`}
                    >
                      {method.isActive ? "Active" : "Inactive"}
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5 pt-1">
                    <Button
                      size="sm"
                      variant={method.isActive ? "outline" : "secondary"}
                      className="h-7 px-2 text-xs"
                      onClick={() => {
                        return handleToggleActive(method);
                      }}
                    >
                      {method.isActive ? "Deactivate" : "Activate"}
                    </Button>
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-7 w-7 text-red-500 hover:text-red-600 ml-auto"
                      disabled={deletingId === method.id}
                      onClick={() => {
                        return setPendingDelete(method);
                      }}
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>

          {!methods.length && (
            <Text variant="muted" className="text-sm py-4 text-center">
              No payment methods configured yet. Add one below to make it
              available church-wide.
            </Text>
          )}

          {totalPages > 1 && (
            <div className="flex items-center justify-between border-t pt-3">
              <Button
                size="sm"
                variant="outline"
                disabled={currentPage === 1}
                onClick={() => {
                  return setCurrentPage((p) => {
                    return Math.max(1, p - 1);
                  });
                }}
              >
                <ChevronLeft className="h-4 w-4" />
                Previous
              </Button>
              <Text variant="muted" className="text-sm">
                Page {currentPage} of {totalPages}
              </Text>
              <Button
                size="sm"
                variant="outline"
                disabled={currentPage === totalPages}
                onClick={() => {
                  return setCurrentPage((p) => {
                    return Math.min(totalPages, p + 1);
                  });
                }}
              >
                Next
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          )}
        </>
      )}

      <ConfirmDialog
        open={!!pendingDelete}
        onOpenChange={(open) => {
          return !open && setPendingDelete(null);
        }}
        title={`Delete "${pendingDelete?.name}"?`}
        description="This permanently removes the payment method. If it's used by existing giving records, deletion will be blocked - deactivate it instead. This action cannot be undone."
        confirmLabel="Delete"
        isConfirming={deletingId === pendingDelete?.id}
        onConfirm={handleConfirmDelete}
      />
    </div>
  );
}
