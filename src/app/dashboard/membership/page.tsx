"use client";

import { useState, useEffect, useCallback } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, Plus, MoreVertical } from "lucide-react";
import Heading from "@/components/ui/typography/Heading";
import { MembersTable } from "@/components/features/dashboard/membership/members-table";
import { fetchMembers, uploadMembersCsv } from "@/services/memberService";
import { MemberProfile } from "@/types";
import { MemberDetailsPage } from "@/components/features/dashboard/membership/member-details-page";
import { AddMemberModal } from "@/components/features/dashboard/membership/add-member-modal";
import { AddMemberFormatModal } from "@/components/features/dashboard/membership/select-modal";
import { useToast } from "@/hooks/use-toast";
import { useDebounce } from "@/hooks/use-debounce";
import { MemberFormType } from "@/lib/enums";
import { Text } from "@/components/ui/typography/Text";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useIsMobile } from "@/hooks/use-mobile";

export default function MembershipPage() {
  const { toast } = useToast();
  const isMobile = useIsMobile();

  const [members, setMembers] = useState<MemberProfile[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedMemberId, setSelectedMemberId] = useState<string | null>(null);
  const [isFormatModalOpen, setIsFormatModalOpen] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const debouncedSearch = useDebounce(searchQuery, 500);
  const [selectedFormat, setSelectedFormat] = useState<"form" | "csv" | null>(
    null,
  );
  const [isCsvUploading, setIsCsvUploading] = useState(false);
  const [filterValue, setFilterValue] = useState("all");
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState<any>(null);

  const loadMembers = useCallback(
    async (
      pageOverride: number = page,
      searchOverride: string = debouncedSearch,
      filterOverride: string = filterValue,
    ) => {
      const response = await fetchMembers(
        pageOverride,
        10,
        searchOverride,
        filterOverride,
      );
      setMembers(response.data);
      setPagination(response.pagination);
    },
    [page, debouncedSearch, filterValue],
  );

  useEffect(() => {
    const load = async () => {
      try {
        await loadMembers();
      } catch (err) {
        toast({ title: "Cannot fetch members data" });
      }
    };
    load();
  }, [page, debouncedSearch, filterValue, loadMembers]);

  useEffect(() => {
    setPage(1);
  }, [debouncedSearch, filterValue]);

  const handleAddMember = async (_member: MemberProfile) => {
    try {
      await loadMembers(1);
      setPage(1);
      setIsAddModalOpen(false);
      setSelectedFormat(null);
    } catch (err) {
      toast({ title: "Cannot fetch members data" });
    }
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
      return;
    }

    if (format === MemberFormType.CSV) {
      const input = document.createElement("input");
      input.type = "file";
      input.accept = ".csv,text/csv";

      input.onchange = async (e: any) => {
        const file = e.target.files[0];
        if (!file) return;

        try {
          setIsCsvUploading(true);
          toast({
            title: "Uploading members...",
            description: "Your CSV is being processed.",
          });

          const result: any = await uploadMembersCsv(file);
          const inserted = Number(result?.inserted || 0);

          toast({
            title: "Success",
            description: `${inserted.toLocaleString()} member${inserted === 1 ? "" : "s"} imported successfully`,
          });

          const response = await fetchMembers(1, 10);
          setMembers(response.data);
          setPagination(response.pagination);
          setPage(1);
        } catch (error: any) {
          const errorMessage =
            error?.message ||
            error?.response?.data?.message ||
            "CSV upload failed";
          toast({
            title: "Error",
            description: errorMessage,
            variant: "destructive",
          });
        } finally {
          setIsCsvUploading(false);
          setSelectedFormat(null);
        }
      };

      input.click();
    }
  };

  if (selectedMemberId) {
    const selectedMember = members.find((m) => m.id === selectedMemberId);
    if (selectedMember) {
      return (
        <MemberDetailsPage
          member={selectedMember}
          onBack={() => setSelectedMemberId(null)}
        />
      );
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white">
        <div className="px-4 sm:px-6 py-4 flex items-center justify-between gap-2">
          <Heading level={3}>Membership</Heading>

          <div className="hidden sm:flex items-center gap-3">
            <div className="relative w-72 md:w-96">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search members..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>

            <Select value={filterValue} onValueChange={setFilterValue}>
              <SelectTrigger className="w-[160px] border border-gray-300 rounded-lg shadow-sm hover:shadow-md transition-all duration-150 focus:ring-2 focus:ring-blue-400">
                <SelectValue placeholder="Filter Members" />
              </SelectTrigger>

              <SelectContent className="bg-white shadow-lg border border-gray-200 rounded-lg">
                <SelectItem value="all">
                  <Text text="All Members" variant="default" />
                </SelectItem>
                <SelectItem value="male">
                  <Text text="Male" variant="default" />
                </SelectItem>
                <SelectItem value="female">
                  <Text text="Female" variant="default" />
                </SelectItem>
                <SelectItem value="isBaptized">
                  <Text text="Baptized" variant="default" />
                </SelectItem>
                <SelectItem value="new-members">
                  <Text text="New Members" variant="default" />
                </SelectItem>
              </SelectContent>
            </Select>

            <Button
              onClick={() => setIsFormatModalOpen(true)}
              variant="default"
              disabled={isCsvUploading}
            >
              <Plus className="h-4 w-4 mr-2" />
              {isCsvUploading ? "Uploading..." : "Add a member"}
            </Button>
          </div>

          {isMobile && (
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <MoreVertical className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>

      <div className="py-4 sm:py-6 px-3 sm:px-4">
        <MembersTable
          members={members}
          pagination={pagination}
          onPageChange={setPage}
          onRowClick={(memberId) => setSelectedMemberId(memberId)}
          onAddMember={() => setIsFormatModalOpen(true)}
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
    </div>
  );
}
