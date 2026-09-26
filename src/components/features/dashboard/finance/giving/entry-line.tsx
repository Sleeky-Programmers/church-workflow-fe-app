"use client";

import { Trash2 } from "lucide-react";

import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import {
  Currency,
  GivingBatchEntryPayload,
  OfferingType,
} from "@/services/givingService";
import { PaymentMethod } from "@/services/paymentMethodService";

interface EntryLineProps {
  entry: GivingBatchEntryPayload;
  offeringTypes: OfferingType[];
  currencies: Currency[];
  paymentMethods: PaymentMethod[];
  onChange: (entry: GivingBatchEntryPayload) => void;
  onRemove: () => void;
  canRemove: boolean;
  disabled?: boolean;
}

export function EntryLine({
  entry,
  offeringTypes,
  currencies,
  paymentMethods,
  onChange,
  onRemove,
  canRemove,
  disabled,
}: EntryLineProps) {
  const showCurrencySelect = currencies.length > 1;

  const handleAmountChange = (raw: string) => {
    const normalized = raw.replace(/,/g, "");
    if (normalized !== "" && Number.isNaN(Number(normalized))) return;
    onChange({ ...entry, amount: normalized === "" ? 0 : Number(normalized) });
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-[1.4fr_1fr_0.8fr_1fr_auto] gap-3 items-end rounded-xl border border-gray-200 p-3">
      <div className="space-y-1.5">
        <label className="text-xs font-medium text-gray-500">
          Offering Type
        </label>
        <Select
          value={entry.offeringTypeId}
          onValueChange={(value) =>
            onChange({ ...entry, offeringTypeId: value })
          }
          disabled={disabled}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select type" />
          </SelectTrigger>
          <SelectContent>
            {offeringTypes.map((type) => (
              <SelectItem key={type.id} value={type.id}>
                {type.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-1.5">
        <label className="text-xs font-medium text-gray-500">Amount</label>
        <Input
          inputMode="decimal"
          placeholder="0.00"
          value={
            entry.amount
              ? entry.amount.toLocaleString("en-US", {
                  maximumFractionDigits: 2,
                })
              : ""
          }
          onChange={(e) => handleAmountChange(e.target.value)}
          disabled={disabled}
        />
      </div>

      {showCurrencySelect && (
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-gray-500">Currency</label>
          <Select
            value={entry.currencyCode}
            onValueChange={(value) =>
              onChange({ ...entry, currencyCode: value })
            }
            disabled={disabled}
          >
            <SelectTrigger>
              <SelectValue placeholder="Currency" />
            </SelectTrigger>
            <SelectContent>
              {currencies.map((currency) => (
                <SelectItem key={currency.id} value={currency.code}>
                  {currency.code}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      <div className="space-y-1.5">
        <label className="text-xs font-medium text-gray-500">
          Payment Method
        </label>
        <Select
          value={entry.paymentMethod}
          onValueChange={(value) =>
            onChange({ ...entry, paymentMethod: value })
          }
          disabled={disabled}
        >
          <SelectTrigger>
            <SelectValue placeholder="Method" />
          </SelectTrigger>
          <SelectContent>
            {paymentMethods.map((method) => (
              <SelectItem key={method.code} value={method.code}>
                {method.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <Button
        type="button"
        variant="ghost"
        size="icon"
        onClick={onRemove}
        disabled={!canRemove || disabled}
        className="justify-self-start sm:justify-self-center"
      >
        <Trash2 className="w-4 h-4 text-red-500" />
      </Button>
    </div>
  );
}
