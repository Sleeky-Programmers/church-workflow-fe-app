"use client";

import { useState } from "react";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
} from "@/components/ui/dropdown-menu";

import { MaritalStatus, MembershipStatus, Gender } from "@/lib/enums";
import { Span, Text } from "@/components/ui/typography/Text";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search } from "lucide-react";
import { formatLabel } from "@/utils/helpers";
import { FilterProps } from "@/lib/interface";

const FilterDropdown = ({
  filters,
  setFilters,
  searchQuery,
  setSearchQuery,
}: FilterProps) => {
  const [openSection, setOpenSection] = useState("gender");
  const [open, setOpen] = useState(false);

  const toggleSection = (section: string) => {
    setOpenSection((prev) => (prev === section ? "" : section));
  };

  const pillClass = (active: boolean) =>
    `px-2 py-1.5 rounded-md text-xs border transition
     bg-transparent hover:bg-transparent active:bg-transparent
     ${
       active
         ? "border-blue-600 text-blue-600"
         : "border-gray-300 text-gray-700"
     }`;

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <Button
          variant="filter"
          className="border px-4 py-2 rounded-lg bg-white flex items-center gap-2"
        >
          Filter
          <Span>▾</Span>
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        align="end"
        className="w-64 bg-gray-50 rounded-2xl shadow-xl border p-3"
      >
        <div className="flex justify-between mb-4">
          <Text>Member Filter</Text>
          <Button
            variant="ghost"
            onClick={() => setOpen(false)}
            className="h-7 w-7 p-0 rounded-full hover:bg-gray-200"
          >
            ✕
          </Button>
        </div>

        <div className="relative w-full mb-3">
          <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-400 pointer-events-none" />
          <Input
            placeholder="Search by name..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-8 h-8 text-xs"
          />
        </div>

        <div className="py-2">
          <Button
            variant="filterHeader"
            onClick={() => toggleSection("gender")}
            className="w-full flex justify-between"
          >
            Gender
            <Span>{openSection === "gender" ? "▴" : "▾"}</Span>
          </Button>

          {openSection === "gender" && (
            <div className="flex gap-2 mt-3">
              {Object.values(Gender).map((gender) => (
                <Button
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

        <div className="py-3 border-t">
          <Button
            variant="filterHeader"
            onClick={() => toggleSection("marital")}
            className="w-full flex justify-between"
          >
            Marital Status
            <Span>{openSection === "marital" ? "▴" : "▾"}</Span>
          </Button>

          {openSection === "marital" && (
            <div className="grid grid-cols-2 gap-2 mt-3">
              {Object.values(MaritalStatus).map((status) => (
                <Button
                  key={status}
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

        <div className="py-3 border-t">
          <Button
            variant="filterHeader"
            onClick={() => toggleSection("membership")}
            className="w-full flex justify-between"
          >
            Membership Status
            <Span>{openSection === "membership" ? "▴" : "▾"}</Span>
          </Button>

          {openSection === "membership" && (
            <div className="grid grid-cols-2 gap-2 mt-3">
              {Object.values(MembershipStatus).map((status) => (
                <Button
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

        <Button className="w-full mt-4 py-2 text-sm">Save</Button>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default FilterDropdown;
