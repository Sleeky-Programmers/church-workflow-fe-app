"use client";

import { useState, useEffect } from "react";
import { Check, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { FetchMembersResponse } from "@/services/memberService";
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
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationPrevious,
  PaginationNext,
} from "@/components/ui/pagination";

type FetchOptionsParams = {
  page?: number;
  limit?: number;
  search?: string;
};

type SelectOption = {
  id: string;
  fullName: string;
};

type SingleBaseProps = {
  value: string;
  onChange: (id: string) => void;
  placeholder?: string;
};

type SingleAsyncProps = {
  fetchOptions: (params: FetchOptionsParams) => Promise<{
    data: SelectOption[];
    pagination?: any;
  }>;
  options?: never;
};

type SingleStaticProps = {
  options: SelectOption[];
  fetchOptions?: never;
};

type MemberSingleSelectProps = SingleBaseProps &
  (SingleAsyncProps | SingleStaticProps);

export function MemberSingleSelect({
  fetchOptions,
  options,
  value,
  onChange,
  placeholder = "Select or search",
}: MemberSingleSelectProps) {
  const [open, setOpen] = useState(false);
  const [internalOptions, setInternalOptions] = useState<SelectOption[]>([]);
  const [selectedOption, setSelectedOption] = useState<SelectOption | null>(
    null,
  );
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState<any | null>(null);

  const debouncedSearch = useDebounce(search, 400);

  useEffect(() => {
    if (!fetchOptions) {
      return;
    }
    const load = async () => {
      const response = await fetchOptions({
        page: 1,
        limit: 10,
        search: debouncedSearch,
      });

      setInternalOptions(response.data);
      setPage(1);
      setPagination(response.pagination ?? null);
    };

    load();
  }, [debouncedSearch, fetchOptions]);

  useEffect(() => {
    if (options) {
      setInternalOptions(options);
    }
  }, [options]);

  useEffect(() => {
    const found = internalOptions.find((m) => {
      return m.id === value;
    });
    if (found) {
      setSelectedOption(found);
    }
  }, [internalOptions, value]);

  const loadMore = async () => {
    if (!fetchOptions) {
      return;
    }
    const next = page + 1;

    const response = await fetchOptions({
      page: next,
      limit: 10,
      search: debouncedSearch,
    });

    setInternalOptions((prev) => {
      return [...prev, ...response.data];
    });
    setPage(next);
    setPagination(response.pagination ?? null);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="ghost" className="w-full border justify-between">
          {selectedOption ? selectedOption.fullName : placeholder}
          <ChevronDown className="w-4 h-4 opacity-50" />
        </Button>
      </PopoverTrigger>

      <PopoverContent
        className="p-0"
        align="start"
        style={{ width: "var(--radix-popover-trigger-width)" }}
      >
        <Command>
          <CommandInput onValueChange={setSearch} placeholder="Search..." />

          <CommandList>
            <CommandEmpty>No results</CommandEmpty>

            <CommandGroup>
              {internalOptions.map((item) => {
                return (
                  <CommandItem
                    key={item.id}
                    onSelect={() => {
                      onChange(item.id);
                      setSelectedOption(item);
                      setOpen(false);
                    }}
                  >
                    {item.fullName}
                    <Check
                      className={`ml-auto ${
                        value === item.id ? "opacity-100" : "opacity-0"
                      }`}
                    />
                  </CommandItem>
                );
              })}
            </CommandGroup>

            {fetchOptions && (
              <div className="p-2">
                {pagination ? (
                  <Pagination className="w-full">
                    <div className="flex w-full items-center justify-between px-2">
                      <PaginationPrevious
                        onClick={async () => {
                          if (pagination.page <= 1) {
                            return;
                          }
                          const p = pagination.page - 1;
                          const response = await fetchOptions({
                            page: p,
                            limit: pagination.limit,
                            search: debouncedSearch,
                          });
                          setInternalOptions(response.data);
                          setPage(p);
                          setPagination(response.pagination ?? null);
                        }}
                      />

                      <PaginationContent>
                        {Array.from({ length: pagination.totalPages }).map(
                          (_, i) => {
                            return (
                              <PaginationItem key={i}>
                                <PaginationLink
                                  isActive={pagination.page === i + 1}
                                  onClick={async () => {
                                    const p = i + 1;
                                    const response = await fetchOptions({
                                      page: p,
                                      limit: pagination.limit,
                                      search: debouncedSearch,
                                    });
                                    setInternalOptions(response.data);
                                    setPage(p);
                                    setPagination(response.pagination ?? null);
                                  }}
                                >
                                  {i + 1}
                                </PaginationLink>
                              </PaginationItem>
                            );
                          },
                        )}
                      </PaginationContent>

                      <PaginationNext
                        onClick={async () => {
                          if (!pagination.hasNextPage) {
                            return;
                          }
                          const p = pagination.page + 1;
                          const response = await fetchOptions({
                            page: p,
                            limit: pagination.limit,
                            search: debouncedSearch,
                          });
                          setInternalOptions(response.data);
                          setPage(p);
                          setPagination(response.pagination ?? null);
                        }}
                      />
                    </div>
                  </Pagination>
                ) : (
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
                )}
              </div>
            )}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}

type MultiBaseProps = {
  value: string[];
  onChange: (ids: string[], members: MemberProfile[]) => void;
  placeholder?: string;
};

type MultiAsyncProps = {
  fetchOptions: (
    page: number,
    limit: number,
    search?: string,
  ) => Promise<FetchMembersResponse>;
  options?: never;
};

type MultiStaticProps = {
  options: MemberProfile[];
  fetchOptions?: never;
};

type MemberMultiSelectProps = MultiBaseProps &
  (MultiAsyncProps | MultiStaticProps);

export function MemberMultiSelect({
  fetchOptions,
  options,
  value,
  onChange,
  placeholder = "Select or search",
}: MemberMultiSelectProps) {
  const [open, setOpen] = useState(false);
  const [internalOptions, setInternalOptions] = useState<MemberProfile[]>([]);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState<any | null>(null);

  const debouncedSearch = useDebounce(search, 400);

  useEffect(() => {
    if (!fetchOptions) {
      return;
    }
    const load = async () => {
      const response = await fetchOptions(1, 10, debouncedSearch);
      setInternalOptions(response.data);
      setPage(1);
      setPagination(response.pagination ?? null);
    };

    load();
  }, [debouncedSearch, fetchOptions]);

  useEffect(() => {
    if (options) {
      setInternalOptions(options);
    }
  }, [options]);

  const loadMore = async () => {
    if (!fetchOptions) {
      return;
    }

    const next = page + 1;
    const response = await fetchOptions(next, 10, debouncedSearch);

    setInternalOptions((prev) => {
      return [...prev, ...response.data];
    });
    setPage(next);
    setPagination(response.pagination ?? null);
  };

  const summary =
    value.length === 0
      ? placeholder
      : value.length <= 2
        ? internalOptions
            .filter((m) => {
              return value.includes(m.id);
            })
            .map((m) => {
              return m.fullName;
            })
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

      <PopoverContent
        className="p-0"
        align="start"
        style={{ width: "var(--radix-popover-trigger-width)" }}
      >
        <Command>
          <CommandInput onValueChange={setSearch} placeholder="Search..." />

          <CommandList>
            <CommandEmpty>No results</CommandEmpty>

            <CommandGroup>
              {internalOptions.map((member) => {
                const selected = value.includes(member.id);

                return (
                  <CommandItem
                    key={member.id}
                    onSelect={() => {
                      const newIds = selected
                        ? value.filter((id) => {
                            return id !== member.id;
                          })
                        : [...value, member.id];

                      const selectedMembers = internalOptions.filter((m) => {
                        return newIds.includes(m.id);
                      });

                      onChange(newIds, selectedMembers);
                    }}
                  >
                    {member.fullName}
                    <Checkbox checked={selected} className="ml-auto" />
                  </CommandItem>
                );
              })}
            </CommandGroup>

            {fetchOptions && (
              <div className="p-2">
                {pagination ? (
                  <Pagination className="w-full">
                    <div className="flex w-full items-center justify-between px-2">
                      <PaginationPrevious
                        onClick={async () => {
                          if (pagination.page <= 1) {
                            return;
                          }
                          const p = pagination.page - 1;
                          const response = await fetchOptions(
                            p,
                            pagination.limit,
                            debouncedSearch,
                          );
                          setInternalOptions(response.data);
                          setPage(p);
                          setPagination(response.pagination ?? null);
                        }}
                      />

                      <PaginationContent>
                        {Array.from({ length: pagination.totalPages }).map(
                          (_, i) => {
                            return (
                              <PaginationItem key={i}>
                                <PaginationLink
                                  isActive={pagination.page === i + 1}
                                  onClick={async () => {
                                    const p = i + 1;
                                    const response = await fetchOptions(
                                      p,
                                      pagination.limit,
                                      debouncedSearch,
                                    );
                                    setInternalOptions(response.data);
                                    setPage(p);
                                    setPagination(response.pagination ?? null);
                                  }}
                                >
                                  {i + 1}
                                </PaginationLink>
                              </PaginationItem>
                            );
                          },
                        )}
                      </PaginationContent>

                      <PaginationNext
                        onClick={async () => {
                          if (!pagination.hasNextPage) {
                            return;
                          }
                          const p = pagination.page + 1;
                          const response = await fetchOptions(
                            p,
                            pagination.limit,
                            debouncedSearch,
                          );
                          setInternalOptions(response.data);
                          setPage(p);
                          setPagination(response.pagination ?? null);
                        }}
                      />
                    </div>
                  </Pagination>
                ) : (
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
                )}
              </div>
            )}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
