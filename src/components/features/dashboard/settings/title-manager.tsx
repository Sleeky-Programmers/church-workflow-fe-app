'use client';

import { ArrowDown, ArrowUp, Check, ChevronLeft, ChevronRight, Plus, X } from 'lucide-react';
import { useEffect, useState } from 'react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Loader } from '@/components/ui/loader';
import { Text } from '@/components/ui/typography/Text';
import { useToast } from '@/hooks/use-toast';
import { createTitle, deleteTitle, fetchTitlesPage, Title, updateTitle } from '@/services/titleService';

interface TitleManagerProps {
	readOnly?: boolean;
}

export function TitleManager({ readOnly = false }: TitleManagerProps) {
	const PAGE_SIZE = 8;
	const { toast } = useToast();
	const [titles, setTitles] = useState<Title[]>([]);
	const [isLoading, setIsLoading] = useState(true);
	const [newName, setNewName] = useState('');
	const [isSaving, setIsSaving] = useState(false);
	const [editingId, setEditingId] = useState<string | null>(null);
	const [editingName, setEditingName] = useState('');
	const [currentPage, setCurrentPage] = useState(1);
	const [totalPages, setTotalPages] = useState(1);
	const [totalTitles, setTotalTitles] = useState(0);
	const [deletingId, setDeletingId] = useState<string | null>(null);

	const load = async (page = currentPage) => {
		setIsLoading(true);
		try {
			const response = await fetchTitlesPage(page, PAGE_SIZE);
			setTitles([...response.data].sort((a, b) => a.sortOrder - b.sortOrder));
			setCurrentPage(response.pagination.page);
			setTotalPages(response.pagination.totalPages || 1);
			setTotalTitles(response.pagination.itemCount);
		} catch (error: any) {
			toast({
				title: 'Error',
				description: error.message || 'Failed to load titles',
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
			await createTitle({
				name: newName.trim(),
				sortOrder: totalTitles,
			});
			setNewName('');
			await load(totalPages);
			toast({ title: 'Success', description: 'Title added' });
		} catch (error: any) {
			toast({
				title: 'Error',
				description: error.message || 'Failed to add title',
				variant: 'destructive',
			});
		} finally {
			setIsSaving(false);
		}
	};

	const handleToggleActive = async (title: Title) => {
		try {
			await updateTitle(title.id, { isActive: !title.isActive });
			await load(currentPage);
		} catch (error: any) {
			toast({
				title: 'Error',
				description: error.message || 'Failed to update title',
				variant: 'destructive',
			});
		}
	};

	const handleDelete = async (title: Title) => {
		if (!window.confirm(`Permanently delete ${title.name}?`)) return;
		setDeletingId(title.id);
		try {
			await deleteTitle(title.id);
			await load(currentPage > 1 && titles.length === 1 ? currentPage - 1 : currentPage);
			toast({ title: 'Success', description: 'Title deleted' });
		} catch (error: any) {
			toast({ title: 'Error', description: error.message || 'Failed to delete title', variant: 'destructive' });
		} finally {
			setDeletingId(null);
		}
	};

	const handleStartEdit = (title: Title) => {
		setEditingId(title.id);
		setEditingName(title.name);
	};

	const handleSaveEdit = async (title: Title) => {
		if (!editingName.trim()) return;
		try {
			await updateTitle(title.id, { name: editingName.trim() });
			setEditingId(null);
			await load(currentPage);
		} catch (error: any) {
			toast({
				title: 'Error',
				description: error.message || 'Failed to rename title',
				variant: 'destructive',
			});
		}
	};

	const handleReorder = async (index: number, direction: -1 | 1) => {
		const targetIndex = index + direction;
		if (targetIndex < 0 || targetIndex >= titles.length) return;

		const reordered = [...titles];
		const [moved] = reordered.splice(index, 1);
		reordered.splice(targetIndex, 0, moved);

		setTitles(reordered);

		try {
			await Promise.all(reordered.map((title, i) => (title.sortOrder === i ? Promise.resolve() : updateTitle(title.id, { sortOrder: i }))));
			await load(currentPage);
		} catch (error: any) {
			toast({
				title: 'Error',
				description: error.message || 'Failed to reorder titles',
				variant: 'destructive',
			});
			await load();
		}
	};

	return (
		<div className="bg-white rounded-2xl border border-gray-300 p-5 space-y-4">
			<div className="flex items-center justify-between">
				<Text className="font-bold text-black">Titles</Text>
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
					{titles.map((title, index) => (
						<div
							key={title.id}
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
										disabled={index === titles.length - 1 && currentPage === totalPages}
										className="disabled:opacity-30">
										<ArrowDown className="w-3.5 h-3.5" />
									</button>
								</div>
							)}

							{!readOnly && editingId === title.id ? (
								<div className="flex flex-1 items-center gap-2">
									<Input
										value={editingName}
										onChange={(e) => setEditingName(e.target.value)}
										className="h-8"
									/>
									<Button
										size="icon"
										variant="ghost"
										onClick={() => handleSaveEdit(title)}>
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
									onClick={() => !readOnly && handleStartEdit(title)}>
									{title.name}
									{title.isSystem && <span className="ml-2 text-xs text-gray-400">(system)</span>}
								</button>
							)}

							{!readOnly && (
								<Button
									size="sm"
									variant="outline"
									disabled={deletingId === title.id}
									onClick={() => handleDelete(title)}>
									{deletingId === title.id ? 'Deleting...' : 'Delete'}
								</Button>
							)}
						</div>
					))}

					{!titles.length && (
						<Text
							variant="muted"
							className="text-sm">
							No titles configured yet.
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
						placeholder="New title (e.g. Pastor)"
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
