"use client";

import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";
import { Card, CardContent } from "@/components/ui/card";
import Heading from "@/components/ui/typography/Heading";
import { ChartContainer } from "@/components/ui/chart";
import { DashboardData } from "@/lib/data";
import { Span } from "@/components/ui/typography/Text";

const getTopIncome = () =>
  [...DashboardData.incomeBreakdown].sort(
    (incomeA, incomeB) => incomeB.value - incomeA.value,
  )[0];

export function IncomeBreakdown() {
  const top = getTopIncome();

  const config = DashboardData.incomeBreakdown.reduce(
    (acc, item) => {
      acc[item.name] = { color: item.color };
      return acc;
    },
    {} as Record<string, { color: string }>,
  );

  return (
    <Card className="rounded-3xl p-3 h-full">
      <CardContent>
        <Heading level={4} text="Income Breakdown" />

        <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-4 items-center">
          <ChartContainer
            className="w-full aspect-auto h-[180px] sm:h-[160px] overflow-hidden"
            config={config}
          >
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={DashboardData.incomeBreakdown}
                  dataKey="value"
                  innerRadius={50}
                  outerRadius={70}
                  paddingAngle={2}
                  cx="50%"
                  cy="50%"
                >
                  {DashboardData.incomeBreakdown.map((entry, i) => (
                    <Cell key={i} fill={entry.color} />
                  ))}
                </Pie>

                <text
                  x="50%"
                  y="45%"
                  textAnchor="middle"
                  dominantBaseline="middle"
                  style={{ fontSize: "14px", fill: "var(--muted-foreground)" }}
                >
                  {top.name}
                </text>
                <text
                  x="50%"
                  y="58%"
                  textAnchor="middle"
                  dominantBaseline="middle"
                  style={{
                    fontSize: "18px",
                    fontWeight: "600",
                    fill: "var(--foreground)",
                  }}
                >
                  {top.value}%
                </text>
              </PieChart>
            </ResponsiveContainer>
          </ChartContainer>

          <div className="space-y-2">
            {DashboardData.incomeBreakdown.map((item) => (
              <div
                key={item.name}
                className="flex items-center justify-between gap-3 text-sm"
              >
                <div className="flex items-center gap-2">
                  <Span
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: item.color }}
                  />
                  <Span className="truncate">{item.name}</Span>
                </div>
                <Span className="font-mono">{item.value}%</Span>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
