import { authenticatedFetch, getMyBranches } from '@/lib/api';
import { PlanLimitStatus } from '@/types';

export interface BranchResponse {
	_id: string;
	name: string;
	alias: string | null;
	address?: string | null;
	country?: string | null;
	state?: string | null;
	timeZone?: string | null;
	isHQ: boolean;
	isActive: boolean;
}

export interface PaginatedBranchResponse {
	branches: BranchResponse[];
	pagination: {
		page: number;
		limit: number;
		itemCount: number;
		totalPages: number;
		hasPreviousPage: boolean;
		hasNextPage: boolean;
	};
}

export interface CreateBranchPayload {
	name: string;
	alias?: string;
	address?: string;
	country?: string;
	state?: string;
	timeZone?: string;
}

export interface UpdateBranchPayload {
	name?: string;
	alias?: string;
	address?: string;
	country?: string;
	state?: string;
	timeZone?: string;
	isActive?: boolean;
}

export async function fetchBranches() {
	return getMyBranches();
}

// For the branch management settings page - unlike fetchBranches()/getMyBranches(),
// this includes inactive branches so a deactivated branch stays visible with a
// "Reactivate" action instead of disappearing from the list entirely.
export async function fetchAllBranchesForManagement(page: number, limit: number) {
	return authenticatedFetch<PaginatedBranchResponse>(`/branches?page=${page}&limit=${limit}`);
}

export async function deleteBranch(id: string) {
	return authenticatedFetch<{ message: string }>(`/branches/${id}`, {
		method: 'DELETE',
	});
}

export async function createBranch(payload: CreateBranchPayload) {
	return authenticatedFetch<BranchResponse>('/branches', {
		method: 'POST',
		body: JSON.stringify(payload),
	});
}

export async function updateBranch(id: string, payload: UpdateBranchPayload) {
	return authenticatedFetch<BranchResponse>(`/branches/${id}`, {
		method: 'PUT',
		body: JSON.stringify(payload),
	});
}

export interface AdminBranchAccessResponse {
	accessScope: 'BRANCH' | 'ORG_WIDE';
	branchIds: string[];
}

export async function fetchAdminBranchAccess(adminId: string) {
	return authenticatedFetch<AdminBranchAccessResponse>(`/branches/admin/${adminId}/access`);
}

export async function updateAdminBranchAccess(adminId: string, payload: { accessScope: 'BRANCH' | 'ORG_WIDE'; branchIds?: string[] }) {
	return authenticatedFetch<AdminBranchAccessResponse>(`/branches/admin/${adminId}/access`, {
		method: 'PUT',
		body: JSON.stringify(payload),
	});
}

export async function fetchBranchLimitStatus(): Promise<PlanLimitStatus> {
	const response = await authenticatedFetch<{
		success: boolean;
		data: {
			currentBranches: number;
			limit: number;
			percentage: number;
			isOverLimit: boolean;
			isNearLimit: boolean;
			planName: string;
		};
	}>('/branches/branch-limit-status', { method: 'GET' });

	const status = response.data;

	return {
		current: status.currentBranches,
		limit: status.limit,
		percentage: status.percentage,
		isOverLimit: status.isOverLimit,
		isNearLimit: status.isNearLimit,
		planName: status.planName,
	};
}
