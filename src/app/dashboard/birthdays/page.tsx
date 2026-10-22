'use client';

import { Cake, ChevronLeft, ChevronRight, Download } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Loader } from '@/components/ui/loader';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { SidebarTrigger } from '@/components/ui/sidebar';
import Heading from '@/components/ui/typography/Heading';
import { Text } from '@/components/ui/typography/Text';
import { useHasAccess } from '@/lib/access-control';
import { BirthdayExportMember, exportBirthdaysToExcel } from '@/lib/birthday-export';
import { cn, formatUpcomingBirthday, getNextBirthdayDate } from '@/lib/utils';
import { fetchMembers } from '@/services/memberService';
import { useUserStore } from '@/stores/useUserStore';

type BirthdayEntry = {
	id: string;
	name: string;
	date: string;
	nextDate: Date;
	/** 0-based month and day of the birthday; the same every year. */
	month: number;
	day: number;
};

const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

const WEEKDAY_LABELS = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];

const isLeapYear = (year: number) => (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0;

// Keyed by month and day only, so a birthday shows on the calendar in every year.
function buildBirthdayMap(entries: BirthdayEntry[]): Map<string, BirthdayEntry[]> {
	const map = new Map<string, BirthdayEntry[]>();
	for (const entry of entries) {
		const key = `${entry.month}-${entry.day}`;
		const list = map.get(key);
		if (list) {
			list.push(entry);
		} else {
			map.set(key, [entry]);
		}
	}
	return map;
}

// Birthdays on a given calendar day. Feb 29 birthdays fall on Feb 28 in years without a leap day.
function birthdaysOn(map: Map<string, BirthdayEntry[]>, day: Date): BirthdayEntry[] {
	const list = map.get(`${day.getMonth()}-${day.getDate()}`) ?? [];
	if (day.getMonth() === 1 && day.getDate() === 28 && !isLeapYear(day.getFullYear())) {
		return [...list, ...(map.get('1-29') ?? [])];
	}
	return list;
}

export default function BirthdaysPage() {
	const canViewMembers = useHasAccess('MEMBERS', 'VIEW');

	const [entries, setEntries] = useState<BirthdayEntry[]>([]);
	const [exportMembers, setExportMembers] = useState<BirthdayExportMember[]>([]);
	const [loading, setLoading] = useState(true);
	const [isExporting, setIsExporting] = useState(false);

	const [searchInput, setSearchInput] = useState('');
	const [appliedSearch, setAppliedSearch] = useState('');

	const today = useMemo(() => new Date(), []);
	const [viewYear, setViewYear] = useState(today.getFullYear());
	const [viewMonth, setViewMonth] = useState(today.getMonth());

	const [selectedDay, setSelectedDay] = useState<Date | null>(null);

	useEffect(() => {
		let mounted = true;
		async function load() {
			setLoading(true);
			try {
				// The members API is scoped to the admin's church server-side, so
				// every birthday listed here belongs to the current church.
				const pageSize = 100;
				const firstPage = await fetchMembers(1, pageSize);
				const members = [...(firstPage.data || [])];
				const totalPages = firstPage.pagination?.totalPages || 1;
				for (let page = 2; page <= totalPages; page++) {
					const nextPage = await fetchMembers(page, pageSize);
					members.push(...(nextPage.data || []));
				}
				if (!mounted) return;

				// Keep the raw mapped members for the Excel export (needs email/phone).
				setExportMembers(
					members.map((m) => ({
						id: m.id,
						fullName: m.fullName,
						email: m.email,
						phoneNumber: m.phone,
						birthday: m.birthday,
					}))
				);

				const mapped: BirthdayEntry[] = members
					.filter((m) => m?.birthday && !isNaN(new Date(m.birthday).getTime()))
					.map((m) => {
						const parsed = new Date(m.birthday as string);
						return {
							id: m.id,
							name: m.fullName,
							date: m.birthday as string,
							nextDate: getNextBirthdayDate(m.birthday as string),
							month: parsed.getUTCMonth(),
							day: parsed.getUTCDate(),
						};
					})
					.sort((a, b) => a.nextDate.getTime() - b.nextDate.getTime());

				setEntries(mapped);
			} catch {
				if (mounted) setEntries([]);
			} finally {
				if (mounted) setLoading(false);
			}
		}
		load();
		return () => {
			mounted = false;
		};
	}, []);

	const birthdayMap = useMemo(() => buildBirthdayMap(entries), [entries]);

	const visibleEntries = useMemo(() => {
		if (!appliedSearch.trim()) return entries;
		const q = appliedSearch.trim().toLowerCase();
		return entries.filter((e) => e.name.toLowerCase().includes(q));
	}, [entries, appliedSearch]);

	const visibleBirthdayMap = useMemo(() => buildBirthdayMap(visibleEntries), [visibleEntries]);

	// Build a 6-week grid of days for the viewed month (with leading/trailing
	// days from adjacent months, like a standard calendar).
	const calendarDays = useMemo(() => {
		const first = new Date(viewYear, viewMonth, 1);
		const startOffset = first.getDay();
		const start = new Date(viewYear, viewMonth, 1 - startOffset);

		const weeks: Date[][] = [];
		const cursor = new Date(start);
		for (let w = 0; w < 6; w++) {
			const week: Date[] = [];
			for (let d = 0; d < 7; d++) {
				week.push(new Date(cursor));
				cursor.setDate(cursor.getDate() + 1);
			}
			weeks.push(week);
		}
		return weeks;
	}, [viewYear, viewMonth]);

	const goToPrevMonth = () => {
		setViewMonth((m) => {
			if (m === 0) {
				setViewYear((y) => y - 1);
				return 11;
			}
			return m - 1;
		});
	};

	const goToNextMonth = () => {
		setViewMonth((m) => {
			if (m === 11) {
				setViewYear((y) => y + 1);
				return 0;
			}
			return m + 1;
		});
	};

	const selectedDayBirthdays = selectedDay ? birthdaysOn(birthdayMap, selectedDay) : [];

	const isSameDay = (a: Date, b: Date) => a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();

	const churchName = useUserStore((state) => state.church?.name ?? null);

	const handleExport = async () => {
		setIsExporting(true);
		try {
			await exportBirthdaysToExcel(exportMembers, churchName);
		} catch (error) {
			console.error('Failed to export birthdays:', error);
		} finally {
			setIsExporting(false);
		}
	};

	if (!canViewMembers) {
		return (
			<div className="space-y-4">
				<div className="flex items-center gap-3">
					<SidebarTrigger className="sm:hidden" />
					<Heading
						level={2}
						text="Birthdays"
					/>
				</div>
				<Text variant="muted">You don&apos;t have permission to view member birthdays.</Text>
			</div>
		);
	}

	return (
		<div className="space-y-6">
			<div className="flex items-center gap-3">
				<SidebarTrigger className="sm:hidden" />
				<Heading
					level={2}
					text="Birthdays"
				/>
			</div>

			<div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:justify-between">
				{/* Search commits on Enter (or the mobile keyboard's search key),
            not on every keystroke. */}
				<form
					role="search"
					onSubmit={(e) => {
						e.preventDefault();
						setAppliedSearch(searchInput);
					}}
					className="sm:max-w-xs w-full">
					<Input
						value={searchInput}
						onChange={(e) => setSearchInput(e.target.value)}
						onKeyDown={(e) => {
							if (e.key === 'Enter') {
								e.preventDefault();
								setAppliedSearch(searchInput);
							}
						}}
						enterKeyHint="search"
						placeholder="Search by name, press Enter..."
						className="w-full"
					/>
				</form>

				<Button
					variant="outline"
					onClick={handleExport}
					disabled={isExporting || loading || entries.length === 0}
					className="gap-2">
					<Download className="w-4 h-4" />
					{isExporting ? 'Exporting...' : 'Export'}
				</Button>
			</div>

			{loading ? (
				<div className="flex items-center justify-center py-16">
					<Loader
						size="w-10 h-10"
						showShadow={false}
					/>
				</div>
			) : (
				<div className="bg-white rounded-xl border border-gray-300 shadow-[0_1px_4px_rgba(0,0,0,0.06)] p-2 sm:p-6 w-full">
					{/* Calendar header: month/year jump controls + prev/next */}
					<div className="flex items-center justify-between gap-2 mb-4">
						<div className="flex items-center gap-2">
							<Select
								value={String(viewMonth)}
								onValueChange={(v) => setViewMonth(Number(v))}>
								<SelectTrigger className="w-[118px] sm:w-[130px]">
									<SelectValue />
								</SelectTrigger>
								<SelectContent>
									{MONTHS.map((month, idx) => (
										<SelectItem
											key={month}
											value={String(idx)}>
											{month}
										</SelectItem>
									))}
								</SelectContent>
							</Select>

							<Select
								value={String(viewYear)}
								onValueChange={(v) => setViewYear(Number(v))}>
								<SelectTrigger className="w-[88px] sm:w-[100px]">
									<SelectValue />
								</SelectTrigger>
								<SelectContent>
									{Array.from({ length: 9 }, (_, i) => today.getFullYear() - 1 + i).map((year) => (
										<SelectItem
											key={year}
											value={String(year)}>
											{year}
										</SelectItem>
									))}
								</SelectContent>
							</Select>
						</div>

						<div className="flex items-center gap-1">
							<button
								type="button"
								onClick={goToPrevMonth}
								className="p-2.5 rounded-md hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-primary-400"
								aria-label="Previous month">
								<ChevronLeft className="w-4 h-4" />
							</button>
							<button
								type="button"
								onClick={goToNextMonth}
								className="p-2.5 rounded-md hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-primary-400"
								aria-label="Next month">
								<ChevronRight className="w-4 h-4" />
							</button>
						</div>
					</div>

					{/* Weekday labels */}
					<div className="grid grid-cols-7 mb-1">
						{WEEKDAY_LABELS.map((label) => (
							<div
								key={label}
								className="text-center text-xs font-medium text-gray-400 py-1">
								{label}
							</div>
						))}
					</div>

					{/* Day grid */}
					<div className="grid grid-cols-7 gap-0.5 sm:gap-1">
						{calendarDays.flat().map((day) => {
							const inMonth = day.getMonth() === viewMonth;
							const key = `${day.getFullYear()}-${day.getMonth()}-${day.getDate()}`;
							const dayBirthdays = birthdaysOn(visibleBirthdayMap, day);
							const hasBirthday = dayBirthdays.length > 0;
							const isToday = isSameDay(day, today);
							const isSelected = selectedDay ? isSameDay(day, selectedDay) : false;

							return (
								<button
									key={key}
									type="button"
									onClick={() => {
										if (inMonth && hasBirthday) {
											setSelectedDay(day);
										}
									}}
									disabled={!inMonth || !hasBirthday}
									className={cn(
										'relative h-11 sm:h-[46px] w-full flex items-center justify-center rounded-md sm:rounded-lg text-sm sm:text-base transition-colors touch-manipulation',
										!inMonth && 'text-gray-300 opacity-50',
										inMonth && !hasBirthday && 'text-gray-600',
										hasBirthday && 'bg-primary-50 text-primary-700 font-semibold hover:bg-primary-100 cursor-pointer',
										isToday && 'ring-1 ring-primary-400',
										isSelected && 'bg-primary text-white hover:bg-primary ring-0'
									)}
									aria-label={
										hasBirthday
											? `${day.getDate()} ${MONTHS[day.getMonth()]}, ${dayBirthdays.length} birthday${dayBirthdays.length === 1 ? '' : 's'}`
											: `${day.getDate()} ${MONTHS[day.getMonth()]}, no birthdays`
									}>
									<span className="flex items-center gap-1">
										{day.getDate()}
										{hasBirthday && !isSelected && <Cake className="hidden sm:block w-3 h-3 text-primary-400" />}
											{hasBirthday && <span aria-hidden className={cn('sm:hidden absolute bottom-1 left-1/2 -translate-x-1/2 h-1.5 w-1.5 rounded-full', isSelected ? 'bg-white' : 'bg-primary-400')} />}
											{dayBirthdays.length > 1 && (
												<span
													aria-hidden
													className={cn(
														'absolute top-0.5 right-0.5 sm:top-1 sm:right-1 min-w-[14px] h-[14px] px-0.5 rounded-full text-[9px] leading-[14px] font-semibold',
														isSelected ? 'bg-white text-primary' : 'bg-primary-400 text-white'
													)}>
													{dayBirthdays.length}
												</span>
											)}
									</span>
								</button>
							);
						})}
					</div>

					<div className="mt-4 flex items-center gap-2">
						<span className="inline-flex items-center gap-1.5 text-xs text-gray-500">
							<span className="w-4 h-4 rounded bg-primary-50 border border-primary-200 inline-flex items-center justify-center">
								<Cake className="w-2.5 h-2.5 text-primary-400" />
							</span>
							Birthday
						</span>
						{appliedSearch.trim() && visibleEntries.length === 0 && <span className="text-xs text-gray-500 ml-2">No birthdays match your search.</span>}
					</div>
				</div>
			)}

			{/* Birthday drawer */}
			<Sheet
				open={!!selectedDay}
				onOpenChange={(open) => !open && setSelectedDay(null)}>
				<SheetContent
					side="right"
					className="flex w-full flex-col gap-0 p-0 sm:max-w-md">
					<SheetHeader className="px-6 pt-6 pb-4 border-b">
						<SheetTitle>
							Birthdays on{' '}
							{selectedDay?.toLocaleDateString('en-US', {
								weekday: 'long',
								month: 'long',
								day: 'numeric',
							})}
						</SheetTitle>
						<Text
							variant="muted"
							className="text-sm">
							{selectedDayBirthdays.length} birthday
							{selectedDayBirthdays.length === 1 ? '' : 's'}
						</Text>
					</SheetHeader>

					<div className="flex-1 overflow-y-auto px-6 py-5">
						{selectedDayBirthdays.length === 0 ? (
							<div className="py-12 text-center">
								<Cake className="w-10 h-10 mx-auto text-gray-300 mb-3" />
								<Text variant="muted">No birthdays on this day.</Text>
							</div>
						) : (
							<div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
								{selectedDayBirthdays.map((entry) => (
									<div
										key={entry.id}
										className="flex flex-col items-start gap-2 bg-white rounded-xl border border-gray-300
                               shadow-[0_1px_4px_rgba(0,0,0,0.06)] px-4 py-4">
										<div
											className="w-9 h-9 rounded-full bg-primary-50 shrink-0
                                 flex items-center justify-center">
											<Cake className="w-4 h-4 text-primary-400" />
										</div>
										<div className="min-w-0">
											<p className="text-sm font-semibold text-gray-900 truncate">{entry.name}</p>
											<p className="text-xs text-gray-400">{formatUpcomingBirthday(entry.date)}</p>
										</div>
									</div>
								))}
							</div>
						)}
					</div>
				</SheetContent>
			</Sheet>
		</div>
	);
}
