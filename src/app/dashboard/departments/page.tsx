"use client";

import { ChevronDown, MoreVertical, Search } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import AddDepartmentDialog from "@/components/features/dashboard/departments/AddDepartmentDialog";
import { getDepartmentColumns } from "@/components/features/dashboard/departments/department-columns";
import Table from "@/components/features/dashboard/Table";
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
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader } from "@/components/ui/loader";
import { SidebarTrigger } from "@/components/ui/sidebar";
import Heading from "@/components/ui/typography/Heading";
import { RouteConfig } from "@/config/routes";
import { useIsMobile } from "@/hooks/use-mobile";
import { useToast } from "@/hooks/use-toast";
import { mapDepartmentToRow } from "@/mappers/department.mapper";
import {
  deleteDepartment,
  exportDepartments,
  fetchDepartments,
} from "@/services/departmentService";
import { DepartmentRow } from "@/types";

export default function DepartmentPage() {
  const router = useRouter();
  const isMobile = useIsMobile();
  const { toast } = useToast();

  const [query, setQuery] = useState("");
  const [data, setData] = useState<DepartmentRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<DepartmentRow | null>(null);
  const [exporting, setExporting] = useState(false);
  const [isAddOpen, setIsAddOpen] = useState(false);

  const loadDepartments = async (searchValue?: string) => {
    setLoading(true);

    try {
      const response = await fetchDepartments({
        page: 1,
        limit: 20,
        search: searchValue,
      });

      setData(response.data.map(mapDepartmentToRow));
    } catch {
      toast({
        title: "Error",
        description: "Failed to fetch departments",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAddDepartment = async () => {
    await loadDepartments();
  };

  useEffect(() => {
    loadDepartments();
  }, []);

  useEffect(() => {
    const delay = setTimeout(() => {
      loadDepartments(query);
    }, 400);

    return () => clearTimeout(delay);
  }, [query]);

  const handleEdit = (row: DepartmentRow) => {
    router.push(RouteConfig.dashboard.departmentEdit(row.id));
  };

  const handleView = (row: DepartmentRow) => {
    router.push(RouteConfig.dashboard.departmentDetails(row.id));
  };

  const handleExport = async () => {
    setExporting(true);

    try {
      const blob = await exportDepartments();
      const url = window.URL.createObjectURL(blob);

      const link = document.createElement("a");
      link.href = url;
      link.download = "departments.csv";
      link.click();

      window.URL.revokeObjectURL(url);
    } catch {
      toast({
        title: "Export failed",
        description: "Please try again",
        variant: "destructive",
      });
    } finally {
      setExporting(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!deleteTarget) {
      return;
    }

    try {
      await deleteDepartment(deleteTarget.id);
      await loadDepartments();

      toast({
        title: "Deleted",
        description: `${deleteTarget.name} deleted successfully`,
      });
    } catch (error: any) {
      toast({
        title: "Delete failed",
        description: error?.message || "Please try again",
        variant: "destructive",
      });
    } finally {
      setDeleteTarget(null);
    }
  };

  const columns = getDepartmentColumns({
    onEdit: handleEdit,
    onExport: handleExport,
    onDeleteRequest: setDeleteTarget,
    onView: handleView,
  });

  if (isMobile) {
    return (
      <div className="min-h-screen bg-white">
        <div className="px-4 py-4 flex items-center justify-between gap-2">
          <div className="flex items-center gap-3">
            <SidebarTrigger />
            <Heading level={3}>Department Name</Heading>
          </div>

          <AddDepartmentDialog onSave={handleAddDepartment} />
        </div>

        <div className="divide-y">
          {loading ? (
            <div className="px-4 py-6 text-sm text-gray-500">
              Loading departments...
            </div>
          ) : (
            data.map((dept) => (
              <div
                key={dept.id}
                className="flex items-center justify-between px-4 py-4"
              >
                <p className="text-sm font-medium text-gray-900">{dept.name}</p>

                <Button
                  variant="outline"
                  className="text-sm border-gray-300"
                  onClick={() => handleView(dept)}
                >
                  View Department
                </Button>
              </div>
            ))
          )}
        </div>

        <AlertDialog
          open={!!deleteTarget}
          onOpenChange={(open) => !open && setDeleteTarget(null)}
        >
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete department?</AlertDialogTitle>
              <AlertDialogDescription>
                This action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>

            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={handleConfirmDelete}>
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    );
  }
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
            onClick={handleExport}
            disabled={exporting}
          >
            {exporting ? "Exporting..." : "Export"}
            <ChevronDown className="w-4 h-4" />
          </Button>

          <AddDepartmentDialog onSave={handleAddDepartment} />
        </div>
      </div>

      <div className="max-h-[65vh] overflow-auto">
        <Table
          columns={columns}
          data={data}
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
            <AlertDialogTitle>Delete department?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this department?
            </AlertDialogDescription>
          </AlertDialogHeader>

          <AlertDialogFooter>
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
