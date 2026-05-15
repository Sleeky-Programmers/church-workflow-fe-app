"use client";

import { ChevronDown, ChevronUp, Search, X } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Span, Text } from "@/components/ui/typography/Text";
import { cn } from "@/lib/utils";

export interface FilterOption<T = string> {
  value: T;
  label: string;
}

export interface FilterSectionConfig<T = string> {
  id: string;
  title: string;
  options: FilterOption<T>[];
  selectedValue: T | null;
  onChange: (value: T | null) => void;
  columns?: 1 | 2 | 3;
}

export interface ReusableFilterDropdownProps {
  filterSections: FilterSectionConfig<any>[];
  searchQuery?: string;
  onSearchChange?: (query: string) => void;
  searchPlaceholder?: string;
  additionalSections?: React.ReactNode;
  title?: string;
  showClearAll?: boolean;
  onClearAll?: () => void;
  onSave?: () => void;
  saveButtonText?: string;
  triggerButtonText?: string;
  className?: string;
}

export const ReusableFilterDropdown = ({
  filterSections,
  searchQuery,
  onSearchChange,
  searchPlaceholder = "Search by name...",
  additionalSections,
  title = "Filter",
  showClearAll = false,
  onClearAll,
  onSave,
  saveButtonText = "Save",
  triggerButtonText = "Filter",
  className,
}: ReusableFilterDropdownProps) => {
  const [openSection, setOpenSection] = useState<string>(
    filterSections[0]?.id || "",
  );
  const [open, setOpen] = useState(false);

  const toggleSection = (sectionId: string) => {
    setOpenSection((prev) => (prev === sectionId ? "" : sectionId));
  };

  const pillClass = (active: boolean) =>
    cn(
      "flex-1 text-xs px-2.5 py-1.5 rounded-md border transition",
      active
        ? "bg-blue-50 border-blue-600 text-gray-700"
        : "bg-white border-gray-300 text-gray-700 hover:bg-gray-100",
    );

  const handleClose = () => {
    setOpen(false);
  };

  const handleSave = () => {
    onSave?.();
    handleClose();
  };

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <Button
          variant="filter"
          className={cn(
            "border px-4 py-2 rounded-lg bg-white flex items-center gap-2",
            className,
          )}
        >
          {triggerButtonText} <Span>▾</Span>
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        align="end"
        className="w-80 bg-gray-50 rounded-2xl shadow-xl border p-3 max-h-[80vh] overflow-y-auto"
      >
        <div className="flex justify-between items-center mb-2.5">
          <div className="flex items-center gap-2">
            <Text>{title}</Text>
            {showClearAll && onClearAll && (
              <Button
                variant="link"
                className="h-auto p-0 text-destructive text-xs"
                onClick={onClearAll}
              >
                Clear all
              </Button>
            )}
          </div>
          <Button
            variant="ghost"
            onClick={handleClose}
            className="h-7 w-7 p-0 rounded-full hover:bg-gray-200"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        {onSearchChange && (
          <div className="relative mb-3">
            <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-400" />
            <Input
              placeholder={searchPlaceholder}
              value={searchQuery || ""}
              onChange={(e) => onSearchChange(e.target.value)}
              className="pl-8 h-8 text-xs"
            />
          </div>
        )}

        {filterSections.map((section, index) => (
          <div
            key={section.id}
            className={index > 0 ? "py-2 border-t" : "mb-2 border-t"}
          >
            <Button
              variant="filterHeader"
              onClick={() => toggleSection(section.id)}
              className="w-full flex justify-between items-center"
            >
              {section.title}
              {openSection === section.id ? (
                <ChevronUp className="h-5 w-5 text-gray-500" />
              ) : (
                <ChevronDown className="h-5 w-5 text-gray-500" />
              )}
            </Button>

            {openSection === section.id && (
              <div
                className={cn(
                  "flex gap-1.5 mt-2",
                  section.columns === 2 && "grid grid-cols-2",
                  section.columns === 3 && "grid grid-cols-3",
                  !section.columns && "flex",
                )}
              >
                {section.options.map((option) => (
                  <Button
                    variant="filter"
                    key={String(option.value)}
                    onClick={() =>
                      section.onChange(
                        section.selectedValue === option.value
                          ? null
                          : option.value,
                      )
                    }
                    className={pillClass(
                      section.selectedValue === option.value,
                    )}
                  >
                    {option.label}
                  </Button>
                ))}
              </div>
            )}
          </div>
        ))}

        {additionalSections && (
          <div className="py-2 border-t space-y-3">{additionalSections}</div>
        )}

        <Button
          onClick={handleSave}
          className="w-full mt-3 h-9 text-sm font-medium"
        >
          {saveButtonText}
        </Button>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
