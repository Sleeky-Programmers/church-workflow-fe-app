"use client";
import { useEffect, useState } from "react";
import { CalendarDays, User } from "lucide-react";
import { Span, Text } from "@/components/ui/typography/Text";
import { StatCard } from "@/components/features/dashboard/StatCard";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import Heading from "@/components/ui/typography/Heading";
import { DashboardData } from "@/lib/data";
import { EVENT_CATEGORY_CONFIG } from "@/config/event-category";
import {
  cn,
  formatEventDate,
  formatUpcomingBirthday,
  getNextBirthdayDate,
  isInFuture,
  sortBirthdaysByNearest,
} from "@/lib/utils";
import Link from "next/link";
import { TrendChart } from "@/components/features/dashboard/trend-chart";

import {
  fetchAttendanceStats,
  fetchTotalMembers,
  getMyChurch,
} from "@/lib/api";
import { fetchMembers as fetchMemberProfiles } from "@/services/memberService";
import type { ChurchResponse } from "@/types/payload";
import { getCurrentUserProfile } from "@/lib/auth/session";
import { EventCategory, EventType } from "@/lib/enums";
import { ChurchEvent } from "@/types";
import { useIsMobile } from "@/hooks/use-mobile";
import DashboardMobile from "@/components/features/dashboard/dashboard-mobile";

const EVENT_STORAGE_KEY = "dashboard:events";

const EVENT_CATEGORY_BY_TYPE: Partial<Record<EventType, EventCategory>> = {
  [EventType.WORSHIP_SERVICE]: EventCategory.GENERAL,
  [EventType.BIRTHDAY]: EventCategory.GENERAL,
  [EventType.MEETING]: EventCategory.LEADERSHIP,
  [EventType.WEDDING_ANNIVERSARY]: EventCategory.SPECIAL,
  [EventType.OTHER]: EventCategory.SPECIAL,
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
  const [serviceAttendanceGrowth, setServiceAttendanceGrowth] = useState("0%");
  const [attendanceTrendData, setAttendanceTrendData] = useState<any[]>([]);
  const [incomeTrendData, setIncomeTrendData] = useState<any[]>([]);
  const [upcomingBirthdays, setUpcomingBirthdays] = useState<
    { name: string; date: string }[]
  >([]);
  const [upcomingEvents, setUpcomingEvents] = useState(
    DashboardData.upcomingEvents,
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
          .map((m) => ({
            name: m.fullName,
            date: m.birthday,
          }))
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
      <div className="flex md:items-center justify-between md:flex-row flex-col items-start gap-1 mb-5 sm:mb-6">
        <Heading level={1} text={`Hello, ${displayName}`} />
        <Text text={churchName ? `Overview - ${churchName}` : "Overview"} />
      </div>

      {churchIdentity && (
        <Card className="mb-6 rounded-3xl">
          <CardContent className="py-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <Text
                text={`Church: ${churchIdentity.name}`}
                variant="blue"
                className="break-words"
              />
              <Text
                text={`Location: ${churchIdentity.address}, ${churchIdentity.country}`}
                className="break-words"
              />
              <Text
                text={`Currency/Timezone: ${churchIdentity.defaultCurrency} - ${churchIdentity.timeZone}`}
                className="break-words"
              />
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 mb-6">
        <div className="lg:col-span-2 space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <StatCard
              title="Total Members"
              count={totalMembers}
              growth={totalMembersGrowth}
            />
            <StatCard
              title="Attendance"
              count={serviceAttendance}
              growth={serviceAttendanceGrowth}
              growthText="Last Event"
            />
          </div>

          <TrendChart
            attendanceData={attendanceTrendData}
            incomeData={incomeTrendData}
          />
        </div>

        <div className="lg:col-span-1">
          <Card className="rounded-3xl h-full">
            <CardContent className="w-full">
              <div className="flex items-center justify-between py-3">
                <Heading
                  level={3}
                  text="Upcoming Events Preview"
                  variant="primary"
                />
                <CalendarDays className="w-5 h-5 text-primary-600" />
              </div>

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

      <Card className="rounded-3xl">
        <CardContent className="py-12 flex flex-col items-center justify-center text-center gap-4">
          <div className="w-40 h-40 flex items-center justify-center">
            <svg
              viewBox="0 0 160 160"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="w-full h-full"
            >
              <ellipse
                cx="80"
                cy="100"
                rx="50"
                ry="14"
                stroke="#E0E7FF"
                strokeWidth="2"
                fill="none"
              />

              <rect
                x="68"
                y="30"
                width="24"
                height="60"
                rx="12"
                fill="#1D4ED8"
              />

              <polygon points="80,10 68,42 92,42" fill="#2563EB" />

              <circle cx="80" cy="55" r="7" fill="white" opacity="0.9" />

              <polygon points="68,75 55,95 68,90" fill="#3B82F6" />

              <polygon points="92,75 105,95 92,90" fill="#3B82F6" />

              <ellipse
                cx="80"
                cy="97"
                rx="8"
                ry="12"
                fill="#FCD34D"
                opacity="0.9"
              />
              <ellipse
                cx="80"
                cy="100"
                rx="5"
                ry="8"
                fill="#F97316"
                opacity="0.8"
              />

              <circle cx="115" cy="88" r="8" fill="#FBBF24" />
              <rect
                x="109"
                y="96"
                width="12"
                height="16"
                rx="4"
                fill="#2563EB"
              />
              <line
                x1="109"
                y1="100"
                x2="100"
                y2="108"
                stroke="#2563EB"
                strokeWidth="3"
                strokeLinecap="round"
              />
              <line
                x1="121"
                y1="100"
                x2="128"
                y2="106"
                stroke="#2563EB"
                strokeWidth="3"
                strokeLinecap="round"
              />

              <circle cx="30" cy="40" r="3" fill="#BFDBFE" />
              <circle cx="140" cy="60" r="3" fill="#FDE68A" />
              <circle cx="20" cy="90" r="2" fill="#C7D2FE" />
              <circle cx="148" cy="110" r="2" fill="#C7D2FE" />
            </svg>
          </div>

          <div className="space-y-2">
            <Heading level={2} text="More Features Coming Soon!" />
            <Text
              variant="muted"
              text="We're working hard to bring you attendance analytics, financial reports, communications, requests and more."
              className="max-w-md mx-auto"
            />
          </div>
        </CardContent>
      </Card>
    </>
  );
}
