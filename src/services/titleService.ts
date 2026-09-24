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

export async function fetchTitles() {
	return authenticatedFetch<Title[]>('/titles');
}

export async function fetchTitlesPage(page: number, limit: number) {
	return authenticatedFetch<PaginatedList<Title>>(`/titles?page=${page}&limit=${limit}`);
}

export async function createTitle(payload: { name: string; sortOrder?: number }) {
	return authenticatedFetch<Title>('/titles', {
		method: 'POST',
		body: JSON.stringify(payload),
	});
}

export async function updateTitle(id: string, payload: Partial<Pick<Title, 'name' | 'isActive' | 'sortOrder'>>) {
	return authenticatedFetch<Title>(`/titles/${id}`, {
		method: 'PUT',
		body: JSON.stringify(payload),
	});
}

export async function deleteTitle(id: string) {
	return authenticatedFetch<{ message: string }>(`/titles/${id}`, {
		method: 'DELETE',
	});
}
