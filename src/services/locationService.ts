import { authenticatedFetch } from '@/lib/api';

export interface Location {
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

export async function fetchLocations() {
	return authenticatedFetch<Location[]>('/locations');
}

export async function fetchLocationsPage(page: number, limit: number) {
	return authenticatedFetch<PaginatedList<Location>>(`/locations?page=${page}&limit=${limit}`);
}

export async function createLocation(payload: { name: string; sortOrder?: number }) {
	return authenticatedFetch<Location>('/locations', {
		method: 'POST',
		body: JSON.stringify(payload),
	});
}

export async function updateLocation(id: string, payload: Partial<Pick<Location, 'name' | 'isActive' | 'sortOrder'>>) {
	return authenticatedFetch<Location>(`/locations/${id}`, {
		method: 'PUT',
		body: JSON.stringify(payload),
	});
}

export async function deleteLocation(id: string) {
	return authenticatedFetch<{ message: string }>(`/locations/${id}`, {
		method: 'DELETE',
	});
}
