"use client"

import React, { useState } from "react";
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

export default function Dashboard() {
  const [stats] = useState({
    totalMembers: "30,350",
    serviceAttendance: "3,671",
    totalIncome: "2,318",
    totalMembersGrowth: "+10%",
    attendanceGrowth: "-10.5%",
    incomeGrowth: "+15%",
  });

  const [attendanceData] = useState([
    { month: "Jan", thisMonth: 11598, lastMonth: 9000 },
    { month: "Feb", thisMonth: 12000, lastMonth: 10000 },
    { month: "Mar", thisMonth: 15000, lastMonth: 11000 },
    { month: "Apr", thisMonth: 21000, lastMonth: 17000 },
    { month: "May", thisMonth: 26000, lastMonth: 22000 },
    { month: "Jun", thisMonth: 23000, lastMonth: 20000 },
    { month: "Jul", thisMonth: 25000, lastMonth: 21000 },
  ]);

  const [incomeExpenses] = useState([
    { month: "Jan", income: 800, expenses: 400 },
    { month: "Feb", income: 1200, expenses: 600 },
    { month: "Mar", income: 1400, expenses: 700 },
    { month: "Apr", income: 1100, expenses: 500 },
    { month: "May", income: 1500, expenses: 800 },
    { month: "Jun", income: 1300, expenses: 700 },
  ]);

  const [incomeBreakdown] = useState([
    { name: "Tithes", value: 52.1, color: "#2563EB" },
    { name: "Offering", value: 22.8, color: "#F97316" },
    { name: "Seeds", value: 13.9, color: "#10B981" },
    { name: "Donations", value: 11.2, color: "#EF4444" },
  ]);

  const [upcomingEvents] = useState([
    { title: "Sunday Service", when: "Tomorrow" },
    { title: "Leaders Meeting", when: "Tomorrow" },
    { title: "Morning Devotion", when: "Monday" },
    { title: "Bible Study", when: "Monday" },
    { title: "Prayer Meeting", when: "Thursday" },
  ]);

  const [birthdays] = useState([
    { name: "Pastor John", when: "Tomorrow" },
    { name: "John Doe", when: "Thursday" },
    { name: "Pastor Peter", when: "Saturday" },
  ]);

  return (
    <>
      <div className="flex items-center justify-between mb-6">
        <Heading level={1} text="Hello, Super Admin" />
        <Text text="Overview" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 mb-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center gap-2 flex-wrap lg:flex-nowrap overflow-x-auto hide-scrollbar">
            <StatCard
              compact
              title="Total Members"
              count={stats.totalMembers}
              growth={stats.totalMembersGrowth}
            />

            <StatCard
              compact
              title="Service Attendance"
              count={stats.serviceAttendance}
              growth={stats.attendanceGrowth}
              growthText="Last Event"
            />

            <StatCard
              compact
              title="Total Income"
              statFilter="This Month"
              count={stats.totalIncome}
              growth={stats.incomeGrowth}
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
                    <LineChart data={attendanceData} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
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
                {upcomingEvents.map((e: any, i: any) => (
                  <div key={i} className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <span className="w-2 h-2 rounded-full bg-sky-600 block" />
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
                {birthdays.map((b, i) => (
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
                  <BarChart data={incomeExpenses} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
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
                          data={incomeBreakdown}
                          dataKey="value"
                          nameKey="name"
                          innerRadius={40}
                          outerRadius={70}
                          paddingAngle={2}
                          cx="50%"
                          cy="50%"
                        >
                          {incomeBreakdown.map((entry, index) => (
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
                  {incomeBreakdown.map((item) => (
                    <div key={item.name} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span
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
