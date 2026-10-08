'use client';

import { X } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';

import { Button } from '@/components/ui/button';
import { DatePicker } from '@/components/ui/date-picker';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { createAsset, CreateAssetPayload, updateAsset } from '@/services/assetService';
import { fetchDepartments } from '@/services/departmentService';
import { fetchLocations } from '@/services/locationService';
import { fetchAdmins } from '@/services/userServices';

import { Asset, ASSET_CATEGORIES, ASSET_RISKS, ASSET_STATUSES, MAINTENANCE_FREQUENCIES } from './data';

export type AssetModalMode = 'create' | 'edit' | 'view';

export interface AddAssetModalProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	mode?: AssetModalMode;
	asset?: Asset | null;
	onSaved: (asset: Asset, mode: Exclude<AssetModalMode, 'view'>) => void;
}

interface FormState {
	name: string;
	tag: string;
	description: string;
	category: string;
	department: string;
	owner: string;
	responsibleMode: 'system' | 'manual';
	assignee: string;
	manualName: string;
	manualEmail: string;
	total: string;
	good: string;
	fair: string;
	repair: string;
	damaged: string;
	risk: string;
	location: string;
	status: string;
	maintenanceEnabled: boolean;
	frequency: string;
	lastService: string;
	lastReview: string;
	remarks: string;
}

const EMPTY_FORM: FormState = {
	name: '',
	tag: '',
	description: '',
	category: 'Other',
	department: '',
	owner: '',
	responsibleMode: 'system',
	assignee: '',
	manualName: '',
	manualEmail: '',
	total: '1',
	good: '0',
	fair: '0',
	repair: '0',
	damaged: '0',
	risk: 'Low',
	location: '',
	status: 'Active',
	maintenanceEnabled: true,
	frequency: 'Quarterly',
	lastService: '',
	lastReview: '',
	remarks: '',
};

const controlClass = 'h-9 rounded-lg border-gray-300 bg-white text-sm text-gray-900 shadow-none';

/** Best-effort conversion from a display date ("Apr 28, 2026") back to the
 * yyyy-MM-dd shape a date input needs. Returns "" when it can't be parsed. */
function toInputDate(display: string | undefined) {
	if (!display) return '';
	const parsed = new Date(display);
	if (Number.isNaN(parsed.getTime())) return '';
	return parsed.toISOString().slice(0, 10);
}

function FieldLabel({ htmlFor, children, required, className }: { htmlFor?: string; children: React.ReactNode; required?: boolean; className?: string }) {
	return (
		<Label
			htmlFor={htmlFor}
			className={cn('block text-[13px] font-medium leading-none text-gray-700', className)}>
			{children}
			{required && <span className="ml-0.5 align-super text-red-500">*</span>}
		</Label>
	);
}

function Fieldset({ title, action, children }: { title: string; action?: React.ReactNode; children: React.ReactNode }) {
	return (
		<section className="rounded-xl border border-gray-200 p-4">
			<div className="flex items-center justify-between gap-3">
				<h3 className="text-sm font-semibold text-gray-800">{title}</h3>
				{action}
			</div>
			{children}
		</section>
	);
}

export function AddAssetModal({ open, onOpenChange, mode = 'create', asset, onSaved }: AddAssetModalProps) {
	const { toast } = useToast();
	const readOnly = mode === 'view';
	const [form, setForm] = useState<FormState>(EMPTY_FORM);
	const [departments, setDepartments] = useState<{ id: string; name: string }[]>([]);
	const [admins, setAdmins] = useState<{ id: string; fullName: string }[]>([]);
	const [locations, setLocations] = useState<{ id: string; name: string }[]>([]);
	const [submitting, setSubmitting] = useState(false);

	useEffect(() => {
		if (!open) return;

		fetchDepartments({ page: 1, limit: 100 })
			.then((res) => {
				setDepartments(res.data.map((d) => ({ id: d.id, name: d.name })));
			})
			.catch(() => {
				// Department select just stays empty when the API is unavailable.
			});

		fetchAdmins({ page: 1, limit: 100 })
			.then((res) => setAdmins(res.data))
			.catch(() => {
				// Assignee select just stays empty when the API is unavailable.
			});

		fetchLocations()
			.then((res) =>
				setLocations(
					res
						.filter((location) => location.isActive)
						.sort((a, b) => a.sortOrder - b.sortOrder),
				),
			)
			.catch(() => {
				// Location select just stays empty when the API is unavailable.
			});
	}, [open]);

	useEffect(() => {
		if (!open) {
			setForm(EMPTY_FORM);
			return;
		}

		if (asset) {
			setForm({
				...EMPTY_FORM,
				name: asset.name,
				tag: asset.tag,
				description: asset.description,
				category: asset.category,
				department: asset.departmentId || '',
				owner: asset.owner,
				responsibleMode: asset.responsible.isSystem ? 'system' : 'manual',
				assignee: asset.responsible.isSystem ? asset.responsible.id || '' : '',
				manualName: !asset.responsible.isSystem ? asset.responsible.name : '',
				manualEmail: !asset.responsible.isSystem ? asset.responsible.email : '',
				total: String(asset.qty),
				good: String(asset.conditions.good),
				fair: String(asset.conditions.fair),
				repair: String(asset.conditions.repair),
				damaged: String(asset.conditions.damaged),
				risk: asset.risk,
				location: asset.location,
				status: asset.status,
				maintenanceEnabled: Boolean(asset.maintenance),
				frequency: asset.maintenance ?? 'Quarterly',
				lastService: toInputDate(asset.schedule.lastService),
				lastReview: toInputDate(asset.schedule.lastReview),
				remarks: asset.remarks,
			});
		} else {
			setForm(EMPTY_FORM);
		}
	}, [open, asset]);

	const update = <K extends keyof FormState>(key: K, value: FormState[K]) => setForm((prev) => ({ ...prev, [key]: value }));

	const assigned = useMemo(() => {
		const parse = (value: string) => Number(value) || 0;
		return parse(form.good) + parse(form.fair) + parse(form.repair) + parse(form.damaged);
	}, [form.good, form.fair, form.repair, form.damaged]);

	const total = Number(form.total) || 0;
	const quantityMessage =
		assigned > total ? (
			<>
				Too many items listed ({assigned} is more than {total}).
			</>
		) : assigned < total ? (
			<>
				Total assigned:{' '}
				<span className="font-semibold">
					{assigned} of {total}
				</span>{' '}
				items assigned.
			</>
		) : (
			<>Total assigned: All items assigned.</>
		);
	const quantityVariant = assigned === total ? 'success' : 'error';

	const isValid = Boolean(form.name.trim()) && Boolean(form.description.trim()) && total > 0 && assigned === total;

	const handleSubmit = async () => {
		if (!isValid) {
			toast({
				title: 'Missing information',
				description: 'Asset name, description and quantities are required',
				variant: 'destructive',
			});
			return;
		}

		const parse = (value: string) => Number(value) || 0;

		const payload: CreateAssetPayload = {
			name: form.name.trim(),
			tag: form.tag.trim() || undefined,
			category: form.category,
			department: form.department || undefined,
			description: form.description.trim(),
			location: form.location.trim() || undefined,
			owner: form.owner.trim() || undefined,
			responsibleMode: form.responsibleMode,
			responsibleAdmin: form.responsibleMode === 'system' ? form.assignee || undefined : undefined,
			responsibleManualName: form.responsibleMode === 'manual' ? form.manualName.trim() : undefined,
			responsibleManualEmail: form.responsibleMode === 'manual' ? form.manualEmail.trim() : undefined,
			conditions: {
				good: parse(form.good),
				fair: parse(form.fair),
				repair: parse(form.repair),
				damaged: parse(form.damaged),
			},
			risk: form.risk as Asset['risk'],
			status: form.status as Asset['status'],
			maintenanceEnabled: form.maintenanceEnabled,
			frequency: form.maintenanceEnabled ? form.frequency : undefined,
			lastService: form.lastService || undefined,
			lastReview: form.lastReview || undefined,
			remarks: form.remarks.trim() || undefined,
		};

		setSubmitting(true);
		try {
			const saved = mode === 'edit' && asset ? await updateAsset(asset.id, payload) : await createAsset(payload);

			onSaved(saved, mode === 'edit' ? 'edit' : 'create');
			onOpenChange(false);
		} catch {
			toast({
				title: mode === 'edit' ? 'Failed to update asset' : 'Failed to create asset',
				description: 'Please try again',
				variant: 'destructive',
			});
		} finally {
			setSubmitting(false);
		}
	};

	const title = mode === 'create' ? 'Add New Asset' : mode === 'edit' ? 'Edit Asset' : 'Asset Details';
	const submitLabel = mode === 'edit' ? 'Save Changes' : 'Create Asset';

	return (
		<Dialog
			open={open}
			onOpenChange={onOpenChange}>
			<DialogContent
				showClose={false}
				className="flex h-[min(80vh,900px)] max-w-[664px] flex-col gap-0 overflow-hidden rounded-2xl border-0 bg-[#fff] p-0 shadow-2xl backdrop-blur-none">
				<div className="flex items-start justify-between px-7 pb-2 pt-6">
					<DialogTitle className="pr-8 text-xl font-bold text-gray-900">{title}</DialogTitle>

					<button
						type="button"
						onClick={() => onOpenChange(false)}
						aria-label="Close"
						className="-mr-1 rounded-md p-1 text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-800">
						<X className="h-5 w-5" />
					</button>
				</div>

				<div className="min-h-0 flex-1 overflow-y-auto px-7 pb-6">
					<div className="space-y-4 pt-3">
						<div className="grid grid-cols-2 gap-4">
							<div className="space-y-2">
								<FieldLabel
									htmlFor="asset-name"
									required>
									Asset Name
								</FieldLabel>
								<Input
									id="asset-name"
									disabled={readOnly}
									value={form.name}
									onChange={(e) => update('name', e.target.value)}
									placeholder="e.g. Yamaha Speaker"
									className={controlClass}
								/>
							</div>

							<div className="space-y-2">
								<FieldLabel htmlFor="asset-tag">Asset Tag ID</FieldLabel>
								<Input
									id="asset-tag"
									disabled={readOnly}
									value={form.tag}
									onChange={(e) => update('tag', e.target.value)}
									placeholder="Auto-generated if empty"
									className={controlClass}
								/>
							</div>
						</div>

						<div className="space-y-2">
							<FieldLabel
								htmlFor="asset-description"
								required>
								Description
							</FieldLabel>
							<Textarea
								id="asset-description"
								disabled={readOnly}
								value={form.description}
								onChange={(e) => update('description', e.target.value)}
								placeholder="Describe the asset..."
								rows={3}
								className={cn(controlClass, 'h-auto resize-none py-2')}
							/>
						</div>

						<div className="grid grid-cols-3 gap-4">
							<div className="space-y-2">
								<FieldLabel required>Category</FieldLabel>
								<Select
									value={form.category}
									onValueChange={(value) => update('category', value)}
									disabled={readOnly}>
									<SelectTrigger className={controlClass}>
										<SelectValue />
									</SelectTrigger>
									<SelectContent>
										{ASSET_CATEGORIES.map((category) => (
											<SelectItem
												key={category}
												value={category}>
												{category}
											</SelectItem>
										))}
									</SelectContent>
								</Select>
							</div>

							<div className="space-y-2">
								<FieldLabel>Department</FieldLabel>
								<Select
									value={form.department}
									onValueChange={(value) => update('department', value)}
									disabled={readOnly}>
									<SelectTrigger className={cn(controlClass, 'text-muted-foreground')}>
										<SelectValue placeholder="Select Department" />
									</SelectTrigger>
									<SelectContent>
										{departments.map((department) => (
											<SelectItem
												key={department.id}
												value={department.id}>
												{department.name}
											</SelectItem>
										))}
									</SelectContent>
								</Select>
							</div>

							<div className="space-y-2">
								<FieldLabel htmlFor="asset-owner">Owner</FieldLabel>
								<Input
									id="asset-owner"
									disabled={readOnly}
									value={form.owner}
									onChange={(e) => update('owner', e.target.value)}
									placeholder="Enter Owner's name"
									className={controlClass}
								/>
							</div>
						</div>

						<Fieldset title="Responsible Person">
							<div className="mt-3 space-y-3">
								<div className="space-y-2.5">
									<RadioGroup
										value={form.responsibleMode}
										onValueChange={(value) => update('responsibleMode', value as FormState['responsibleMode'])}
										disabled={readOnly}
										className="gap-2.5">
										<div className="flex items-center gap-2.5">
											<RadioGroupItem
												value="system"
												id="responsible-system"
											/>
											<Label
												htmlFor="responsible-system"
												className="font-normal text-gray-700">
												Assign System User
											</Label>
										</div>

										{form.responsibleMode === 'system' && (
											<Select
												value={form.assignee}
												onValueChange={(value) => update('assignee', value)}
												disabled={readOnly}>
												<SelectTrigger className={cn(controlClass, 'ml-4 w-[calc(100%-1rem)] text-muted-foreground')}>
													<SelectValue placeholder="Assignee" />
												</SelectTrigger>
												<SelectContent>
													{admins.map((admin) => (
														<SelectItem
															key={admin.id}
															value={admin.id}>
															{admin.fullName}
														</SelectItem>
													))}
												</SelectContent>
											</Select>
										)}

										<div className="flex items-center gap-2.5 pt-0.5">
											<RadioGroupItem
												value="manual"
												id="responsible-manual"
											/>
											<Label
												htmlFor="responsible-manual"
												className="font-normal text-gray-700">
												Enter Name Manually
											</Label>
										</div>
									</RadioGroup>

									{form.responsibleMode === 'manual' && (
										<div className="ml-4 grid grid-cols-2 gap-4">
											<Input
												disabled={readOnly}
												value={form.manualName}
												onChange={(e) => update('manualName', e.target.value)}
												placeholder="Enter Name"
												className={controlClass}
											/>
											<Input
												disabled={readOnly}
												value={form.manualEmail}
												onChange={(e) => update('manualEmail', e.target.value)}
												placeholder="Enter Email Address"
												className={controlClass}
											/>
										</div>
									)}
								</div>

								<div className="rounded-lg border border-blue-200 bg-blue-50 px-3.5 py-2.5">
									<p className="text-[13px] leading-relaxed text-blue-800">System users can update records for assets they&apos;re assigned to.</p>
									<p className="text-[13px] leading-relaxed text-blue-800">Manual names are for accountability only and receive no system access.</p>
								</div>
							</div>
						</Fieldset>

						<Fieldset title="Quantity & Condition">
							<div className="mt-3 grid grid-cols-5 gap-4">
								<div className="space-y-2">
									<FieldLabel
										htmlFor="qty-total"
										required>
										Total
									</FieldLabel>
									<Input
										id="qty-total"
										type="number"
										min={0}
										disabled={readOnly}
										value={form.total}
										onChange={(e) => update('total', e.target.value)}
										className={controlClass}
									/>
								</div>

								<div className="space-y-2">
									<FieldLabel
										htmlFor="qty-good"
										className="text-green-600">
										Good
									</FieldLabel>
									<Input
										id="qty-good"
										type="number"
										min={0}
										disabled={readOnly}
										value={form.good}
										onChange={(e) => update('good', e.target.value)}
										className={controlClass}
									/>
								</div>

								<div className="space-y-2">
									<FieldLabel
										htmlFor="qty-fair"
										className="text-blue-600">
										Fair
									</FieldLabel>
									<Input
										id="qty-fair"
										type="number"
										min={0}
										disabled={readOnly}
										value={form.fair}
										onChange={(e) => update('fair', e.target.value)}
										className={controlClass}
									/>
								</div>

								<div className="space-y-2">
									<FieldLabel
										htmlFor="qty-repair"
										className="text-orange-600">
										Repair
									</FieldLabel>
									<Input
										id="qty-repair"
										type="number"
										min={0}
										disabled={readOnly}
										value={form.repair}
										onChange={(e) => update('repair', e.target.value)}
										className={controlClass}
									/>
								</div>

								<div className="space-y-2">
									<FieldLabel
										htmlFor="qty-damaged"
										className="text-red-600">
										Damaged
									</FieldLabel>
									<Input
										id="qty-damaged"
										type="number"
										min={0}
										disabled={readOnly}
										value={form.damaged}
										onChange={(e) => update('damaged', e.target.value)}
										className={controlClass}
									/>
								</div>
							</div>

							<div
								className={cn(
									'mt-4 rounded-lg border px-3.5 py-3 text-sm',
									quantityVariant === 'success' ? 'border-green-200 bg-green-50 text-green-700' : 'border-red-200 bg-red-50 text-red-700'
								)}>
								{quantityMessage}
							</div>
						</Fieldset>

						<div className="grid grid-cols-2 gap-4">
							<div className="space-y-2">
								<FieldLabel required>Missing Risk</FieldLabel>
								<Select
									value={form.risk}
									onValueChange={(value) => update('risk', value)}
									disabled={readOnly}>
									<SelectTrigger className={controlClass}>
										<SelectValue />
									</SelectTrigger>
									<SelectContent>
										{ASSET_RISKS.map((risk) => (
											<SelectItem
												key={risk}
												value={risk}>
												{risk}
											</SelectItem>
										))}
									</SelectContent>
								</Select>
							</div>

							<div className="space-y-2">
								<FieldLabel htmlFor="asset-location">Location</FieldLabel>
								<Select
									value={form.location}
									onValueChange={(value) => update('location', value)}
									disabled={readOnly}>
									<SelectTrigger id="asset-location" className={cn(controlClass, 'text-muted-foreground')}>
										<SelectValue placeholder="Select Location" />
									</SelectTrigger>
									<SelectContent>
										{locations.map((location) => (
											<SelectItem key={location.id} value={location.name}>
												{location.name}
											</SelectItem>
										))}
									</SelectContent>
								</Select>
							</div>
						</div>

						<div className="space-y-2">
							<FieldLabel>Status</FieldLabel>
							<Select
								value={form.status}
								onValueChange={(value) => update('status', value)}
								disabled={readOnly}>
								<SelectTrigger className={controlClass}>
									<SelectValue />
								</SelectTrigger>
								<SelectContent>
									{ASSET_STATUSES.map((status) => (
										<SelectItem
											key={status}
											value={status}>
											{status}
										</SelectItem>
									))}
								</SelectContent>
							</Select>
						</div>

						<Fieldset
							title="Scheduled Maintenance"
							action={
								<Switch
									checked={form.maintenanceEnabled}
									onCheckedChange={(checked) => update('maintenanceEnabled', checked)}
									disabled={readOnly}
								/>
							}>
							{form.maintenanceEnabled && (
								<div className="mt-3 space-y-4">
									<div className="space-y-2">
										<FieldLabel htmlFor="maintenance-frequency">Maintenance Frequency</FieldLabel>
										<Select
											value={form.frequency}
											onValueChange={(value) => update('frequency', value)}
											disabled={readOnly}>
											<SelectTrigger className={controlClass}>
												<SelectValue />
											</SelectTrigger>
											<SelectContent>
												{MAINTENANCE_FREQUENCIES.map((frequency) => (
													<SelectItem
														key={frequency}
														value={frequency}>
														{frequency}
													</SelectItem>
												))}
											</SelectContent>
										</Select>
									</div>

									<div className="grid grid-cols-2 gap-4">
										<div className="space-y-2">
											<FieldLabel htmlFor="last-service">Last Service Date</FieldLabel>
											<DatePicker
												id="last-service"
												disabled={readOnly}
												value={form.lastService}
												onChange={(value) => update('lastService', value)}
											/>
										</div>

										<div className="space-y-2">
											<FieldLabel htmlFor="last-review">Last Review Date</FieldLabel>
											<DatePicker
												id="last-review"
												disabled={readOnly}
												value={form.lastReview}
												onChange={(value) => update('lastReview', value)}
											/>
										</div>
									</div>

									<div className="space-y-2">
										<FieldLabel htmlFor="next-due">Next Due Date</FieldLabel>
										<Input
											id="next-due"
											disabled
											readOnly
											placeholder="Auto-calculated after saving"
											className={cn(controlClass, 'bg-gray-50 text-muted-foreground')}
										/>
									</div>
								</div>
							)}
						</Fieldset>

						<Fieldset title="Supporting Information">
							<div className="mt-3 space-y-2">
								<FieldLabel htmlFor="asset-remarks">Remarks</FieldLabel>
								<Textarea
									id="asset-remarks"
									disabled={readOnly}
									value={form.remarks}
									onChange={(e) => update('remarks', e.target.value)}
									placeholder="Add any notes, observations, or context about this asset..."
									rows={4}
									className={cn(controlClass, 'h-auto resize-none py-2')}
								/>
							</div>
						</Fieldset>
					</div>

					<div className="mt-5 flex justify-end gap-3 border-t border-gray-100 pt-4">
						<Button
							type="button"
							variant="outline"
							className="h-10 rounded-lg border-gray-300 px-5 text-sm font-medium"
							onClick={() => onOpenChange(false)}>
							{mode === 'view' ? 'Close' : 'Cancel'}
						</Button>

						{mode !== 'view' && (
							<Button
								type="button"
								disabled={!isValid || submitting}
								onClick={handleSubmit}
								className="h-10 rounded-lg bg-primary px-5 text-sm font-medium text-white-600 hover:bg-primary-600">
								{submitting ? 'Saving...' : submitLabel}
							</Button>
						)}
					</div>
				</div>
			</DialogContent>
		</Dialog>
	);
}
