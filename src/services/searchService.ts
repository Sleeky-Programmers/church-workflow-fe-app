import { authenticatedFetch } from "@/lib/api";

export interface SearchMemberResult {
  _id: string;
  fullName: string;
  phoneNumber?: string;
  membershipStatus?: string;
}

export interface SearchNamedResult {
  _id: string;
  name: string;
}

export interface SearchAssetResult extends SearchNamedResult {
  tag?: string;
  category?: string;
}

export interface SearchUserResult extends SearchNamedResult {
  email?: string;
}

/**
 * A group is missing entirely when the current role has no VIEW access to
 * that section, so every key is optional.
 */
export interface GlobalSearchResults {
  members?: SearchMemberResult[];
  departments?: SearchNamedResult[];
  smallTeams?: SearchNamedResult[];
  assets?: SearchAssetResult[];
  users?: SearchUserResult[];
}

export interface GlobalSearchResponse {
  q: string;
  partial: boolean;
  results: GlobalSearchResults;
}

export const GLOBAL_SEARCH_LIMIT = 5;

export function globalSearch(
  q: string,
  signal?: AbortSignal,
): Promise<GlobalSearchResponse> {
  const params = new URLSearchParams({
    q,
    limit: String(GLOBAL_SEARCH_LIMIT),
  });
  return authenticatedFetch<GlobalSearchResponse>(`/search?${params}`, {
    method: "GET",
    signal,
  });
}
