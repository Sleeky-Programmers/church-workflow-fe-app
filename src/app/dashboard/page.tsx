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
import { fetchTotalMembers, getMyChurch } from "@/lib/api";
import type { ChurchResponse } from "@/types/payload";
import { getCurrentUserProfile } from "@/lib/auth/session";

export default function Dashboard() {
  const [displayName, setDisplayName] = useState("Super Admin");
  const [churchName, setChurchName] = useState<string | null>(null);
  const [churchIdentity, setChurchIdentity] = useState<ChurchResponse | null>(
    null,
  );

  useEffect(() => {
    const profile = getCurrentUserProfile();

    if (profile?.firstName) {
      setDisplayName(profile.firstName);
    } else if (profile?.fullName) {
      setDisplayName(profile.fullName);
    }
  }, []);

  useEffect(() => {
    async function loadChurch() {
      try {
        const church = await getMyChurch();
        if (!church) {
          return;
        }
        setChurchName(church.name);
        setChurchIdentity(church);
      } catch {
        setChurchName(null);
        setChurchIdentity(null);
      }
    }
    loadChurch();
  }, []);

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
        <div className="lg:col-span-2 space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3">
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
                        <div className="flex items-center gap-3 min-w-0">
                          <Span
                            className={cn(
                              "w-3 h-3 rounded-full block",
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
                    <div className="flex items-center gap-2 min-w-0">
                      <Avatar>
                        <AvatarFallback>
                          <User className="w-4 h-4 text-primary" />
                        </AvatarFallback>
                      </Avatar>
                      <Text text={b.name} className="truncate" />
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
