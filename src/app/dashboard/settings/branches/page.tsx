"use client";

import { Building2 } from "lucide-react";
import { useEffect, useState } from "react";

import { AddBranchDialog } from "@/components/features/dashboard/settings/add-branch-dialog";
import { EditBranchDialog } from "@/components/features/dashboard/settings/edit-branch-dialog";
import { LimitBanner } from "@/components/features/dashboard/subscription/limit-banner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Loader } from "@/components/ui/loader";
import Heading from "@/components/ui/typography/Heading";
import { Text } from "@/components/ui/typography/Text";
import { useToast } from "@/hooks/use-toast";
import {
  BranchResponse,
  fetchBranchLimitStatus,
  fetchBranches,
  updateBranch,
} from "@/services/branchService";
import { useUserStore } from "@/stores/useUserStore";

export default function BranchesSettingsPage() {
  const { toast } = useToast();
  const accessScope = useUserStore((state) => state.accessScope);
  const canManageBranches = accessScope === "ORG_WIDE";

  const [branches, setBranches] = useState<BranchResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [togglingId, setTogglingId] = useState<string | null>(null);
  const [editTarget, setEditTarget] = useState<BranchResponse | null>(null);

  const load = async () => {
    setLoading(true);
    try {
      const res = await fetchBranches();
      setBranches(res.branches as BranchResponse[]);
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
      await load();
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

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Heading level={3}>Branches</Heading>
        {canManageBranches && <AddBranchDialog onSaved={load} />}
      </div>

      <Text variant="muted" className="text-sm">
        Your church's head branch was created automatically. Add subsidiary
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
      ) : (
        <div className="divide-y border rounded-xl overflow-hidden bg-white">
          {branches.map((branch) => (
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
                    onClick={() => setEditTarget(branch)}
                  >
                    Edit
                  </Button>
                  {!branch.isHQ && (
                    <Button
                      size="sm"
                      variant="outline"
                      disabled={togglingId === branch._id}
                      onClick={() => handleToggleActive(branch)}
                    >
                      {branch.isActive ? "Deactivate" : "Reactivate"}
                    </Button>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      <EditBranchDialog
        open={!!editTarget}
        onOpenChange={(open) => !open && setEditTarget(null)}
        branch={editTarget}
        onSaved={load}
      />
    </div>
  );
}
