"use client";

import { DepartmentRow } from "@/types";
import { Card, CardContent } from "@/components/ui/card";
import Heading from "@/components/ui/typography/Heading";
import { Text, Span } from "@/components/ui/typography/Text";
import { Button } from "@/components/ui/button";
import { MoreVertical } from "lucide-react";
import { useRouter } from "next/navigation";
import { RouteConfig } from "@/config/routes";

type Props = {
  data: DepartmentRow[];
};

export default function DepartmentMobile({ data }: Props) {
  const router = useRouter();

  if (data.length === 0) {
    return (
      <div className="px-3 pt-3">
        <Text text="No departments found" variant="muted" />
      </div>
    );
  }

  return (
    <div className="space-y-3 px-3 pt-3">
      {data.map((dept) => (
        <Card
          key={dept.id}
          className="rounded-2xl cursor-pointer"
          onClick={() =>
            router.push(RouteConfig.dashboard.departmentDetails(dept.id))
          }
        >
          <CardContent className="p-4 space-y-3">
            {/* Top row */}
            <div className="flex items-center justify-between">
              <Heading level={4} text={dept.name} className="truncate" />

              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 shrink-0"
                onClick={(e) => e.stopPropagation()} // prevent card click
              >
                <MoreVertical className="h-4 w-4" />
              </Button>
            </div>

            {/* Details */}
            <div className="space-y-1">
              <Text text={`HOD: ${dept.hod?.name ?? "—"}`} />

              <Text text={`Members: ${dept.members}`} />

              <Span
                text={dept.status}
                variant={dept.status === "Active" ? "success" : "muted"}
              />
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
