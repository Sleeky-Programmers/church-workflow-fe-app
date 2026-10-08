"use client";

import { cn } from "@/lib/utils";

import { Asset, HistoryTone } from "../data";

const TONE_CLASS: Record<HistoryTone, string> = {
  green: "bg-emerald-500",
  amber: "bg-amber-500",
  purple: "bg-purple-500",
  blue: "bg-blue-500",
};

export function HistoryTab({ asset }: { asset: Asset }) {
  return (
    <section className="rounded-xl border border-gray-200 bg-white p-5 shadow-[0_1px_4px_rgba(0,0,0,0.04)]">
      <h2 className="text-base font-semibold text-gray-900">Change History</h2>

      {asset.history.length === 0 ? (
        <p className="mt-4 text-sm text-gray-500">
          No changes recorded for this asset yet.
        </p>
      ) : (
        <ol className="mt-4 space-y-5">
          {asset.history.map((event) => (
            <li key={event.id} className="flex gap-4">
              <span
                className={cn(
                  "mt-1.5 h-2.5 w-2.5 shrink-0 rounded-full",
                  TONE_CLASS[event.tone],
                )}
              />

              <div className="min-w-0">
                <p className="text-xs text-gray-400">{event.timestamp}</p>
                <p className="mt-1 text-sm leading-relaxed text-gray-600">
                  <span className="font-semibold text-gray-900">
                    {event.actor}
                  </span>{" "}
                  {event.action}
                </p>
              </div>
            </li>
          ))}
        </ol>
      )}
    </section>
  );
}
