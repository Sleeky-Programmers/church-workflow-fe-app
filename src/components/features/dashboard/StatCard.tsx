"use client";

import {
  ArrowDownRight,
  ArrowUpRight,
  ChevronDown,
  TrendingDown,
  TrendingUp,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import Heading from "@/components/ui/typography/Heading";
import { Span } from "@/components/ui/typography/Text";
import { useIsMobile } from "@/hooks/use-mobile";
import { cn } from "@/lib/utils";

// ─────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────
interface StatCardProps {
  title: string;
  count: string | number;
  growth: string;
  /** Optional small label shown above the growth % e.g. "Last Event" */
  growthLabel?: string;
  className?: string;
  compact?: boolean;
}

interface TotalIncomeCardProps {
  amount: string;
  growth: string;
  monthFilter: "This Month" | "Last Month";
  onToggleMonth: () => void;
  className?: string;
  compact?: boolean;
}

const GrowthBadge = ({
  isPositive,
  size = "md",
}: {
  isPositive: boolean;
  size?: "sm" | "md";
}) => {
  const Icon = isPositive ? TrendingUp : TrendingDown;
  return (
    <span
      className={cn(
        "inline-flex items-center justify-center rounded-xl shrink-0",
        isPositive ? "bg-emerald-500" : "bg-red-500",
        size === "sm" ? "w-6 h-6" : "w-8 h-8",
      )}
    >
      <Icon
        className={
          size === "sm" ? "w-3.5 h-3.5 text-white" : "w-4 h-4 text-white"
        }
        strokeWidth={2.5}
      />
    </span>
  );
};

export const StatCard = ({
  title,
  count,
  growth,
  growthLabel,
  className,
  compact = false,
}: StatCardProps) => {
  const isPositive = !growth.startsWith("-");
  const growthColor = isPositive ? "text-emerald-600" : "text-red-500";

  return (
    <div
      className={cn(
        "bg-[#E8EFF8] rounded-3xl flex flex-col justify-between",
        compact ? "p-4 min-h-[110px]" : "p-5 min-h-[130px]",
        className,
      )}
    >
      {/* ── Title ── */}
      <p className="text-[13px] font-medium text-gray-500 leading-none">
        {title}
      </p>

      {/* ── Count + growth row ── */}
      <div className="flex items-center gap-3 flex-wrap">
        {/* Big number */}
        <span
          className={cn(
            "font-bold text-gray-900 tracking-tight leading-none",
            compact ? "text-[26px]" : "text-[32px] md:text-[36px]",
          )}
        >
          {count}
        </span>

        {/* Growth cluster */}
        <div className="flex items-center gap-1.5">
          <div className="flex flex-col items-end leading-none gap-0.5">
            {growthLabel && (
              <span className="text-[10px] text-gray-400 font-medium whitespace-nowrap">
                {growthLabel}
              </span>
            )}
            <span className={cn("text-[13px] font-semibold", growthColor)}>
              {growth}
            </span>
          </div>

          <GrowthBadge isPositive={isPositive} size={compact ? "sm" : "md"} />
        </div>
      </div>
    </div>
  );
};

export const TotalIncomeCard = ({
  amount,
  growth,
  monthFilter,
  onToggleMonth,
  className,
  compact = false,
}: TotalIncomeCardProps) => {
  const isPositive = !growth.startsWith("-");
  const growthColor = isPositive ? "text-emerald-600" : "text-red-500";

  return (
    <div
      className={cn(
        "bg-[#E8EFF8] rounded-3xl flex flex-col justify-between",
        compact ? "p-4 min-h-[110px]" : "p-5 min-h-[130px]",
        className,
      )}
    >
      {/* ── Top row: title + month dropdown ── */}
      <div className="flex items-center justify-between gap-2">
        <p className="text-[13px] font-medium text-gray-500 leading-none">
          Total Income
        </p>

        <button
          onClick={onToggleMonth}
          className="flex items-center gap-1 text-[12px] text-gray-500 font-medium
                     border border-gray-300/70 rounded-lg px-2.5 py-1
                     bg-white/30 hover:bg-white/60 transition-colors whitespace-nowrap"
        >
          {monthFilter}
          <ChevronDown className="w-3 h-3 shrink-0" />
        </button>
      </div>

      {/* ── Bottom row: amount + growth ── */}
      <div className="flex items-center gap-3 flex-wrap">
        {/* Amount */}
        <span
          className={cn(
            "font-bold text-gray-900 tracking-tight leading-none",
            compact ? "text-[26px]" : "text-[32px] md:text-[36px]",
          )}
        >
          {amount}
        </span>

        {/* Growth cluster */}
        <div className="flex items-center gap-1.5">
          <span className={cn("text-[13px] font-semibold", growthColor)}>
            {growth}
          </span>
          <GrowthBadge isPositive={isPositive} size={compact ? "sm" : "md"} />
        </div>
      </div>
    </div>
  );
};
