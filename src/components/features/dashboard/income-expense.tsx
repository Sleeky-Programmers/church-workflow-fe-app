"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Bar, BarChart, CartesianGrid, Tooltip, XAxis, YAxis } from "recharts";

import { Card, CardContent } from "@/components/ui/card";
import { ChartContainer, ChartTooltipContent } from "@/components/ui/chart";
import { Loader } from "@/components/ui/loader";
import Heading from "@/components/ui/typography/Heading";
import { Span, Text } from "@/components/ui/typography/Text";
import { fetchExpenseMonthlyTrend } from "@/services/expenseService";
import { fetchGivingMonthlyTrend } from "@/services/givingRecordService";

type MonthlyPoint = { month: string; income: number; expenses: number };

function getDateRange(data: MonthlyPoint[]) {
  if (!data.length) return "";
  return `${data[0].month} - ${data[data.length - 1].month}`;
}

// Last 6 calendar months of the current year, ending at the current month -
// the backend trend endpoints only return the current year, so a January
// view just shows fewer months rather than wrapping into last year.
function lastSixMonths<T extends { month: string }>(points: T[]) {
  const currentMonthIndex = new Date().getMonth();
  const start = Math.max(0, currentMonthIndex - 5);
  return points.slice(start, currentMonthIndex + 1);
}

export function IncomeVsExpenses() {
  const [data, setData] = useState<MonthlyPoint[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function load() {
      setIsLoading(true);
      try {
        // Settled independently - a role with GIVING but not
        // GIVING_AND_EXPENSES access (or vice versa) should still see
        // whichever series it's allowed to, not a blank chart.
        const [givingResult, expenseResult] = await Promise.allSettled([
          fetchGivingMonthlyTrend(),
          fetchExpenseMonthlyTrend(),
        ]);

        const giving = lastSixMonths(
          givingResult.status === "fulfilled" ? givingResult.value : [],
        );
        const expenses = lastSixMonths(
          expenseResult.status === "fulfilled" ? expenseResult.value : [],
        );
        const months =
          giving.length >= expenses.length
            ? giving.map((p) => p.month)
            : expenses.map((p) => p.month);

        setData(
          months.map((month, index) => ({
            month,
            income: giving[index]?.totalAmount || 0,
            expenses: expenses[index]?.totalAmount || 0,
          })),
        );
      } catch {
        setData([]);
      } finally {
        setIsLoading(false);
      }
    }

    load();
  }, []);

  const range = getDateRange(data);

  return (
    <Card className="rounded-3xl p-3 h-full w-full">
      <CardContent>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1">
          <Heading level={4} text="Income vs Expenses" />
          <Span text={range} variant="default" />
        </div>

        <div className="mt-4">
          {isLoading ? (
            <div className="flex items-center justify-center h-[260px] sm:h-[300px]">
              <Loader size="w-8 h-8" showShadow={false} />
            </div>
          ) : (
            <ChartContainer
              className="w-full aspect-auto h-[260px] sm:h-[300px] overflow-hidden p-2 sm:p-3"
              config={{
                income: { color: "#2563EB" },
                expenses: { color: "#F97316" },
              }}
            >
              <BarChart
                data={data}
                margin={{ top: 10, right: 4, left: 0, bottom: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#E6E6E6" />
                <XAxis dataKey="month" tickLine={false} axisLine={false} />
                <YAxis tickLine={false} axisLine={false} width={32} />
                <Tooltip content={<ChartTooltipContent />} />

                <Bar
                  dataKey="income"
                  fill="var(--color-income)"
                  barSize={18}
                  radius={[6, 6, 0, 0]}
                />
                <Bar
                  dataKey="expenses"
                  fill="var(--color-expenses)"
                  barSize={18}
                  radius={[6, 6, 0, 0]}
                />
              </BarChart>
            </ChartContainer>
          )}
        </div>

        <div className="mt-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <div className="flex flex-wrap items-center gap-3 sm:gap-4 text-sm">
            <div className="flex items-center gap-2">
              <Span className="w-3 h-3 rounded-sm bg-primary-600" />
              <Text text="Income" />
            </div>

            <div className="flex items-center gap-2">
              <Span className="w-3 h-3 rounded-sm bg-orange-500" />
              <Text text="Expenses" />
            </div>
          </div>

          <Link
            href="/dashboard/finance"
            className="text-sm text-primary-600 hover:underline"
          >
            View all
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}
