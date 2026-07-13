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

export interface AdminResponse {
  id: string;
  firstName: string;
  lastName: string;
  fullName: string;
  email: string;
}

export interface AdminListResponse {
  data: AdminResponse[];
  pagination: {
    page: number;
    limit: number;
    itemCount: number;
    totalPages: number;
    hasPreviousPage: boolean;
    hasNextPage: boolean;
  };
}
