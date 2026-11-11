"use client";

import { Check, ChevronDown } from "lucide-react";
import { useMemo, useState } from "react";

import { Button } from "@/components/ui/button";
import {
  Command,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  CURRENCY_CATALOG,
  CURRENCY_CATALOG_BY_CODE,
} from "@/lib/currency-catalog";

interface CurrencyComboboxProps {
  value?: string;
  onChange: (code: string) => void;
  excludeCodes?: string[];
  placeholder?: string;
  disabled?: boolean;
}

function normalizeQuery(value: string): string {
  return value.toLowerCase().trim();
}

// Searchable currency picker over the full bundled ISO 4217 catalog
// (@/lib/currency-catalog) - mirrors the Command/Popover pattern already
// Used by TitleCombobox. Selecting an entry here is the only input the
// "Add currency" form needs; symbol and name are derived from the code.
export function CurrencyCombobox({
  value,
  onChange,
  excludeCodes = [],
  placeholder = "Select a currency",
  disabled,
}: CurrencyComboboxProps) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");

  const excluded = useMemo(() => {
    return new Set(excludeCodes);
  }, [excludeCodes]);

  const options = useMemo(() => {
    return CURRENCY_CATALOG.filter((entry) => {
      return !excluded.has(entry.code);
    });
  }, [excluded]);

  const filteredOptions = useMemo(() => {
    const query = normalizeQuery(search);
    if (!query) {
      return options;
    }
    return options.filter((entry) => {
      return (
        entry.code.toLowerCase().includes(query) ||
        entry.name.toLowerCase().includes(query)
      );
    });
  }, [options, search]);

  const selected = value ? CURRENCY_CATALOG_BY_CODE[value] : undefined;

  const handleSelect = (code: string) => {
    onChange(code);
    setSearch("");
    setOpen(false);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="ghost"
          disabled={disabled}
          className="w-full border justify-between font-normal"
        >
          <span className="truncate">
            {selected
              ? `${selected.code} - ${selected.name} (${selected.symbol})`
              : placeholder}
          </span>
          <ChevronDown className="w-4 h-4 opacity-50 shrink-0" />
        </Button>
      </PopoverTrigger>

      <PopoverContent
        className="p-0"
        align="start"
        style={{ width: "var(--radix-popover-trigger-width)" }}
      >
        <Command shouldFilter={false}>
          <CommandInput
            value={search}
            onValueChange={setSearch}
            placeholder="Search by code or name..."
          />

          <CommandList className="max-h-64">
            <CommandGroup>
              {filteredOptions.map((entry) => {
                return (
                  <CommandItem
                    key={entry.code}
                    onSelect={() => {
                      return handleSelect(entry.code);
                    }}
                  >
                    <span className="truncate">
                      {entry.code} - {entry.name} ({entry.symbol})
                    </span>
                    <Check
                      className={`ml-auto h-4 w-4 shrink-0 ${
                        value === entry.code ? "opacity-100" : "opacity-0"
                      }`}
                    />
                  </CommandItem>
                );
              })}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
