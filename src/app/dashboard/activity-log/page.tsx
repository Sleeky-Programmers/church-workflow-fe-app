"use client";

import React, { useMemo, useState } from "react";
import Table, { Column } from "@/components/features/dashboard/Table";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { ChevronDown, Download, Search, User2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Text } from "@/components/ui/typography/Text";
import ActivityLogPopup from "@/components/features/dashboard/ActivityLogPopup";
import { ActivityRow } from "@/types";
import { ActivityLogData } from "@/lib/data";
import { formatDateTime12h } from "@/lib/utils";

export default function ActivityLogPage() {
  const [query, setQuery] = useState("");
  const [showFilter, setShowFilter] = useState(false);
  const [moduleFilter, setModuleFilter] = useState<string | null>(null);
  const [selectedRow, setSelectedRow] = useState<ActivityRow | null>(null);

  const avatarColors = ["#E7EFF7", "#FFF1E6", "#E6F2E6"];
  const avatarTextColors = [
    "rgba(11,59,97,1)",
    "rgba(102,51,0,1)",
    "rgba(6,95,36,1)",
  ];

  const filtered = useMemo(() => {
    const q = query.toLowerCase();

    return ActivityLogData.filter((row) => {
      if (moduleFilter && row.module !== moduleFilter) return false;
      if (!q) return true;

      return (
        row.user.name.toLowerCase().includes(q) ||
        row.action.toLowerCase().includes(q)
      );
    }).sort((a, b) => Date.parse(b.timestamp) - Date.parse(a.timestamp));
  }, [query, moduleFilter]);

  const exportToCSV = () => {
    const headers = ["Timestamp", "User", "Action", "Module", "Details"];

    const rows = filtered.map((r) => [
      formatDateTime12h(r.timestamp),
      r.user.name,
      r.action,
      r.module,
      r.details,
    ]);

    const csv = [headers, ...rows]
      .map((row) => row.map((v) => `"${v}"`).join(","))
      .join("\n");

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = url;
    link.download = "activity-log.csv";
    link.click();
  };

  const columns: Column<ActivityRow>[] = [
    {
      key: "timestamp",
      header: "Timestamp",
      sortable: true,
      accessor: "timestamp",
      sortAccessor: (row) => Date.parse(row.timestamp),
      render: (row) => formatDateTime12h(row.timestamp).toUpperCase(),
    },
    {
      key: "user",
      header: "User",
      width: "w-48",
      render: (row: ActivityRow & { avatarColor?: string }) => (
        <div className="flex items-center gap-3">
          <Avatar>
            <AvatarFallback
              style={{
                backgroundColor: row.avatarColor,
                color: (row as any).avatarTextColor ?? avatarTextColors[0],
              }}
            >
              <User2 className="w-4 h-4" />
            </AvatarFallback>
          </Avatar>
          <span className="text-sm">{row.user.name}</span>
        </div>
      ),
    },
    {
      key: "action",
      header: "Action",
      accessor: "action",
    },
    {
      key: "module",
      header: "Module",
      accessor: "module",
      width: "w-40",
    },
    {
      key: "details",
      header: "Details",
      accessor: "details",
    },
  ];

  const rowsWithColor = filtered.map((row, index) => ({
    ...row,
    avatarColor: avatarColors[index % avatarColors.length],
    avatarTextColor: avatarTextColors[index % avatarTextColors.length],
  }));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-4 w-full">
          <Text text="Activity Log" />

          <div className="w-full sm:max-w-xs">
            <Input
              placeholder="Search by user or action"
              leftIcon={<Search className="w-4 h-4" />}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </div>
        </div>

        <div className="relative flex items-center gap-3">
          <Button
            variant="ghost"
            className="hidden sm:flex items-center gap-2"
            onClick={() => setShowFilter((p) => !p)}
          >
            Filter
            <ChevronDown className="w-4 h-4" />
          </Button>

          {showFilter && (
            <div className="absolute right-0 top-10 w-56 rounded-xl border bg-background shadow-lg p-3 z-20">
              <Text text="Filter by module" className="text-sm mb-2" />
              {["Requisition", "Membership", "Events", "Authentication"].map(
                (m) => (
                  <Button
                    key={m}
                    variant={moduleFilter === m ? "secondary" : "ghost"}
                    className="w-full justify-start text-sm"
                    onClick={() => {
                      setModuleFilter(m);
                      setShowFilter(false);
                    }}
                  >
                    {m}
                  </Button>
                ),
              )}
              <Button
                variant="ghost"
                className="w-full text-xs mt-2"
                onClick={() => {
                  setModuleFilter(null);
                  setShowFilter(false);
                }}
              >
                Clear filter
              </Button>
            </div>
          )}

          <Button onClick={exportToCSV} className="flex items-center gap-2">
            <Download className="w-4 h-4" />
            Export CSV
          </Button>
        </div>
      </div>

      <Table
        columns={columns}
        data={rowsWithColor}
        rowKey={(r) => r.id}
        showCheckbox={false}
        enablePagination
        defaultPageSize={5}
        onRowClick={(r) => setSelectedRow(r as ActivityRow)}
        emptyState={
          <Text
            text="No activity logs found."
            variant="muted"
            className="text-center py-10 "
          />
        }
      />

      <ActivityLogPopup
        selectedRow={selectedRow}
        setSelectedRow={setSelectedRow}
      />
    </div>
  );
}
