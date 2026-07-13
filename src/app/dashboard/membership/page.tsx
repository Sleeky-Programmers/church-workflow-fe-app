"use client";

import { CircleAlert, MoreVertical, Plus, Search, X } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import router from "next/router";
import { useCallback, useEffect, useRef, useState } from "react";
import { MdCheckCircle, MdError, MdInfo, MdWarning } from "react-icons/md";

import { AddMemberModal } from "@/components/features/dashboard/membership/add-member-modal";
import { CsvUploadModal } from "@/components/features/dashboard/membership/csv-upload-modal";
import { DeleteMembersModal } from "@/components/features/dashboard/membership/delete-member-modal";
import { MemberFilterDropdown } from "@/components/features/dashboard/membership/member-filter-dropdown";
import { MembersTable } from "@/components/features/dashboard/membership/members-table";
import { AddMemberFormatModal } from "@/components/features/dashboard/membership/select-modal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader } from "@/components/ui/loader";
import { SidebarTrigger } from "@/components/ui/sidebar";
import Heading from "@/components/ui/typography/Heading";
import { useDebounce } from "@/hooks/use-debounce";
import { useIsMobile } from "@/hooks/use-mobile";
import { useToast } from "@/hooks/use-toast";
import {
  Gender,
  MaritalStatus,
  MemberFormType,
  MembershipStatus,
} from "@/lib/enums";
import { toSentenceCase } from "@/lib/utils";
import { mapFiltersToBackend } from "@/mappers/filter.mapper";
import { fetchMembers, getMemberLimitStatus } from "@/services/memberService";
import { useSearchStore } from "@/stores/useSearchStore";
import { MemberLimitStatus, MemberProfile } from "@/types";

type BannerColor = "blue" | "red" | "amber";

const bannerStyles: Record<BannerColor, string> = {
  blue: "border-blue-200 bg-blue-50",
  red: "border-red-200 bg-red-50",
  amber: "border-amber-200 bg-amber-50",
};

const iconColors: Record<BannerColor, string> = {
  blue: "text-primary-500",
  red: "text-red-500",
  amber: "text-amber-500",
};

export function ActionRequiredBanner() {
  const router = useRouter();
  const [isVisible, setIsVisible] = useState(true);
  const [status, setStatus] = useState<MemberLimitStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStatus = async () => {
      setLoading(true);
      setError(null);

      try {
        const data = await getMemberLimitStatus();
        setStatus(data);
      } catch (err) {
        console.error("Failed to fetch member limit status:", err);
        setError("Failed to load member limit status");
      } finally {
        setLoading(false);
      }
    };

    fetchStatus();
  }, []);

  // Check if banner was dismissed in this session
  useEffect(() => {
    const dismissedBanner = sessionStorage.getItem(
      "memberLimitBannerDismissed",
    );
    if (dismissedBanner) {
      setIsVisible(false);
    }
  }, []);

  const handleDismiss = () => {
    setIsVisible(false);
    sessionStorage.setItem("memberLimitBannerDismissed", "true");
  };

  if (loading) return null;
  if (error) {
    console.warn("Banner error:", error);
    return null;
  }
  if (!status || !isVisible) return null;

  const {
    currentMembers,
    limit,
    percentage,
    isOverLimit,
    isWithinGracePeriod,
    isNearLimit,
    daysRemaining,
    planName,
  } = status;

  // No banner if not near limit and not over limit
  if (!isNearLimit && !isOverLimit) return null;

  // Determine banner styling
  let bannerColor: BannerColor = "blue";
  let title = "";
  let message = "";

  if (isOverLimit && isWithinGracePeriod) {
    bannerColor = "blue";
    title = "Action Required:";
    const formattedDate = status.gracePeriodEnds
      ? new Date(status.gracePeriodEnds).toLocaleDateString("en-US", {
          month: "long",
          day: "numeric",
          year: "numeric",
        })
      : "soon";
    message = `Your ${daysRemaining || 7}-day grace period to manage over-limit members ends on ${formattedDate}. Upgrade to prevent dashboard restrictions.`;
  } else if (isOverLimit && !isWithinGracePeriod) {
    bannerColor = "red";
    title = "Over Limit:";
    message = `Your ${toSentenceCase(planName || "")} plan has ${currentMembers} members, which exceeds the ${limit} member limit. Please upgrade now to continue.`;
  } else if (isNearLimit) {
    bannerColor = "amber";
    title = "Approaching Limit:";
    message = `You have ${currentMembers} out of ${limit} members (${Math.round(percentage)}%). Consider upgrading to avoid reaching the limit.`;
  }

  const Icon = isOverLimit ? MdError : isNearLimit ? MdWarning : MdInfo;

  return (
    <div
      className={`mx-4 sm:mx-6 mt-3 mb-1 flex items-center gap-3 rounded-lg border ${bannerStyles[bannerColor]} px-4 py-3`}
    >
      <Icon className={iconColors[bannerColor]} size={25} />

      <p className="flex-1 text-sm text-gray-700">
        <span className="font-semibold">{title}</span> {message}
      </p>

      <Button
        onClick={() => router.push("/dashboard/settings/billing")}
        variant={bannerColor === "red" ? "destructive" : "default"}
      >
        Upgrade Now
      </Button>

      <button
        onClick={handleDismiss}
        className="shrink-0 text-gray-400 hover:text-gray-600"
        aria-label="Dismiss"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  );
}

export default function MembershipPage() {
  const { toast } = useToast();
  const router = useRouter();
  const isMobile = useIsMobile();
  const searchParams = useSearchParams();

  // Use Zustand store for search state
  const {
    searchQuery,
    setSearchQuery,
    clearSearch,
    syncFromURL,
    updateURLSearch,
  } = useSearchStore();

  const [filters, setFilters] = useState({
    gender: null as Gender | null,
    maritalStatus: null as MaritalStatus | null,
    membershipStatus: null as MembershipStatus | null,
  });

  const [members, setMembers] = useState<MemberProfile[]>([]);
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
  const [isLoading, setIsLoading] = useState(false);

  const debouncedSearch = useDebounce(searchQuery, 500);
  const backendFilter = mapFiltersToBackend(filters);

  // Ref to track if we're clearing search due to selection
  const isClearingSearchFromSelection = useRef(false);

  const loadMembers = useCallback(
    async (pageOverride: number, search: string, filter: string) => {
      try {
        setIsLoading(true);
        const response = await fetchMembers(pageOverride, 10, search, filter);
        setMembers(response.data);
        setPagination(response.pagination);
      } catch (error) {
        toast({ title: "Failed to load members" });
      } finally {
        setIsLoading(false);
      }
    },
    [toast],
  );

  // Sync URL params with Zustand store on mount and URL changes
  useEffect(() => {
    syncFromURL(searchParams);
  }, [searchParams, syncFromURL]);

  // Update URL when debounced search changes
  useEffect(() => {
    if (
      debouncedSearch === searchQuery &&
      !isClearingSearchFromSelection.current
    ) {
      updateURLSearch(window.location.pathname, router);
    }
  }, [debouncedSearch, searchQuery, updateURLSearch, router]);

  // Clear search when members are selected (but don't clear selection)
  useEffect(() => {
    if (selectedMemberIds.length > 0 && searchQuery) {
      isClearingSearchFromSelection.current = true;
      clearSearch();
      updateURLSearch(window.location.pathname, router);

      // Reset the flag after a short delay
      setTimeout(() => {
        isClearingSearchFromSelection.current = false;
      }, 100);
    }
  }, [
    selectedMemberIds.length,
    searchQuery,
    clearSearch,
    updateURLSearch,
    router,
  ]);

  // Load members when search or filters change (reset to page 1)
  useEffect(() => {
    const newPage = 1;
    setPage(newPage);
    loadMembers(newPage, debouncedSearch, backendFilter);
  }, [debouncedSearch, backendFilter, loadMembers]);

  // Load members when page changes
  useEffect(() => {
    loadMembers(page, debouncedSearch, backendFilter);
  }, [page, debouncedSearch, backendFilter, loadMembers]);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setSearchQuery(newValue);
    // Clear selection when user starts typing a new search
    if (selectedMemberIds.length > 0) {
      setSelectedMemberIds([]);
    }
  };

  const handleClearSearch = () => {
    clearSearch();
    updateURLSearch(window.location.pathname, router);
    // Keep selection when clearing search manually? Or clear it?
    // Let's keep selection for better UX
  };

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
      <ActionRequiredBanner />

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
            <div className="relative w-72 md:w-96">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search members..."
                value={searchQuery}
                onChange={handleSearchChange}
                className="pl-10 pr-8"
              />
              {searchQuery && (
                <button
                  onClick={handleClearSearch}
                  className="absolute right-3 top-1/2 -translate-y-1/2"
                >
                  <X className="h-4 w-4 text-gray-400 hover:text-gray-600" />
                </button>
              )}
            </div>

            <MemberFilterDropdown
              filters={filters}
              setFilters={setFilters}
              searchQuery={searchQuery}
              setSearchQuery={setSearchQuery}
            />

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

      <div className="py-4 sm:py-6 px-3 sm:px-4 relative">
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-white/60 z-10">
            <Loader className="h-6 w-6" />
          </div>
        )}
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
        onOpenChange={setIsCsvModalOpen}
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
