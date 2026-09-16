"use client";

import { ChevronDown, MoreVertical, Search, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import AddDepartmentDialog from "@/components/features/dashboard/departments/AddDepartmentDialog";
import { EditDepartmentDialog } from "@/components/features/dashboard/departments/EditDepartmentDialog";
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

  const [searchInput, setSearchInput] = useState(""); // For input value
  const [searchTerm, setSearchTerm] = useState(""); // For actual search query
  const [data, setData] = useState<DepartmentRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<DepartmentRow | null>(null);
  const [exporting, setExporting] = useState(false);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editTargetId, setEditTargetId] = useState<string | null>(null);

  const loadDepartments = async (searchValue?: string) => {
    setLoading(true);

    try {
      const response = await fetchDepartments({
        page: 1,
        limit: 20,
        search: searchValue, // This will map to 'search' param in DTO
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

  const handleSearch = () => {
    setSearchTerm(searchInput);
    loadDepartments(searchInput);
  };

  const handleClearSearch = () => {
    setSearchInput("");
    setSearchTerm("");
    loadDepartments("");
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  const handleAddDepartment = async () => {
    await loadDepartments(searchTerm);
  };

  useEffect(() => {
    loadDepartments();
  }, []);

  const handleEdit = (row: DepartmentRow) => {
    setEditTargetId(row.id);
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
      await loadDepartments(searchTerm);

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
            <div className="px-4 py-10 flex items-center justify-center">
              <Loader size="w-10 h-10" showShadow={false} />
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
                {deleteTarget && deleteTarget.members > 0
                  ? `This department still has ${deleteTarget.members} member${deleteTarget.members > 1 ? "s" : ""}. Deleting it removes them from the department. This action cannot be undone.`
                  : "This action cannot be undone."}
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

        <EditDepartmentDialog
          open={!!editTargetId}
          onOpenChange={(open) => !open && setEditTargetId(null)}
          departmentId={editTargetId}
          onSaved={() => loadDepartments(searchTerm)}
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Heading level={2} text="Departments/Units" />

          <div className="relative flex items-center">
            <div className="relative">
              <Input
                placeholder="Search by HOD, member..."
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                onKeyPress={handleKeyPress}
                className="w-[300px] pr-20"
              />
              {searchInput && (
                <button
                  onClick={handleClearSearch}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
            <Button onClick={handleSearch} className="ml-2" size="default">
              <Search className="size-6" />
            </Button>
          </div>
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

      {/* Optional: Show active search term */}
      {searchTerm && (
        <div className="text-sm text-gray-500">
          Showing results for: <span className="font-medium">{searchTerm}</span>
          <Button
            variant="link"
            size="sm"
            onClick={handleClearSearch}
            className="ml-2"
          >
            Clear
          </Button>
        </div>
      )}

      <div className="max-h-[65vh] overflow-auto">
        <Table
          columns={columns}
          data={data}
          rowKey={(row) => row.id}
          showCheckbox
          isLoading={loading}
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
              {deleteTarget && deleteTarget.members > 0
                ? `This department still has ${deleteTarget.members} member${deleteTarget.members > 1 ? "s" : ""}. Deleting it removes them from the department. This action cannot be undone.`
                : "Are you sure you want to delete this department?"}
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

      <EditDepartmentDialog
        open={!!editTargetId}
        onOpenChange={(open) => !open && setEditTargetId(null)}
        departmentId={editTargetId}
        onSaved={() => loadDepartments(searchTerm)}
      />
    </div>
  );
}
