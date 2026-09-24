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
import { useTitles } from "@/hooks/use-titles";
import { TITLE_MAX_LENGTH } from "@/lib/titles";

function normalizeTitleQuery(value: string): string {
  return value.toLowerCase().replace(/[.\s]/g, "");
}

interface TitleComboboxProps {
  value?: string;
  onChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
}

// Searchable title picker: type-ahead over the church's configured title
// list (case/punctuation-insensitive), with a "Use '...'" fallback so any
// custom title up to 50 chars can still be entered when nothing matches.
// The list itself is managed at Settings > Titles & Locations.
export function TitleCombobox({
  value,
  onChange,
  placeholder = "Select or type a title",
  disabled,
}: TitleComboboxProps) {
  const { titles, isLoading } = useTitles();
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");

  const activeLabels = useMemo(
    () => titles.filter((t) => t.isActive).map((t) => t.name),
    [titles],
  );

  const filteredLabels = useMemo(() => {
    const query = normalizeTitleQuery(search);
    if (!query) return activeLabels;
    return activeLabels.filter((label) =>
      normalizeTitleQuery(label).includes(query),
    );
  }, [activeLabels, search]);

  const trimmedSearch = search.trim();
  const hasExactMatch = activeLabels.some(
    (label) => normalizeTitleQuery(label) === normalizeTitleQuery(trimmedSearch),
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
            onValueChange={(v) => setSearch(v.slice(0, TITLE_MAX_LENGTH))}
            placeholder="Search titles..."
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
