import React from "react";

type HeadingLevel = 1 | 2 | 3 | 4 | 5 | 6;

interface HeadingProps extends React.HTMLAttributes<HTMLHeadingElement> {
  level?: HeadingLevel;
  text?: string;
  children?: React.ReactNode;
  className?: string;
}

const sizeClasses: Record<HeadingLevel, string> = {
  1: "text-2xl",
  2: "text-xl",
  3: "text-lg",
  4: "text-md",
  5: "text-sm",
  6: "text-xs",
};

const Heading = React.forwardRef<HTMLHeadingElement, HeadingProps>(
  ({ level = 1, text, children, className = "", ...props }, ref) => {
    const Tag = (`h${level}` as unknown) as keyof JSX.IntrinsicElements;
    const classes = `${sizeClasses[level]} font-semibold whitespace-nowrap flex-shrink-0 ${className}`.trim();

    return React.createElement(Tag, { ref, className: classes, ...props }, children ?? text);
  }
);

Heading.displayName = "Heading";

export default Heading;
