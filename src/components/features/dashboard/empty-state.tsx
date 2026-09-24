import { LucideIcon } from "lucide-react";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type EmptyStateProps = {
  icon: LucideIcon;
  title: string;
  description?: string;
  /** Optional call-to-action rendered as a small outline button below the text. */
  action?: {
    label: string;
    href: string;
  };
  /** "sm" fits compact widgets; "md" fits full-card/chart areas. */
  size?: "sm" | "md";
  className?: string;
};

// Shared empty-state UI for dashboard cards - replaces bare muted text with
// an icon badge, a friendly message and an optional next-step action.
export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  size = "md",
  className,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center text-center",
        size === "md" ? "gap-3 py-8" : "gap-2 py-4",
        className,
      )}
    >
      <div
        className={cn(
          "relative flex items-center justify-center rounded-full",
          "bg-gradient-to-b from-primary-50 to-blue-50",
          "ring-1 ring-primary-100",
          size === "md" ? "w-14 h-14" : "w-11 h-11",
        )}
      >
        {/* Decorative dot accents around the badge */}
        <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-blue-200" />
        <span className="absolute -bottom-1 -left-1 w-1.5 h-1.5 rounded-full bg-primary-200" />

        <Icon
          className={cn(
            "text-primary-400",
            size === "md" ? "w-6 h-6" : "w-5 h-5",
          )}
        />
      </div>

      <div className="space-y-0.5">
        <p
          className={cn(
            "font-semibold text-gray-700",
            size === "md" ? "text-sm" : "text-[13px]",
          )}
        >
          {title}
        </p>
        {description && (
          <p
            className={cn(
              "text-gray-400",
              size === "md" ? "text-[12.5px]" : "text-xs",
            )}
          >
            {description}
          </p>
        )}
      </div>

      {action && (
        <Button asChild variant="outline" size="sm" className="mt-1 h-8">
          <Link href={action.href}>{action.label}</Link>
        </Button>
      )}
    </div>
  );
}
