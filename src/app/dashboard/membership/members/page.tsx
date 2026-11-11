"use client";

import { Search, X } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { fadeUp } from "@/components/features/dashboard/membership/animations";

import { LimitBanner } from "@/components/features/dashboard/subscription/limit-banner";
import { PlanLimitReachedModal } from "@/components/features/dashboard/subscription/plan-limit-reached-modal";
import { MemberLimitSuccessModal } from "@/components/features/dashboard/subscription/member-limit-success-modal";
import { AddMemberModal } from "@/components/features/dashboard/membership/add-member-modal";
import { ArchivedGuestsPanel } from "@/components/features/dashboard/membership/archived-guests-panel";
import { FrequentGuestsBanner } from "@/components/features/dashboard/membership/frequent-guests-banner";
import { CsvUploadModal } from "@/components/features/dashboard/membership/csv-upload-modal";
import { DeleteMembersModal } from "@/components/features/dashboard/membership/delete-member-modal";
import { MemberFilterDropdown } from "@/components/features/dashboard/membership/member-filter-dropdown";
import { MembersTable } from "@/components/features/dashboard/membership/members-table";
import { AddMemberFormatModal } from "@/components/features/dashboard/membership/select-modal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader } from "@/components/ui/loader";
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
import { mapFiltersToQueryParams } from "@/mappers/filter.mapper";
import { getNextPlan, getUpgradeFeatures } from "@/lib/plan-utils";
import {
  fetchMembers,
  getGuestPlanLimitStatus,
  getMemberPlanLimitStatus,
  getResourcePlanLimitStatus,
} from "@/services/memberService";
import { getPlans } from "@/services/billingService";
import { useSearchStore } from "@/stores/useSearchStore";
import { LimitResource, MemberProfile, Plan, PlanLimitStatus } from "@/types";

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

  const [, setSelectedFormat] = useState<"form" | "csv" | null>(null);
  const [isCsvUploading] = useState(false);

  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);

  const [limitStatus, setLimitStatus] = useState<PlanLimitStatus | null>(null);
  const [guestLimitStatus, setGuestLimitStatus] =
    useState<PlanLimitStatus | null>(null);
  // Which limit the "limit reached" modal is about.
  const [limitModalResource, setLimitModalResource] =
    useState<LimitResource>("member");
  const activeTab =
    searchParams.get("tab") === "archived" ? "archived" : "people";
  const [bannerKey, setBannerKey] = useState(0);
  const [plans, setPlans] = useState<Plan[]>([]);
  const [plansLoaded, setPlansLoaded] = useState(false);
  const [isLimitReachedModalOpen, setIsLimitReachedModalOpen] = useState(false);
  const [successModal, setSuccessModal] = useState<{
    context: "add" | "import";
    addedCount?: number;
  } | null>(null);

  const debouncedSearch = useDebounce(searchQuery, 500);
  const facetQuery = mapFiltersToQueryParams(filters);

  // Ref to track if we're clearing search due to selection
  const isClearingSearchFromSelection = useRef(false);

  const loadMembers = useCallback(
    async (pageOverride: number, search: string, facetsQs: string) => {
      try {
        setIsLoading(true);
        const response = await fetchMembers(
          pageOverride,
          10,
          search,
          undefined,
          Object.fromEntries(new URLSearchParams(facetsQs)),
        );
        setMembers(response.data);
        setPagination(response.pagination);
      } catch {
        toast({ title: "Failed to load members" });
      } finally {
        setIsLoading(false);
      }
    },
    [toast],
  );

  const refreshLimitStatus = useCallback(async () => {
    try {
      const [status, guestStatus] = await Promise.all([
        getMemberPlanLimitStatus(),
        getResourcePlanLimitStatus("guest"),
      ]);
      setLimitStatus(status);
      setGuestLimitStatus(guestStatus);
      return status;
    } catch {
      return null;
    }
  }, []);

  // Load the plan catalogue once so the "Upgrade to Growth" modal can show
  // The next tier's name/features without hardcoding them.
  useEffect(() => {
    getPlans()
      .then(setPlans)
      .catch(() => {
        return undefined;
      })
      .finally(() => {
        return setPlansLoaded(true);
      });
  }, []);

  useEffect(() => {
    refreshLimitStatus();
  }, [refreshLimitStatus]);

  const nextPlan = getNextPlan(limitStatus?.planName ?? null, plans);
  const nextPlanFeatures = getUpgradeFeatures(nextPlan);

  const atLimit = (s: PlanLimitStatus | null) => {
    return !!s && s.limit > 0 && s.current >= s.limit;
  };

  // Members and guests have separate limits, so adding is only blocked up
  // Front when both are full. The server checks the right limit for the
  // Status chosen and names it in its message.
  const handleAddMemberClick = async () => {
    const status = limitStatus ?? (await refreshLimitStatus());
    const guestStatus =
      guestLimitStatus ?? (await getResourcePlanLimitStatus("guest"));
    if (atLimit(status) && atLimit(guestStatus)) {
      setLimitModalResource("member");
      setIsLimitReachedModalOpen(true);
      return;
    }
    setIsFormatModalOpen(true);
  };

  const setTab = (tab: "people" | "archived") => {
    const params = new URLSearchParams(searchParams.toString());
    if (tab === "archived") {
      params.set("tab", "archived");
    } else {
      params.delete("tab");
    }
    router.replace(`?${params.toString()}`);
  };

  const handleGuestsChanged = () => {
    loadMembers(page, debouncedSearch, facetQuery);
    refreshLimitStatus();
    setBannerKey((k) => {
      return k + 1;
    });
  };

  const handleViewUpgradePlans = () => {
    setSuccessModal(null);
    setIsLimitReachedModalOpen(true);
  };

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

  // Single fetch effect: search, facets, and page all route through here so
  // Every state change issues exactly one request (no double-fetch).
  useEffect(() => {
    loadMembers(page, debouncedSearch, facetQuery);
  }, [page, debouncedSearch, facetQuery, loadMembers]);

  // Reset to page 1 whenever the query changes (but not on page changes)
  const queryKey = `${debouncedSearch}|${facetQuery}`;
  const prevQueryKey = useRef(queryKey);
  useEffect(() => {
    if (prevQueryKey.current !== queryKey) {
      prevQueryKey.current = queryKey;
      setPage(1);
    }
  }, [queryKey]);

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
    await loadMembers(1, debouncedSearch, facetQuery);
    setPage(1);
    setIsAddModalOpen(false);
    setSelectedFormat(null);

    const status = await refreshLimitStatus();
    if (status?.isOverLimit && status.isWithinGracePeriod) {
      setSuccessModal({ context: "add" });
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
    }

    if (format === MemberFormType.CSV) {
      setIsCsvModalOpen(true);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <LimitBanner
        fetchStatus={getMemberPlanLimitStatus}
        dismissKey="memberLimitBannerDismissed"
        resourceLabel="members"
        resourceLimitLabel="member limit"
        className="mx-4 mt-3 mb-1 sm:mx-6"
      />
      <LimitBanner
        key={`guest-${bannerKey}`}
        fetchStatus={getGuestPlanLimitStatus}
        dismissKey="guestLimitBannerDismissed"
        resourceLabel="guests"
        resourceLimitLabel="guest limit"
        className="mx-4 mt-3 mb-1 sm:mx-6"
      />
      <FrequentGuestsBanner
        key={`frequent-${bannerKey}`}
        onConverted={handleGuestsChanged}
      />

      <div className="bg-white border-b border-gray-200">
        <div className="px-4 sm:px-6 py-3 sm:py-4 flex flex-wrap items-center gap-x-3 gap-y-3 md:flex-nowrap md:justify-between">
          <div className="flex items-center gap-3 min-w-0 flex-1 md:flex-none">
            {isMobile && (
              <div className="flex items-center justify-center h-8 w-8 shrink-0"></div>
            )}
            <Heading
              level={3}
              className="leading-none m-0 whitespace-nowrap truncate"
            >
              CW Members
            </Heading>
          </div>

          <div className="flex items-center gap-2 sm:gap-3 shrink-0 md:order-3">
            <MemberFilterDropdown
              filters={filters}
              setFilters={setFilters}
              searchQuery={searchQuery}
              setSearchQuery={setSearchQuery}
            />

            {selectedMemberIds.length > 0 ? (
              <Button
                variant="destructive"
                onClick={() => {
                  return setIsDeleteModalOpen(true);
                }}
                className="rounded-lg whitespace-nowrap"
              >
                Remove
                <span className="hidden sm:inline">&nbsp;Members</span>
              </Button>
            ) : (
              <Button
                onClick={handleAddMemberClick}
                disabled={isCsvUploading}
                className="rounded-lg whitespace-nowrap"
              >
                {isCsvUploading ? (
                  "Uploading..."
                ) : (
                  <>
                    Add<span className="hidden sm:inline">&nbsp;a member</span>
                  </>
                )}
              </Button>
            )}
          </div>

          {/* Full-width on its own row on mobile; inline on md+ */}
          <div className="w-full md:order-2 md:flex-1 md:w-auto md:max-w-sm">
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search"
                value={searchQuery}
                onChange={handleSearchChange}
                className="pl-9 pr-8 h-9 bg-white"
              />
              {searchQuery ? (
                <button
                  onClick={handleClearSearch}
                  className="absolute right-3 top-1/2 -translate-y-1/2"
                >
                  <X className="h-4 w-4 text-gray-400 hover:text-gray-600" />
                </button>
              ) : (
                <kbd className="absolute right-3 top-1/2 -translate-y-1/2 hidden md:block text-xs text-gray-400 border border-gray-200 rounded px-1">
                  /
                </kbd>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="px-3 sm:px-4 pt-4 flex gap-2" role="tablist">
        {(
          [
            ["people", "People"],
            ["archived", "Archived guests"],
          ] as const
        ).map(([tab, label]) => {
          return (
            <button
              key={tab}
              role="tab"
              aria-selected={activeTab === tab}
              onClick={() => {
                return setTab(tab);
              }}
              className={
                activeTab === tab
                  ? "rounded-full bg-primary-500 px-3 py-1.5 text-sm font-medium text-white"
                  : "rounded-full border border-gray-200 bg-white px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
              }
            >
              {label}
            </button>
          );
        })}
      </div>

      {activeTab === "archived" ? (
        <div className="py-4 sm:py-6 px-3 sm:px-4">
          <ArchivedGuestsPanel onRestored={handleGuestsChanged} />
        </div>
      ) : (
        <motion.div
          variants={fadeUp}
          initial="hidden"
          animate="visible"
          className="py-4 sm:py-6 px-3 sm:px-4 relative"
        >
          {isLoading && (
            <div className="absolute inset-0 flex items-center justify-center bg-white/60 z-10">
              <Loader size="w-10 h-10" showShadow={false} />
            </div>
          )}
          <MembersTable
            members={members}
            pagination={pagination}
            onPageChange={setPage}
            onRowClick={(memberId) => {
              return router.push(`/dashboard/membership/members/${memberId}`);
            }}
            onAddMember={handleAddMemberClick}
            selectedMemberIds={selectedMemberIds}
            onSelectMember={(id, checked) => {
              return setSelectedMemberIds((prev) => {
                return checked
                  ? [...prev, id]
                  : prev.filter((mid) => {
                      return mid !== id;
                    });
              });
            }}
            onSelectAll={(checked) => {
              return setSelectedMemberIds(
                checked
                  ? members.map((m) => {
                      return m.id;
                    })
                  : [],
              );
            }}
            setIsDeleteModalOpen={setIsDeleteModalOpen}
            setIsFormatModalOpen={setIsFormatModalOpen}
            isCsvUploading={isCsvUploading}
            searchActive={Boolean(searchQuery || facetQuery)}
          />
        </motion.div>
      )}

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
        onClose={() => {
          return setIsCsvModalOpen(false);
        }}
        onSuccess={async (insertedCount) => {
          const response = await fetchMembers(1, 10);
          setMembers(response.data);
          setPagination(response.pagination);
          setPage(1);

          const status = await refreshLimitStatus();
          setBannerKey((k) => {
            return k + 1;
          });
          if (status?.isOverLimit && status.isWithinGracePeriod) {
            setSuccessModal({ context: "import", addedCount: insertedCount });
          }
        }}
        onOpenChange={setIsCsvModalOpen}
      />

      <DeleteMembersModal
        open={isDeleteModalOpen}
        onOpenChange={setIsDeleteModalOpen}
        memberIds={selectedMemberIds}
        onDeleted={(deletedIds) => {
          const remaining = members.filter((m) => {
            return !deletedIds.includes(m.id);
          });
          setMembers(remaining);
          setSelectedMemberIds([]);

          // If this page is now empty and there are earlier pages, step back
          // So the user isn't stranded on a blank page.
          if (remaining.length === 0 && pagination && pagination.page > 1) {
            setPage(pagination.page - 1);
          } else {
            loadMembers(page, debouncedSearch, facetQuery);
          }

          // Freed seats should immediately reflect in the limit banner
          refreshLimitStatus();
        }}
      />

      {successModal && limitStatus && (
        <MemberLimitSuccessModal
          open
          onOpenChange={(open) => {
            if (!open) {
              setSuccessModal(null);
            }
          }}
          context={successModal.context}
          addedCount={successModal.addedCount}
          current={limitStatus.current}
          limit={limitStatus.limit}
          planName={limitStatus.planName}
          daysRemaining={limitStatus.daysRemaining}
          onViewUpgradePlans={handleViewUpgradePlans}
        />
      )}

      <PlanLimitReachedModal
        open={isLimitReachedModalOpen}
        onOpenChange={setIsLimitReachedModalOpen}
        limit={
          (limitModalResource === "guest"
            ? guestLimitStatus?.limit
            : limitStatus?.limit) ?? 0
        }
        planName={limitStatus?.planName ?? null}
        resourceLabel={limitModalResource === "guest" ? "guest" : "member"}
        resourceLabelPlural={
          limitModalResource === "guest" ? "guests" : "members"
        }
        nextPlanName={nextPlan?.name}
        isNextPlanLoading={!plansLoaded}
        features={nextPlanFeatures}
      />
    </div>
  );
}
