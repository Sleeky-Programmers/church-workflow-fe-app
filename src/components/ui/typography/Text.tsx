"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { useIsMobile } from "@/hooks/use-mobile";
const MOBILE_BREAKPOINT = 768;

type Variant =
  | "default"
  | "muted"
  | "error"
  | "partner"
  | "quote"
  | "tag"
  | "tab"
  | "tabInactive"
  | "menuActive"
  | "indicator"
  | "label"
  | "blue"
  | "dot"
  | "menuInactive"
  | "pending"
  | "chip"
  | "success";

type TextProps = {
  text?: string;
  className?: string;
  style?: React.CSSProperties;
  variant?: Variant;
  children?: React.ReactNode;
};

export function Text({
  text,
  className,
  variant = "default",
  children,
}: TextProps) {
  const isMobile = useIsMobile();

  const variantClass = {
    default: "text-inherit",
    muted: "text-muted-foreground",
    error: "text-destructive",

    partner: cn(
      "text-lg text-muted-foreground font-medium tracking-wide transition-opacity hover:opacity-70",
      isMobile && "text-sm",
    ),

    quote: cn(
      "text-lg font-serif italic text-primary-foreground",
      isMobile && "text-base",
    ),

    tag: "text-xs bg-background px-2 py-1 rounded",

    tab: "text-primary font-medium",
    tabInactive: "text-primary/60 font-medium",

    menuActive: "text-primary font-medium",
    menuInactive: "text-primary/60 font-medium",

    indicator: "inline-block w-2 h-2 rounded-full bg-primary",

    label: cn("font-semibold text-foreground text-md", isMobile && "text-sm"),

    blue: "text-primary font-medium",

    dot: "h-2 w-2 rounded-full bg-primary flex-shrink-0",

    pending: cn(
      "text-xs font-medium text-foreground bg-accent border border-input",
      isMobile && "text-xs",
    ),

    success: cn("text-foreground font-medium bg-accent", isMobile && "text-xs"),

    chip: cn(
      "rounded-full border border-input bg-primary-100 px-2.5 py-1 text-xs text-foreground",
      isMobile && "text-xs",
    ),
  }[variant];

  return (
    <p
      className={cn(
        "text-sm",
        isMobile && "text-xs",
        "leading-relaxed",
        variantClass,
        className,
      )}
    >
      {children ?? text}
    </p>
  );
}

export function Span({
  text,
  className,
  style,
  variant = "default",
  children,
}: TextProps) {
  const isMobile = useIsMobile();

  const variantClass = {
    default: "text-foreground",
    muted: "text-muted-foreground",
    error: "text-destructive",

    partner: cn(
      "text-lg text-muted-foreground font-medium tracking-wide transition-opacity hover:opacity-70",
      isMobile && "text-sm",
    ),

    quote: cn(
      "text-lg font-serif italic text-primary-foreground",
      isMobile && "text-base",
    ),

    tag: "text-xs bg-background px-2 py-1 rounded",

    tab: "text-primary font-medium",
    tabInactive: "text-primary font-medium",

    menuActive: "text-primary font-medium",
    menuInactive: "text-primary/60 font-medium",

    indicator: "inline-block w-2 h-2 rounded-full bg-primary",

    label: cn("font-medium text-foreground", isMobile && "text-sm"),

    blue: "text-primary font-medium",

    dot: "inline-block w-3 h-3 rounded-full",

    pending:
      "text-xs font-medium text-foreground bg-accent border border-input",

    success: "text-foreground font-medium bg-accent border border-input",

    chip: "rounded-full border border-input bg-primary-100 px-2.5 py-1 text-xs text-foreground",
  }[variant];

  return (
    <span
      className={cn(
        "text-xs", //
        isMobile && "text-[10px]",
        "leading-snug",
        variantClass,
        className,
      )}
      style={style}
    >
      {children ?? text}
    </span>
  );
}
