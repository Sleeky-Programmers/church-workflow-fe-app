"use client";

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip } from "recharts";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import Heading from "@/components/ui/typography/Heading";
import { Span, Text } from "@/components/ui/typography/Text";
import { ChartContainer, ChartTooltipContent } from "@/components/ui/chart";
import { DashboardData } from "@/lib/data";
import { cn } from "@/lib/utils";

function getDateRange(data: { month: string }[]) {
  if (!data.length) return "";
  return `${data[0].month} – ${data[data.length - 1].month}`;
}

export function IncomeVsExpenses() {
  const range = getDateRange(DashboardData.incomeExpenses);

  return (
    <Card className="rounded-3xl p-3 h-full">
      <CardContent>
        <div className="flex items-center justify-between">
          <Heading level={4} text="Income vs Expenses" />
          <Span text={range} variant="default" />
        </div>

        <div className="mt-4">
          <ChartContainer
            className="p-4"
            config={{
              income: { color: "#2563EB" },
              expenses: { color: "#F97316" },
            }}
          >
            <BarChart
              data={DashboardData.incomeExpenses}
              margin={{ top: 10, right: 20, left: 0, bottom: 0 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#E6E6E6" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip content={<ChartTooltipContent />} />

              <Bar
                dataKey="income"
                fill="var(--color-income)"
                barSize={22}
                radius={[6, 6, 0, 0]}
              />
              <Bar
                dataKey="expenses"
                fill="var(--color-expenses)"
                barSize={22}
                radius={[6, 6, 0, 0]}
              />
            </BarChart>
          </ChartContainer>
        </div>

        {/* Footer */}
        <div className="mt-4 flex items-center justify-between">
          {/* Legend */}
          <div className="flex items-center gap-4 text-sm">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-sm bg-primary-600" />
              <Text text="Income" />
            </div>

            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-sm bg-orange-500" />
              <Text text="Expenses" />
            </div>
          </div>

          {/* View all */}
          <Link
            href="/dashboard/finance"
            className="text-sm text-primary-600 hover:underline"
          >
            View all →
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}
