"use client";

import { Building2, ChevronLeft, ChevronRight } from "lucide-react";
import { useEffect, useState } from "react";

import { AddBranchDialog } from "@/components/features/dashboard/settings/add-branch-dialog";
import { EditBranchDialog } from "@/components/features/dashboard/settings/edit-branch-dialog";
import { LimitBanner } from "@/components/features/dashboard/subscription/limit-banner";
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
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Loader } from "@/components/ui/loader";
import Heading from "@/components/ui/typography/Heading";
import { Text } from "@/components/ui/typography/Text";
import { useToast } from "@/hooks/use-toast";
import {
  BranchResponse,
  deleteBranch,
  fetchAllBranchesForManagement,
  fetchBranchLimitStatus,
  updateBranch,
} from "@/services/branchService";
import { useUserStore } from "@/stores/useUserStore";

export default function BranchesSettingsPage() {
  const { toast } = useToast();
  const accessScope = useUserStore((state) => {
    return state.accessScope;
  });
  const canManageBranches = accessScope === "ORG_WIDE";

  const [branches, setBranches] = useState<BranchResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [togglingId, setTogglingId] = useState<string | null>(null);
  const [editTarget, setEditTarget] = useState<BranchResponse | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<BranchResponse | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const load = async (page = currentPage) => {
    setLoading(true);
    try {
      const res = await fetchAllBranchesForManagement(page, 8);
      setBranches(Array.isArray(res.branches) ? res.branches : []);
      setCurrentPage(res.pagination.page);
      setTotalPages(res.pagination.totalPages || 1);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to load branches",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleToggleActive = async (branch: BranchResponse) => {
    setTogglingId(branch._id);
    try {
      await updateBranch(branch._id, { isActive: !branch.isActive });
      await load(currentPage);
      toast({
        title: "Success",
        description: `${branch.name} ${branch.isActive ? "deactivated" : "reactivated"}`,
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to update branch",
        variant: "destructive",
      });
    } finally {
      setTogglingId(null);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) {
      return;
    }
    setIsDeleting(true);
    try {
      await deleteBranch(deleteTarget._id);
      setDeleteTarget(null);
      await load(
        currentPage > 1 && branches.length === 1
          ? currentPage - 1
          : currentPage,
      );
      toast({
        title: "Success",
        description: `${deleteTarget.name} deleted`,
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to delete branch",
        variant: "destructive",
      });
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Heading level={3}>Branches</Heading>
        {canManageBranches && <AddBranchDialog onSaved={load} />}
      </div>

      <Text variant="muted" className="text-sm">
        Your church&apos;s head branch was created automatically. Add subsidiary
        branches for additional locations - the number you can create depends on
        your plan.
      </Text>

      {canManageBranches && (
        <LimitBanner
          fetchStatus={fetchBranchLimitStatus}
          dismissKey="branchLimitBannerDismissed"
          resourceLabel="branches"
          resourceLimitLabel="branch limit"
        />
      )}

      {loading ? (
        <div className="flex items-center justify-center py-16">
          <Loader />
        </div>
      ) : branches.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed py-16 text-center">
          <Building2 className="mb-3 h-8 w-8 text-gray-400" />
          <Text className="font-semibold">No branches yet</Text>
          <Text variant="muted" className="mt-1 text-sm">
            Add a branch to see it listed here.
          </Text>
        </div>
      ) : (
        <div className="divide-y border rounded-xl overflow-hidden bg-white">
          {branches.map((branch) => {
            return (
              <div
                key={branch._id}
                className="flex items-center justify-between gap-3 p-4"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="flex h-9 w-9 items-center justify-center rounded-md bg-primary-50 shrink-0">
                    <Building2 className="h-4 w-4 text-primary-500" />
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <Text className="font-semibold truncate">
                        {branch.name}
                      </Text>
                      {branch.isHQ && (
                        <Badge variant="outline" className="text-xs">
                          Head Office
                        </Badge>
                      )}
                      {!branch.isActive && (
                        <Badge
                          variant="outline"
                          className="text-xs border-gray-400 text-gray-500"
                        >
                          Inactive
                        </Badge>
                      )}
                    </div>
                    {branch.alias && (
                      <Text variant="muted" className="text-xs">
                        {branch.alias}
                      </Text>
                    )}
                  </div>
                </div>

                {canManageBranches && (
                  <div className="flex items-center gap-2 shrink-0">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        return setEditTarget(branch);
                      }}
                    >
                      Edit
                    </Button>
                    {!branch.isHQ && (
                      <Button
                        size="sm"
                        variant="outline"
                        disabled={togglingId === branch._id}
                        onClick={() => {
                          return handleToggleActive(branch);
                        }}
                      >
                        {branch.isActive ? "Deactivate" : "Reactivate"}
                      </Button>
                    )}
                    {!branch.isHQ && (
                      <Button
                        size="sm"
                        variant="outline"
                        className="text-destructive-600 hover:text-destructive-600"
                        onClick={() => {
                          return setDeleteTarget(branch);
                        }}
                      >
                        Delete
                      </Button>
                    )}
                  </div>
                )}
              </div>
            );
          })}
          {totalPages > 1 && (
            <div className="flex items-center justify-between border-t p-3">
              <Button
                size="sm"
                variant="outline"
                disabled={currentPage === 1 || loading}
                onClick={() => {
                  return load(currentPage - 1);
                }}
              >
                <ChevronLeft className="h-4 w-4" />
                Previous
              </Button>
              <Text variant="muted" className="text-sm">
                Page {currentPage} of {totalPages}
              </Text>
              <Button
                size="sm"
                variant="outline"
                disabled={currentPage === totalPages || loading}
                onClick={() => {
                  return load(currentPage + 1);
                }}
              >
                Next
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          )}
        </div>
      )}

      <EditBranchDialog
        open={!!editTarget}
        onOpenChange={(open) => {
          return !open && setEditTarget(null);
        }}
        branch={editTarget}
        onSaved={load}
      />

      <AlertDialog
        open={!!deleteTarget}
        onOpenChange={(open) => {
          return !open && setDeleteTarget(null);
        }}
      >
        <AlertDialogContent className="max-w-sm rounded-2xl">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-base font-semibold text-gray-900">
              Delete {deleteTarget?.name}?
            </AlertDialogTitle>
            <AlertDialogDescription className="text-sm text-gray-500">
              {deleteTarget?.isHQ
                ? "This is the Head Office branch, created automatically when your church was set up. It cannot be deleted."
                : "This will permanently remove the branch and any admin access grants tied to it. This cannot be undone."}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="gap-2 sm:gap-2">
            <AlertDialogCancel
              onClick={() => {
                return setDeleteTarget(null);
              }}
            >
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={(e) => {
                e.preventDefault();
                handleDelete();
              }}
              disabled={isDeleting}
            >
              {isDeleting ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
