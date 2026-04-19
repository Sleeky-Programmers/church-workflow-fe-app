"use client";

import { useState, useEffect, useCallback } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, Plus, MoreVertical } from "lucide-react";
import Heading from "@/components/ui/typography/Heading";
import { MembersTable } from "@/components/features/dashboard/membership/members-table";
import { fetchMembers } from "@/services/memberService";
import { MemberProfile } from "@/types";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { AddMemberModal } from "@/components/features/dashboard/membership/add-member-modal";
import { AddMemberFormatModal } from "@/components/features/dashboard/membership/select-modal";
import { DeleteMembersModal } from "@/components/features/dashboard/membership/delete-member-modal";
import { useToast } from "@/hooks/use-toast";
import { useDebounce } from "@/hooks/use-debounce";
import { MemberFormType } from "@/lib/enums";
import { CsvUploadModal } from "@/components/features/dashboard/membership/csv-upload-modal";
import FilterDropdown from "@/components/features/dashboard/membership/filter-drop-down";
import { MaritalStatus, Gender, MembershipStatus } from "@/lib/enums";
import { mapFiltersToBackend } from "@/mappers/filter.mapper";
import { useIsMobile } from "@/hooks/use-mobile";
import { useRouter } from "next/navigation";

export default function MembershipPage() {
  const { toast } = useToast();
  const router = useRouter();
  const isMobile = useIsMobile();

  const [filters, setFilters] = useState({
    gender: null as Gender | null,
    maritalStatus: null as MaritalStatus | null,
    membershipStatus: null as MembershipStatus | null,
  });

  const [members, setMembers] = useState<MemberProfile[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedMemberIds, setSelectedMemberIds] = useState<string[]>([]);

  const [isFormatModalOpen, setIsFormatModalOpen] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isCsvModalOpen, setIsCsvModalOpen] = useState(false);

  const [selectedFormat, setSelectedFormat] = useState<"form" | "csv" | null>(
    null,
  );
  const [isCsvUploading, setIsCsvUploading] = useState(false);

  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState<any>(null);

  const debouncedSearch = useDebounce(searchQuery, 500);
  const backendFilter = mapFiltersToBackend(filters);

  const loadMembers = useCallback(
    async (pageOverride: number, search: string, filter: string) => {
      try {
        const response = await fetchMembers(pageOverride, 10, search, filter);
        setMembers(response.data);
        setPagination(response.pagination);
      } catch (error) {
        toast({ title: "Failed to load members" });
      }
    },
    [toast],
  );

  useEffect(() => {
    const newPage = 1;
    setPage(newPage);
    loadMembers(newPage, debouncedSearch, backendFilter);
  }, [debouncedSearch, backendFilter, loadMembers]);

  useEffect(() => {
    loadMembers(page, debouncedSearch, backendFilter);
  }, [page, debouncedSearch, backendFilter, loadMembers]);

  const handleAddMember = async () => {
    await loadMembers(1, debouncedSearch, backendFilter);
    setPage(1);
    setIsAddModalOpen(false);
    setSelectedFormat(null);
  };

  const handleFormatSelect = (
    format: MemberFormType.FORM | MemberFormType.CSV,
  ) => {
    if (format === MemberFormType.CSV && isCsvUploading) {
      toast({
        title: "Upload in progress",
        description: "Please wait for the current CSV upload to finish.",
      });
      return;
    }

    setSelectedFormat(format);

    if (format === MemberFormType.FORM) {
      setIsAddModalOpen(true);
    }

    if (format === MemberFormType.CSV) {
      setIsCsvModalOpen(true);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white">
        <div className="px-4 sm:px-6 py-4 flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 h-8">
            {isMobile && (
              <div className="flex items-center justify-center h-8 w-8">
                <SidebarTrigger />
              </div>
            )}
            <Heading level={3} className="leading-none m-0">
              Membership
            </Heading>
          </div>

          <div className="hidden sm:flex items-center gap-3">
            {/* Search */}
            <div className="relative w-72 md:w-96">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search members..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Filters */}
            <FilterDropdown
              filters={filters}
              setFilters={setFilters}
              searchQuery={searchQuery}
              setSearchQuery={setSearchQuery}
            />

            {/* Actions */}
            {selectedMemberIds.length > 0 ? (
              <Button
                variant="destructive"
                onClick={() => setIsDeleteModalOpen(true)}
              >
                Remove Members ({selectedMemberIds.length})
              </Button>
            ) : (
              <Button
                onClick={() => setIsFormatModalOpen(true)}
                disabled={isCsvUploading}
              >
                <Plus className="h-4 w-4 mr-2" />
                {isCsvUploading ? "Uploading..." : "Add a member"}
              </Button>
            )}
          </div>

          {isMobile && (
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <MoreVertical className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>

      {/* Table */}
      <div className="py-4 sm:py-6 px-3 sm:px-4">
        <MembersTable
          members={members}
          pagination={pagination}
          onPageChange={setPage}
          onRowClick={(memberId) =>
            router.push(`/dashboard/membership/${memberId}`)
          }
          onAddMember={() => setIsFormatModalOpen(true)}
          selectedMemberIds={selectedMemberIds}
          onSelectMember={(id, checked) =>
            setSelectedMemberIds((prev) =>
              checked ? [...prev, id] : prev.filter((mid) => mid !== id),
            )
          }
          onSelectAll={(checked) =>
            setSelectedMemberIds(checked ? members.map((m) => m.id) : [])
          }
          setIsDeleteModalOpen={setIsDeleteModalOpen}
          setIsFormatModalOpen={setIsFormatModalOpen}
          isCsvUploading={isCsvUploading}
        />
      </div>

      <AddMemberFormatModal
        open={isFormatModalOpen}
        onOpenChange={setIsFormatModalOpen}
        onSelectFormat={handleFormatSelect}
      />

      <AddMemberModal
        open={isAddModalOpen}
        onOpenChange={setIsAddModalOpen}
        onMemberAdded={handleAddMember}
      />

      <CsvUploadModal
        open={isCsvModalOpen}
        onClose={() => setIsCsvModalOpen(false)}
        onSuccess={async () => {
          const response = await fetchMembers(1, 10);
          setMembers(response.data);
          setPagination(response.pagination);
          setPage(1);
        }}
        onOpenChange={setIsFormatModalOpen}
      />

      <DeleteMembersModal
        open={isDeleteModalOpen}
        onOpenChange={setIsDeleteModalOpen}
        memberIds={selectedMemberIds}
        onDeleted={(deletedIds) => {
          setMembers((prev) => prev.filter((m) => !deletedIds.includes(m.id)));
          setSelectedMemberIds([]);
        }}
      />
    </div>
  );
}
