"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { Breadcrumb, BreadcrumbList, BreadcrumbItem, BreadcrumbLink, BreadcrumbPage, BreadcrumbSeparator } from "@/components/ui/breadcrumb";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Table, { Column } from "@/components/features/dashboard/Table";
import { Badge } from "@/components/ui/badge";
import { departmentData, departmentEvents, departmentMembers, departmentRequisitions } from "@/lib/data";
import Heading from "@/components/ui/typography/Heading";
import { DepartmentTabs, RequisitionStatus } from "@/lib/enums";
import DepartmentSidebar from "@/components/features/dashboard/DepartmentSidebar";
import { Input } from "@/components/ui/input";
import { ChevronDown, Search } from "lucide-react";

export default function DepartmentDetailPage() {
  const params = useParams() as { id?: string };
  const id = params?.id ?? "";

  const department = departmentData.find((data) => data.id === id);

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

  const membersColumns: Column<any>[] = [
    { key: "name", header: "Name", accessor: (row) => row.name, width: "w-1/3" },
    { key: "role", header: "Role/Position", accessor: (row) => row.role, width: "w-1/3" },
    { key: "joined", header: "Joined On", accessor: (row) => row.joined, width: "w-1/6" },
    { key: "contact", header: "Contact", accessor: (row) => row.contact, width: "w-1/6" },
  ];

  const eventsColumns: Column<any>[] = [
    { key: "event", header: "Event", accessor: (row) => row.event, width: "w-1/2" },
    { key: "date", header: "Date", accessor: (row) => row.date, width: "w-1/6" },
    {
      key: "status",
      header: "Status",
      render: (row) => <Badge variant="outline" className="border-emerald-300 text-emerald-600 bg-transparent">{row.status}</Badge>,
      width: "w-1/6",
      align: "center",
    },
    { key: "assigned", header: "Assigned", accessor: (row) => row.assigned, width: "w-1/6", align: "center" },
  ];

  const requisitionColumns: Column<any>[] = [
    { key: "date", header: "Date", accessor: (row) => row.date, width: "w-1/6" },
    { key: "title", header: "Title", accessor: (row) => row.title, width: "w-1/2" },
    { key: "amount", header: "Amount", accessor: (row) => row.amount, width: "w-1/6" },
    {
      key: "status",
      header: "Status",
      render: (row) => (
        <Badge
          variant="outline"
          className={
            row.status === RequisitionStatus.PENDING
              ? "border-orange-300 text-orange-600 bg-transparent"
              : "border-emerald-300 text-emerald-600 bg-transparent"
          }
        >
          {row.status}
        </Badge>
      ),
      width: "w-1/6",
      align: "center",
    },
  ];

  const [tab, setTab] = useState<DepartmentTabs>(DepartmentTabs.MEMBERS);
  const tabHeading =
    tab === DepartmentTabs.MEMBERS
      ? "Member's List"
      : tab === DepartmentTabs.EVENTS
      ? "Events"
      : "Requisitions";

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
                <BreadcrumbPage>{department.name}</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>

          <div className="hidden sm:block">
            <Input
              leftIcon={<Search className="w-4 h-4" />}
              placeholder="Search by HOD, members"
              className="w-48 md:w-64"
            />
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="ghost">Filter <ChevronDown className="w-4 h-4" /></Button>
          <Button>New member</Button>
        </div>
      </div>

      <div className="grid grid-cols-4">
        <DepartmentSidebar tab={tab} setTab={setTab} />

        <main className="col-span-3 ml-2 md:pl-6 md:border-l md:border-neutral-200">
          <Heading level={2} text={tabHeading} className="mb-4" />
          {tab === DepartmentTabs.MEMBERS && (
            <Table columns={membersColumns} data={departmentMembers} rowKey={(row) => row.id} showCheckbox />
          )}

          {tab === DepartmentTabs.EVENTS && (
            <Table columns={eventsColumns} data={departmentEvents} rowKey={(row) => row.id} showCheckbox />
          )}

          {tab === DepartmentTabs.REQUISITIONS && (
            <Table columns={requisitionColumns} data={departmentRequisitions} rowKey={(row) => row.id} showCheckbox />
          )}
        </main>
      </div>
    </div>
  );
}
