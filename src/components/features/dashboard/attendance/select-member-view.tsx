"use client";

import { useState, useEffect } from "react";
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
  selectedMembers: string[];
  onToggleMember: (memberId: string) => void;
  onMarkPresent: () => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
};

export function SelectMembersView({
  selectedMembers,
  onToggleMember,
  onMarkPresent,
  searchQuery,
  onSearchChange,
}: SelectMembersViewProps) {
  const [members, setMembers] = useState<Member[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hasLoaded, setHasLoaded] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const loadMembers = async (page: number = 1) => {
    setIsLoading(true);
    try {
      const data = await fetchMembers(page, 10, searchQuery);
      setMembers(data.members);
      setTotalPages(data.pages);
      setHasLoaded(true);
    } catch (error) {
      console.error("Failed to load members:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLoadMembers = () => {
    loadMembers(1);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    loadMembers(page);
  };

  useEffect(() => {
    if (hasLoaded && searchQuery !== undefined) {
      const timer = setTimeout(() => {
        loadMembers(1);
        setCurrentPage(1);
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [searchQuery]);

  return (
    <div className="flex-1 flex flex-col min-h-0">
      <div className="p-4 border-b">
        <Heading level={3} className="mb-1">
          Select Members
        </Heading>
        {selectedMembers.length > 0 && (
          <Text variant="muted">
            {selectedMembers.length} member(s) selected
          </Text>
        )}
      </div>

      {hasLoaded && (
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
      )}

      <div className="flex-1 overflow-y-auto">
        {!hasLoaded ? (
          <div className="flex items-center justify-center h-full">
            <Button
              onClick={handleLoadMembers}
              className="bg-secondary-600 hover:bg-secondary-700"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Loading...
                </>
              ) : (
                <>Load members →</>
              )}
            </Button>
          </div>
        ) : isLoading ? (
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

      {hasLoaded && totalPages > 1 && (
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

      {hasLoaded && selectedMembers.length > 0 && (
        <div className="p-4 border-t">
          <Button onClick={onMarkPresent} className="w-full">
            Mark as present
          </Button>
        </div>
      )}
    </div>
  );
}
