"use client";

import { ChevronDown, ChevronUp, Search } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Span, Text } from "@/components/ui/typography/Text";
import {
  FilterSection,
  Gender,
  MaritalStatus,
  MembershipStatus,
} from "@/lib/enums";
import { FilterProps } from "@/lib/interface";
import { formatLabel } from "@/utils/helpers";

const FilterDropdown = ({
  filters,
  setFilters,
  searchQuery,
  setSearchQuery,
}: FilterProps) => {
  const [openSection, setOpenSection] = useState("gender");
  const [open, setOpen] = useState(false);

  const toggleSection = (section: FilterSection) => {
    setOpenSection((prev) => (prev === section ? "" : section));
  };

  const pillClass = (active: boolean) =>
    `flex-1 text-xs px-2.5 py-1.5 rounded-md border transition
     ${active ? "bg-blue-50 border-blue-600 text-gray-700" : "bg-white border-gray-300 text-gray-700 hover:bg-gray-100"}`;

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <Button
          variant="filter"
          className="border px-4 py-2 rounded-lg bg-white flex items-center gap-2"
        >
          Filter <Span>▾</Span>
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        align="end"
        className="w-64 bg-gray-50 rounded-2xl shadow-xl border p-3"
      >
        <div className="flex justify-between items-center mb-2.5">
          <Text>Member Filter</Text>
          <Button
            variant="ghost"
            onClick={() => setOpen(false)}
            className="h-7 w-7 p-0 rounded-full hover:bg-gray-200"
          >
            ✕
          </Button>
        </div>

        <div className="relative mb-3">
          <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-400" />
          <Input
            placeholder="Search by name..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-8 h-8 text-xs"
          />
        </div>

        <div className="mb-2 border-t">
          <Button
            variant="filterHeader"
            onClick={() => toggleSection(FilterSection.GENDER)}
            className="w-full flex justify-between items-center"
          >
            Gender
            {openSection === FilterSection.GENDER ? (
              <ChevronUp className="h-5 w-5 text-gray-500" />
            ) : (
              <ChevronDown className="h-5 w-5 text-gray-500" />
            )}
          </Button>

          {openSection === FilterSection.GENDER && (
            <div className="flex gap-1.5 mt-2">
              {Object.values(Gender).map((gender) => (
                <Button
                  variant="filter"
                  key={gender}
                  onClick={() =>
                    setFilters({
                      ...filters,
                      gender: filters.gender === gender ? null : gender,
                    })
                  }
                  className={pillClass(filters.gender === gender)}
                >
                  {formatLabel(gender)}
                </Button>
              ))}
            </div>
          )}
        </div>

        <div className="py-2 border-t">
          <Button
            variant="filterHeader"
            onClick={() => toggleSection(FilterSection.MARITAL)}
            className="w-full flex justify-between items-center"
          >
            Marital Status
            {openSection === FilterSection.MARITAL ? (
              <ChevronUp className="h-5 w-5 text-gray-500" />
            ) : (
              <ChevronDown className="h-5 w-5 text-gray-500" />
            )}
          </Button>

          {openSection === FilterSection.MARITAL && (
            <div className="grid grid-cols-2 gap-1.5 mt-2">
              {Object.values(MaritalStatus).map((status) => (
                <Button
                  key={status}
                  variant="filter"
                  onClick={() =>
                    setFilters({
                      ...filters,
                      maritalStatus:
                        filters.maritalStatus === status ? null : status,
                    })
                  }
                  className={pillClass(filters.maritalStatus === status)}
                >
                  {formatLabel(status)}
                </Button>
              ))}
            </div>
          )}
        </div>

        <div className="py-2 border-t">
          <Button
            variant="filterHeader"
            onClick={() => toggleSection(FilterSection.MEMBERSHIP)}
            className="w-full flex justify-between items-center"
          >
            Membership Status
            {openSection === FilterSection.MEMBERSHIP ? (
              <ChevronUp className="h-5 w-5 text-gray-500" />
            ) : (
              <ChevronDown className="h-5 w-5 text-gray-500" />
            )}
          </Button>

          {openSection === FilterSection.MEMBERSHIP && (
            <div className="grid grid-cols-2 gap-1.5 mt-2">
              {Object.values(MembershipStatus).map((status) => (
                <Button
                  variant="filter"
                  key={status}
                  onClick={() =>
                    setFilters({
                      ...filters,
                      membershipStatus:
                        filters.membershipStatus === status ? null : status,
                    })
                  }
                  className={pillClass(filters.membershipStatus === status)}
                >
                  {formatLabel(status)}
                </Button>
              ))}
            </div>
          )}
        </div>

        <Button
          onClick={() => setOpen(false)}
          className="w-full mt-3 h-9 text-sm font-medium"
        >
          Save
        </Button>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default FilterDropdown;
