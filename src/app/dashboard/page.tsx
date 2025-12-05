"use client"

import React from "react";
import { CalendarDays, User } from "lucide-react";
import { Span, Text } from "@/components/ui/typography/Text";
import { StatCard } from "@/components/features/dashboard/StatCard";
import { Card, CardContent } from "@/components/ui/card";
import {
  ChartContainer,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
} from "recharts";
import { Button } from "@/components/ui/button";
import Heading from "@/components/ui/typography/Heading";
import { DashboardData } from "@/lib/data";

export default function Dashboard() {
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
              count={DashboardData.stats.totalMembers}
              growth={DashboardData.stats.totalMembersGrowth}
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

          <div className="lg:col-span-3">
            <Card className="rounded-3xl p-3">
              <CardContent>
                <div className="flex items-start justify-between">
                  <div>
                    <Heading level={4} text="Attendance Trend" />
                    <Text text="This month &bull; Last month" />
                  </div>
                  <Span text="Overview" />
                </div>

                <div className="mt-4">
                  <ChartContainer
                    className="p-4"
                    config={{
                      thisMonth: { color: "#2563EB" },
                      lastMonth: { color: "#93C5FD" },
                    }}
                  >
                    <LineChart data={DashboardData.attendanceData} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#E6E6E6" />
                      <XAxis dataKey="month" />
                      <YAxis />
                      <Tooltip content={<ChartTooltipContent />} />
                      <Line type="monotone" dataKey="thisMonth" stroke="var(--color-thisMonth)" strokeWidth={2.5} dot={false} />
                      <Line type="monotone" dataKey="lastMonth" stroke="var(--color-lastMonth)" strokeWidth={2} strokeDasharray="4 4" dot={false} />
                    </LineChart>
                  </ChartContainer>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        <div className="lg:col-span-1">
          <Card className="rounded-3xl">
            <CardContent className="w-full">
              <div className="flex items-center justify-between py-3">
                <Heading level={3} text="Upcoming Events" className="text-blue-600" />
                <CalendarDays className="w-5 h-5 text-blue-600" />
              </div>

              <Text text="Services" className="text-blue-500" />
              <div className="mt-2 space-y-3">
                {DashboardData.upcomingEvents.map((e: any, i: any) => (
                  <div key={i} className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <Span className="w-2 h-2 rounded-full bg-sky-600 block" />
                      <div>
                        <Heading level={5} text={e.title} />
                        <Span text="Services" />
                      </div>
                    </div>
                    <Span text={e.when} />
                  </div>
                ))}
              </div>

              <div className="border-t my-4" />

              <Text text="Birthdays" className="text-blue-500" />
              <div className="mt-3 space-y-2">
                {DashboardData.birthdays.map((b, i) => (
                  <div key={i} className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2">
                      <Avatar>
                        <AvatarFallback>
                          <User className="w-4 h-4 text-primary" />
                        </AvatarFallback>
                      </Avatar>
                      <Text text={b.name} />
                    </div>
                    <Span text={b.when} />
                  </div>
                ))}
              </div>

              <Button className="!text-white w-full mt-4">
                View more
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
        <div className="lg:col-span-2">
          <Card className="rounded-3xl p-3">
            <CardContent>
              <div className="flex items-center justify-between">
                <Heading level={4} text="Income vs Expenses" />
                <Span text="January - June 2025" />
              </div>

              <div className="mt-4 h-auto">
                <ChartContainer className="p-4" config={{ income: { color: "#2563EB" }, expenses: { color: "#F97316" } }}>
                  <BarChart data={DashboardData.incomeExpenses} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#E6E6E6" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip content={<ChartTooltipContent />} />
                    <Bar dataKey="income" fill="var(--color-income)" barSize={14} />
                    <Bar dataKey="expenses" fill="var(--color-expenses)" barSize={14} />
                  </BarChart>
                </ChartContainer>
              </div>
            </CardContent>
          </Card>
        </div>

        <div>
          <Card className="rounded-3xl p-3">
            <CardContent>
              <div className="flex items-center justify-between">
                <Heading level={4} text="Income Breakdown" />
                <Span text="Overview" />
              </div>

              <div className="mt-4 flex items-center justify-center">
                <ChartContainer className="p-[1px] w-full" config={{ tithes: { color: "#2563EB" } }}>
                  <div className="w-full h-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={DashboardData.incomeBreakdown}
                          dataKey="value"
                          nameKey="name"
                          innerRadius={40}
                          outerRadius={70}
                          paddingAngle={2}
                          cx="50%"
                          cy="50%"
                        >
                          {DashboardData.incomeBreakdown.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </ChartContainer>
              </div>

              <div className="mt-4">
                <div className="grid gap-2">
                  {DashboardData.incomeBreakdown.map((item) => (
                    <div key={item.name} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Span
                          className="w-3 h-3 rounded-full block"
                          style={{ backgroundColor: item.color }}
                        />
                        <div className="text-sm">{item.name}</div>
                      </div>
                      <div className="text-sm font-mono">{item.value}%</div>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
}
