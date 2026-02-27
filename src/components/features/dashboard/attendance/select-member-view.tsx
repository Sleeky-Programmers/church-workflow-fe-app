"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Loader2 } from "lucide-react";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { Member } from "@/types";
import { fetchMembers } from "@/lib/api";
import { MemberListItem } from "./member-list";
import Heading from "@/components/ui/typography/Heading";
import { Text } from "@/components/ui/typography/Text";

type SelectMembersViewProps = {
  isOpen: boolean;
  selectedMembers: string[];
  onToggleMember: (memberId: string) => void;
  onMarkPresent: () => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
};

export function SelectMembersView({
  isOpen,
  selectedMembers,
  onToggleMember,
  onMarkPresent,
  searchQuery,
  onSearchChange,
}: SelectMembersViewProps) {
  const [members, setMembers] = useState<Member[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const loadMembers = async (page: number = 1, query: string = searchQuery) => {
    setIsLoading(true);
    try {
      const data = await fetchMembers(page, 10, query);
      setMembers(data.members);
      setTotalPages(data.pages);
    } catch (error) {
      console.error("Failed to load members:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    loadMembers(page);
  };

  useEffect(() => {
    if (!isOpen) return;
    setCurrentPage(1);
    loadMembers(1, "");
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    const timer = setTimeout(() => {
      setCurrentPage(1);
      loadMembers(1);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery, isOpen]);

  return (
    <div className="flex-1 flex flex-col min-h-0">
      <div className="p-4 border-b flex items-start justify-between gap-3">
        <div>
          <Heading level={3} className="mb-1">
            Select Members
          </Heading>
          {selectedMembers.length > 0 && (
            <Text variant="muted">
              {selectedMembers.length} member(s) selected
            </Text>
          )}
        </div>

        <Button
          onClick={onMarkPresent}
          disabled={selectedMembers.length === 0}
          className="whitespace-nowrap"
        >
          Mark as present
        </Button>
      </div>

      <div className="p-4 border-b">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Select or search"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-9"
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-primary-600" />
          </div>
        ) : members.length === 0 ? (
          <div className="flex items-center justify-center py-8 text-gray-500">
            <Text variant="default">No members found</Text>
          </div>
        ) : (
          <div className="p-4">
            {members.map((member) => (
              <MemberListItem
                key={member.id}
                member={member}
                mode="select"
                isSelected={selectedMembers.includes(member.id)}
                onSelect={onToggleMember}
              />
            ))}
          </div>
        )}
      </div>

      {totalPages > 1 && (
        <div className="p-4 border-t">
          <Pagination>
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious
                  onClick={() => handlePageChange(Math.max(1, currentPage - 1))}
                  className={
                    currentPage === 1
                      ? "pointer-events-none opacity-50"
                      : "cursor-pointer"
                  }
                />
              </PaginationItem>

              {Array.from({ length: Math.min(3, totalPages) }, (_, i) => {
                const page = i + 1;
                return (
                  <PaginationItem key={page}>
                    <PaginationLink
                      onClick={() => handlePageChange(page)}
                      isActive={currentPage === page}
                      className="cursor-pointer"
                    >
                      {page}
                    </PaginationLink>
                  </PaginationItem>
                );
              })}

              <PaginationItem>
                <PaginationNext
                  onClick={() =>
                    handlePageChange(Math.min(totalPages, currentPage + 1))
                  }
                  className={
                    currentPage === totalPages
                      ? "pointer-events-none opacity-50"
                      : "cursor-pointer"
                  }
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </div>
      )}
    </div>
  );
}
