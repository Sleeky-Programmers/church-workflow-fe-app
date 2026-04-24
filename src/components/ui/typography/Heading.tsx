"use client";

import * as React from "react";
import { useIsMobile } from "@/hooks/use-mobile";
type HeadingLevel = 1 | 2 | 3 | 4 | 5 | 6;
type HeadingVariant = "default" | "primary" | "muted";

interface HeadingProps extends React.HTMLAttributes<HTMLHeadingElement> {
  level?: HeadingLevel;
  text?: string | number;
  variant?: HeadingVariant;
  children?: React.ReactNode;
  className?: string;
}

const desktopSizeClasses: Record<HeadingLevel, string> = {
  1: "text-3xl",
  2: "text-2xl",
  3: "text-xl",
  4: "text-lg",
  5: "text-md",
  6: "text-sm",
};

const mobileSizeClasses: Record<HeadingLevel, string> = {
  1: "text-2xl",
  2: "text-xl",
  3: "text-lg",
  4: "text-md",
  5: "text-sm",
  6: "text-xs",
};

const variantStyles: Record<HeadingVariant, string> = {
  default: "text-inherit",
  primary: "text-[#0C5FB3]",
  muted: "text-gray-500",
};

const Heading = React.forwardRef<HTMLHeadingElement, HeadingProps>(
  (
    {
      level = 1,
      text,
      variant = "default",
      children,
      className = "",
      ...props
    },
    ref,
  ) => {
    const isMobile = useIsMobile();

    const Tag = `h${level}` as keyof JSX.IntrinsicElements;

    const sizeClass = isMobile
      ? mobileSizeClasses[level]
      : desktopSizeClasses[level];

    const classes = [
      sizeClass,
      variantStyles[variant],
      "font-semibold",
      "leading-tight", // improves readability on mobile
      className,
    ]
      .filter(Boolean)
      .join(" ");

    return React.createElement(
      Tag,
      { ref, className: classes, ...props },
      children ?? text,
    );
  },
);

Heading.displayName = "Heading";

export default Heading;
