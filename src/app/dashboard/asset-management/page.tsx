'use client';

import { CheckCircle2, ChevronLeft, ChevronRight, MoreHorizontal, Package, Search, TriangleAlert, Wrench } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

import { AddAssetModal, AssetModalMode } from '@/components/features/dashboard/assets/add-asset-modal';
import { Asset, ASSET_CATEGORY_FILTERS, ASSET_RISK_FILTERS, ASSET_STATUS_FILTERS, ASSET_TYPE_FILTERS, PAGE_SIZE } from '@/components/features/dashboard/assets/data';
import { AlertDialog, AlertDialogContent } from '@/components/ui/alert-dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Pagination, PaginationContent, PaginationEllipsis, PaginationItem } from '@/components/ui/pagination';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { RouteConfig } from '@/config/routes';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { AssetListRow, AssetStatsResponse, deleteAsset, fetchAssetById, fetchAssets, fetchAssetStats } from '@/services/assetService';

const TONES = {
	green: 'border-emerald-200 bg-emerald-50 text-emerald-700',
	red: 'border-red-200 bg-red-50 text-red-600',
	amber: 'border-amber-200 bg-amber-50 text-amber-700',
	orange: 'border-orange-200 bg-orange-50 text-orange-600',
} as const;

type Tone = keyof typeof TONES;

const CONDITION_TONE: Record<string, Tone> = {
	Good: 'green',
	Fair: 'amber',
	Repair: 'orange',
	Damaged: 'red',
};

const RISK_TONE: Record<string, Tone> = {
	High: 'red',
	Medium: 'amber',
	Low: 'green',
};

function CellBadge({ tone, children }: { tone: Tone; children: React.ReactNode }) {
	return (
		<Badge
			variant="outline"
			className={cn('rounded-md px-3 py-1 text-[13px] font-medium', TONES[tone])}>
			{children}
		</Badge>
	);
}

const HEAD_CLASS = 'px-4 py-3.5 text-[11px] font-medium uppercase tracking-wide text-gray-500';

type PageItem = number | 'ellipsis';

function getPageItems(totalPages: number, currentPage: number): PageItem[] {
	if (totalPages <= 6) {
		return Array.from({ length: totalPages }, (_, index) => index + 1);
	}

	if (currentPage <= 3 || currentPage >= totalPages - 2) {
		return [1, 2, 3, 'ellipsis', totalPages - 2, totalPages - 1, totalPages];
	}

	return [1, 'ellipsis', currentPage - 1, currentPage, currentPage + 1, 'ellipsis', totalPages];
}

const DEFAULT_STATS: AssetStatsResponse = {
	totalAssets: 0,
	maintenanceDue: 0,
	highRisk: 0,
	goodCondition: 0,
	overdue: 0,
};

export default function AssetManagementPage() {
	const { toast } = useToast();
	const router = useRouter();

	const [assets, setAssets] = useState<AssetListRow[]>([]);
	const [assetStats, setAssetStats] = useState<AssetStatsResponse>(DEFAULT_STATS);
	const [itemCount, setItemCount] = useState(0);
	const [loading, setLoading] = useState(false);
	const [query, setQuery] = useState('');
	const [category, setCategory] = useState('ALL');
	const [risk, setRisk] = useState('ALL');
	const [type, setType] = useState('ALL');
	const [status, setStatus] = useState('ALL');
	const [page, setPage] = useState(1);
	const [selected, setSelected] = useState<string[]>([]);

	const [modal, setModal] = useState<{
		mode: AssetModalMode;
		asset: Asset | null;
	} | null>(null);
	const [deleteTarget, setDeleteTarget] = useState<AssetListRow | null>(null);
	const [deleteConfirmText, setDeleteConfirmText] = useState('');

	const openDetail = (asset: AssetListRow) => router.push(RouteConfig.dashboard.assetDetails(asset.id));

	const loadAssets = async () => {
		setLoading(true);
		try {
			const res = await fetchAssets({
				page,
				limit: PAGE_SIZE,
				search: query || undefined,
				category: category !== 'ALL' ? category : undefined,
				risk: risk !== 'ALL' ? risk : undefined,
				type: type !== 'ALL' ? type : undefined,
				status: status !== 'ALL' ? status : undefined,
			});
			setAssets(res.data);
			setItemCount(res.pagination?.itemCount ?? res.data.length);
		} catch {
			toast({
				title: 'Failed to load assets',
				description: 'Please try again',
				variant: 'destructive',
			});
		} finally {
			setLoading(false);
		}
	};

	const loadStats = async () => {
		try {
			const res = await fetchAssetStats();
			setAssetStats(res);
		} catch {
			// Stat cards simply stay at their last known values on failure.
		}
	};

	useEffect(() => {
		loadAssets();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [query, category, risk, type, status, page]);

	useEffect(() => {
		loadStats();
	}, []);

	const totalPages = Math.max(1, Math.ceil(itemCount / PAGE_SIZE));
	const currentPage = Math.min(page, totalPages);
	const rows = assets;
	const rangeStart = itemCount ? (currentPage - 1) * PAGE_SIZE + 1 : 0;
	const rangeEnd = Math.min(currentPage * PAGE_SIZE, itemCount);
	const pageItems = getPageItems(totalPages, currentPage);

	const allOnPageSelected = rows.length > 0 && rows.every((asset) => selected.includes(asset.id));

	const toggleAllOnPage = (checked: boolean) => {
		setSelected((prev) => {
			const onPage = rows.map((asset) => asset.id);

			if (!checked) {
				return prev.filter((id) => !onPage.includes(id));
			}

			return Array.from(new Set([...prev, ...onPage]));
		});
	};

	const toggleRow = (id: string, checked: boolean) => {
		setSelected((prev) => (checked ? Array.from(new Set([...prev, id])) : prev.filter((value) => value !== id)));
	};

	const openEditModal = async (row: AssetListRow) => {
		try {
			const full = await fetchAssetById(row.id);
			setModal({ mode: 'edit', asset: full });
		} catch {
			toast({
				title: 'Failed to load asset',
				description: 'Please try again',
				variant: 'destructive',
			});
		}
	};

	const handleSaved = (asset: Asset, mode: Exclude<AssetModalMode, 'view'>) => {
		if (mode === 'create') {
			setPage(1);
			loadAssets();
			loadStats();
			toast({ title: 'Asset created', description: `${asset.name} was added` });
			return;
		}

		loadAssets();
		loadStats();
		toast({ title: 'Asset updated', description: `${asset.name} was saved` });
	};

	const isDeleteConfirmed = deleteConfirmText.trim().toLowerCase() === 'delete';

	const handleDelete = async () => {
		if (!deleteTarget || !isDeleteConfirmed) return;

		try {
			await deleteAsset(deleteTarget.id);
			setSelected((prev) => prev.filter((id) => id !== deleteTarget.id));
			toast({
				title: 'Asset deleted',
				description: `${deleteTarget.name} was removed`,
			});
			loadAssets();
			loadStats();
		} catch {
			toast({
				title: 'Failed to delete asset',
				description: 'Please try again',
				variant: 'destructive',
			});
		} finally {
			setDeleteTarget(null);
			setDeleteConfirmText('');
		}
	};

	const stats = [
		{
			key: 'total',
			label: 'Total Assets',
			value: assetStats.totalAssets,
			icon: Package,
			iconClass: 'border-blue-100 bg-blue-50 text-primary-500',
		},
		{
			key: 'maintenance',
			label: 'Maintenance Due',
			value: assetStats.maintenanceDue,
			icon: Wrench,
			iconClass: 'border-amber-100 bg-amber-50 text-amber-600',
		},
		{
			key: 'risk',
			label: 'High Risk',
			value: assetStats.highRisk,
			icon: TriangleAlert,
			iconClass: 'border-red-100 bg-red-50 text-red-600',
		},
		{
			key: 'condition',
			label: 'Good Condition',
			value: assetStats.goodCondition,
			icon: CheckCircle2,
			iconClass: 'border-emerald-100 bg-emerald-50 text-emerald-600',
		},
	];

	return (
		<div className="space-y-5">
			{/* Attention banner */}
			{assetStats.overdue > 0 && (
				<div className="flex flex-wrap items-center gap-4 rounded-xl border border-[#d4e8f3] bg-[#e6f4fa] px-4 py-4">
					<span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary">
						<TriangleAlert className="h-3.5 w-3.5 !text-white-600" />
					</span>

					<p className="min-w-0 text-sm text-gray-800">
						<span className="font-semibold">Attention:</span> {assetStats.overdue} assets have overdue maintenance. Review and update records to stay compliant.
					</p>

					<Button
						type="button"
						onClick={() => {
							setType('Due');
							setPage(1);
						}}
						className="ml-auto h-9 shrink-0 rounded-lg bg-primary px-4 text-sm font-medium !text-white-600 hover:bg-primary-600">
						View Overdue
					</Button>
				</div>
			)}

			{/* Toolbar */}
			<div className="flex flex-wrap items-center gap-4">
				<div className="flex min-w-0 flex-1 flex-wrap items-center gap-x-10 gap-y-3 lg:flex-nowrap">
					<div className="flex items-center gap-2">
						<h1 className="text-base font-semibold text-gray-900">Asset Management</h1>
					</div>

					<div className="relative w-full sm:w-72">
						<Input
							leftIcon={<Search className="h-4 w-4 text-gray-400" />}
							placeholder="Search by Categories, Departments.."
							value={query}
							onChange={(e) => {
								setQuery(e.target.value);
								setPage(1);
							}}
							className="h-9 rounded-lg border-gray-300 bg-white pl-9 pr-9 text-sm shadow-none"
						/>
						<kbd className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 rounded border border-gray-200 bg-gray-50 px-1.5 py-0.5 text-[11px] font-medium text-gray-400">
							/
						</kbd>
					</div>
				</div>

				<div className="ml-auto flex flex-wrap items-center gap-4">
					<Select
						value={category}
						onValueChange={(value) => {
							setCategory(value);
							setPage(1);
						}}>
						<SelectTrigger className="h-9 w-[132px] rounded-lg border-gray-300 bg-white text-sm text-gray-700 shadow-none">
							<SelectValue />
						</SelectTrigger>
						<SelectContent>
							{ASSET_CATEGORY_FILTERS.map((option) => (
								<SelectItem
									key={option.value}
									value={option.value}>
									{option.label}
								</SelectItem>
							))}
						</SelectContent>
					</Select>

					<Select
						value={risk}
						onValueChange={(value) => {
							setRisk(value);
							setPage(1);
						}}>
						<SelectTrigger className="h-9 w-[102px] rounded-lg border-gray-300 bg-white text-sm text-gray-700 shadow-none">
							<SelectValue />
						</SelectTrigger>
						<SelectContent>
							{ASSET_RISK_FILTERS.map((option) => (
								<SelectItem
									key={option.value}
									value={option.value}>
									{option.label}
								</SelectItem>
							))}
						</SelectContent>
					</Select>

					<Select
						value={type}
						onValueChange={(value) => {
							setType(value);
							setPage(1);
						}}>
						<SelectTrigger className="h-9 w-[112px] rounded-lg border-gray-300 bg-white text-sm text-gray-700 shadow-none">
							<SelectValue />
						</SelectTrigger>
						<SelectContent>
							{ASSET_TYPE_FILTERS.map((option) => (
								<SelectItem
									key={option.value}
									value={option.value}>
									{option.label}
								</SelectItem>
							))}
						</SelectContent>
					</Select>

					<Select
						value={status}
						onValueChange={(value) => {
							setStatus(value);
							setPage(1);
						}}>
						<SelectTrigger className="h-9 w-[112px] rounded-lg border-gray-300 bg-white text-sm text-gray-700 shadow-none">
							<SelectValue />
						</SelectTrigger>
						<SelectContent>
							{ASSET_STATUS_FILTERS.map((option) => (
								<SelectItem
									key={option.value}
									value={option.value}>
									{option.label}
								</SelectItem>
							))}
						</SelectContent>
					</Select>

					<Button
						type="button"
						onClick={() => setModal({ mode: 'create', asset: null })}
						className="h-9 rounded-lg bg-primary px-10 text-sm font-medium !text-white-600 hover:bg-primary-600">
						Add Assets
					</Button>
				</div>
			</div>

			<div className="space-y-3">
				{/* Stat cards */}
				<div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
					{stats.map((stat) => (
						<div
							key={stat.key}
							className="flex items-center justify-between gap-3 rounded-xl border border-gray-200 bg-white p-4 shadow-[0_1px_4px_rgba(0,0,0,0.06)]">
							<div className="min-w-0">
								<p className="text-[13px] font-medium uppercase tracking-wide text-gray-500">{stat.label}</p>
								<p className="mt-2 text-[30px] font-bold leading-none tracking-tight text-gray-900">{stat.value}</p>
							</div>

							<span className={cn('flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border', stat.iconClass)}>
								<stat.icon className="h-5 w-5" />
							</span>
						</div>
					))}
				</div>

				{/* Table */}
				<div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-[0_1px_4px_rgba(0,0,0,0.04)]">
					<Table>
						<TableHeader>
							<TableRow className="border-gray-200 hover:bg-transparent">
								<TableHead className={cn(HEAD_CLASS, 'w-12')}>
									<Checkbox
										checked={allOnPageSelected}
										onCheckedChange={(checked) => toggleAllOnPage(checked === true)}
										aria-label="Select all assets on this page"
									/>
								</TableHead>
								<TableHead className={HEAD_CLASS}>Asset</TableHead>
								<TableHead className={HEAD_CLASS}>Category</TableHead>
								<TableHead className={HEAD_CLASS}>Department</TableHead>
								<TableHead className={cn(HEAD_CLASS, 'text-right')}>Qty</TableHead>
								<TableHead className={HEAD_CLASS}>Condition</TableHead>
								<TableHead className={HEAD_CLASS}>Risk</TableHead>
								<TableHead className={HEAD_CLASS}>Status</TableHead>
								<TableHead className={HEAD_CLASS}>Maintenance</TableHead>
								<TableHead className={cn(HEAD_CLASS, 'w-14')} />
							</TableRow>
						</TableHeader>

						<TableBody>
							{loading ? (
								<TableRow className="border-gray-100 hover:bg-transparent">
									<TableCell
										colSpan={10}
										className="px-4 py-10 text-center">
										<p className="text-sm text-gray-500">Loading assets...</p>
									</TableCell>
								</TableRow>
							) : rows.length === 0 ? (
								<TableRow className="border-gray-100 hover:bg-transparent">
									<TableCell
										colSpan={10}
										className="px-4 py-10 text-center">
										<p className="text-sm text-gray-500">No assets match your search or filters.</p>
									</TableCell>
								</TableRow>
							) : (
								rows.map((asset) => (
									<TableRow
										key={asset.id}
										className="border-gray-100 hover:bg-gray-50/60"
										onClick={() => openDetail(asset)}>
										<TableCell
											className="px-4 py-2.5 align-middle"
											onClick={(event) => event.stopPropagation()}>
											<Checkbox
												checked={selected.includes(asset.id)}
												onCheckedChange={(checked) => toggleRow(asset.id, checked === true)}
												aria-label={`Select ${asset.name}`}
											/>
										</TableCell>

										<TableCell className="px-4 py-2.5 align-middle">
											<div className="flex items-center gap-3">
												<span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-gray-100 text-sm font-semibold text-gray-500">
													{asset.avatar}
												</span>

												<div className="min-w-0">
													<p className="truncate text-sm font-semibold text-gray-900">{asset.name}</p>
													<p className="truncate text-xs text-gray-400">{asset.tag}</p>
												</div>
											</div>
										</TableCell>

										<TableCell className="px-4 py-2.5 align-middle">
											<CellBadge tone="green">{asset.category}</CellBadge>
										</TableCell>

										<TableCell className="px-4 py-3.5 align-middle text-sm text-gray-500">{asset.department}</TableCell>

										<TableCell className="px-4 py-2.5 text-right align-middle text-sm font-semibold text-gray-700">{asset.qty}</TableCell>

										<TableCell className="px-4 py-2.5 align-middle">
											<CellBadge tone={CONDITION_TONE[asset.condition]}>{asset.condition}</CellBadge>
											{(asset.needsAttention ?? 0) > 0 && asset.qty > 1 && (
												<p className="mt-1 text-xs text-gray-500">
													{asset.needsAttention} of {asset.qty} need attention
												</p>
											)}
										</TableCell>

										<TableCell className="px-4 py-2.5 align-middle">
											<CellBadge tone={RISK_TONE[asset.risk]}>{asset.risk}</CellBadge>
										</TableCell>

										<TableCell className="px-4 py-2.5 align-middle">
											<CellBadge tone="green">{asset.status}</CellBadge>
										</TableCell>

										<TableCell className="px-4 py-2.5 align-middle">
											<p className="text-xs text-gray-500">{asset.maintenance ?? '-'}</p>
											{asset.maintenanceDue && <p className="mt-0.5 text-xs font-medium text-red-500">{asset.maintenanceDue}</p>}
										</TableCell>

										<TableCell
											className="px-4 py-2.5 align-middle"
											onClick={(event) => event.stopPropagation()}>
											<DropdownMenu>
												<DropdownMenuTrigger asChild>
													<button
														type="button"
														aria-label={`${asset.name} actions`}
														className="flex h-8 w-8 items-center justify-center rounded-md text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600">
														<MoreHorizontal className="h-4 w-4" />
													</button>
												</DropdownMenuTrigger>

												<DropdownMenuContent
													align="end"
													className="w-32 rounded-lg border-gray-200 bg-white p-1.5 shadow-lg">
													<DropdownMenuItem
														onSelect={() => openDetail(asset)}
														className="cursor-pointer rounded-md px-3 py-2 text-sm text-gray-900 focus:bg-gray-100 focus:text-gray-900">
														View
													</DropdownMenuItem>
													<DropdownMenuItem
														onSelect={() => openEditModal(asset)}
														className="cursor-pointer rounded-md px-3 py-2 text-sm text-orange-600 focus:bg-orange-50 focus:text-orange-600">
														Edit
													</DropdownMenuItem>
													<DropdownMenuItem
														onSelect={() => setDeleteTarget(asset)}
														className="cursor-pointer rounded-md px-3 py-2 text-sm text-red-600 focus:bg-red-50 focus:text-red-600">
														Delete
													</DropdownMenuItem>
												</DropdownMenuContent>
											</DropdownMenu>
										</TableCell>
									</TableRow>
								))
							)}
						</TableBody>
					</Table>

					{/* Footer */}
					<div className="flex flex-wrap items-center justify-between gap-3 border-t border-gray-100 px-4 py-3">
						<p className="text-sm text-gray-500">
							Showing {rangeStart}–{rangeEnd} of {itemCount} assets
						</p>

						{totalPages > 1 && (
							<Pagination className="m-0 w-auto justify-end">
								<PaginationContent>
									<PaginationItem>
										<Button
											variant="outline"
											size="icon"
											aria-label="Go to previous page"
											disabled={currentPage === 1}
											onClick={() => setPage((value) => Math.max(1, value - 1))}>
											<ChevronLeft className="h-4 w-4" />
										</Button>
									</PaginationItem>

									{pageItems.map((item, index) =>
										item === 'ellipsis' ? (
											<PaginationItem key={`ellipsis-${index}`}>
												<PaginationEllipsis />
											</PaginationItem>
										) : (
											<PaginationItem key={item}>
												<Button
													variant={currentPage === item ? 'default' : 'outline'}
													size="sm"
													aria-label={`Go to page ${item}`}
													aria-current={currentPage === item ? 'page' : undefined}
													onClick={() => setPage(item)}
													className="w-10">
													{item}
												</Button>
											</PaginationItem>
										)
									)}

									<PaginationItem>
										<Button
											variant="outline"
											size="icon"
											aria-label="Go to next page"
											disabled={currentPage === totalPages}
											onClick={() => setPage((value) => Math.min(totalPages, value + 1))}>
											<ChevronRight className="h-4 w-4" />
										</Button>
									</PaginationItem>
								</PaginationContent>
							</Pagination>
						)}
					</div>
				</div>
			</div>

			<AddAssetModal
				open={!!modal}
				onOpenChange={(open) => !open && setModal(null)}
				mode={modal?.mode ?? 'create'}
				asset={modal?.asset ?? null}
				onSaved={handleSaved}
			/>

			<AlertDialog
				open={!!deleteTarget}
				onOpenChange={(open) => {
					if (!open) {
						setDeleteTarget(null);
						setDeleteConfirmText('');
					}
				}}>
				<AlertDialogContent className="max-w-md rounded-2xl bg-[#fff] p-6">
					<div className="flex items-start gap-4">
						<span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-red-50 text-red-600">
							<TriangleAlert className="h-5 w-5" />
						</span>

						<h3 className="pt-2.5 text-lg font-bold text-gray-900">Delete Asset</h3>
					</div>

					<div className="mt-4 flex items-center justify-between gap-3 rounded-lg border border-blue-100 bg-blue-50 px-3.5 py-2.5">
						<span className="truncate text-sm font-medium text-blue-700">{deleteTarget?.name}</span>
						<span className="shrink-0 text-sm font-medium text-blue-700">{deleteTarget?.tag}</span>
					</div>

					<p className="mt-4 text-sm leading-relaxed text-gray-500">
						This will permanently delete the asset and all its records, history, images, and maintenance data. This action cannot be undone.{' '}
						<span className="font-semibold text-gray-700">Be careful - only grant this permission to trusted administrators.</span>
					</p>

					<div className="mt-5 space-y-2">
						<Label htmlFor="list-delete-confirm-input" className="block text-[13px] font-medium leading-none text-gray-700">
							Confirmation Input
							<span className="ml-0.5 align-super text-red-500">*</span>
						</Label>
						<Input
							id="list-delete-confirm-input"
							value={deleteConfirmText}
							onChange={(event) => setDeleteConfirmText(event.target.value)}
							placeholder='Type "Delete" to confirm'
							className="h-10 rounded-lg border-gray-300 bg-white text-sm shadow-none"
						/>
					</div>

					<div className="mt-6 flex justify-end gap-3">
						<Button
							type="button"
							variant="outline"
							onClick={() => {
								setDeleteTarget(null);
								setDeleteConfirmText('');
							}}
							className="h-10 rounded-lg border-gray-300 px-5 text-sm font-medium">
							Cancel
						</Button>

						<Button
							type="button"
							disabled={!isDeleteConfirmed}
							onClick={handleDelete}
							className="h-10 rounded-lg bg-red-600 px-5 text-sm font-medium text-white-600 hover:bg-red-700 disabled:opacity-50">
							Delete
						</Button>
					</div>
				</AlertDialogContent>
			</AlertDialog>
		</div>
	);
}
