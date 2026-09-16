"use client";

import { format, startOfMonth } from "date-fns";
import { useEffect, useState } from "react";
import { Cell, Pie, PieChart, ResponsiveContainer } from "recharts";

import { Card, CardContent } from "@/components/ui/card";
import { ChartContainer } from "@/components/ui/chart";
import { Loader } from "@/components/ui/loader";
import Heading from "@/components/ui/typography/Heading";
import { Span, Text } from "@/components/ui/typography/Text";
import { fetchGivingSummary } from "@/services/givingRecordService";

const CATEGORIES: {
  key: "tithe" | "offering" | "specialOffering" | "thanksgivingOffering";
  name: string;
  color: string;
}[] = [
  { key: "tithe", name: "Tithe", color: "#2563EB" },
  { key: "offering", name: "Offering", color: "#F97316" },
  { key: "specialOffering", name: "Special Offering", color: "#10B981" },
  { key: "thanksgivingOffering", name: "Thanksgiving", color: "#EF4444" },
];

export function IncomeBreakdown() {
  const [isLoading, setIsLoading] = useState(true);
  const [slices, setSlices] = useState(
    CATEGORIES.map((c) => ({ ...c, value: 0, percent: 0 })),
  );

  useEffect(() => {
    async function load() {
      setIsLoading(true);
      try {
        const summary = await fetchGivingSummary({
          startDate: format(startOfMonth(new Date()), "yyyy-MM-dd"),
          endDate: format(new Date(), "yyyy-MM-dd"),
        });

        const total =
          summary.tithe +
          summary.offering +
          summary.specialOffering +
          summary.thanksgivingOffering;

        setSlices(
          CATEGORIES.map((c) => {
            const value = summary[c.key] || 0;
            return {
              ...c,
              value,
              percent: total > 0 ? Math.round((value / total) * 100) : 0,
            };
          }),
        );
      } catch {
        setSlices(CATEGORIES.map((c) => ({ ...c, value: 0, percent: 0 })));
      } finally {
        setIsLoading(false);
      }
    }

    load();
  }, []);

  const top = [...slices].sort((a, b) => b.value - a.value)[0] || slices[0];
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
