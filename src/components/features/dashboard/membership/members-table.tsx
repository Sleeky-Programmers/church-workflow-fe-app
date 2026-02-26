"use client";

import { useMemo, useState } from "react";
import { MemberProfile } from "@/types";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import { Text, Span } from "@/components/ui/typography/Text";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";

type MembersTableProps = {
  members: MemberProfile[];
  onRowClick: (memberId: string) => void;
};

export function MembersTable({ members, onRowClick }: MembersTableProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const totalPages = useMemo(
    () => Math.max(1, Math.ceil(members.length / pageSize)),
    [members.length, pageSize],
  );

  const paginated = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return members.slice(start, start + pageSize);
  }, [members, currentPage, pageSize]);

  useMemo(() => setCurrentPage(1), [members, pageSize]);

  return (
    <div className="overflow-auto w-full max-w-full">
      <div className="min-w-max border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>
                <Checkbox />
              </TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Birthday</TableHead>
              <TableHead>Gender</TableHead>
              <TableHead>Phone</TableHead>
              <TableHead>Email</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginated.map((member) => (
              <TableRow
                key={member.id}
                onClick={() => onRowClick(member.id)}
                className="cursor-pointer hover:bg-gray-50 p-5"
              >
                <TableCell onClick={(e) => e.stopPropagation()}>
                  <Checkbox />
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-3">
                    <Text variant="default" className="truncate">
                      {member.fullName}
                    </Text>
                  </div>
                </TableCell>
                <TableCell>
                  <Text variant="default">{member.birthday}</Text>
                </TableCell>
                <TableCell>
                  <Text variant="default">{member.gender}</Text>
                </TableCell>
                <TableCell>
                  <Text variant="default">{member.phone}</Text>
                </TableCell>
                <TableCell>
                  <Text variant="default" className="truncate">
                    {member.email}
                  </Text>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      {members.length === 0 && (
        <div className="p-8 text-center">
          <Text variant="muted">No members found</Text>
        </div>
      )}

      {members.length > 0 && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-4 py-3 border-t">
          <Span>
            Page {currentPage} of {totalPages}
          </Span>

          <Select
            value={String(pageSize)}
            onValueChange={(v) => setPageSize(Number(v))}
          >
            <SelectTrigger className="w-[110px]">
              <SelectValue placeholder="Page size" />
            </SelectTrigger>
            <SelectContent>
              {[10, 20, 50].map((s) => (
                <SelectItem key={s} value={String(s)}>
                  {s} / page
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <div className="flex items-center gap-2">
            <Button
              className="px-3 py-1 rounded-md border disabled:opacity-50"
              variant="outline"
              disabled={currentPage === 1}
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            >
              Previous
            </Button>

            <Button
              className="px-3 py-1 rounded-md border disabled:opacity-50"
              variant="outline"
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            >
              Next
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
