import * as React from "react"
import { cn } from "@/lib/utils"

interface InputProps extends React.ComponentProps<"input"> {
  error?: boolean
  leftIcon?: React.ReactNode
  rightIcon?: React.ReactNode
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, error, leftIcon, rightIcon, ...props }, ref) => {
    const paddingClass = leftIcon && rightIcon
      ? "pl-10 pr-10"
      : leftIcon
      ? "pl-10 pr-3"
      : rightIcon
      ? "pl-3 pr-10"
      : "px-3"

    return (
      <div className={cn("relative w-full")}>
        {leftIcon && (
          <span
            className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2"
            aria-hidden
          >
            {leftIcon}
          </span>
        )}

        <input
          type={type}
          aria-invalid={error ? "true" : "false"}
          className={cn(
            "flex h-9 w-full rounded-md border bg-transparent py-1 text-base shadow-sm transition-colors " +
              "file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground " +
              "placeholder:text-muted-foreground focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
            paddingClass,
            error
              ? "border-destructive text-destructive placeholder:text-destructive/70 focus-visible:ring-destructive"
              : "border-input focus-visible:ring-ring",
            className
          )}
          ref={ref}
          {...props}
        />

        {rightIcon && (
          <span
            className={cn(
              "absolute right-3 top-1/2 -translate-y-1/2",
            )}
          >
            {rightIcon}
          </span>
        )}
      </div>
    )
  }
)

Input.displayName = "Input"

export { Input }
