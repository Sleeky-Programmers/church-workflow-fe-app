"use client";

import {
  AlertTriangle,
  Check,
  ChevronLeft,
  ChevronRight,
  Plus,
  Star,
  Trash2,
  X,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";

import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { CurrencyCombobox } from "@/components/ui/currency-combobox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader } from "@/components/ui/loader";
import { Text } from "@/components/ui/typography/Text";
import { useToast } from "@/hooks/use-toast";
import { CURRENCY_CATALOG_BY_CODE } from "@/lib/currency-catalog";
import {
  createCurrency,
  Currency,
  deleteCurrency,
  fetchCurrencies,
  setDefaultCurrency,
  updateCurrency,
} from "@/services/givingService";

const PAGE_SIZE = 9;

export function CurrencyManager() {
  const { toast } = useToast();
  const [currencies, setCurrencies] = useState<Currency[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingSymbol, setEditingSymbol] = useState("");
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [pendingDelete, setPendingDelete] = useState<Currency | null>(null);
  const [currentPage, setCurrentPage] = useState(1);

  const [selectedCode, setSelectedCode] = useState("");
  const selectedEntry = selectedCode
    ? CURRENCY_CATALOG_BY_CODE[selectedCode]
    : undefined;

  const totalPages = Math.max(1, Math.ceil(currencies.length / PAGE_SIZE));
  const pagedCurrencies = useMemo(
    () =>
      currencies.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE),
    [currencies, currentPage],
  );

  const load = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await fetchCurrencies();
      setCurrencies(data);
    } catch (err: any) {
      setError(err.message || "Failed to load currencies");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (currentPage > totalPages) setCurrentPage(totalPages);
  }, [currentPage, totalPages]);

  const handleAdd = async () => {
    if (!selectedEntry) {
      setError("Select a currency to add");
      return;
    }

    setIsSaving(true);
    setError(null);
    try {
      await createCurrency({
        code: selectedEntry.code,
        symbol: selectedEntry.symbol,
        name: selectedEntry.name,
      });
      setSelectedCode("");
      await load();
      toast({ title: "Success", description: "Currency added" });
    } catch (err: any) {
      setError(err.message || "Failed to add currency");
    } finally {
      setIsSaving(false);
    }
  };

  const handleToggleActive = async (currency: Currency) => {
    setError(null);
    try {
      await updateCurrency(currency.id, { isActive: !currency.isActive });
      await load();
    } catch (err: any) {
      setError(err.message || "Failed to update currency");
    }
  };

  const handleSetDefault = async (currency: Currency) => {
    setError(null);
    try {
      await setDefaultCurrency(currency.id);
      await load();
      toast({
        title: "Success",
        description: `${currency.code} is now the default currency`,
      });
    } catch (err: any) {
      setError(err.message || "Failed to set default currency");
    }
  };

  const handleConfirmDelete = async () => {
    if (!pendingDelete) return;
    const currency = pendingDelete;
    setDeletingId(currency.id);
    setError(null);
    try {
      await deleteCurrency(currency.id);
      await load();
      toast({ title: "Success", description: "Currency deleted" });
    } catch (err: any) {
      setError(err.message || "Failed to delete currency");
    } finally {
      setDeletingId(null);
      setPendingDelete(null);
    }
  };

  const handleStartEdit = (currency: Currency) => {
    setEditingId(currency.id);
    setEditingSymbol(currency.symbol);
  };

  const handleSaveEdit = async (currency: Currency) => {
    if (!editingSymbol.trim()) return;
    setError(null);
    try {
      await updateCurrency(currency.id, { symbol: editingSymbol.trim() });
      setEditingId(null);
      await load();
    } catch (err: any) {
      setError(err.message || "Failed to update currency symbol");
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-300 p-5 space-y-4">
      <div className="flex items-center justify-between">
        <Text className="font-bold text-black">Currencies</Text>
        <Text variant="muted" className="text-sm">
          {currencies.length} total
        </Text>
      </div>

      {error && (
        <div className="flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
          <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-[1.5fr_80px_1fr_auto] gap-2 pb-4 border-b items-end">
        <div className="space-y-1">
          <Label className="text-xs text-gray-500">Currency</Label>
          <CurrencyCombobox
            value={selectedCode}
            onChange={setSelectedCode}
            excludeCodes={currencies.map((c) => c.code)}
            disabled={isSaving}
          />
        </div>
        <div className="space-y-1">
          <Label className="text-xs text-gray-500">Symbol</Label>
          <Input
            value={selectedEntry?.symbol || ""}
            disabled
            readOnly
            className="bg-gray-100 text-gray-500"
          />
        </div>
        <div className="space-y-1">
          <Label className="text-xs text-gray-500">Name</Label>
          <Input
            value={selectedEntry?.name || ""}
            disabled
            readOnly
            className="bg-gray-100 text-gray-500"
          />
        </div>
        <Button onClick={handleAdd} disabled={isSaving || !selectedEntry}>
          <Plus className="w-4 h-4" />
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
            {pagedCurrencies.map((currency) => (
              <div
                key={currency.id}
                className="rounded-xl border border-gray-200 p-3 flex flex-col gap-2 hover:border-gray-300 transition-colors"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-gray-900">
                        {currency.code}
                      </span>
                      {editingId === currency.id ? (
                        <div className="flex items-center gap-1">
                          <Input
                            value={editingSymbol}
                            onChange={(e) => setEditingSymbol(e.target.value)}
                            className="h-7 w-16"
                            autoFocus
                          />
                          <Button
                            size="icon"
                            variant="ghost"
                            className="h-7 w-7"
                            onClick={() => handleSaveEdit(currency)}
                          >
                            <Check className="w-4 h-4 text-green-600" />
                          </Button>
                          <Button
                            size="icon"
                            variant="ghost"
                            className="h-7 w-7"
                            onClick={() => setEditingId(null)}
                          >
                            <X className="w-4 h-4" />
                          </Button>
                        </div>
                      ) : (
                        <span className="text-sm text-gray-500 truncate">
                          {currency.symbol}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-gray-500 truncate mt-0.5">
                      {currency.name}
                    </p>
                    <div className="flex items-center gap-1.5 mt-1">
                      <span
                        className={`text-[11px] px-1.5 py-0.5 rounded-full ${
                          currency.isActive
                            ? "bg-green-50 text-green-700"
                            : "bg-gray-100 text-gray-500"
                        }`}
                      >
                        {currency.isActive ? "Active" : "Inactive"}
                      </span>
                      {currency.isDefault && (
                        <span className="text-[11px] px-1.5 py-0.5 rounded-full bg-amber-50 text-amber-700">
                          default
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 pt-1">
                  <button
                    type="button"
                    onClick={() => handleSetDefault(currency)}
                    title={currency.isDefault ? "Default currency" : "Set as default"}
                  >
                    <Star
                      className={`w-4 h-4 ${
                        currency.isDefault
                          ? "fill-amber-400 text-amber-400"
                          : "text-gray-300 hover:text-amber-400"
                      }`}
                    />
                  </button>
                  <Button
                    size="sm"
                    variant={currency.isActive ? "outline" : "secondary"}
                    className="h-7 px-2 text-xs"
                    onClick={() => handleToggleActive(currency)}
                  >
                    {currency.isActive ? "Deactivate" : "Activate"}
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-7 px-2 text-xs"
                    onClick={() => handleStartEdit(currency)}
                  >
                    Edit symbol
                  </Button>
                  <Button
                    size="icon"
                    variant="ghost"
                    className="h-7 w-7 text-red-500 hover:text-red-600 ml-auto"
                    disabled={deletingId === currency.id}
                    onClick={() => setPendingDelete(currency)}
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </Button>
                </div>
              </div>
            ))}
          </div>

          {!currencies.length && (
            <Text variant="muted" className="text-sm py-4 text-center">
              No currencies configured yet.
            </Text>
          )}

          {totalPages > 1 && (
            <div className="flex items-center justify-between border-t pt-3">
              <Button
                size="sm"
                variant="outline"
                disabled={currentPage === 1}
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
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
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
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
        onOpenChange={(open) => !open && setPendingDelete(null)}
        title={`Delete "${pendingDelete?.code}"?`}
        description="This permanently removes the currency. If it's used by existing giving records, deletion will be blocked - deactivate it instead. This action cannot be undone."
        confirmLabel="Delete"
        isConfirming={deletingId === pendingDelete?.id}
        onConfirm={handleConfirmDelete}
      />
    </div>
  );
}
