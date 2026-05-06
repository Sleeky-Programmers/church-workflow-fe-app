"use client";

import { CalendarDays, User } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

import { StatCard } from "@/components/features/dashboard/StatCard";
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

            <div className="space-y-3">
              <p className="text-[12.5px] font-bold text-primary-400 mb-1">
                Services
              </p>
              {sortedUpcomingEvents.length === 0 ? (
                <Text text="No upcoming services" variant="muted" />
              ) : (
                sortedUpcomingEvents.map((event, i) => {
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
                })
              )}
            </div>

            <div className="h-px bg-gray-100 my-2" />

            <div className="space-y-3">
              <p className="text-[12.5px] font-bold text-primary-400 mb-1">
                Birthdays
              </p>
              {sortedBirthdays.length === 0 ? (
                <Text text="No upcoming birthdays" variant="muted" />
              ) : (
                sortedBirthdays.map((b, i) => (
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
              <Link href="/dashboard/membership">View more</Link>
            </Button>
          </CardContent>
        </Card>

        {/* Coming Soon Banner - Mobile Version */}
        <div className="bg-white rounded-2xl border border-gray-300 shadow-[0_1px_4px_rgba(0,0,0,0.06)] flex flex-col items-center justify-center gap-3 py-8 px-4 text-center">
          <div className="select-none">
            <Image
              src="/assets/coming-soon.png"
              alt="Coming Soon"
              width={120}
              height={120}
              className="object-contain"
            />
          </div>
          <p className="text-[15px] font-extrabold text-gray-900">
            More Features Coming Soon!
          </p>
          <p className="text-[12px] text-gray-600 max-w-xs leading-relaxed">
            We're working hard to bring you attendance analytics, financial
            reports, communications, requests and more.
          </p>
        </div>
      </div>
    </div>
  );
}
