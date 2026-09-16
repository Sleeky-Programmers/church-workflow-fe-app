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
  findExactTitleMatch,
  normalizeTitleQuery,
  TITLE_CATEGORIES,
  TITLE_MAX_LENGTH,
} from "@/lib/titles";

interface TitleComboboxProps {
  value?: string;
  onChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
}

// Searchable title picker: type-ahead over the shared title catalog
// (case/punctuation-insensitive), with a "Use '...'" fallback so any custom
// title up to 50 chars can still be entered when nothing matches.
export function TitleCombobox({
  value,
  onChange,
  placeholder = "Select or type a title",
  disabled,
}: TitleComboboxProps) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");

  const filteredCategories = useMemo(() => {
    const query = normalizeTitleQuery(search);
    if (!query) return TITLE_CATEGORIES;

    const result: Record<string, string[]> = {};
    for (const [category, labels] of Object.entries(TITLE_CATEGORIES)) {
      const matches = labels.filter((label) =>
        normalizeTitleQuery(label).includes(query),
      );
      if (matches.length) result[category] = matches;
    }
    return result;
  }, [search]);

  const trimmedSearch = search.trim();
  const hasExactMatch = Boolean(findExactTitleMatch(trimmedSearch));

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
          disabled={disabled}
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
            {Object.entries(filteredCategories).map(([category, labels]) => (
              <CommandGroup key={category} heading={category}>
                {labels.map((label) => (
                  <CommandItem key={label} onSelect={() => handleSelect(label)}>
                    {label}
                    <Check
                      className={`ml-auto h-4 w-4 ${value === label ? "opacity-100" : "opacity-0"}`}
                    />
                  </CommandItem>
                ))}
              </CommandGroup>
            ))}

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
