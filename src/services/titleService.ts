import { authenticatedFetch } from '@/lib/api';

export interface Title {
	id: string;
	name: string;
	isActive: boolean;
	sortOrder: number;
	isSystem: boolean;
}

export interface PaginatedList<T> {
	data: T[];
	pagination: {
		page: number;
		limit: number;
		itemCount: number;
		totalPages: number;
		hasPreviousPage: boolean;
		hasNextPage: boolean;
	};
}

// The API returns Mongoose documents keyed by `_id`; normalize to `id` so
// Callers have a stable identifier (matches the members/services convention).
function normalizeTitle(raw: any): Title {
	return {
		id: raw?._id ?? raw?.id,
		name: raw?.name,
		isActive: raw?.isActive,
		sortOrder: raw?.sortOrder ?? 0,
		isSystem: raw?.isSystem ?? false,
	};
}

export async function fetchTitles() {
	const data = await authenticatedFetch<any[]>('/titles');
	return data.map(normalizeTitle);
}

export async function fetchTitlesPage(page: number, limit: number) {
	const res = await authenticatedFetch<PaginatedList<any>>(`/titles?page=${page}&limit=${limit}`);
	return { ...res, data: res.data.map(normalizeTitle) } as PaginatedList<Title>;
}

export async function createTitle(payload: { name: string; sortOrder?: number }) {
	const created = await authenticatedFetch<any>('/titles', {
		method: 'POST',
		body: JSON.stringify(payload),
	});
	return normalizeTitle(created);
}

export async function updateTitle(id: string, payload: Partial<Pick<Title, 'name' | 'isActive' | 'sortOrder'>>) {
	const updated = await authenticatedFetch<any>(`/titles/${id}`, {
		method: 'PUT',
		body: JSON.stringify(payload),
	});
	return normalizeTitle(updated);
}

export async function deleteTitle(id: string) {
	return authenticatedFetch<{ message: string }>(`/titles/${id}`, {
		method: 'DELETE',
	});
}
