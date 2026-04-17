"use client";

import { CalendarDays, User } from "lucide-react";
import { Span, Text } from "@/components/ui/typography/Text";
import { StatCard } from "@/components/features/dashboard/StatCard";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import Heading from "@/components/ui/typography/Heading";
import Link from "next/link";

import MobileHeader from "@/components/layout/mobile-header";
import {
  formatEventDate,
  formatUpcomingBirthday,
  isInFuture,
} from "@/lib/utils";
import { Event } from "@/types";
import { EVENT_CATEGORY_CONFIG } from "@/config/event-category";
import { TrendChart } from "@/components/features/dashboard/trend-chart";
import { IncomeVsExpenses } from "@/components/features/dashboard/income-expense";
import { IncomeBreakdown } from "@/components/features/dashboard/income-breakdown";

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
}: Props) {
  return (
    <div className=" pb-6">
      <MobileHeader title="Dashboard" />

      <div className="space-y-4 px-3 pt-3">
        <div className="space-y-1">
          <Heading level={2} text={`Hello, ${displayName}`} />
          <Text text={churchName ? churchName : "Overview"} variant="muted" />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <StatCard
            compact
            title="Total Members"
            count={totalMembers}
            growth={totalMembersGrowth}
          />

          <StatCard
            compact
            title="Attendance"
            count={serviceAttendance}
            growth={serviceAttendanceGrowth}
          />
        </div>

        <div className="pt-2">
          <TrendChart
            attendanceData={attendanceTrendData}
            incomeData={incomeTrendData}
          />
        </div>

        <Card className="rounded-2xl">
          <CardContent className="p-4 space-y-4">
            <div className="flex items-center justify-between">
              <Heading level={4} text="Upcoming Events" />
              <CalendarDays className="w-5 h-5 text-primary-600" />
            </div>

            <div className="space-y-3">
              {upcomingEvents
                .filter((event) => isInFuture(event.date))
                .slice(0, 4)
                .map((event, i) => {
                  const config = EVENT_CATEGORY_CONFIG[event.category];
                  const date = formatEventDate(event.date);

                  return (
                    <div key={i} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span
                          className={`w-2 h-2 rounded-full ${config.dotClass}`}
                        />
                        <Text text={event.title} />
                      </div>

                      <Span text={date || ""} />
                    </div>
                  );
                })}
            </div>

            <Button asChild className="w-full mt-2">
              <Link href="/dashboard/events">View all</Link>
            </Button>
          </CardContent>
        </Card>

        <Card className="rounded-2xl">
          <CardContent className="p-4 space-y-3">
            <Heading level={4} text="Birthdays" />

            {upcomingBirthdays.length === 0 ? (
              <Text text="No upcoming birthdays" variant="muted" />
            ) : (
              upcomingBirthdays.slice(0, 4).map((b, i) => (
                <div key={i} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Avatar>
                      <AvatarFallback>
                        <User className="w-4 h-4" />
                      </AvatarFallback>
                    </Avatar>

                    <Text text={b.name} />
                  </div>

                  <Span text={formatUpcomingBirthday(b.date)} />
                </div>
              ))
            )}
          </CardContent>
        </Card>

        <div className="space-y-4">
          <IncomeVsExpenses />
          <IncomeBreakdown />
        </div>
      </div>
    </div>
  );
}
