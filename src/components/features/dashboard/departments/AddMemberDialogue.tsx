"use client";

import { useState } from "react";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { MemberMultiSelect } from "@/components/features/dashboard/departments/member-selectors";
import { fetchMembers } from "@/services/memberService";
import { addDepartmentMembers } from "@/services/departmentService";
import { useToast } from "@/hooks/use-toast";
import { useIsMobile } from "@/hooks/use-mobile";
import { Span, Text } from "@/components/ui/typography/Text";
import Heading from "@/components/ui/typography/Heading";

export function AddMembersToDepartmentDialog({
  departmentId,
  departmentName,
  onSuccess,
}: {
  departmentId: string;
  departmentName?: string;
  onSuccess: () => void;
}) {
  const { toast } = useToast();
  const isMobile = useIsMobile();

  const [open, setOpen] = useState(false);
  const [memberIds, setMemberIds] = useState<string[]>([]);
  const [memberMap, setMemberMap] = useState<Record<string, any>>({});
  const [loading, setLoading] = useState(false);

  async function handleAdd() {
    if (!memberIds.length) {
      return;
    }
    setLoading(true);

    try {
      await addDepartmentMembers(departmentId, memberIds);

      toast({
        title: "Success",
        description: "Members updated successfully",
      });

      setOpen(false);
      setMemberIds([]);
      setMemberMap({});
      onSuccess();
    } catch (err: any) {
      toast({
        title: "Error",
        description: err.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }

  function removeSelected(id: string) {
    setMemberIds((prev) => prev.filter((member) => member !== id));

    setMemberMap((prev) => {
      const copy = { ...prev };
      delete copy[id];
      return copy;
    });
  }

  const visibleMembers = memberIds.slice(0, 3);
  const remainingCount = memberIds.length - visibleMembers.length;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="w-full sm:w-auto">New Member</Button>
      </DialogTrigger>

      <DialogContent
        className={`
          p-0 overflow-hidden
          ${
            isMobile
              ? "w-full h-full max-w-none rounded-none"
              : "max-w-lg rounded-xl"
          }
        `}
      >
        <div className="px-5 py-4 border-b">
          <Heading className="font-semibold text-base">
            {isMobile
              ? `Manage Members - ${departmentName || ""}`
              : "Add member(s)"}
          </Heading>
        </div>

        <div className="px-5 py-4 space-y-5 overflow-y-auto max-h-[70vh]">
          {memberIds.length > 0 && (
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <Text className="text-sm font-medium">Selected Members</Text>

                {isMobile && (
                  <Button variant="outline" size="sm">
                    View All Members
                  </Button>
                )}
              </div>

              <div className="flex flex-wrap gap-2">
                {visibleMembers.map((id) => {
                  const member = memberMap[id];
                  if (!member) {
                    return null;
                  }
                  return (
                    <Span key={id} variant="chip">
                      {member.fullName.split(" ")[0]}
                      <Button onClick={() => removeSelected(id)}>
                        <X className="w-3 h-3 ml-1" />
                      </Button>
                    </Span>
                  );
                })}

                {remainingCount > 0 && (
                  <Span variant="chip">+{remainingCount}</Span>
                )}
              </div>
            </div>
          )}

          <div className="space-y-2">
            <Text className="text-sm font-medium">Add Members</Text>

            <MemberMultiSelect
              fetchOptions={fetchMembers}
              value={memberIds}
              onChange={(ids, members) => {
                setMemberIds(ids);

                setMemberMap((prev) => {
                  const updated = { ...prev };
                  members.forEach((m) => {
                    updated[m.id] = m;
                  });
                  return updated;
                });
              }}
            />
          </div>
        </div>

        <div className="border-t p-4">
          <Button onClick={handleAdd} disabled={loading} className="w-full">
            {loading ? "Updating..." : "Update"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
