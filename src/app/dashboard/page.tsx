"use client";

import { Cake, CalendarDays, User } from "lucide-react";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";

import DashboardMobile from "@/components/features/dashboard/dashboard-mobile";
import { EmptyState } from "@/components/features/dashboard/empty-state";
import { GivingConfigWarningBanner } from "@/components/features/dashboard/giving-config-warning-banner";
import { IncomeBreakdown } from "@/components/features/dashboard/income-breakdown";
import { IncomeVsExpenses } from "@/components/features/dashboard/income-expense";
import { PendingRequestsWidget } from "@/components/features/dashboard/pending-requests-widget";
import { RecentActivityWidget } from "@/components/features/dashboard/recent-activity-widget";
import { StatCard } from "@/components/features/dashboard/StatCard";
import { PlanUsageStrip } from "@/components/features/dashboard/subscription/plan-usage-strip";
import { TrendChart } from "@/components/features/dashboard/trend-chart";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Loader } from "@/components/ui/loader";
import { Text } from "@/components/ui/typography/Text";
import { useIsMobile } from "@/hooks/use-mobile";
import { useHasAccess } from "@/lib/access-control";
import {
  fetchAttendanceStats,
  fetchAttendanceTrend,
  fetchTotalMembers,
} from "@/lib/api";
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
import { fetchGivingMonthlyTrend } from "@/services/givingService";
import { fetchMemberBirthdays } from "@/services/memberService";
import { useUserStore } from "@/stores/useUserStore";
import { ChurchEvent } from "@/types";
import Image from "next/image";

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
  const { user, church, isLoading, error, fetchUserData } = useUserStore();

  const [displayName, setDisplayName] = useState("Super Admin");
  const isMobile = useIsMobile();
  const canViewGiving = useHasAccess("GIVING", "VIEW");
  const canViewRequests = useHasAccess("REQUESTS", "VIEW");

  const [totalMembers, setTotalMembers] = useState("0");
  const [totalMembersGrowth, setTotalMembersGrowth] = useState("0%");
  const [membersLoading, setMembersLoading] = useState(true);
  const [membersError, setMembersError] = useState(false);
  const [serviceAttendance, setServiceAttendance] = useState("0");
  const [serviceAttendanceGrowth, setServiceAttendanceGrowth] = useState("0%");
  const [attendanceLoading, setAttendanceLoading] = useState(true);
  const [attendanceError, setAttendanceError] = useState(false);
  const [attendanceTrendData, setAttendanceTrendData] = useState<any[]>([]);
  const [incomeTrendData, setIncomeTrendData] = useState<any[]>([]);
  const [upcomingBirthdays, setUpcomingBirthdays] = useState<
    { name: string; date: string }[]
  >([]);
  const [birthdaysLoading, setBirthdaysLoading] = useState(true);
  const [upcomingEvents, setUpcomingEvents] = useState(
    DashboardData.upcomingEvents,
  );
  // ── Profile ──
  useEffect(() => {
    if (user?.firstName) {
      setDisplayName(user.firstName);
    }
  }, [user?.firstName]);

  // Fetch user data on mount
  useEffect(() => {
    fetchUserData();
  }, [fetchUserData]);

  // ── Members ──
  const loadMembers = useCallback(async () => {
    setMembersLoading(true);
    setMembersError(false);
    try {
      const { totalMembers, growth } = await fetchTotalMembers();
      setTotalMembers(totalMembers.toLocaleString());
      setTotalMembersGrowth(growth || "0%");
    } catch {
      setMembersError(true);
    } finally {
      setMembersLoading(false);
    }
  }, []);

  useEffect(() => {
    loadMembers();
  }, [loadMembers]);

  // ── Attendance ──
  const loadAttendanceData = useCallback(async () => {
    setAttendanceLoading(true);
    setAttendanceError(false);
    // Stats (the card) and trend (the chart) are independent requests: fire
    // Them together instead of back-to-back, and don't let a chart failure
    // Mark the card as broken (or vice versa).
    const [statsResult, trendResult] = await Promise.allSettled([
      fetchAttendanceStats(),
      fetchAttendanceTrend(),
    ]);

    if (statsResult.status === "fulfilled") {
      const { totalAttendance, attendanceGrowth } = statsResult.value;
      setServiceAttendance((totalAttendance ?? 0).toLocaleString());
      setServiceAttendanceGrowth(attendanceGrowth || "0%");
    } else {
      setAttendanceError(true);
    }

    if (trendResult.status === "fulfilled") {
      const trend = trendResult.value;
      // Combine regular and special service data for the chart
      setAttendanceTrendData(
        (trend.regularService || []).map((regular, index) => {
          return {
            month: regular.month,
            thisMonth: regular.totalAttendance,
            lastMonth: trend.specialService?.[index]?.totalAttendance || 0,
          };
        }),
      );
    } else {
    }

    setAttendanceLoading(false);
  }, []);

  useEffect(() => {
    loadAttendanceData();
  }, [loadAttendanceData]);

  // ── Income (Giving) ── independent of attendance, since a role without
  // GIVING access shouldn't stop the attendance trend from loading.
  useEffect(() => {
    fetchGivingMonthlyTrend()
      .then((trend) => {
        // Sum across currencies per month - this widget shows a single
        // Combined figure rather than breaking out by currency.
        const byMonth: Record<string, number> = {};
        const monthOrder: string[] = [];
        for (const point of trend) {
          if (!(point.month in byMonth)) {
            monthOrder.push(point.month);
          }
          byMonth[point.month] =
            (byMonth[point.month] || 0) + point.totalAmount;
        }
        setIncomeTrendData(
          monthOrder.map((month) => {
            return {
              month,
              thisMonth: byMonth[month],
              lastMonth: 0,
            };
          }),
        );
      })
      .catch(() => {});
  }, []);

  // ── Birthdays ──
  useEffect(() => {
    let mounted = true;
    async function loadBirthdays() {
      setBirthdaysLoading(true);
      try {
        // One light request (name + birthday only) instead of up to three
        // Sequential pages of full member records, which also silently
        // Missed anyone past the 300th member.
        const members = await fetchMemberBirthdays();
        if (!mounted) {
          return;
        }
        const today = new Date();
        const cutoff = new Date();
        cutoff.setMonth(today.getMonth() + 3);
        const mapped = members
          .filter((m) => {
            return m?.birthday && !isNaN(new Date(m.birthday).getTime());
          })
          .map((m) => {
            return { name: m.fullName, date: m.birthday };
          })
          .filter(({ date }) => {
            const next = getNextBirthdayDate(date);
            return next >= today && next <= cutoff;
          });
        setUpcomingBirthdays(sortBirthdaysByNearest(mapped));
      } catch {
        if (mounted) {
          setUpcomingBirthdays([]);
        }
      } finally {
        if (mounted) {
          setBirthdaysLoading(false);
        }
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
      if (!stored) {
        return;
      }
      const parsed = JSON.parse(stored) as ChurchEvent[];
      const normalized = parsed.map((e) => {
        return {
          title: e.title,
          date: e.date,
          category: EVENT_CATEGORY_BY_TYPE[e.type] || EventCategory.GENERAL,
        };
      });
      if (normalized.length) {
        setUpcomingEvents(normalized);
      }
    } catch {
      setUpcomingEvents(DashboardData.upcomingEvents);
    }
  }, []);

  // Only block the whole page when we have no profile to show at all (a true
  // Cold failure). If a cached user exists, a transient refresh error is shown
  // As a non-blocking banner below and the dashboard stays usable.
  if (error && !user) {
    return (
      <div className="flex items-center justify-center py-16 gap-2 flex-col">
        <div className="text-red-500 text-center">
          <Text variant="error" className="mb-2">
            Error loading dashboard
          </Text>
          <Text variant="default" className="text-sm text-gray-600">
            {error}
          </Text>
          <Button
            onClick={() => {
              return fetchUserData(true);
            }}
            className="mt-4"
            variant="outline"
          >
            Retry
          </Button>
        </div>
      </div>
    );
  }

  // Non-blocking banner: profile refresh failed but we still have cached data.
  const profileRefreshBanner =
    error && user ? (
      <div className="flex items-center justify-between gap-3 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3">
        <p className="text-[13px] text-amber-800">
          Some data may be out of date. {error}
        </p>
        <Button
          onClick={() => {
            return fetchUserData(true);
          }}
          size="sm"
          variant="outline"
          disabled={isLoading}
          className="shrink-0 border-amber-300 text-amber-800 hover:bg-amber-100"
        >
          {isLoading ? "Retrying…" : "Retry"}
        </Button>
      </div>
    ) : null;

  // ── Mobile shell ──
  if (isMobile) {
    return (
      <>
        {profileRefreshBanner}
        {canViewGiving && <GivingConfigWarningBanner />}
        <DashboardMobile
          displayName={displayName}
          churchName={church?.name || "Your Church"}
          totalMembers={totalMembers}
          totalMembersGrowth={totalMembersGrowth}
          serviceAttendance={serviceAttendance}
          serviceAttendanceGrowth={serviceAttendanceGrowth}
          attendanceTrendData={attendanceTrendData}
          incomeTrendData={incomeTrendData}
          upcomingEvents={upcomingEvents}
          upcomingBirthdays={upcomingBirthdays}
          canViewGiving={canViewGiving}
          canViewRequests={canViewRequests}
        />
      </>
    );
  }

  // ── Derived ──
  const sortedEvents = upcomingEvents
    .filter((e) => {
      return isInFuture(e.date);
    })
    .sort((a, b) => {
      return new Date(a.date).getTime() - new Date(b.date).getTime();
    });

  // Safely handle null church values with fallbacks
  const churchInitials = church?.alias
    ? church.alias.substring(0, 2).toUpperCase()
    : church?.name && church.name !== "Your Church"
      ? church.name
          .split(" ")
          .slice(0, 2)
          .map((w) => {
            return w[0];
          })
          .join("")
          .toUpperCase()
      : "CW";

  // Get location string from address, state, country
  const churchLocation = church?.address ? church.address : "N/A";

  return (
    <div className="flex flex-col gap-5 pb-8">
      {profileRefreshBanner}
      {canViewGiving && <GivingConfigWarningBanner />}

      <div className="flex items-center justify-between">
        <h1 className="text-[22px] font-bold text-gray-900 tracking-tight flex items-center gap-2">
          Hello, {user?.firstName || "User"}
          {isLoading && <Loader size="w-4 h-4" showShadow={false} />}
        </h1>

        <div className="flex items-center gap-3">
          <div className="text-right leading-tight">
            <p className="text-[13.5px] font-bold text-gray-900">
              {church?.name || "Your Church"}
            </p>
            {churchLocation && churchLocation !== "N/A" && (
              <p className="text-[12px] text-gray-400 mt-0.5">
                {churchLocation}
              </p>
            )}
          </div>

          {church?.logoUrl ? (
            <div className="w-10 h-10 rounded-full bg-primary-400 flex items-center justify-center ring-2 ring-blue-100 shrink-0 overflow-hidden">
              <Image
                src={church.logoUrl}
                alt={church.name || "Church"}
                className="w-full h-full object-cover" width={256} height={256} unoptimized />
            </div>
          ) : (
            <div className="w-10 h-10 rounded-full bg-primary-50 text-white-900 font-semibold flex items-center justify-center ring-2 ring-blue-100 shrink-0 overflow-hidden">
              {church?.alias?.charAt(0) || churchInitials}
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
              isLoading={membersLoading}
              hasError={membersError}
              onRetry={loadMembers}
            />
            <StatCard
              title="Attendance"
              count={serviceAttendance}
              growth={serviceAttendanceGrowth}
              growthLabel="Last Event"
              iconVariant="orange"
              isLoading={attendanceLoading}
              hasError={attendanceError}
              onRetry={loadAttendanceData}
            />
          </div>

          <PlanUsageStrip />

          <div
            className="bg-white rounded-2xl border border-gray-300
                        shadow-[0_1px_4px_rgba(0,0,0,0.06)]"
          >
            <TrendChart
              attendanceData={attendanceTrendData}
              incomeData={incomeTrendData}
              isLoading={attendanceLoading}
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
                  const displayDate = formatEventDate(event.date);
                  if (!displayDate) {
                    return null;
                  }
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

            <div className="flex items-center justify-between mb-3">
              <p className="text-[12.5px] font-bold text-primary-400">
                Birthdays
              </p>
              {upcomingBirthdays.length > 0 && (
                <Link
                  href="/dashboard/birthdays"
                  className="text-[12px] font-semibold text-primary-400 hover:underline"
                >
                  View all
                </Link>
              )}
            </div>
            <div className="flex flex-col gap-2.5 pb-2">
              {birthdaysLoading ? (
                <div className="flex items-center justify-center py-3">
                  <Loader size="w-6 h-6" showShadow={false} />
                </div>
              ) : upcomingBirthdays.length === 0 ? (
                <EmptyState
                  size="sm"
                  icon={Cake}
                  title="No upcoming birthdays"
                  description="Members with birthdays in the next 3 months will show up here."
                  action={{
                    label: "View birthdays",
                    href: "/dashboard/birthdays",
                  }}
                />
              ) : (
                upcomingBirthdays.slice(0, 5).map((b, i) => {
                  return (
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
                  );
                })
              )}
            </div>
          </div>

          <Button
            asChild
            className="w-full mt-5 rounded-xl bg-primary-400 hover:bg-primary-600
                        !text-white font-bold text-[13.5px] h-10 shrink-0"
          >
            <Link href="/dashboard/birthdays">View more</Link>
          </Button>
        </aside>
      </div>

      {canViewGiving && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <IncomeVsExpenses />
          <IncomeBreakdown />
        </div>
      )}

      <div
        className={cn(
          "grid grid-cols-1 gap-6",
          canViewRequests && "lg:grid-cols-2",
        )}
      >
        {canViewRequests && <PendingRequestsWidget />}
        <RecentActivityWidget />
      </div>
    </div>
  );
}
