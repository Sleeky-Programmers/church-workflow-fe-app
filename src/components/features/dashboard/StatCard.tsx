"use client";

import { ChevronDown } from "lucide-react";

import { cn } from "@/lib/utils";

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

interface StatCardProps {
  title: string;
  count: string | number;
  growth?: string;
  growthLabel?: string;
  /** "blue" → blue rounded-square icon  |  "orange" → orange rounded-square icon */
  iconVariant?: "blue" | "orange";
  icon?: React.ReactNode;
  className?: string;
}

interface TotalIncomeCardProps {
  amount: string;
  growth: string;
  monthFilter: "This Month" | "Last Month";
  onToggleMonth: () => void;
  className?: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// Icons (inline SVG so zero extra deps)
// ─────────────────────────────────────────────────────────────────────────────

const MembersIcon = () => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="white"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className="w-5 h-5"
  >
    <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" />
    <circle cx="9" cy="7" r="4" />
    <path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75" />
  </svg>
);

const AttendanceIcon = () => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="white"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className="w-6 h-6"
  >
    <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2" />
    <rect x="9" y="3" width="6" height="4" rx="1" />
    <path d="M9 12l2 2 4-4" />
  </svg>
);

const IncomeIcon = () => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="white"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className="w-5 h-5"
  >
    <line x1="12" y1="1" x2="12" y2="23" />
    <path d="M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6" />
  </svg>
);

// ─────────────────────────────────────────────────────────────────────────────
// StatCard — matches the design: white card, coloured icon box, big number
// ─────────────────────────────────────────────────────────────────────────────

export const StatCard = ({
  title,
  count,
  growth,
  growthLabel,
  iconVariant = "blue",
  icon,
  className,
}: StatCardProps) => {
  const isPositive = growth ? !growth.startsWith("-") : true;

  return (
    <div
      className={cn(
        "bg-white rounded-2xl border border-gray-300 p-5 flex flex-col items-center gap-0",
        "shadow-[0_1px_4px_rgba(0,0,0,0.06)] hover:shadow-[0_4px_16px_rgba(0,0,0,0.08)]",
        "transition-shadow duration-200",
        className,
      )}
    >
      {/* Coloured icon box */}
      <div
        className={cn(
          "w-12 h-12 rounded-[13px] flex items-center justify-center shrink-0",
          iconVariant === "blue"
            ? "bg-primary-400"
            : "bg-secondary-400 orange-500",
        )}
      >
        {icon ??
          (iconVariant === "blue" ? <MembersIcon /> : <AttendanceIcon />)}
      </div>

      {/* Text */}
      <div className="flex flex-col min-w-0">
        <p className="text-[13px] font-bold text-black mb-1 truncate">
          {title}
        </p>
        <span className="text-[30px] text-center font-bold text-black leading-none tracking-tight">
          {count}
        </span>
      </div>
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// TotalIncomeCard
// ─────────────────────────────────────────────────────────────────────────────

export const TotalIncomeCard = ({
  amount,
  growth,
  monthFilter,
  onToggleMonth,
  className,
}: TotalIncomeCardProps) => {
  const isPositive = !growth.startsWith("-");
  const growthColor = isPositive ? "text-emerald-600" : "text-red-500";

  return (
    <div
      className={cn(
        "bg-white rounded-2xl border border-gray-100 p-5 flex items-center gap-4",
        "shadow-[0_1px_4px_rgba(0,0,0,0.06)] hover:shadow-[0_4px_16px_rgba(0,0,0,0.08)]",
        "transition-shadow duration-200",
        className,
      )}
    >
      {/* Icon */}
      <div className="w-12 h-12 rounded-[13px] bg-emerald-500 flex items-center justify-center shrink-0">
        <IncomeIcon />
      </div>

      {/* Text */}
      <div className="flex flex-col min-w-0 flex-1">
        <div className="flex items-center justify-between gap-2 mb-1">
          <p className="text-[13px] font-medium text-gray-400 truncate">
            Total Income
          </p>
          <button
            onClick={onToggleMonth}
            className="flex items-center gap-1 text-[11px] text-gray-500 font-medium
                       border border-gray-200 rounded-lg px-2 py-1 bg-gray-50
                       hover:bg-gray-100 transition-colors whitespace-nowrap shrink-0"
          >
            {monthFilter}
            <ChevronDown className="w-3 h-3" />
          </button>
        </div>
        <span className="text-[28px] font-extrabold text-gray-900 leading-none tracking-tight">
          {amount}
        </span>
        <span className={cn("text-[12px] font-semibold mt-1", growthColor)}>
          {growth}
        </span>
      </div>
    </div>
  );
};
