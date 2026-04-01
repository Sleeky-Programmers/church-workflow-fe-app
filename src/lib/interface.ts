import { Gender, MaritalStatus, MembershipStatus } from "./enums";

export interface FilterState {
  gender: Gender | null;
  maritalStatus: MaritalStatus | null;
  membershipStatus: MembershipStatus | null;
}

export interface FilterProps {
  filters: FilterState;
  setFilters: (filters: FilterState) => void;
  searchQuery: string;
  setSearchQuery: (value: string) => void;
}
