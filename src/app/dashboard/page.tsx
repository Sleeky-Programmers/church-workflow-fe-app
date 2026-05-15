"use client";

import { CalendarDays, User } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";

import DashboardMobile from "@/components/features/dashboard/dashboard-mobile";
import {
  StatCard,
  TotalIncomeCard,
} from "@/components/features/dashboard/StatCard";
import { TrendChart } from "@/components/features/dashboard/trend-chart";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { EVENT_CATEGORY_CONFIG } from "@/config/event-category";
import { useIsMobile } from "@/hooks/use-mobile";
import {
  fetchAttendanceStats,
  fetchTotalMembers,
  getMyChurch,
} from "@/lib/api";
import { getCurrentUserProfile } from "@/lib/auth/session";
import { DashboardData } from "@/lib/data";
import { EventCategory, EventType } from "@/lib/enums";
import {
  cn,
  formatEventDate,
  formatUpcomingBirthday,
  getNextBirthdayDate,
  isInFuture,
  sortBirthdaysByNearest,
} from "@/lib/utils";
import { fetchMembers as fetchMemberProfiles } from "@/services/memberService";
import { ChurchEvent } from "@/types";

import type { ChurchResponse } from "@/types/payload";

// ─────────────────────────────────────────────────────────────────────────────
// Constants
// ─────────────────────────────────────────────────────────────────────────────

const EVENT_STORAGE_KEY = "dashboard:events";

const EVENT_CATEGORY_BY_TYPE: Partial<Record<EventType, EventCategory>> = {
  [EventType.WORSHIP_SERVICE]: EventCategory.GENERAL,
  [EventType.BIRTHDAY]: EventCategory.GENERAL,
  [EventType.MEETING]: EventCategory.LEADERSHIP,
  [EventType.WEDDING_ANNIVERSARY]: EventCategory.SPECIAL,
  [EventType.OTHER]: EventCategory.SPECIAL,
};

const formatNaira = (amount: string | number): string => {
  const n =
    typeof amount === "string" ? parseInt(amount.replace(/,/g, "")) : amount;
  return `₦${n.toLocaleString()}`;
};

const formatGrowth = (growth: string | number): string => {
  const n = typeof growth === "string" ? parseFloat(growth) : growth;
  return `${n > 0 ? "+" : ""}${n.toFixed(1)}%`;
};

// ─────────────────────────────────────────────────────────────────────────────
// Dot colour map for event categories
// ─────────────────────────────────────────────────────────────────────────────

const DOT_COLORS: Record<string, string> = {
  GENERAL: "bg-blue-600",
  LEADERSHIP: "bg-orange-500",
  SPECIAL: "bg-red-500",
};

// ─────────────────────────────────────────────────────────────────────────────
// Page
// ─────────────────────────────────────────────────────────────────────────────

export default function Dashboard() {
  const [displayName, setDisplayName] = useState("Super Admin");
  const isMobile = useIsMobile();

  const [totalMembers, setTotalMembers] = useState("0");
  const [totalMembersGrowth, setTotalMembersGrowth] = useState("0%");
  const [serviceAttendance, setServiceAttendance] = useState("0");
  const [serviceAttendanceGrowth, setServiceAttendanceGrowth] = useState("0%");
  const [income, setIncome] = useState(0);
  const [incomeGrowth, setIncomeGrowth] = useState(0);
  const [attendanceTrendData, setAttendanceTrendData] = useState<any[]>([]);
  const [incomeTrendData, setIncomeTrendData] = useState<any[]>([]);
  const [upcomingBirthdays, setUpcomingBirthdays] = useState<
    { name: string; date: string }[]
  >([]);
  const [upcomingEvents, setUpcomingEvents] = useState(
    DashboardData.upcomingEvents,
  );
  const [incomeMonth, setIncomeMonth] = useState<"This Month" | "Last Month">(
    "This Month",
  );

  // Single church state
  const [church, setChurch] = useState<{
    _id: string;
    name: string;
    alias: string;
    address: string;
    country: string;
    state: string;
    defaultCurrency: string;
    logoUrl: null | string;
  }>({
    _id: "",
    name: "Your Church",
    alias: "",
    address: "",
    country: "",
    state: "",
    defaultCurrency: "NGN",
    logoUrl: null,
  });

  // ── Profile ──
  useEffect(() => {
    const profile = getCurrentUserProfile();
    if (profile?.firstName) setDisplayName(profile.firstName);
    else if (profile?.fullName) setDisplayName(profile.fullName);
  }, []);

  // ── Church ──
  useEffect(() => {
    async function loadChurch() {
      try {
        const churchData = await getMyChurch();
        console.log({ church: churchData });
        if (churchData) {
          setChurch({
            _id: churchData._id || "",
            name: churchData.name || "Your Church",
            alias: churchData.alias || "",
            address: churchData.address || "",
            country: churchData.country || "",
            state: churchData.state || "",
            defaultCurrency: churchData.defaultCurrency || "NGN",
            logoUrl: churchData.logoUrl || null,
          });
        }
      } catch {
        /* silent - keep default church state */
      }
    }
    loadChurch();
  }, []);

  // ── Members ──
  useEffect(() => {
    fetchTotalMembers()
      .then(({ totalMembers, growth }) => {
        setTotalMembers(totalMembers.toLocaleString());
        setTotalMembersGrowth(growth || "0%");
      })
      .catch(() => {});
  }, []);

  // ── Attendance ──
  useEffect(() => {
    fetchAttendanceStats()
      .then((res) => {
        const { totalAttendance, attendanceGrowth, monthlyAttendanceTrends } =
          res;
        setServiceAttendance(totalAttendance.toLocaleString());
        setServiceAttendanceGrowth(attendanceGrowth || "0%");
        const trends = monthlyAttendanceTrends || [];
        setAttendanceTrendData(trends);
        setIncomeTrendData(
          trends.map((t) => ({ month: t.month, thisMonth: 0, lastMonth: 0 })),
        );
      })
      .catch(() => {});
  }, []);

  // ── Birthdays ──
  useEffect(() => {
    let mounted = true;
    async function loadBirthdays() {
      try {
        const members: any[] = [];
        let page = 1;
        while (page <= 3) {
          const res = await fetchMemberProfiles(page, 100);
          members.push(...(res.data || []));
          if (!res.pagination?.hasNextPage) break;
          page++;
        }
        if (!mounted) return;
        const today = new Date();
        const cutoff = new Date();
        cutoff.setMonth(today.getMonth() + 3);
        const mapped = members
          .filter((m) => m?.birthday && !isNaN(new Date(m.birthday).getTime()))
          .map((m) => ({ name: m.fullName, date: m.birthday }))
          .filter(({ date }) => {
            const next = getNextBirthdayDate(date);
            return next >= today && next <= cutoff;
          });
        setUpcomingBirthdays(sortBirthdaysByNearest(mapped));
      } catch {
        if (mounted) setUpcomingBirthdays([]);
      }
    }
    loadBirthdays();
    return () => {
      mounted = false;
    };
  }, []);

  // ── Cached events ──
  useEffect(() => {
    try {
      const stored = localStorage.getItem(EVENT_STORAGE_KEY);
      if (!stored) return;
      const parsed = JSON.parse(stored) as ChurchEvent[];
      const normalized = parsed.map((e) => ({
        title: e.title,
        date: e.date,
        category: EVENT_CATEGORY_BY_TYPE[e.type] || EventCategory.GENERAL,
      }));
      if (normalized.length) setUpcomingEvents(normalized);
    } catch {
      setUpcomingEvents(DashboardData.upcomingEvents);
    }
  }, []);

  // ── Mobile shell ──
  if (isMobile) {
    return (
      <DashboardMobile
        displayName={displayName}
        churchName={church.name}
        totalMembers={totalMembers}
        totalMembersGrowth={totalMembersGrowth}
        serviceAttendance={serviceAttendance}
        serviceAttendanceGrowth={serviceAttendanceGrowth}
        attendanceTrendData={attendanceTrendData}
        incomeTrendData={incomeTrendData}
        upcomingEvents={upcomingEvents}
        upcomingBirthdays={upcomingBirthdays}
      />
    );
  }

  // ── Derived ──
  const sortedEvents = upcomingEvents
    .filter((e) => isInFuture(e.date))
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  // Only compute initials as fallback when alias is not available
  const churchInitials = church.alias
    ? church.alias.substring(0, 2).toUpperCase()
    : church.name && church.name !== "Your Church"
      ? church.name
          .split(" ")
          .slice(0, 2)
          .map((w) => w[0])
          .join("")
          .toUpperCase()
      : "CW";

  // Get location string from address, state, country
  const churchLocation = [church.address].filter(Boolean).join(", ");

  return (
    <div className="flex flex-col gap-5 pb-8">
      <div className="flex items-center justify-between">
        <h1 className="text-[22px] font-bold text-gray-900 tracking-tight">
          Hello, {displayName}
        </h1>

        <div className="flex items-center gap-3">
          <div className="text-right leading-tight">
            <p className="text-[13.5px] font-bold text-gray-900">
              {church.name}
            </p>
            {churchLocation && churchLocation !== "N/A" && (
              <p className="text-[12px] text-gray-400 mt-0.5">
                {churchLocation}
              </p>
            )}
          </div>

          {church.logoUrl ? (
            <div className="w-10 h-10 rounded-full bg-primary-400 flex items-center justify-center ring-2 ring-blue-100 shrink-0 overflow-hidden">
              <img
                src={church.logoUrl}
                alt={church.name}
                className="w-full h-full object-cover"
              />
            </div>
          ) : (
            <div className="w-10 h-10 rounded-full bg-primary-400 flex items-center justify-center tracking-wide text-white-600 text-[11px] font-extrabold ring-2 ring-blue-100 shrink-0">
              {church.alias || churchInitials}
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_316px] gap-4 items-stretch">
        <div className="flex flex-col gap-4">
          <div className="grid grid-cols-2 gap-4">
            <StatCard
              title="Total Members"
              count={totalMembers}
              growth={totalMembersGrowth}
              iconVariant="blue"
            />
            <StatCard
              title="Attendance"
              count={serviceAttendance}
              growth={serviceAttendanceGrowth}
              growthLabel="Last Event"
              iconVariant="orange"
            />
          </div>

          <div
            className="bg-white rounded-2xl border border-gray-300
                        shadow-[0_1px_4px_rgba(0,0,0,0.06)]"
          >
            <TrendChart
              attendanceData={attendanceTrendData}
              incomeData={incomeTrendData}
            />
          </div>
        </div>

        <aside
          className="bg-white rounded-2xl border border-gray-300
                      shadow-[0_1px_4px_rgba(0,0,0,0.06)] p-5 flex flex-col h-full"
        >
          <div className="flex items-center justify-between mb-4 shrink-0">
            <h2 className="text-[15px] font-bold text-primary-400">
              Upcoming Events Preview
            </h2>
            <CalendarDays className="w-[18px] h-[18px] text-primary-400 shrink-0" />
          </div>

          <div className="flex-1 overflow-y-auto scrollbar-hide">
            <p className="text-[12.5px] font-bold text-primary-400 mb-3">
              Services
            </p>
            <div className="flex flex-col gap-2.5 mb-1">
              {sortedEvents.length === 0 ? (
                <p className="text-[12px] text-gray-400">
                  No upcoming services
                </p>
              ) : (
                sortedEvents.map((event, i) => {
                  const cfg = EVENT_CATEGORY_CONFIG[event.category];
                  const displayDate = formatEventDate(event.date);
                  if (!displayDate) return null;
                  const dotClass =
                    DOT_COLORS[event.category] ?? "bg-primary-400";
                  return (
                    <div
                      key={i}
                      className="flex items-center justify-between gap-3"
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <span
                          className={cn(
                            "w-2.5 h-2.5 rounded-full shrink-0",
                            dotClass,
                          )}
                        />
                        <span className="text-[13px] font-semibold text-gray-800 truncate">
                          {event.title}
                        </span>
                      </div>
                      <span className="text-[12px] text-gray-400 font-medium shrink-0">
                        {displayDate}
                      </span>
                    </div>
                  );
                })
              )}
            </div>

            <div className="h-px bg-gray-100 my-4" />

            <p className="text-[12.5px] font-bold text-primary-400 mb-3">
              Birthdays
            </p>
            <div className="flex flex-col gap-2.5 pb-2">
              {upcomingBirthdays.length === 0 ? (
                <p className="text-[12px] text-gray-400">
                  No upcoming birthdays
                </p>
              ) : (
                upcomingBirthdays.map((b, i) => (
                  <div
                    key={`${b.name}-${i}`}
                    className="flex items-center justify-between gap-3"
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <Avatar className="w-7 h-7 shrink-0">
                        <AvatarFallback className="bg-blue-50">
                          <User className="w-3.5 h-3.5 text-primary-400" />
                        </AvatarFallback>
                      </Avatar>
                      <span className="text-[13px] font-semibold text-gray-800 truncate">
                        {b.name}
                      </span>
                    </div>
                    <span className="text-[12px] text-gray-400 font-medium shrink-0">
                      {formatUpcomingBirthday(b.date)}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>

          <Button
            asChild
            className="w-full mt-5 rounded-xl bg-primary-400 hover:bg-primary-600
                        !text-white font-bold text-[13.5px] h-10 shrink-0"
          >
            <Link href="/dashboard/membership">View more</Link>
          </Button>
        </aside>
      </div>

      <div
        className="bg-white rounded-2xl border border-gray-300
                shadow-[0_1px_4px_rgba(0,0,0,0.06)]
                flex flex-col items-center justify-center gap-3 py-10 px-6 text-center
                col-span-full w-full"
      >
        <div className="mb-1 select-none">
          <Image
            src="/assets/coming-soon.png"
            alt="Coming Soon"
            width={160}
            height={160}
            className="object-contain"
            priority
          />
        </div>
        <p className="text-[16px] font-extrabold text-gray-900">
          More Features Coming Soon!
        </p>
        <p className="text-[13px] text-gray-600 max-w-md leading-relaxed">
          We're working hard to bring you attendance analytics, financial
          reports, communications, requests and more.
        </p>
      </div>
    </div>
  );
}
