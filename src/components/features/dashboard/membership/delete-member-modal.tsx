"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
} from "@/components/ui/dialog";
import { Text } from "@/components/ui/typography/Text";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

import { deleteMember } from "@/services/memberService";
type DeleteMembersModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  memberIds: string[];
  onDeleted?: (deletedIds: string[]) => void; // callback after successful deletion
};

export function DeleteMembersModal({
  open,
  onOpenChange,
  memberIds,
  onDeleted,
}: DeleteMembersModalProps) {
  const { toast } = useToast();
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    if (memberIds.length === 0) {
      return;
    }
    try {
      setIsDeleting(true);
      for (const id of memberIds) {
        await deleteMember(id);
      }
      toast({
        title: "Deleted",
        description: `${memberIds.length} ${memberIds.length === 1 ? "member" : "members"} deleted successfully.`,
      });

      onDeleted?.(memberIds);
      onOpenChange(false);
    } catch (error) {
      toast({
        title: "Error",
        description:
          error instanceof Error ? error.message : "Failed to delete members",
        variant: "destructive",
      });
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        showClose={false}
        mobileSheet
        className="w-full sm:max-w-lg max-h-[60vh] overflow-hidden p-4 sm:p-6 flex flex-col"
      >
        <DialogDescription className="sr-only">
          Confirm deletion of selected members
        </DialogDescription>

        <div className="flex-1 min-h-0 overflow-y-auto px-0 sm:px-6 py-3 sm:py-6">
          <Text className="text-lg sm:text-xl mb-2">
            Remove {memberIds.length === 1 ? "member" : "members"}?
          </Text>
          <Text variant="default">
            Are you sure you want to remove these selected{" "}
            <strong>{memberIds.length}</strong>{" "}
            {memberIds.length === 1 ? "member" : "members"}? This action cannot
            be undone.
          </Text>
        </div>

        <div className="border-t border-gray-200 pt-4">
          <div className="flex justify-end gap-3">
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isDeleting}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={isDeleting}
            >
              {isDeleting ? "Deleting..." : "Delete"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
