"use client";

import {
  FilterSectionConfig,
  ReusableFilterDropdown,
} from "@/components/features/dashboard/filter-drop-down";
import {
  FilterSection,
  Gender,
  MaritalStatus,
  MembershipStatus,
} from "@/lib/enums";
import { FilterProps } from "@/lib/interface";
import { formatLabel } from "@/utils/helpers";

export const MemberFilterDropdown = ({
  filters,
  setFilters,
  searchQuery,
  setSearchQuery,
}: FilterProps) => {
  const filterSections: FilterSectionConfig<any>[] = [
    {
      id: FilterSection.GENDER,
      title: "Gender",
      options: Object.values(Gender).map((gender) => ({
        value: gender,
        label: formatLabel(gender),
      })),
      selectedValue: filters.gender,
      onChange: (value: Gender | null) => {
        setFilters({ ...filters, gender: value });
      },
      columns: 1,
    },
    {
      id: FilterSection.MARITAL,
      title: "Marital Status",
      options: Object.values(MaritalStatus).map((status) => ({
        value: status,
        label: formatLabel(status),
      })),
      selectedValue: filters.maritalStatus,
      onChange: (value: MaritalStatus | null) => {
        setFilters({ ...filters, maritalStatus: value });
      },
      columns: 2,
    },
    {
      id: FilterSection.MEMBERSHIP,
      title: "Membership Status",
      options: Object.values(MembershipStatus).map((status) => ({
        value: status,
        label: formatLabel(status),
      })),
      selectedValue: filters.membershipStatus,
      onChange: (value: MembershipStatus | null) => {
        setFilters({ ...filters, membershipStatus: value });
      },
      columns: 2,
    },
  ];

  return (
    <ReusableFilterDropdown
      filterSections={filterSections}
      searchQuery={searchQuery}
      onSearchChange={setSearchQuery}
      title="Member Filter"
      triggerButtonText="Filter"
      onSave={() => {}}
    />
  );
};
