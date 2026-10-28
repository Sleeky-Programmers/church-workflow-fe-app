"use client";

import { format, startOfMonth, subMonths } from "date-fns";
import { Download } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import {
  CartesianGrid,
  Line,
  LineChart,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { ChartContainer, ChartTooltipContent } from "@/components/ui/chart";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader } from "@/components/ui/loader";
import Heading from "@/components/ui/typography/Heading";
import { Span, Text } from "@/components/ui/typography/Text";
import { useToast } from "@/hooks/use-toast";
import {
  fetchGivingMonthlyTrend,
  fetchGivingSummary,
  GivingMonthlyTrendPoint,
  GivingSummaryResponse,
} from "@/services/givingService";
import { formatCurrency } from "@/utils/currency";

const LINE_COLORS = ["#2563EB", "#F97316", "#10B981", "#EF4444", "#A855F7"];

function toCsv(rows: (string | number)[][]) {
  return rows
    .map((row) =>
      row
        .map((cell) => {
          const value = String(cell ?? "");
          return value.includes(",") ? `"${value.replace(/"/g, '""')}"` : value;
        })
        .join(","),
    )
    .join("\n");
}

function downloadCsv(filename: string, csv: string) {
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export default function GivingReportsPage() {
  const { toast } = useToast();

  const [startDate, setStartDate] = useState(
    format(startOfMonth(subMonths(new Date(), 5)), "yyyy-MM-dd"),
  );
  const [endDate, setEndDate] = useState(format(new Date(), "yyyy-MM-dd"));

  const [summary, setSummary] = useState<GivingSummaryResponse | null>(null);
  const [trend, setTrend] = useState<GivingMonthlyTrendPoint[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const load = async () => {
    setIsLoading(true);
    try {
      const [summaryData, trendData] = await Promise.all([
        fetchGivingSummary({ startDate, endDate }),
        fetchGivingMonthlyTrend({ startDate, endDate }),
      ]);
      setSummary(summaryData);
      setTrend(trendData);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to load giving reports",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const currencyCodes = useMemo(
    () => Array.from(new Set(trend.map((p) => p.currencyCode))),
    [trend],
  );

  const chartData = useMemo(() => {
    const byMonth: Record<string, Record<string, number>> = {};
    for (const point of trend) {
      byMonth[point.month] = byMonth[point.month] || {};
      byMonth[point.month][point.currencyCode] = point.totalAmount;
    }
    return Object.entries(byMonth).map(([month, values]) => ({
      month,
      ...values,
    }));
  }, [trend]);

  const chartConfig = useMemo(() => {
    return currencyCodes.reduce(
      (acc, code, index) => {
        acc[code] = {
          label: code,
          color: LINE_COLORS[index % LINE_COLORS.length],
        };
        return acc;
      },
      {} as Record<string, { label: string; color: string }>,
    );
  }, [currencyCodes]);

  const handleExportCsv = () => {
    if (!summary) return;
    const rows: (string | number)[][] = [
      ["Giving Report", `${startDate} to ${endDate}`],
      [],
      ["By Offering Type"],
      ["Offering Type", "Amount"],
      ...summary.byOfferingType.map((row) => [row.name, row.amount]),
      [],
      ["By Currency"],
      ["Currency", "Amount"],
      ...summary.byCurrency.map((row) => [row.currencyCode, row.amount]),
      [],
      ["Monthly Trend"],
      ["Month", "Currency", "Amount"],
      ...trend.map((row) => [row.month, row.currencyCode, row.totalAmount]),
    ];

    downloadCsv(`giving-report-${startDate}-to-${endDate}.csv`, toCsv(rows));
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <Heading level={2} text="Giving Reports" />
        </div>

        <Button variant="outline" onClick={handleExportCsv} disabled={!summary}>
          <Download className="w-4 h-4" />
          Export CSV
        </Button>
      </div>

      <div className="flex flex-wrap items-end gap-3">
        <div className="space-y-1.5">
          <Label>From</Label>
          <Input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="w-40"
          />
        </div>
        <div className="space-y-1.5">
          <Label>To</Label>
          <Input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="w-40"
          />
        </div>
        <Button onClick={load} disabled={isLoading}>
          Apply
        </Button>
      </div>

      {isLoading || !summary ? (
        <div className="flex items-center justify-center py-20">
          <Loader size="w-10 h-10" showShadow={false} />
        </div>
      ) : (
        <div className="space-y-6">
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            <div className="bg-white rounded-2xl border border-gray-300 p-4 shadow-[0_1px_4px_rgba(0,0,0,0.06)]">
              <p className="text-[13px] font-bold text-black mb-1">
                Total Records
              </p>
              <span className="text-xl font-bold text-black">
                {summary.recordCount}
              </span>
            </div>

            {summary.byCurrency.map((row) => (
              <div
                key={row.currencyCode}
                className="bg-white rounded-2xl border border-gray-300 p-4 shadow-[0_1px_4px_rgba(0,0,0,0.06)]"
              >
                <p className="text-[13px] font-bold text-black mb-1">
                  Total {row.currencyCode}
                </p>
                <span className="text-xl font-bold text-black">
                  {formatCurrency(row.amount, row.currencyCode)}
                </span>
              </div>
            ))}
          </div>

          <div className="bg-white rounded-2xl border border-gray-300 p-5">
            <Text className="font-bold text-black mb-4">
              Monthly Trend by Currency
            </Text>

            {chartData.length === 0 ? (
              <Text variant="muted" className="text-sm py-8 text-center">
                No trend data for this range.
              </Text>
            ) : (
              <ChartContainer
                className="w-full aspect-auto h-[300px] overflow-hidden"
                config={chartConfig}
              >
                <LineChart
                  data={chartData}
                  margin={{ top: 10, right: 12, left: 0, bottom: 0 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#E6E6E6" />
                  <XAxis dataKey="month" tickLine={false} axisLine={false} />
                  <YAxis tickLine={false} axisLine={false} width={40} />
                  <Tooltip content={<ChartTooltipContent />} />
                  {currencyCodes.map((code) => (
                    <Line
                      key={code}
                      type="monotone"
                      dataKey={code}
                      stroke={`var(--color-${code})`}
                      strokeWidth={2}
                      dot={false}
                    />
                  ))}
                </LineChart>
              </ChartContainer>
            )}

            <div className="mt-3 flex flex-wrap gap-4 text-sm">
              {currencyCodes.map((code, index) => (
                <div key={code} className="flex items-center gap-2">
                  <Span
                    className="w-3 h-3 rounded-sm"
                    style={{
                      backgroundColor: LINE_COLORS[index % LINE_COLORS.length],
                    }}
                  />
                  <Text text={code} />
                </div>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="bg-white rounded-2xl border border-gray-300 p-5">
              <Text className="font-bold text-black mb-3">
                By Offering Type
              </Text>
              <div className="space-y-2">
                {summary.byOfferingType.map((row) => (
                  <div
                    key={row.name}
                    className="flex items-center justify-between text-sm"
                  >
                    <Span>{row.name}</Span>
                    <Span className="font-semibold">
                      {row.amount.toLocaleString()}
                    </Span>
                  </div>
                ))}
                {!summary.byOfferingType.length && (
                  <Text variant="muted" className="text-sm">
                    No data for this range.
                  </Text>
                )}
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-gray-300 p-5">
              <Text className="font-bold text-black mb-3">By Currency</Text>
              <div className="space-y-2">
                {summary.byCurrency.map((row) => (
                  <div
                    key={row.currencyCode}
                    className="flex items-center justify-between text-sm"
                  >
                    <Span>{row.currencyCode}</Span>
                    <Span className="font-semibold">
                      {formatCurrency(row.amount, row.currencyCode)}
                    </Span>
                  </div>
                ))}
                {!summary.byCurrency.length && (
                  <Text variant="muted" className="text-sm">
                    No data for this range.
                  </Text>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
