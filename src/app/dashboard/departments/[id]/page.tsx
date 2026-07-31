"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { formatDate } from "@/utils/helpers";
import { useEffect, useState } from "react";
import { Text } from "@/components/ui/typography/Text";
import { AddMembersToDepartmentDialog } from "@/components/features/dashboard/departments/AddMemberDialogue";
import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
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

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Table from "@/components/features/dashboard/Table";
import Heading from "@/components/ui/typography/Heading";
import { DepartmentTabs } from "@/lib/enums";
import { Loader } from "@/components/ui/loader";
import DepartmentSidebar from "@/components/features/dashboard/departments/DepartmentSidebar";
import { Input } from "@/components/ui/input";
import { ChevronDown, Search } from "lucide-react";

import { getMembersColumns } from "@/components/features/dashboard/departments/member-column";

import {
  fetchDepartmentById,
  removeDepartmentMembers,
  DepartmentResponse,
} from "@/services/departmentService";

import { useIsMobile } from "@/hooks/use-mobile";
import { useToast } from "@/hooks/use-toast";

export type MemberItem = {
  id: string;
  name: string;
  joined: string;
  contact: string;
};

function MobileMembersList({
  members,
  selectedRows,
  onToggle,
  onRemove,
}: {
  members: MemberItem[];
  selectedRows: string[];
  onToggle: (id: string) => void;
  onRemove: (id: string) => void;
}) {
  return (
    <div className="divide-y border rounded-xl overflow-hidden bg-white">
      {members.map((member) => (
        <div
          key={member.id}
          className="flex items-center justify-between px-4 py-4"
        >
          <div className="flex items-center gap-3">
            <Input
              type="checkbox"
              checked={selectedRows.includes(member.id)}
              onChange={() => onToggle(member.id)}
            />

            <div>
              <Text>{member.name}</Text>
              <Text>{member.contact}</Text>
            </div>
          </div>

          <Button
            size="sm"
            variant="destructive"
            onClick={() => onRemove(member.id)}
          >
            Remove
          </Button>
        </div>
      ))}
    </div>
  );
}

export default function DepartmentDetailPage() {
  const params = useParams();
  const isMobile = useIsMobile();
  const { toast } = useToast();

  const id = Array.isArray(params?.id) ? params.id[0] : params?.id;

  const [department, setDepartment] = useState<DepartmentResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [tab, setTab] = useState<DepartmentTabs>(DepartmentTabs.MEMBERS);
  const [selectedRows, setSelectedRows] = useState<string[]>([]);
  const [removeTarget, setRemoveTarget] = useState<{
    ids: string[];
    label: string;
  } | null>(null);

  useEffect(() => {
    if (!id) {
      return;
    }
    let isMounted = true;

    async function load() {
      setLoading(true);
      setError(null);

      try {
        const response = await fetchDepartmentById(id);
        if (isMounted) setDepartment(response);
      } catch (err: any) {
        if (isMounted) {
          setError(err.message || "Failed to fetch department");
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    load();
    return () => {
      isMounted = false;
    };
  }, [id]);

  const membersData: MemberItem[] =
    department?.members?.map((member) => ({
      id: member.id,
      name: member.fullName,
      joined: formatDate(member.dateJoined),
      contact: member.phoneNumber || member.email || "-",
    })) ?? [];

  const toggleRow = (rowId: string) => {
    setSelectedRows((prev) =>
      prev.includes(rowId)
        ? prev.filter((id) => id !== rowId)
        : [...prev, rowId],
    );
  };

  const toggleAll = () => {
    if (selectedRows.length === membersData.length) {
      setSelectedRows([]);
    } else {
      setSelectedRows(membersData.map((member) => member.id));
    }
  };

  const handleBulkRemove = () => {
    if (!id || selectedRows.length === 0) {
      return;
    }
    setRemoveTarget({
      ids: selectedRows,
      label: `${selectedRows.length} selected member${selectedRows.length > 1 ? "s" : ""}`,
    });
  };

  const handleSingleRemove = (memberId: string) => {
    if (!id) {
      return;
    }
    setRemoveTarget({ ids: [memberId], label: "this member" });
  };

  const handleConfirmRemove = async () => {
    if (!id || !removeTarget) {
      return;
    }
    const { ids } = removeTarget;

    try {
      await removeDepartmentMembers(id, ids);

      setDepartment((prev) => {
        if (!prev) {
          return prev;
        }
        return {
          ...prev,
          members: prev.members.filter((m) => !ids.includes(m.id)),
        };
      });
      setSelectedRows((prev) => prev.filter((rowId) => !ids.includes(rowId)));

      toast({
        title: "Removed",
        description:
          ids.length > 1
            ? `${ids.length} members removed successfully`
            : "Member removed successfully",
      });
    } catch (error: any) {
      toast({
        title: "Remove failed",
        description: error?.message || "Please try again",
        variant: "destructive",
      });
    } finally {
      setRemoveTarget(null);
    }
  };

  const membersColumns = getMembersColumns({
    selectedRows,
    membersData,
    onToggleRow: toggleRow,
    onToggleAll: toggleAll,
    onRemove: handleSingleRemove,
  });

  const tabHeading =
    tab === DepartmentTabs.MEMBERS ? "Member's List" : "Requisitions";

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader />
      </div>
    );
  }
  if (error) {
    return <div className="p-6 text-red-500">{error}</div>;
  }
  if (!department) {
    return (
      <div className="p-6">
        <Card>
          <CardContent>
            <div className="py-8 text-center">Department not found.</div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-4 md:p-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b pb-4">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:gap-6">
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink asChild>
                  <Link href="/dashboard/departments">Departments</Link>
                </BreadcrumbLink>
              </BreadcrumbItem>

              <BreadcrumbSeparator />

              <BreadcrumbItem>
                <BreadcrumbPage>{department.name}</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>

          <Input
            leftIcon={<Search className="w-4 h-4" />}
            placeholder="Search members"
            className="w-full md:w-64"
          />
        </div>

        {!isMobile && (
          <div className="flex items-center gap-2">
            {selectedRows.length > 0 ? (
              <Button variant="destructive" onClick={handleBulkRemove}>
                Remove ({selectedRows.length})
              </Button>
            ) : (
              <AddMembersToDepartmentDialog
                departmentId={id!}
                onSuccess={async () => {
                  const updated = await fetchDepartmentById(id!);
                  setDepartment(updated);
                }}
              />
            )}
          </div>
        )}
      </div>

      {isMobile && (
        <div className="flex gap-2">
          <Button
            onClick={() => setTab(DepartmentTabs.MEMBERS)}
            variant={tab === DepartmentTabs.MEMBERS ? "default" : "outline"}
            className="flex-1"
          >
            Members
          </Button>

          <Button
            onClick={() => setTab(DepartmentTabs.REQUISITIONS)}
            variant={
              tab === DepartmentTabs.REQUISITIONS ? "default" : "outline"
            }
            className="flex-1"
          >
            Requests
          </Button>
        </div>
      )}

      <div className={`grid ${isMobile ? "grid-cols-1" : "grid-cols-4"}`}>
        {!isMobile && <DepartmentSidebar tab={tab} setTab={setTab} />}

        <main
          className={`${isMobile ? "" : "col-span-3 ml-2 md:pl-6 md:border-l"}`}
        >
          <Heading level={2} text={tabHeading} className="mb-4" />

          <Card className="border rounded-xl overflow-hidden">
            <CardContent className="p-4">
              {tab === DepartmentTabs.MEMBERS && (
                <>
                  {isMobile ? (
                    <>
                      <AddMembersToDepartmentDialog
                        departmentId={id!}
                        onSuccess={async () => {
                          const updated = await fetchDepartmentById(id!);
                          setDepartment(updated);
                        }}
                      />

                      <MobileMembersList
                        members={membersData}
                        selectedRows={selectedRows}
                        onToggle={toggleRow}
                        onRemove={handleSingleRemove}
                      />

                      {selectedRows.length > 0 && (
                        <Button
                          variant="destructive"
                          className="w-full mt-4"
                          onClick={handleBulkRemove}
                        >
                          Remove Selected ({selectedRows.length})
                        </Button>
                      )}
                    </>
                  ) : (
                    <Table
                      columns={membersColumns}
                      data={membersData}
                      rowKey={(row) => row.id}
                    />
                  )}
                </>
              )}

              {tab === DepartmentTabs.REQUISITIONS && (
                <div className="p-6 text-gray-500">
                  No requisitions data available
                </div>
              )}
            </CardContent>
          </Card>
        </main>
      </div>

      <AlertDialog
        open={!!removeTarget}
        onOpenChange={(open) => !open && setRemoveTarget(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove {removeTarget?.label}?</AlertDialogTitle>
            <AlertDialogDescription>
              This will remove {removeTarget?.label} from this department. This
              action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>

          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmRemove}>
              Remove
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
