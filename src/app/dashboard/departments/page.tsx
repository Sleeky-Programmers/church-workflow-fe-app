"use client";
import { useMemo, useState, useEffect } from "react";
import Table from "@/components/features/dashboard/Table";
import Heading from "@/components/ui/typography/Heading";
import { Input } from "@/components/ui/input";
import { fetchAllMembers } from "@/services/memberService";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Search, ChevronDown } from "lucide-react";
import { useRouter } from "next/navigation";
import AddDepartmentDialog from "@/components/features/dashboard/departments/AddDepartmentDialog";
import { DepartmentRow } from "@/types";

import { Button } from "@/components/ui/button";
import { getDepartmentColumns } from "@/components/features/dashboard/departments/department-columns";
import { RouteConfig } from "@/config/routes";
import { MemberProfile } from "@/types";

export default function DepartmentPage() {
  const [query, setQuery] = useState("");
  const [data, setData] = useState<DepartmentRow[]>([]);
  const [members, setMembers] = useState<MemberProfile[]>([]);
  const [deleteTarget, setDeleteTarget] = useState<DepartmentRow | null>(null);
  const router = useRouter();

  useEffect(() => {
    const load = async () => {
      const members = await fetchAllMembers();
      setMembers(members);
    };

    load();
  }, []);
  const filtered = useMemo(() => {
    if (!query) return data;
    const q = query.toLowerCase();
    return data.filter(
      (d) =>
        d.name.toLowerCase().includes(q) ||
        (d.hod?.name ?? "").toLowerCase().includes(q) ||
        String(d.members).includes(q) ||
        d.status.toLowerCase().includes(q),
    );
  }, [data, query]);

  const handleEdit = (row: DepartmentRow) => {
    router.push(RouteConfig.dashboard.departmentEdit(row.id));
  };

  const handleExport = (row: DepartmentRow) => {
    alert(`Export: ${row.id}`);
  };

  const handleConfirmDelete = () => {
    if (!deleteTarget) return;
    setData((prev) => prev.filter((d) => d.id !== deleteTarget.id));
    setDeleteTarget(null);
  };

  const handleAddDepartment = (payload: {
    name: string;
    hodId: string;
    memberIds: string[];
    status: string;
    description: string;
  }) => {
    const hod = members.find((member) => member.id === payload.hodId);
    const normalizedStatus =
      payload.status.toLowerCase() === "active" ? "Active" : "Inactive";

    const newDepartment: DepartmentRow = {
      id: crypto.randomUUID(),
      name: payload.name.trim(),
      hod: hod ? { name: hod.fullName } : null,
      members: payload.memberIds.length,
      status: normalizedStatus,
    };

    setData((prev) => [newDepartment, ...prev]);
  };

  const columns = getDepartmentColumns({
    onEdit: handleEdit,
    onExport: handleExport,
    onDeleteRequest: setDeleteTarget,
  });

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
            className="w-[300px]"
          />
        </div>
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            className="hidden sm:flex items-center gap-2 text-gray-600"
          >
            Filter
            <ChevronDown className="w-4 h-4" />
          </Button>
          <AddDepartmentDialog onSave={handleAddDepartment} />
        </div>
      </div>

      <div className="max-h-[65vh] overflow-auto">
        <Table
          columns={columns}
          data={filtered}
          rowKey={(row) => row.id}
          showCheckbox
          onRowClick={(row) =>
            router.push(RouteConfig.dashboard.departmentDetails(row.id))
          }
        />
      </div>

      <AlertDialog
        open={!!deleteTarget}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
      >
        <AlertDialogContent className="max-w-sm rounded-2xl">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-base font-semibold text-gray-900">
              Delete department?
            </AlertDialogTitle>
            <AlertDialogDescription className="text-sm text-gray-500">
              Are you sure you want to delete this department?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="gap-2 sm:gap-2">
            <AlertDialogCancel onClick={() => setDeleteTarget(null)}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmDelete}>
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
