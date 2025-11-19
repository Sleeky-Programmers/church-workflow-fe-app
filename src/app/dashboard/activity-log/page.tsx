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

const sampleData: ActivityRow[] = [
  {
    id: "1",
    timestamp: "2025-05-15T10:34:00",
    user: { name: "John Doe", initials: "JD" },
    action: "Submitted a requisition",
    module: "Requisition",
    details: "For media projector (₦150,000)",
  },
  {
    id: "2",
    timestamp: "2025-05-14T19:15:00",
    user: { name: "Admin", initials: "AD" },
    action: "Approved requisition",
    module: "Requisition",
    details: "For generator diesel",
  },
  {
    id: "3",
    timestamp: "2025-05-14T17:42:00",
    user: { name: "Gloria A.", initials: "GA" },
    action: "Added new church member",
    module: "Membership",
    details: "Member: Peter Samuel",
  },
  {
    id: "4",
    timestamp: "2025-05-13T14:05:00",
    user: { name: "Ruth B.", initials: "RB" },
    action: "Logged in",
    module: "Authentication",
    details: "IP: 102.67.34.98",
  },
  {
    id: "5",
    timestamp: "2025-05-14T17:42:00",
    user: { name: "David O.", initials: "DO" },
    action: "Sent out event reminders",
    module: "Events",
    details: "For Sunday Thanksgiving Service",
  },
];

export default function ActivityLogPage() {
  const [query, setQuery] = useState("");
  const [data] = useState<ActivityRow[]>(sampleData);
  const avatarColors = ["#E7EFF7", "#FFF1E6", "#E6F2E6"];

  const avatarTextColors = [
    "rgba(11,59,97,1)",
    "rgba(102,51,0,1)",
    "rgba(6,95,36,1)",
  ];
  const [selectedRow, setSelectedRow] = useState<ActivityRow | null>(null);

  const filtered = useMemo(() => {
    if (!query) return data;
    const q = query.toLowerCase();
    return data.filter(
      (r) =>
        r.user.name.toLowerCase().includes(q) ||
        r.action.toLowerCase().includes(q) ||
        r.module.toLowerCase().includes(q) ||
        r.details.toLowerCase().includes(q) ||
        new Date(r.timestamp).toLocaleString().toLowerCase().includes(q)
    );
  }, [data, query]);

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
        const rowsWithColor = filtered.map((r, i) => ({
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
