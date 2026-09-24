'use client';

import { ArrowDown, ArrowUp, Check, ChevronLeft, ChevronRight, Plus, X } from 'lucide-react';
import { useEffect, useState } from 'react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Loader } from '@/components/ui/loader';
import { Text } from '@/components/ui/typography/Text';
import { useToast } from '@/hooks/use-toast';
import { createLocation, deleteLocation, fetchLocationsPage, Location, updateLocation } from '@/services/locationService';

interface LocationManagerProps {
	readOnly?: boolean;
}

export function LocationManager({ readOnly = false }: LocationManagerProps) {
	const PAGE_SIZE = 8;
	const { toast } = useToast();
	const [locations, setLocations] = useState<Location[]>([]);
	const [isLoading, setIsLoading] = useState(true);
	const [newName, setNewName] = useState('');
	const [isSaving, setIsSaving] = useState(false);
	const [editingId, setEditingId] = useState<string | null>(null);
	const [editingName, setEditingName] = useState('');
	const [currentPage, setCurrentPage] = useState(1);
	const [totalPages, setTotalPages] = useState(1);
	const [totalLocations, setTotalLocations] = useState(0);
	const [deletingId, setDeletingId] = useState<string | null>(null);

	const load = async (page = currentPage) => {
		setIsLoading(true);
		try {
			const response = await fetchLocationsPage(page, PAGE_SIZE);
			setLocations([...response.data].sort((a, b) => a.sortOrder - b.sortOrder));
			setCurrentPage(response.pagination.page);
			setTotalPages(response.pagination.totalPages || 1);
			setTotalLocations(response.pagination.itemCount);
		} catch (error: any) {
			toast({
				title: 'Error',
				description: error.message || 'Failed to load locations',
				variant: 'destructive',
			});
		} finally {
			setIsLoading(false);
		}
	};

	useEffect(() => {
		load();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	const handleAdd = async () => {
		if (!newName.trim()) return;
		setIsSaving(true);
		try {
			await createLocation({
				name: newName.trim(),
				sortOrder: totalLocations,
			});
			setNewName('');
			await load(totalPages);
			toast({ title: 'Success', description: 'Location added' });
		} catch (error: any) {
			toast({
				title: 'Error',
				description: error.message || 'Failed to add location',
				variant: 'destructive',
			});
		} finally {
			setIsSaving(false);
		}
	};

	const handleToggleActive = async (location: Location) => {
		try {
			await updateLocation(location.id, { isActive: !location.isActive });
			await load(currentPage);
		} catch (error: any) {
			toast({
				title: 'Error',
				description: error.message || 'Failed to update location',
				variant: 'destructive',
			});
		}
	};

	const handleDelete = async (location: Location) => {
		if (!window.confirm(`Permanently delete ${location.name}?`)) return;
		setDeletingId(location.id);
		try {
			await deleteLocation(location.id);
			await load(currentPage > 1 && locations.length === 1 ? currentPage - 1 : currentPage);
			toast({ title: 'Success', description: 'Location deleted' });
		} catch (error: any) {
			toast({ title: 'Error', description: error.message || 'Failed to delete location', variant: 'destructive' });
		} finally {
			setDeletingId(null);
		}
	};

	const handleStartEdit = (location: Location) => {
		setEditingId(location.id);
		setEditingName(location.name);
	};

	const handleSaveEdit = async (location: Location) => {
		if (!editingName.trim()) return;
		try {
			await updateLocation(location.id, { name: editingName.trim() });
			setEditingId(null);
			await load(currentPage);
		} catch (error: any) {
			toast({
				title: 'Error',
				description: error.message || 'Failed to rename location',
				variant: 'destructive',
			});
		}
	};

	const handleReorder = async (index: number, direction: -1 | 1) => {
		const targetIndex = index + direction;
		if (targetIndex < 0 || targetIndex >= locations.length) return;

		const reordered = [...locations];
		const [moved] = reordered.splice(index, 1);
		reordered.splice(targetIndex, 0, moved);

		setLocations(reordered);

		try {
			await Promise.all(reordered.map((location, i) => (location.sortOrder === i ? Promise.resolve() : updateLocation(location.id, { sortOrder: i }))));
			await load(currentPage);
		} catch (error: any) {
			toast({
				title: 'Error',
				description: error.message || 'Failed to reorder locations',
				variant: 'destructive',
			});
			await load();
		}
	};

	return (
		<div className="bg-white rounded-2xl border border-gray-300 p-5 space-y-4">
			<div className="flex items-center justify-between">
				<Text className="font-bold text-black">Locations / Auditoriums</Text>
			</div>

			{isLoading ? (
				<div className="flex items-center justify-center py-8">
					<Loader
						size="w-8 h-8"
						showShadow={false}
					/>
				</div>
			) : (
				<div className="space-y-2">
					{locations.map((location, index) => (
						<div
							key={location.id}
							className="flex items-center gap-2 rounded-lg border border-gray-200 px-3 py-2">
							{!readOnly && (
								<div className="flex flex-col">
									<button
										type="button"
										onClick={() => handleReorder(index, -1)}
										disabled={index === 0 && currentPage === 1}
										className="disabled:opacity-30">
										<ArrowUp className="w-3.5 h-3.5" />
									</button>
									<button
										type="button"
										onClick={() => handleReorder(index, 1)}
										disabled={index === locations.length - 1 && currentPage === totalPages}
										className="disabled:opacity-30">
										<ArrowDown className="w-3.5 h-3.5" />
									</button>
								</div>
							)}

							{!readOnly && editingId === location.id ? (
								<div className="flex flex-1 items-center gap-2">
									<Input
										value={editingName}
										onChange={(e) => setEditingName(e.target.value)}
										className="h-8"
									/>
									<Button
										size="icon"
										variant="ghost"
										onClick={() => handleSaveEdit(location)}>
										<Check className="w-4 h-4 text-green-600" />
									</Button>
									<Button
										size="icon"
										variant="ghost"
										onClick={() => setEditingId(null)}>
										<X className="w-4 h-4" />
									</Button>
								</div>
							) : (
								<button
									type="button"
									disabled={readOnly}
									className="flex-1 text-left text-sm font-medium disabled:cursor-default"
									onClick={() => !readOnly && handleStartEdit(location)}>
									{location.name}
									{location.isSystem && <span className="ml-2 text-xs text-gray-400">(system)</span>}
								</button>
							)}

							{!readOnly && (
								<Button
									size="sm"
									variant="outline"
									disabled={deletingId === location.id}
									onClick={() => handleDelete(location)}>
									{deletingId === location.id ? 'Deleting...' : 'Delete'}
								</Button>
							)}
						</div>
					))}

					{!locations.length && (
						<Text
							variant="muted"
							className="text-sm">
							No locations configured yet.
						</Text>
					)}

					{totalPages > 1 && (
						<div className="flex items-center justify-between border-t pt-3">
							<Button
								size="sm"
								variant="outline"
								disabled={currentPage === 1 || isLoading}
								onClick={() => load(currentPage - 1)}>
								<ChevronLeft className="h-4 w-4" />
								Previous
							</Button>
							<Text
								variant="muted"
								className="text-sm">
								Page {currentPage} of {totalPages}
							</Text>
							<Button
								size="sm"
								variant="outline"
								disabled={currentPage === totalPages || isLoading}
								onClick={() => load(currentPage + 1)}>
								Next
								<ChevronRight className="h-4 w-4" />
							</Button>
						</div>
					)}
				</div>
			)}

			{!readOnly && (
				<div className="flex items-center gap-2 pt-2 border-t">
					<Input
						placeholder="New location (e.g. Main Auditorium)"
						value={newName}
						onChange={(e) => setNewName(e.target.value)}
						disabled={isSaving}
					/>
					<Button
						onClick={handleAdd}
						disabled={isSaving || !newName.trim()}>
						<Plus className="w-4 h-4" />
						Add
					</Button>
				</div>
			)}
		</div>
	);
}
