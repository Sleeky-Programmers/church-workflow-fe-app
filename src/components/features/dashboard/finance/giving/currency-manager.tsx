"use client";

import { Check, Plus, Star, X } from "lucide-react";
import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader } from "@/components/ui/loader";
import { Text } from "@/components/ui/typography/Text";
import { useToast } from "@/hooks/use-toast";
import {
  createCurrency,
  Currency,
  fetchCurrencies,
  setDefaultCurrency,
  updateCurrency,
} from "@/services/givingService";

export function CurrencyManager() {
  const { toast } = useToast();
  const [currencies, setCurrencies] = useState<Currency[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingSymbol, setEditingSymbol] = useState("");

  const [newCode, setNewCode] = useState("");
  const [newSymbol, setNewSymbol] = useState("");
  const [newName, setNewName] = useState("");

  const load = async () => {
    setIsLoading(true);
    try {
      const data = await fetchCurrencies();
      setCurrencies(data);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to load currencies",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleAdd = async () => {
    if (!newCode.trim() || !newSymbol.trim() || !newName.trim()) {
      toast({
        title: "Missing information",
        description: "Code, symbol and name are all required",
        variant: "destructive",
      });
      return;
    }

    setIsSaving(true);
    try {
      await createCurrency({
        code: newCode.trim().toUpperCase(),
        symbol: newSymbol.trim(),
        name: newName.trim(),
      });
      setNewCode("");
      setNewSymbol("");
      setNewName("");
      await load();
      toast({ title: "Success", description: "Currency added" });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to add currency",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleToggleActive = async (currency: Currency) => {
    try {
      await updateCurrency(currency.id, { isActive: !currency.isActive });
      await load();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to update currency",
        variant: "destructive",
      });
    }
  };

  const handleSetDefault = async (currency: Currency) => {
    try {
      await setDefaultCurrency(currency.id);
      await load();
      toast({
        title: "Success",
        description: `${currency.code} is now the default currency`,
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to set default currency",
        variant: "destructive",
      });
    }
  };

  const handleStartEdit = (currency: Currency) => {
    setEditingId(currency.id);
    setEditingSymbol(currency.symbol);
  };

  const handleSaveEdit = async (currency: Currency) => {
    if (!editingSymbol.trim()) return;
    try {
      await updateCurrency(currency.id, { symbol: editingSymbol.trim() });
      setEditingId(null);
      await load();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to update currency symbol",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-300 p-5 space-y-4">
      <Text className="font-bold text-black">Currencies</Text>

      {isLoading ? (
        <div className="flex items-center justify-center py-8">
          <Loader size="w-8 h-8" showShadow={false} />
        </div>
      ) : (
        <div className="space-y-2">
          {currencies.map((currency) => (
            <div
              key={currency.id}
              className="flex items-center gap-2 rounded-lg border border-gray-200 px-3 py-2"
            >
              <button
                type="button"
                onClick={() => handleSetDefault(currency)}
                title={
                  currency.isDefault ? "Default currency" : "Set as default"
                }
              >
                <Star
                  className={`w-4 h-4 ${
                    currency.isDefault
                      ? "fill-amber-400 text-amber-400"
                      : "text-gray-300"
                  }`}
                />
              </button>

              <span className="w-14 text-sm font-semibold">
                {currency.code}
              </span>

              {editingId === currency.id ? (
                <div className="flex flex-1 items-center gap-2">
                  <Input
                    value={editingSymbol}
                    onChange={(e) => setEditingSymbol(e.target.value)}
                    className="h-8 w-20"
                  />
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={() => handleSaveEdit(currency)}
                  >
                    <Check className="w-4 h-4 text-green-600" />
                  </Button>
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={() => setEditingId(null)}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              ) : (
                <button
                  type="button"
                  className="flex-1 text-left text-sm"
                  onClick={() => handleStartEdit(currency)}
                >
                  {currency.symbol} - {currency.name}
                </button>
              )}

              <Button
                size="sm"
                variant={currency.isActive ? "outline" : "secondary"}
                onClick={() => handleToggleActive(currency)}
              >
                {currency.isActive ? "Active" : "Inactive"}
              </Button>
            </div>
          ))}

          {!currencies.length && (
            <Text variant="muted" className="text-sm">
              No currencies configured yet.
            </Text>
          )}
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-[80px_80px_1fr_auto] gap-2 pt-2 border-t">
        <Input
          placeholder="Code"
          value={newCode}
          onChange={(e) => setNewCode(e.target.value)}
          disabled={isSaving}
        />
        <Input
          placeholder="Symbol"
          value={newSymbol}
          onChange={(e) => setNewSymbol(e.target.value)}
          disabled={isSaving}
        />
        <Input
          placeholder="Name"
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
          disabled={isSaving}
        />
        <Button onClick={handleAdd} disabled={isSaving}>
          <Plus className="w-4 h-4" />
          Add
        </Button>
      </div>
    </div>
  );
}
