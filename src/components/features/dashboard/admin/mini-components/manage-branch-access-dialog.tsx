"use client";

import { useEffect, useState } from "react";

import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Loader } from "@/components/ui/loader";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Text } from "@/components/ui/typography/Text";
import { useToast } from "@/hooks/use-toast";
import {
  BranchResponse,
  fetchAdminBranchAccess,
  fetchBranches,
  updateAdminBranchAccess,
} from "@/services/branchService";

type AccessChoice = "BRANCH" | "ORG_WIDE";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  userId: string | null;
  userName: string;
  onSaved: () => void | Promise<void>;
}

export function ManageBranchAccessDialog({
  open,
  onOpenChange,
  userId,
  userName,
  onSaved,
}: Props) {
  const { toast } = useToast();

  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [branches, setBranches] = useState<BranchResponse[]>([]);
  const [choice, setChoice] = useState<AccessChoice>("BRANCH");
  const [selectedBranchIds, setSelectedBranchIds] = useState<string[]>([]);

  useEffect(() => {
    if (!open || !userId) return;

    let cancelled = false;
    async function load() {
      setIsLoading(true);
      try {
        const [access, branchesRes] = await Promise.all([
          fetchAdminBranchAccess(userId!),
          fetchBranches(),
        ]);
        if (cancelled) return;

        setBranches(branchesRes.branches as BranchResponse[]);
        setChoice(access.accessScope);
        setSelectedBranchIds(access.branchIds);
      } catch (error: any) {
        if (!cancelled) {
          toast({
            title: "Error",
            description: error.message || "Failed to load branch access",
            variant: "destructive",
          });
          onOpenChange(false);
        }
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, userId]);

  const toggleBranch = (branchId: string) => {
    setSelectedBranchIds((prev) =>
      prev.includes(branchId)
        ? prev.filter((id) => id !== branchId)
        : [...prev, branchId],
    );
  };

  async function handleSave() {
    if (!userId) return;

    setIsSaving(true);
    try {
      await updateAdminBranchAccess(userId, {
        accessScope: choice,
        branchIds: choice === "BRANCH" ? selectedBranchIds : undefined,
      });

      await onSaved();

      toast({ title: "Success", description: "Branch access updated" });
      onOpenChange(false);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to update branch access",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Branch Access for {userName}</DialogTitle>
        </DialogHeader>

        {isLoading ? (
          <div className="flex items-center justify-center py-10">
            <Loader size="w-8 h-8" showShadow={false} />
          </div>
        ) : (
          <div className="space-y-4">
            <RadioGroup
              value={choice}
              onValueChange={(value) => setChoice(value as AccessChoice)}
              className="space-y-3"
            >
              <div className="flex items-start gap-2">
                <RadioGroupItem value="ORG_WIDE" id="scope-org-wide" />
                <div>
                  <Label htmlFor="scope-org-wide">
                    All branches (org-wide)
                  </Label>
                  <Text variant="muted" className="text-xs">
                    Can see and switch between every branch, including new ones
                    created later, and can manage branches.
                  </Text>
                </div>
              </div>

              <div className="flex items-start gap-2">
                <RadioGroupItem value="BRANCH" id="scope-branch" />
                <div>
                  <Label htmlFor="scope-branch">Specific branches only</Label>
                  <Text variant="muted" className="text-xs">
                    Can only see and switch between the branches checked below.
                  </Text>
                </div>
              </div>
            </RadioGroup>

            {choice === "BRANCH" && (
              <div className="space-y-2 rounded-lg border p-3 max-h-56 overflow-y-auto">
                {branches.length === 0 ? (
                  <Text variant="muted" className="text-sm">
                    No branches found.
                  </Text>
                ) : (
                  branches.map((branch) => (
                    <div key={branch._id} className="flex items-center gap-2">
                      <Checkbox
                        id={`branch-${branch._id}`}
                        checked={selectedBranchIds.includes(branch._id)}
                        onCheckedChange={() => toggleBranch(branch._id)}
                      />
                      <Label
                        htmlFor={`branch-${branch._id}`}
                        className="font-normal"
                      >
                        {branch.name}
                        {branch.isHQ && (
                          <span className="text-gray-400"> (Head Office)</span>
                        )}
                      </Label>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
        )}

        <DialogFooter className="sm:justify-end">
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isSaving}
          >
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={isSaving || isLoading}>
            {isSaving ? (
              <span className="flex items-center gap-2">
                <Loader size="w-4 h-4" showShadow={false} />
                Saving...
              </span>
            ) : (
              "Save Changes"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
