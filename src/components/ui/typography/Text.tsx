import React from "react";
import { cn } from "@/lib/utils";

type TextProps = {
  text?: string;
  className?: string;
  style?: React.CSSProperties;
  variant?:
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
    | "menuInactive";
  children?: React.ReactNode;
};

export function Text({
  text,
  className,
  variant = "default",
  children,
}: TextProps) {
  const variantClass = {
    default: "text-foreground",
    muted: "text-muted-foreground",
    error: "text-destructive",
    partner:
      "text-lg text-muted-foreground font-medium tracking-wide transition-opacity hover:opacity-70",
    quote: "text-lg md:text-xl font-serif italic text-gray-100",
    tag: "text-xs bg-background px-2 py-1 rounded",
    tab: "text-primary font-medium",
    tabInactive: "text-primary/60 font-medium",
    menuActive: "text-primary font-medium",
    menuInactive: "text-primary/60 font-medium",
    indicator: "inline-block w-2 h-2 rounded-full bg-sky-600",
    label: "font-semibold text-foreground text-md",
  }[variant];

  return (
    <p className={cn("text-sm", variantClass, className)}>{children ?? text}</p>
  );
}

export function Span({
  text,
  className,
  style,
  variant = "default",
  children,
}: TextProps) {
  const variantClass = {
    default: "text-foreground",
    muted: "text-muted-foreground",
    error: "text-destructive",
    partner:
      "text-lg text-muted-foreground font-medium tracking-wide transition-opacity hover:opacity-70",
    quote: "text-lg md:text-xl font-serif italic text-white-600",
    tag: "text-xs bg-background px-2 py-1 rounded",
    tab: "text-primary font-medium",
    tabInactive: "text-primary font-medium",
    menuActive: "text-blue-600 font-medium",
    menuInactive: "text-blue-400/70 font-medium",
    indicator: "inline-block w-2 h-2 rounded-full bg-sky-600",
    label: "font-medium text-foreground",
  }[variant];

  return (
    <span className={cn("text-xs", variantClass, className)} style={style}>
      {children ?? text}
    </span>
  );
}
