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
import { useLocations } from "@/hooks/use-locations";

const LOCATION_MAX_LENGTH = 120;

function normalizeLocationQuery(value: string): string {
  return value.toLowerCase().trim();
}

interface LocationComboboxProps {
  value?: string;
  onChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
}

// Searchable location picker: type-ahead over the church's configured
// location list, with a "Use '...'" fallback so any custom location can
// still be entered when nothing matches. The list itself is managed at
// Settings > Titles & Locations.
export function LocationCombobox({
  value,
  onChange,
  placeholder = "Select or type a location",
  disabled,
}: LocationComboboxProps) {
  const { locations, isLoading } = useLocations();
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");

  const activeLabels = useMemo(
    () => locations.filter((l) => l.isActive).map((l) => l.name),
    [locations],
  );

  const filteredLabels = useMemo(() => {
    const query = normalizeLocationQuery(search);
    if (!query) return activeLabels;
    return activeLabels.filter((label) =>
      normalizeLocationQuery(label).includes(query),
    );
  }, [activeLabels, search]);

  const trimmedSearch = search.trim();
  const hasExactMatch = activeLabels.some(
    (label) =>
      normalizeLocationQuery(label) === normalizeLocationQuery(trimmedSearch),
  );

  const handleSelect = (label: string) => {
    onChange(label);
    setSearch("");
    setOpen(false);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="ghost"
          disabled={disabled || isLoading}
          className="w-full border justify-between font-normal"
        >
          <span className="truncate">{value || placeholder}</span>
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
            onValueChange={(v) => setSearch(v.slice(0, LOCATION_MAX_LENGTH))}
            placeholder="Search locations..."
          />

          <CommandList className="max-h-64">
            <CommandGroup>
              {filteredLabels.map((label) => (
                <CommandItem key={label} onSelect={() => handleSelect(label)}>
                  {label}
                  <Check
                    className={`ml-auto h-4 w-4 ${value === label ? "opacity-100" : "opacity-0"}`}
                  />
                </CommandItem>
              ))}
            </CommandGroup>

            {trimmedSearch && !hasExactMatch && (
              <CommandGroup>
                <CommandItem onSelect={() => handleSelect(trimmedSearch)}>
                  Use &ldquo;{trimmedSearch}&rdquo;
                </CommandItem>
              </CommandGroup>
            )}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
