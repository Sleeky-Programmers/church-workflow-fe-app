"use client";

import { Cake } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

import { SidebarTrigger } from "@/components/ui/sidebar";
import { Input } from "@/components/ui/input";
import { Loader } from "@/components/ui/loader";
import Heading from "@/components/ui/typography/Heading";
import { Text } from "@/components/ui/typography/Text";
import { useHasAccess } from "@/lib/access-control";
import { formatUpcomingBirthday, getNextBirthdayDate } from "@/lib/utils";
import { fetchMembers } from "@/services/memberService";

type BirthdayEntry = {
  id: string;
  name: string;
  date: string;
  nextDate: Date;
};

const MONTH_LABEL = new Intl.DateTimeFormat("en-US", {
  month: "long",
  year: "numeric",
});

export default function BirthdaysPage() {
  const canViewMembers = useHasAccess("MEMBERS", "VIEW");

  const [entries, setEntries] = useState<BirthdayEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    let mounted = true;
    async function load() {
      setLoading(true);
      try {
        // The members API is scoped to the admin's church server-side, so
        // every birthday listed here belongs to the current church.
        const pageSize = 100;
        const firstPage = await fetchMembers(1, pageSize);
        const members = [...(firstPage.data || [])];
        const totalPages = firstPage.pagination?.totalPages || 1;
        for (let page = 2; page <= totalPages; page++) {
          const nextPage = await fetchMembers(page, pageSize);
          members.push(...(nextPage.data || []));
        }
        if (!mounted) return;

        const cutoff = new Date();
        cutoff.setMonth(cutoff.getMonth() + 12);

        const mapped: BirthdayEntry[] = members
          .filter(
            (m) => m?.birthday && !isNaN(new Date(m.birthday).getTime()),
          )
          .map((m) => ({
            id: m.id,
            name: m.fullName,
            date: m.birthday as string,
            nextDate: getNextBirthdayDate(m.birthday as string),
          }))
          .filter((entry) => entry.nextDate <= cutoff)
          .sort((a, b) => a.nextDate.getTime() - b.nextDate.getTime());

        setEntries(mapped);
      } catch {
        if (mounted) setEntries([]);
      } finally {
        if (mounted) setLoading(false);
      }
    }
    load();
    return () => {
      mounted = false;
    };
  }, []);

  // Group entries into upcoming months (nearest first), preserving the
  // day order within each month.
  const monthGroups = useMemo(() => {
    const groups: { key: string; label: string; entries: BirthdayEntry[] }[] =
      [];
    const index = new Map<string, number>();

    for (const entry of entries) {
      const key = `${entry.nextDate.getFullYear()}-${entry.nextDate.getMonth()}`;
      if (!index.has(key)) {
        index.set(key, groups.length);
        groups.push({
          key,
          label: MONTH_LABEL.format(entry.nextDate),
          entries: [],
        });
      }
      groups[index.get(key)!].entries.push(entry);
    }
    return groups;
  }, [entries]);

  const filteredGroups = useMemo(() => {
    if (!search.trim()) return monthGroups;
    const q = search.trim().toLowerCase();
    return monthGroups
      .map((g) => ({
        ...g,
        entries: g.entries.filter((e) => e.name.toLowerCase().includes(q)),
      }))
      .filter((g) => g.entries.length > 0);
  }, [monthGroups, search]);

  if (!canViewMembers) {
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <SidebarTrigger className="sm:hidden" />
          <Heading level={2} text="Birthdays" />
        </div>
        <Text variant="muted">
          You don&apos;t have permission to view member birthdays.
        </Text>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <SidebarTrigger className="sm:hidden" />
        <Heading level={2} text="Birthdays" />
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:justify-between">
        <Input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by name..."
          className="sm:max-w-xs"
        />
        {!loading && (
          <Text variant="muted">
            {entries.length} birthday{entries.length === 1 ? "" : "s"} in the
            next 12 months
          </Text>
        )}
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-16">
          <Loader size="w-10 h-10" showShadow={false} />
        </div>
      ) : filteredGroups.length === 0 ? (
        <div className="py-16 text-center">
          <Cake className="w-10 h-10 mx-auto text-gray-300 mb-3" />
          <Text variant="muted">
            {search.trim()
              ? "No birthdays match your search."
              : "No upcoming birthdays in the next 12 months."}
          </Text>
        </div>
      ) : (
        <div className="space-y-8">
          {filteredGroups.map((group) => (
            <section key={group.key}>
              <h3 className="text-sm font-bold text-primary-400 mb-3">
                {group.label}
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
                {group.entries.map((entry) => (
                  <div
                    key={entry.id}
                    className="flex items-center justify-between gap-3
                               bg-white rounded-xl border border-gray-300
                               shadow-[0_1px_4px_rgba(0,0,0,0.06)] px-4 py-3"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div
                        className="w-9 h-9 rounded-full bg-blue-50 shrink-0
                                   flex items-center justify-center"
                      >
                        <Cake className="w-4 h-4 text-primary-400" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-gray-900 truncate">
                          {entry.name}
                        </p>
                        <p className="text-xs text-gray-400">
                          {formatUpcomingBirthday(entry.date)}
                        </p>
                      </div>
                    </div>
                    <span className="text-xs font-medium text-primary-400 shrink-0">
                      {entry.nextDate.toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                      })}
                    </span>
                  </div>
                ))}
              </div>
            </section>
          ))}
        </div>
      )}
    </div>
  );
}
