"use client";

import { Cake, CalendarDays, User } from "lucide-react";
import Link from "next/link";

import { EmptyState } from "@/components/features/dashboard/empty-state";
import { IncomeBreakdown } from "@/components/features/dashboard/income-breakdown";
import { IncomeVsExpenses } from "@/components/features/dashboard/income-expense";
import { PendingRequestsWidget } from "@/components/features/dashboard/pending-requests-widget";
import { RecentActivityWidget } from "@/components/features/dashboard/recent-activity-widget";
import { StatCard } from "@/components/features/dashboard/StatCard";
import { PlanUsageStrip } from "@/components/features/dashboard/subscription/plan-usage-strip";
import { TrendChart } from "@/components/features/dashboard/trend-chart";
import MobileHeader from "@/components/layout/mobile-header";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import Heading from "@/components/ui/typography/Heading";
import { Span, Text } from "@/components/ui/typography/Text";
import { EVENT_CATEGORY_CONFIG } from "@/config/event-category";
import {
  formatEventDate,
  formatUpcomingBirthday,
  isInFuture,
} from "@/lib/utils";
import { Event } from "@/types";

type Props = {
  displayName: string;
  churchName: string | null;
  totalMembers: string;
  totalMembersGrowth: string;
  serviceAttendance: string;
  serviceAttendanceGrowth: string;
  attendanceTrendData: any[];
  incomeTrendData: any[];
  upcomingEvents: Event[];
  upcomingBirthdays: { name: string; date: string }[];
  canViewGiving: boolean;
  canViewRequests: boolean;
};

export default function DashboardMobile({
  displayName,
  churchName,
  totalMembers,
  totalMembersGrowth,
  serviceAttendance,
  serviceAttendanceGrowth,
  attendanceTrendData,
  incomeTrendData,
  upcomingEvents,
  upcomingBirthdays,
  canViewGiving,
  canViewRequests,
}: Props) {
  // Sort upcoming events by date
  const sortedUpcomingEvents = upcomingEvents
    .filter((event) => isInFuture(event.date))
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .slice(0, 4);

  // Sort birthdays by nearest
  const sortedBirthdays = [...upcomingBirthdays]
    .sort((a, b) => {
      const dateA = new Date(a.date);
      const dateB = new Date(b.date);
      const now = new Date();
      const nextA = new Date(
        now.getFullYear(),
        dateA.getMonth(),
        dateA.getDate(),
      );
      const nextB = new Date(
        now.getFullYear(),
        dateB.getMonth(),
        dateB.getDate(),
      );
      if (nextA < now) nextA.setFullYear(now.getFullYear() + 1);
      if (nextB < now) nextB.setFullYear(now.getFullYear() + 1);
      return nextA.getTime() - nextB.getTime();
    })
    .slice(0, 4);

  return (
    <div className="pb-6">
      <MobileHeader title="Dashboard" />

      <div className="space-y-4 px-3 pt-3">
        <div className="space-y-1">
          <Heading level={2} text={`Hello, ${displayName}`} />
          <Text text={churchName ? churchName : "Overview"} variant="muted" />
        </div>

        <div className="grid grid-cols-2 gap-3">
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

        <PlanUsageStrip />

        <div className="pt-2">
          <TrendChart
            attendanceData={attendanceTrendData}
            incomeData={incomeTrendData}
          />
        </div>

        <Card className="rounded-2xl">
          <CardContent className="p-4 space-y-4">
            <div className="flex items-center justify-between">
              <Heading level={4} text="Upcoming Events Preview" />
              <CalendarDays className="w-5 h-5 text-primary-600" />
            </div>

            <div className="space-y-4">
              {sortedUpcomingEvents.length === 0 ? (
                <Text text="No upcoming services" variant="muted" />
              ) : (
                sortedUpcomingEvents.map((event, i) => {
                  const config = EVENT_CATEGORY_CONFIG[event.category];
                  const date = formatEventDate(event.date);
                  const iconColors = [
                    "bg-blue-500",
                    "bg-orange-500",
                    "bg-blue-500",
                    "bg-orange-500",
                  ];

                  return (
                    <div key={i} className="flex items-center gap-3">
                      {/* Colored icon box */}
                      <div
                        className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${iconColors[i % iconColors.length]}`}
                      >
                        <CalendarDays className="w-5 h-5 text-white-600" />
                      </div>

                      {/* Title + Location */}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-gray-900 leading-tight">
                          {event.title}
                        </p>
                      </div>

                      {/* Date */}
                      <div className="text-right shrink-0">
                        <span className="text-xs text-gray-400 font-medium whitespace-nowrap">
                          {date}
                        </span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            <div className="h-px bg-gray-100 my-2" />

            <div className="space-y-3">
              <div className="flex items-center justify-between mb-1">
                <p className="text-[12.5px] font-bold text-primary-400">
                  Birthdays
                </p>
                {sortedBirthdays.length > 0 && (
                  <Link
                    href="/dashboard/birthdays"
                    className="text-[12px] font-semibold text-primary-400 hover:underline"
                  >
                    View all
                  </Link>
                )}
              </div>
              {sortedBirthdays.length === 0 ? (
                <EmptyState
                  size="sm"
                  icon={Cake}
                  title="No upcoming birthdays"
                  description="Members with birthdays in the next 3 months will show up here."
                />
              ) : (
                sortedBirthdays.slice(0, 5).map((b, i) => (
                  <div
                    key={`${b.name}-${i}`}
                    className="flex items-center justify-between"
                  >
                    <div className="flex items-center gap-2">
                      <Avatar className="w-7 h-7">
                        <AvatarFallback className="bg-blue-50">
                          <User className="w-3.5 h-3.5 text-primary-400" />
                        </AvatarFallback>
                      </Avatar>
                      <Text text={b.name} />
                    </div>
                    <Span text={formatUpcomingBirthday(b.date)} />
                  </div>
                ))
              )}
            </div>

            <Button
              asChild
              className="w-full mt-4 rounded-xl bg-primary-400 hover:bg-primary-600 !text-white font-bold"
            >
              <Link href="/dashboard/birthdays">View more</Link>
            </Button>
          </CardContent>
        </Card>

        {canViewGiving && (
          <div className="space-y-4">
            <IncomeVsExpenses />
            <IncomeBreakdown />
          </div>
        )}

        {canViewRequests && <PendingRequestsWidget />}
        <RecentActivityWidget />
      </div>
    </div>
  );
}
