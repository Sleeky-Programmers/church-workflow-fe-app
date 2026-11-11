"use client";

import { Lightbulb, X } from "lucide-react";
import Link from "next/link";
import {
  useCallback,
  useEffect,
  useId,
  useLayoutEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { createPortal } from "react-dom";

import { cn } from "@/lib/utils";
import type { Suggestion } from "@/services/suggestionService";

import { useSuggestions } from "./suggestions-context";

interface SuggestionAnchorProps {
  /**
   * Where this element sits, e.g. "nav:/dashboard/finance" for a sidebar
   * link or "action:attendance.mark" for a button. Pass several to let one
   * element stand in for a group (a collapsed menu and its sub-pages).
   */
  id: string | string[];
  /** When two anchors match, the heavier one gets the bubble. */
  weight?: number;
  className?: string;
  children: ReactNode;
}

const BUBBLE_WIDTH = 270;
const GAP = 14;

function Bubble({
  suggestion,
  target,
  onDismiss,
}: {
  suggestion: Suggestion;
  target: HTMLElement;
  onDismiss: () => void;
}) {
  const [pos, setPos] = useState<{
    top: number;
    left: number;
    below: boolean;
  } | null>(null);

  const place = useCallback(() => {
    const rect = target.getBoundingClientRect();
    if (!rect.width && !rect.height) {
      setPos(null);
      return;
    }
    const roomRight = window.innerWidth - rect.right;
    const below = roomRight < BUBBLE_WIDTH + GAP + 8;
    setPos(
      below
        ? {
            top: rect.bottom + GAP,
            left: Math.max(
              8,
              Math.min(rect.left, window.innerWidth - BUBBLE_WIDTH - 8),
            ),
            below,
          }
        : { top: rect.top + rect.height / 2, left: rect.right + GAP, below },
    );
  }, [target]);

  useLayoutEffect(() => {
    place();
    const observer = new ResizeObserver(place);
    observer.observe(target);
    window.addEventListener("resize", place);
    window.addEventListener("scroll", place, true);
    return () => {
      observer.disconnect();
      window.removeEventListener("resize", place);
      window.removeEventListener("scroll", place, true);
    };
  }, [place, target]);

  if (!pos) {
    return null;
  }

  return createPortal(
    <div
      role="status"
      style={{
        position: "fixed",
        top: pos.top,
        left: pos.left,
        width: BUBBLE_WIDTH,
        transform: pos.below ? undefined : "translateY(-50%)",
      }}
      className="z-[60] animate-in fade-in slide-in-from-left-2 duration-300"
    >
      <div className="relative rounded-2xl border border-primary-200 bg-white p-3 pr-8 shadow-[0_8px_24px_rgba(0,0,0,0.12)]">
        {/* Chat-bubble tail pointing at the element */}
        <span
          aria-hidden
          className={cn(
            "absolute h-3 w-3 rotate-45 border-primary-200 bg-white",
            pos.below
              ? "-top-1.5 left-6 border-l border-t"
              : "-left-1.5 top-1/2 -mt-1.5 border-b border-l",
          )}
        />

        <button
          type="button"
          onClick={onDismiss}
          aria-label="Dismiss suggestion"
          className="absolute right-1.5 top-1.5 rounded-full p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
        >
          <X className="h-3.5 w-3.5" />
        </button>

        <Link href={suggestion.href} className="flex items-start gap-2">
          <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary-400">
            <Lightbulb className="h-3.5 w-3.5 text-white" stroke="#ffffff" />
          </span>
          <span className="min-w-0">
            <span className="block text-[13px] font-semibold leading-snug text-black">
              {suggestion.title}
            </span>
            <span className="mt-0.5 block text-xs leading-snug text-gray-500">
              {suggestion.message}
            </span>
          </span>
        </Link>
      </div>
    </div>,
    document.body,
  );
}

/**
 * Marks an element as a place a suggestion can appear beside. If a
 * suggestion belongs here, it shows as a small chat bubble next to the
 * element. Safe to use anywhere inside the dashboard.
 */
export function SuggestionAnchor({
  id,
  weight = 1,
  className,
  children,
}: SuggestionAnchorProps) {
  const ctx = useSuggestions();
  const token = useId();
  const ref = useRef<HTMLDivElement>(null);
  const ids = Array.isArray(id) ? id : [id];
  const key = ids.join("|");

  useEffect(() => {
    if (!ctx) {
      return;
    }
    ctx.register(ids, token, weight);
    return () => {
      return ctx.unregister(ids, token);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ctx?.register, ctx?.unregister, key, token, weight]);

  const suggestion = ctx?.bubbleFor(ids, token) ?? null;

  return (
    <div ref={ref} className={cn("w-full", className)}>
      {children}
      {suggestion && ref.current && (
        <Bubble
          suggestion={suggestion}
          target={ref.current}
          onDismiss={() => {
            return ctx?.dismiss(suggestion.id);
          }}
        />
      )}
    </div>
  );
}
