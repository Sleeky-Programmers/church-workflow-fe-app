"use client";
import { CalendarDays, User } from "lucide-react";
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
import { Card, CardContent } from "@/components/ui/card";
import Heading from "@/components/ui/typography/Heading";
import { Span, Text } from "@/components/ui/typography/Text";
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
const EVENT_STORAGE_KEY = "dashboard:events";
const EVENT_CATEGORY_BY_TYPE: Partial<Record<EventType, EventCategory>> = {
  [EventType.WORSHIP_SERVICE]: EventCategory.GENERAL,
  [EventType.BIRTHDAY]: EventCategory.GENERAL,
  [EventType.MEETING]: EventCategory.LEADERSHIP,
  [EventType.WEDDING_ANNIVERSARY]: EventCategory.SPECIAL,
  [EventType.OTHER]: EventCategory.SPECIAL,
};

const formatNaira = (amount: string | number): string => {
  const numAmount =
    typeof amount === "string" ? parseInt(amount.replace(/,/g, "")) : amount;
  return `₦${numAmount.toLocaleString()}`;
};

const formatGrowth = (growth: string | number): string => {
  const numGrowth = typeof growth === "string" ? parseFloat(growth) : growth;
  const sign = numGrowth > 0 ? "+" : "";
  return `${sign}${numGrowth.toFixed(1)}%`;
};

export default function Dashboard() {
  const [displayName, setDisplayName] = useState("Super Admin");
  const [churchName, setChurchName] = useState<string | null>(null);
  const [churchIdentity, setChurchIdentity] = useState<ChurchResponse | null>(
    null,
  );
  const isMobile = useIsMobile();

  useEffect(() => {
    const profile = getCurrentUserProfile();
    if (profile?.firstName) setDisplayName(profile.firstName);
    else if (profile?.fullName) setDisplayName(profile.fullName);
  }, []);

  useEffect(() => {
    async function loadChurch() {
      try {
        const church = await getMyChurch();
        if (!church) return;
        setChurchName(church.name);
        setChurchIdentity(church);
      } catch {
        setChurchName(null);
        setChurchIdentity(null);
      }
    }
    loadChurch();
  }, []);

  const [totalMembers, setTotalMembers] = useState("0");
  const [totalMembersGrowth, setTotalMembersGrowth] = useState("0%");
  const [serviceAttendance, setServiceAttendance] = useState("0");
  const [income, setIncome] = useState(0);
  const [incomeGrowth, setIncomeGrowth] = useState(0);
  const [serviceAttendanceGrowth, setServiceAttendanceGrowth] = useState("0%");
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

  useEffect(() => {
    fetchTotalMembers()
      .then(({ totalMembers, growth }) => {
        setTotalMembers(totalMembers.toLocaleString());
        setTotalMembersGrowth(growth || "0%");
      })
      .catch(() => {
        setTotalMembers("0");
        setTotalMembersGrowth("0%");
      });
  }, []);

  useEffect(() => {
    fetchAttendanceStats()
      .then(
        ({ totalAttendance, attendanceGrowth, monthlyAttendanceTrends }) => {
          setServiceAttendance(totalAttendance.toLocaleString());
          setServiceAttendanceGrowth(attendanceGrowth || "0%");
          const trends = monthlyAttendanceTrends || [];
          setAttendanceTrendData(trends);
          setIncomeTrendData(
            trends.map((item) => ({
              month: item.month,
              thisMonth: 0,
              lastMonth: 0,
            })),
          );
        },
      )
      .catch(() => {
        setServiceAttendance("0");
        setServiceAttendanceGrowth("0%");
        setAttendanceTrendData([]);
        setIncomeTrendData([]);
      });
  }, []);

  useEffect(() => {
    let isMounted = true;
    async function loadBirthdays() {
      try {
        const members: any[] = [];
        let currentPage = 1;
        const MAX_PAGES = 3;
        while (currentPage <= MAX_PAGES) {
          const response = await fetchMemberProfiles(currentPage, 100);
          members.push(...(response.data || []));
          if (!response.pagination?.hasNextPage) break;
          currentPage += 1;
        }
        if (!isMounted) return;
        const mappedBirthdays = members
          .filter((m) => m?.birthday && !isNaN(new Date(m.birthday).getTime()))
          .map((m) => ({ name: m.fullName, date: m.birthday }))
          .filter((m) => {
            const next = getNextBirthdayDate(m.date);
            const today = new Date();
            const future = new Date();
            future.setMonth(today.getMonth() + 3);
            return next >= today && next <= future;
          });
        setUpcomingBirthdays(sortBirthdaysByNearest(mappedBirthdays));
      } catch {
        if (isMounted) setUpcomingBirthdays([]);
      }
    }
    loadBirthdays();
    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(EVENT_STORAGE_KEY);
      if (!stored) return;
      const parsed = JSON.parse(stored) as ChurchEvent[];
      const normalized = parsed.map((event) => ({
        title: event.title,
        date: event.date,
        category: EVENT_CATEGORY_BY_TYPE[event.type] || EventCategory.GENERAL,
      }));
      if (normalized.length) setUpcomingEvents(normalized);
    } catch {
      setUpcomingEvents(DashboardData.upcomingEvents);
    }
  }, []);

  if (isMobile) {
    return (
      <DashboardMobile
        displayName={displayName}
        churchName={churchName}
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

  return (
    <>
      {/* ── Header ── */}
      <div className="flex md:items-center justify-between md:flex-row flex-col items-start gap-1 mb-5 sm:mb-6">
        <Heading level={1} text={`Hello, ${displayName}`} />
        <Text text={churchName ? `Overview - ${churchName}` : "Overview"} />
      </div>

      {/* ── Top row: stat cards + attendance trend + upcoming events ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 mb-6">
        {/* Left: stat cards + trend chart */}
        <div className="lg:col-span-2 space-y-3">
          {/* ── 3 stat cards ── */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            <StatCard
              title="Total Members"
              count={totalMembers}
              growth={totalMembersGrowth}
            />

            <StatCard
              title="Service Attendance"
              count={serviceAttendance}
              growth={serviceAttendanceGrowth}
              growthLabel="Last Event"
            />

            <TotalIncomeCard
              amount={formatNaira(income)}
              growth={formatGrowth(incomeGrowth)}
              monthFilter={incomeMonth}
              onToggleMonth={() =>
                setIncomeMonth((prev) =>
                  prev === "This Month" ? "Last Month" : "This Month",
                )
              }
              className="col-span-2 md:col-span-1"
            />
          </div>

          {/* ── Attendance Trend chart ── */}
          <TrendChart
            attendanceData={attendanceTrendData}
            incomeData={incomeTrendData}
          />
        </div>

        {/* ── Right: Upcoming Events ── */}
        <div className="lg:col-span-1">
          <Card className="rounded-3xl h-full">
            <CardContent className="w-full">
              <div className="flex items-center justify-between py-3">
                <Heading level={3} text="Upcoming Events" variant="primary" />
                <CalendarDays className="w-5 h-5 text-primary-600" />
              </div>

              {/* Services */}
              <Text text="Services" variant="blue" />
              <div className="mt-3 space-y-3">
                {upcomingEvents
                  .filter((event) => isInFuture(event.date))
                  .sort(
                    (a, b) =>
                      new Date(a.date).getTime() - new Date(b.date).getTime(),
                  )
                  .map((event, i) => {
                    const categoryConfig =
                      EVENT_CATEGORY_CONFIG[event.category];
                    const displayDate = formatEventDate(event.date);
                    if (!displayDate) return null;
                    return (
                      <div
                        key={i}
                        className="flex items-center justify-between gap-3"
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <Span
                            className={cn(
                              "w-3 h-3 rounded-full block shrink-0",
                              categoryConfig.dotClass,
                            )}
                          />
                          <div className="min-w-0">
                            <Heading
                              level={5}
                              text={event.title}
                              className="truncate"
                            />
                          </div>
                        </div>
                        <Span
                          text={displayDate}
                          variant="default"
                          className="shrink-0 text-sm text-gray-500"
                        />
                      </div>
                    );
                  })}
              </div>

              <div className="border-t my-4" />

              {/* Birthdays */}
              <Text text="Birthdays" variant="blue" />
              <div className="mt-3 space-y-2">
                {upcomingBirthdays.length === 0 ? (
                  <Text
                    variant="muted"
                    text="No upcoming birthdays to display"
                  />
                ) : (
                  upcomingBirthdays.map((b, i) => (
                    <div
                      key={`${b.name}-${i}`}
                      className="flex items-center justify-between gap-3"
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <Avatar className="w-8 h-8">
                          <AvatarFallback className="bg-blue-50">
                            <User className="w-4 h-4 text-primary" />
                          </AvatarFallback>
                        </Avatar>
                        <Text text={b.name} className="truncate" />
                      </div>
                      <Span
                        text={formatUpcomingBirthday(b.date)}
                        variant="default"
                        className="shrink-0 text-sm text-gray-500"
                      />
                    </div>
                  ))
                )}
              </div>

              <Button asChild className="w-full mt-4 rounded-xl">
                <Link href="/dashboard/membership">View more</Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
}
