"use client";

import React, { useMemo, useState } from "react";
import Table, { Column } from "@/components/features/dashboard/Table";
import Heading from "@/components/ui/typography/Heading";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Search, ChevronDown, Edit, User } from "lucide-react";
import { useRouter } from "next/navigation";
import AddDepartmentDialog from "@/components/features/dashboard/AddDepartmentDialog";
import { DepartmentRow } from "@/types";
import { departmentData } from "@/lib/data";

export default function DepartmentPage() {
  const [query, setQuery] = useState("");
  const [data] = useState<DepartmentRow[]>(departmentData);
  const router = useRouter();

  const filtered = useMemo(() => {
    if (!query) {
      return data;
    }

    const lowercaseQuery = query.toLowerCase();
    return data.filter(
      (department) =>
        department.name.toLowerCase().includes(lowercaseQuery) ||
        (department.hod?.name ?? "").toLowerCase().includes(lowercaseQuery) ||
        String(department.members).includes(lowercaseQuery) ||
        department.status.toLowerCase().includes(lowercaseQuery)
    );
  }, [data, query]);

  const columns: Column<DepartmentRow>[] = [
    { key: "name", header: "Department name", accessor: "name", width: "w-72" },
    {
      key: "hod",
      header: "HOD",
      render: (row) => (
        <div className="flex items-center gap-3">
          <Avatar>
            <AvatarFallback>
              <User className="w-4 h-4 text-primary" />
            </AvatarFallback>
          </Avatar>
          <div className="text-sm">{row.hod?.name ?? "-"}</div>
        </div>
      ),
      width: "w-48",
    },
    { key: "members", header: "Members", accessor: "members", width: "w-24", align: "center" },
    {
      key: "status",
      header: "Status",
      render: (row) => (
        <Badge variant="outline" className="border-emerald-300 text-emerald-600 bg-transparent">
          {row.status}
        </Badge>
      ),
      width: "w-40",
      align: "center",
    },
    {
      key: "actions",
      header: "Actions",
      render: () => (
        <Button variant="ghost" size="sm" className="flex items-center gap-2">
          <Edit className="w-4 h-4 text-primary" />
          Edit
        </Button>
      ),
      width: "w-36",
      align: "right",
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Heading level={2} text="Departments/Units" />
          <Input
            placeholder="Search by HOD, member..."
            leftIcon={<Search className="w-4 h-4" />}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-[360px]"
          />
        </div>

        <div className="flex items-center gap-3">
          <Button variant="ghost" className="hidden sm:flex items-center gap-2">
            Filter
            <ChevronDown className="w-4 h-4" />
          </Button>

          <AddDepartmentDialog data={data} />
        </div>
      </div>

        <div className="max-h-[65vh] overflow-auto">
        <Table columns={columns} data={filtered} rowKey={(row) => row.id} showCheckbox onRowClick={(row) => router.push(`/dashboard/departments/${row.id}`)} />
      </div>
    </div>
  );
}
