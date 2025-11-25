"use client"

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

export default function ActivityLogPage() {
  const [query, setQuery] = useState("");
  const avatarColors = ["#E7EFF7", "#FFF1E6", "#E6F2E6"];

  const avatarTextColors = [
    "rgba(11,59,97,1)",
    "rgba(102,51,0,1)",
    "rgba(6,95,36,1)",
  ];
  const [selectedRow, setSelectedRow] = useState<ActivityRow | null>(null);

  const filtered = useMemo(() => {
    if (!query) {
      return ActivityLogData;
    }

    const lowerCaseQuery = query.toLowerCase();
    return ActivityLogData.filter(
      (activityRow: ActivityRow) =>
        activityRow.user.name.toLowerCase().includes(lowerCaseQuery) ||
        activityRow.action.toLowerCase().includes(lowerCaseQuery) ||
        activityRow.module.toLowerCase().includes(lowerCaseQuery) ||
        activityRow.details.toLowerCase().includes(lowerCaseQuery) ||
        new Date(activityRow.timestamp).toLocaleString().toLowerCase().includes(lowerCaseQuery)
    );
  }, [query]);

  const columns: Column<ActivityRow>[] = [
    {
      key: "timestamp",
      header: "Timestamp",
      accessor: (row) => new Date(row.timestamp).toLocaleString(),
      width: "w-56",
    },
    {
      key: "user",
      header: "User",
      render: (row: ActivityRow & { avatarColor?: string }) => (
        <div className="flex items-center gap-3">
          <Avatar>
            <AvatarFallback
              style={{
                backgroundColor: (row as any).avatarColor ?? avatarColors[0],
                color: (row as any).avatarTextColor ?? avatarTextColors[0],
              }}
            >
              <User2 className="w-4 h-4" />
            </AvatarFallback>
          </Avatar>
          <div className="text-sm">{row.user.name}</div>
        </div>
      ),
      width: "w-48",
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

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center justify-start gap-3">
          <Text text="Activity Log" />
          <Input
            placeholder="Search by user or action"
            leftIcon={<Search className="w-4 h-4" />}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>

        <div className="flex items-center gap-3">
          <Button variant="ghost" className="hidden sm:flex items-center gap-2">
            Filter
            <ChevronDown className="w-4 h-4" />
          </Button>

          <Button className="flex items-center gap-2">
            <Download className="w-4 h-4" />
            Export to CSV/PDF
          </Button>
        </div>
      </div>

      {(() => {
        const rowsWithColor = filtered.map((r: any, i: number) => ({
          ...r,
          avatarColor: avatarColors[i % avatarColors.length],
          avatarTextColor: avatarTextColors[i % avatarTextColors.length],
        }));

        return (
          <Table
            columns={columns}
            data={rowsWithColor}
            rowKey={(r) => r.id}
            showCheckbox
            onRowClick={(r) => setSelectedRow(r as ActivityRow)}
          />
        );
      })()}

      <ActivityLogPopup
        selectedRow={selectedRow}
        setSelectedRow={setSelectedRow}
      />
    </div>
  );
}
