"use client";

import { useMemo, useState } from "react";
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
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Calendar, Clock, User, X } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";

type MemberAttendanceTabProps = {
  records: MemberAttendanceRecord[];
  filterValue: string;
};

export function MemberAttendanceTab({
  records,
  filterValue,
}: MemberAttendanceTabProps) {
  const isMobile = useIsMobile();
  const [selectedRecord, setSelectedRecord] =
    useState<MemberAttendanceRecord | null>(null);

  const filteredRecords = useMemo(() => {
    if (filterValue === "present") {
      return records.filter((record) => record.status === "Present");
    }
    if (filterValue === "absent") {
      return records.filter((record) => record.status === "Absent");
    }
    return records;
  }, [records, filterValue]);

  const attendanceStats = useMemo(() => {
    const attended = records.filter(
      (record) => record.status === "Present",
    ).length;
    const missed = records.filter(
      (record) => record.status === "Absent",
    ).length;
    const rate = records.length
      ? Math.round((attended / records.length) * 100)
      : 0;
    return { attended, missed, rate };
  }, [records]);

  if (!isMobile) {
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
              {filteredRecords.map((record) => (
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

          {filteredRecords.length === 0 && (
            <div className="p-8 text-center">
              <Text variant="muted">No attendance records found</Text>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="p-1 space-y-2">
        <div className="grid grid-cols-3 gap-2">
          <div className="rounded-lg border bg-white px-2 py-2 text-center">
            <div className="text-lg font-semibold leading-none">
              {attendanceStats.attended}
            </div>
            <div className="text-[11px] text-muted-foreground mt-1">
              Attended
            </div>
          </div>
          <div className="rounded-lg border bg-white px-2 py-2 text-center">
            <div className="text-lg font-semibold leading-none text-destructive-600">
              {attendanceStats.missed}
            </div>
            <div className="text-[11px] text-muted-foreground mt-1">Missed</div>
          </div>
          <div className="rounded-lg border bg-white px-2 py-2 text-center">
            <div className="text-lg font-semibold leading-none text-success-600">
              {attendanceStats.rate}%
            </div>
            <div className="text-[11px] text-muted-foreground mt-1">Rate</div>
          </div>
        </div>

        <div className="bg-white rounded-lg border overflow-hidden">
          <div className="grid grid-cols-2 px-3 py-3 border-b bg-gray-50">
            <Text variant="default" className="font-medium text-sm">
              Service
            </Text>
            <Text variant="default" className="font-medium text-sm text-right">
              Action
            </Text>
          </div>

          {filteredRecords.map((record) => {
            const isPresent = record.status === "Present";
            return (
              <div
                key={record.id}
                className="grid grid-cols-2 items-center px-3 py-3 border-b last:border-b-0"
              >
                <Text variant="default" className="text-sm truncate pr-2">
                  {record.service}
                </Text>
                <div className="flex justify-end">
                  <Button
                    size="sm"
                    className={`h-7 px-2 text-xs ${
                      isPresent
                        ? "bg-success-600 hover:bg-success-700"
                        : "bg-destructive-600 hover:bg-destructive-700"
                    }`}
                    onClick={() => setSelectedRecord(record)}
                  >
                    View Details
                  </Button>
                </div>
              </div>
            );
          })}

          {filteredRecords.length === 0 && (
            <div className="p-6 text-center">
              <Text variant="muted">No attendance records found</Text>
            </div>
          )}
        </div>
      </div>

      <Dialog
        open={Boolean(selectedRecord)}
        onOpenChange={(open) => {
          if (!open) setSelectedRecord(null);
        }}
      >
        <DialogContent
          showClose={false}
          mobileSheet
          className="w-full max-w-md p-0 overflow-hidden max-sm:max-h-[85vh]"
        >
          {selectedRecord && (
            <div className="bg-background">
              <DialogHeader className="px-5 py-4 border-b">
                <div className="flex items-center justify-between">
                  <DialogTitle className="text-lg">
                    {selectedRecord.service}
                  </DialogTitle>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setSelectedRecord(null)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </DialogHeader>

              <div className="px-5 py-4 space-y-4">
                <div className="flex items-center gap-2 text-sm">
                  <Calendar className="h-4 w-4" />
                  <Text variant="default">{selectedRecord.date}</Text>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Clock className="h-4 w-4" />
                  <Text variant="default">{selectedRecord.time}</Text>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <User className="h-4 w-4" />
                  <Text variant="default">
                    Recorded by: {selectedRecord.recordedBy}
                  </Text>
                </div>

                <Button
                  disabled
                  className={`w-full ${
                    selectedRecord.status === "Present"
                      ? "bg-success-50 text-success-700 border border-success-300 hover:bg-success-50"
                      : "bg-destructive-50 text-destructive-700 border border-destructive-300 hover:bg-destructive-50"
                  }`}
                >
                  {selectedRecord.status}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
