"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { formatDate } from "@/utils/helpers";

import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Table, { Column } from "@/components/features/dashboard/Table";
import Heading from "@/components/ui/typography/Heading";
import { DepartmentTabs } from "@/lib/enums";
import { Loader } from "@/components/ui/loader";
import DepartmentSidebar from "@/components/features/dashboard/departments/DepartmentSidebar";
import { Input } from "@/components/ui/input";
import { ChevronDown, Search } from "lucide-react";
import { Span } from "@/components/ui/typography/Text";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";

import { useEffect, useState } from "react";
import {
  fetchDepartmentById,
  removeDepartmentMembers,
  DepartmentResponse,
} from "@/services/departmentService";

export default function DepartmentDetailPage() {
  const params = useParams();

  const id = Array.isArray(params?.id) ? params.id[0] : params?.id;
  const [department, setDepartment] = useState<DepartmentResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [tab, setTab] = useState<DepartmentTabs>(DepartmentTabs.MEMBERS);

  const [selectedRows, setSelectedRows] = useState<string[]>([]);

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
        if (isMounted) {
          setDepartment(response);
        }
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

  const membersData =
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
      setSelectedRows(membersData.map((m) => m.id));
    }
  };

  const handleBulkRemove = async () => {
    if (!id || selectedRows.length === 0) {
      return;
    }
    if (!confirm("Remove selected members?")) {
      return;
    }

    await removeDepartmentMembers(id, selectedRows);

    setDepartment((prev) => {
      if (!prev) {
        return prev;
      }
      return {
        ...prev,
        members: prev.members.filter((m) => !selectedRows.includes(m.id)),
      };
    });

    setSelectedRows([]);
  };

  const handleSingleRemove = async (memberId: string) => {
    if (!id) {
      return;
    }
    if (!confirm("Remove this member?")) {
      return;
    }

    await removeDepartmentMembers(id, [memberId]);

    setDepartment((prev) => {
      if (!prev) {
        return prev;
      }
      return {
        ...prev,
        members: prev.members.filter((m) => m.id !== memberId),
      };
    });
  };

  const membersColumns: Column<any>[] = [
    {
      key: "select",
      header: (
        <input
          type="checkbox"
          checked={
            membersData.length > 0 && selectedRows.length === membersData.length
          }
          onChange={toggleAll}
          className="w-4 h-4 rounded border-gray-300 accent-blue-600"
        />
      ),
      render: (row) => (
        <input
          type="checkbox"
          checked={selectedRows.includes(row.id)}
          onChange={() => toggleRow(row.id)}
          className="w-4 h-4 rounded border-gray-300 accent-blue-600"
        />
      ),
      width: "w-[50px]",
    },
    {
      key: "name",
      header: "Name",
      render: (row) => (
        <span className="font-medium text-gray-900">{row.name}</span>
      ),
      width: "w-[35%]",
    },
    {
      key: "joined",
      header: "Joined On",
      render: (row) => <span className="text-gray-600">{row.joined}</span>,
      width: "w-[25%]",
    },
    {
      key: "contact",
      header: "Contact",
      render: (row) => <span className="text-gray-600">{row.contact}</span>,
      width: "w-[30%]",
    },
    {
      key: "actions",
      header: "Actions",
      render: (row) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              className="flex items-center justify-center w-8 h-8 rounded-md "
            >
              <Span className="text-xl leading-none">⋮</Span>
            </Button>
          </DropdownMenuTrigger>

          <DropdownMenuContent align="end" className="w-40">
            <DropdownMenuItem
              onClick={() => handleSingleRemove(row.id)}
              className="text-red-600 focus:text-red-600 cursor-pointer"
            >
              Remove
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ),
      width: "w-[80px]",
      align: "center",
    },
  ];

  const tabHeading =
    tab === DepartmentTabs.MEMBERS ? "Member's List" : "Requisitions";

  if (loading) {
    return <Loader />;
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
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between border-b pb-4">
        <div className="flex items-center gap-6">
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink asChild>
                  <Link href="/dashboard/departments">Departments</Link>
                </BreadcrumbLink>
              </BreadcrumbItem>

              <BreadcrumbSeparator />

              <BreadcrumbItem>
                <BreadcrumbPage>
                  {department.name}{" "}
                  {department.hod && (
                    <span className="text-sm text-gray-500">
                      (HOD: {department.hod.name})
                    </span>
                  )}
                </BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>

          <div className="hidden sm:block">
            <Input
              leftIcon={<Search className="w-4 h-4" />}
              placeholder="Search members"
              className="w-48 md:w-64"
            />
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="ghost">
            Filter <ChevronDown className="w-4 h-4" />
          </Button>

          {selectedRows.length > 0 ? (
            <Button variant="destructive" onClick={handleBulkRemove}>
              Remove ({selectedRows.length})
            </Button>
          ) : (
            <Button>New member</Button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-4">
        <DepartmentSidebar tab={tab} setTab={setTab} />
        <main className="col-span-3 ml-2 md:pl-6 md:border-l md:border-gray-200">
          <Heading level={2} text={tabHeading} className="mb-4" />

          <Card className="border border-gray-200 rounded-xl shadow-sm overflow-hidden">
            <CardContent className="p-0">
              {tab === DepartmentTabs.MEMBERS && (
                <Table
                  columns={membersColumns}
                  data={membersData}
                  rowKey={(row) => row.id}
                />
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
    </div>
  );
}
