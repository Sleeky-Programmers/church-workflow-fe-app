"use client";

import { useState, useEffect } from "react";
import { Check, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { FetchMembersResponse } from "@/services/memberService";
import { AdminListResponse, AdminResponse } from "@/lib/interface";
import { useDebounce } from "@/hooks/use-debounce";
import {
  Command,
  CommandEmpty,
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
import { MemberProfile } from "@/types";
import { Checkbox } from "@/components/ui/checkbox";

type FetchOptionsParams = {
  page?: number;
  limit?: number;
  search?: string;
};

type SelectOption = {
  id: string;
  fullName: string;
};

interface MemberSingleSelectProps {
  fetchOptions: (params: FetchOptionsParams) => Promise<{
    data: { id: string; fullName: string }[];
    pagination?: any;
  }>;
  value: string;
  onChange: (id: string) => void;
  placeholder?: string;
}

export function MemberSingleSelect({
  fetchOptions,
  value,
  onChange,
  placeholder = "Select or search",
}: MemberSingleSelectProps) {
  const [open, setOpen] = useState(false);
  const [options, setOptions] = useState<SelectOption[]>([]);
  const [selectedOption, setSelectedOption] = useState<SelectOption | null>(
    null,
  );
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);

  const debouncedSearch = useDebounce(search, 400);

  useEffect(() => {
    const load = async () => {
      const response = await fetchOptions({
        page: 1,
        limit: 10,
        search: debouncedSearch,
      });

      setOptions(response.data);
      setPage(1);
    };

    load();
  }, [debouncedSearch, fetchOptions]);

  useEffect(() => {
    const found = options.find((member) => member.id === value);
    if (found) {
      setSelectedOption(found);
    }
  }, [options, value]);

  const loadMore = async () => {
    const next = page + 1;

    const response = await fetchOptions({
      page: next,
      limit: 10,
      search: debouncedSearch,
    });

    setOptions((prev) => [...prev, ...response.data]);
    setPage(next);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="ghost" className="w-full border justify-between">
          {selectedOption ? selectedOption.fullName : placeholder}
          <ChevronDown className="w-4 h-4 opacity-50" />
        </Button>
      </PopoverTrigger>

      <PopoverContent className="p-0 w-full">
        <Command>
          <CommandInput onValueChange={setSearch} placeholder="Search..." />

          <CommandList>
            <CommandEmpty>No results</CommandEmpty>

            <CommandGroup>
              {options.map((hod) => (
                <CommandItem
                  key={hod.id}
                  onSelect={() => {
                    onChange(hod.id);
                    setSelectedOption(hod);
                    setOpen(false);
                  }}
                >
                  {hod.fullName}
                  <Check
                    className={`ml-auto ${
                      value === hod.id ? "opacity-100" : "opacity-0"
                    }`}
                  />
                </CommandItem>
              ))}
            </CommandGroup>

            <div className="p-2">
              <Button
                onClick={loadMore}
                variant="ghost"
                size="sm"
                className="w-full"
              >
                Load more
              </Button>
            </div>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}

interface MemberMultiSelectProps {
  fetchOptions: (
    page: number,
    limit: number,
    search?: string,
  ) => Promise<FetchMembersResponse>;
  value: string[];
  onChange: (ids: string[], members: MemberProfile[]) => void;
  placeholder?: string;
}

export function MemberMultiSelect({
  fetchOptions,
  value,
  onChange,
  placeholder = "Select or search",
}: MemberMultiSelectProps) {
  const [open, setOpen] = useState(false);
  const [options, setOptions] = useState<MemberProfile[]>([]);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);

  const debouncedSearch = useDebounce(search, 400);

  useEffect(() => {
    const load = async () => {
      const response = await fetchOptions(1, 10, debouncedSearch);
      setOptions(response.data);
      setPage(1);
    };
    load();
  }, [debouncedSearch, fetchOptions]);

  const loadMore = async () => {
    const next = page + 1;
    const response = await fetchOptions(next, 10, debouncedSearch);
    setOptions((prev) => [...prev, ...response.data]);
    setPage(next);
  };

  const summary =
    value.length === 0
      ? placeholder
      : value.length <= 2
        ? options
            .filter((member) => value.includes(member.id))
            .map((member) => member.fullName)
            .join(", ")
        : `${value.length} members selected`;

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="ghost" className="w-full border justify-between">
          {summary}
          <ChevronDown className="w-4 h-4 opacity-50" />
        </Button>
      </PopoverTrigger>

      <PopoverContent className="p-0 w-full">
        <Command>
          <CommandInput onValueChange={setSearch} placeholder="Search..." />

          <CommandList>
            <CommandEmpty>No results</CommandEmpty>

            <CommandGroup>
              {options.map((member) => {
                const selected = value.includes(member.id);

                return (
                  <CommandItem
                    key={member.id}
                    onSelect={() => {
                      const newIds = selected
                        ? value.filter((id) => id !== member.id)
                        : [...value, member.id];

                      const selectedMembers = options.filter((option) =>
                        newIds.includes(option.id),
                      );

                      onChange(newIds, selectedMembers);
                    }}
                  >
                    {member.fullName}
                    <Checkbox checked={selected} className="ml-auto" />
                  </CommandItem>
                );
              })}
            </CommandGroup>

            <div className="p-2">
              <Button
                onClick={loadMore}
                variant="ghost"
                size="sm"
                className="w-full"
              >
                Load more
              </Button>
            </div>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
