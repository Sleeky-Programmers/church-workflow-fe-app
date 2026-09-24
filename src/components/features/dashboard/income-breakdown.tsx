"use client";

import { format, startOfMonth } from "date-fns";
import { useEffect, useState } from "react";
import { Cell, Pie, PieChart, ResponsiveContainer } from "recharts";

import { Card, CardContent } from "@/components/ui/card";
import { ChartContainer } from "@/components/ui/chart";
import { Loader } from "@/components/ui/loader";
import Heading from "@/components/ui/typography/Heading";
import { Span, Text } from "@/components/ui/typography/Text";
import { fetchGivingSummary } from "@/services/givingService";

const COLORS = [
  "#2563EB",
  "#F97316",
  "#10B981",
  "#EF4444",
  "#A855F7",
  "#EAB308",
];

type Slice = { name: string; color: string; value: number; percent: number };

export function IncomeBreakdown() {
  const [isLoading, setIsLoading] = useState(true);
  const [slices, setSlices] = useState<Slice[]>([]);

  useEffect(() => {
    async function load() {
      setIsLoading(true);
      try {
        const summary = await fetchGivingSummary({
          startDate: format(startOfMonth(new Date()), "yyyy-MM-dd"),
          endDate: format(new Date(), "yyyy-MM-dd"),
        });

        const total = summary.byOfferingType.reduce(
          (sum, row) => sum + row.amount,
          0,
        );

        setSlices(
          summary.byOfferingType.map((row, index) => ({
            name: row.name,
            color: COLORS[index % COLORS.length],
            value: row.amount,
            percent: total > 0 ? Math.round((row.amount / total) * 100) : 0,
          })),
        );
      } catch {
        setSlices([]);
      } finally {
        setIsLoading(false);
      }
    }

    load();
  }, []);

  const top = [...slices].sort((a, b) => b.value - a.value)[0];
  const hasData = slices.some((s) => s.value > 0);

  const config = slices.reduce(
    (acc, item) => {
      acc[item.name] = { color: item.color };
      return acc;
    },
    {} as Record<string, { color: string }>,
  );

  return (
    <Card className="rounded-3xl p-3 h-full">
      <CardContent>
        <Heading level={4} text="Giving Breakdown" />

        <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-4 items-center">
          {isLoading ? (
            <div className="flex items-center justify-center h-[180px] sm:h-[160px]">
              <Loader size="w-8 h-8" showShadow={false} />
            </div>
          ) : !hasData ? (
            <div className="flex items-center justify-center h-[180px] sm:h-[160px]">
              <Text variant="muted" className="text-sm">
                No giving recorded this month yet.
              </Text>
            </div>
          ) : (
            <ChartContainer
              className="w-full aspect-auto h-[180px] sm:h-[160px] overflow-hidden"
              config={config}
            >
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={slices}
                    dataKey="percent"
                    innerRadius={50}
                    outerRadius={70}
                    paddingAngle={2}
                    cx="50%"
                    cy="50%"
                  >
                    {slices.map((entry, i) => (
                      <Cell key={i} fill={entry.color} />
                    ))}
                  </Pie>

                  {top && (
                    <>
                      <text
                        x="50%"
                        y="45%"
                        textAnchor="middle"
                        dominantBaseline="middle"
                        style={{
                          fontSize: "14px",
                          fill: "var(--muted-foreground)",
                        }}
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
                        {top.percent}%
                      </text>
                    </>
                  )}
                </PieChart>
              </ResponsiveContainer>
            </ChartContainer>
          )}

          <div className="space-y-2">
            {!isLoading && !hasData && (
              <Text variant="muted" className="text-sm">
                No giving recorded this month yet.
              </Text>
            )}
            {slices.map((item) => (
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
                <Span className="font-mono">{item.percent}%</Span>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
