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
  isInFuture,
  sortBirthdaysByNearest,
} from "@/lib/utils";
import Link from "next/link";
import { TrendChart } from "@/components/features/dashboard/trend-chart";
import { IncomeVsExpenses } from "@/components/features/dashboard/income-expense";
import { IncomeBreakdown } from "@/components/features/dashboard/income-breakdown";
import { getCurrentAdmin, fetchTotalMembers } from "@/lib/api";

export default function Dashboard() {
  const [totalMembers, setTotalMembers] = useState<string>(
    DashboardData.stats.totalMembers,
  );
  const [totalMembersGrowth, setTotalMembersGrowth] = useState<string>(
    DashboardData.stats.totalMembersGrowth,
  );

  useEffect(() => {
    async function loadStats() {
      const { totalMembers: count, growth } = await fetchTotalMembers();
      setTotalMembers(count.toLocaleString());
      setTotalMembersGrowth(growth);
    }
    loadStats();
  }, []);
  return (
    <>
      <div className="flex md:items-center justify-between md:flex-row flex-col items-start mb-6">
        <Heading level={1} text="Hello, Super Admin" />
        <Text text="Overview" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 mb-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center gap-2 flex-wrap lg:flex-nowrap overflow-x-auto hide-scrollbar">
            <StatCard
              compact
              title="Total Members"
              count={totalMembers}
              growth={totalMembersGrowth}
            />

            <StatCard
              compact
              title="Service Attendance"
              count={DashboardData.stats.serviceAttendance}
              growth={DashboardData.stats.attendanceGrowth}
              growthText="Last Event"
            />

            <StatCard
              compact
              title="Total Income"
              statFilter="This Month"
              count={DashboardData.stats.totalIncome}
              growth={DashboardData.stats.incomeGrowth}
            />
          </div>

          <div>
            <TrendChart
              attendanceData={DashboardData.attendanceData}
              incomeData={DashboardData.incomeExpenses.map((item) => ({
                month: item.month,
                thisMonth: item.income,
                lastMonth: item.expenses,
              }))}
            />
          </div>
        </div>

        <div className="lg:col-span-1">
          <Card className="rounded-3xl">
            <CardContent className="w-full">
              <div className="flex items-center justify-between py-3">
                <Heading level={3} text="Upcoming Events" variant="primary" />

                <CalendarDays className="w-5 h-5 text-primary-600" />
              </div>

              <Text text="Services" variant="blue" />
              <div className="mt-3 space-y-3">
                {DashboardData.upcomingEvents
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
                        <div className="flex items-center gap-3">
                          <Span
                            className={cn(
                              "w-3 h-3 rounded-full block",
                              categoryConfig.dotClass,
                            )}
                          />
                          <div>
                            <Heading level={5} text={event.title} />
                          </div>
                        </div>

                        <Span text={displayDate} variant="default" />
                      </div>
                    );
                  })}
              </div>

              <div className="border-t my-4" />

              <Text text="Birthdays" variant="blue" />
              <div className="mt-3 space-y-2">
                {sortBirthdaysByNearest(DashboardData.birthdays).map((b, i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between gap-3"
                  >
                    <div className="flex items-center gap-2">
                      <Avatar>
                        <AvatarFallback>
                          <User className="w-4 h-4 text-primary" />
                        </AvatarFallback>
                      </Avatar>
                      <Text text={b.name} />
                    </div>
                    <Span
                      text={formatUpcomingBirthday(b.date)}
                      variant="default"
                    />
                  </div>
                ))}
              </div>

              <Button asChild className="w-full mt-4">
                <Link href="/dashboard/membership">View more</Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
        <IncomeVsExpenses />

        <IncomeBreakdown />
      </div>
    </>
  );
}
