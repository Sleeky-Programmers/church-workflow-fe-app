"use client";

import { MemberAttendanceRecord } from "@/types";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Text } from "@/components/ui/typography/Text";

type MemberAttendanceTabProps = {
  records: MemberAttendanceRecord[];
  filterValue: string;
};

export function MemberAttendanceTab({ records }: MemberAttendanceTabProps) {
  return (
    <div className="p-6">
      <div className="bg-white rounded-lg border overflow-hidden">
        <Table>
          <TableHeader className="bg-gray-50">
            <TableRow>
              <TableHead>Service</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Recorded By</TableHead>
              <TableHead>Time</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {records.map((record) => (
              <TableRow key={record.id}>
                <TableCell>
                  <Text variant="default" className="text-sm font-medium">
                    {record.service}
                  </Text>
                </TableCell>
                <TableCell>
                  <Text variant="default" className="text-sm">
                    {record.date}
                  </Text>
                </TableCell>
                <TableCell>
                  <Badge
                    variant={
                      record.status === "Present" ? "default" : "destructive"
                    }
                    className={
                      record.status === "Present"
                        ? "bg-success-100 text-success-700 hover:bg-success-100"
                        : ""
                    }
                  >
                    {record.status}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Text variant="default" className="text-sm">
                    {record.recordedBy}
                  </Text>
                </TableCell>
                <TableCell>
                  <Text variant="default" className="text-sm">
                    {record.time}
                  </Text>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>

        {records.length === 0 && (
          <div className="p-8 text-center">
            <Text variant="muted">No attendance records found</Text>
          </div>
        )}
      </div>
    </div>
  );
}
