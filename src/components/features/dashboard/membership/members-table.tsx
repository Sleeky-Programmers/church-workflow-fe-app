"use client";

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
import { Button } from "@/components/ui/button";
import { useIsMobile } from "@/hooks/use-mobile";
import { formatDate } from "@/utils/helpers";

type MembersTableProps = {
  members: MemberProfile[];
  onRowClick: (memberId: string) => void;
  onAddMember?: () => void;
  pagination: {
    page: number;
    totalPages: number;
    hasPreviousPage: boolean;
    hasNextPage: boolean;
  } | null;
  onPageChange: (page: number) => void;
};

export function MembersTable({
  members,
  onRowClick,
  onAddMember,
  pagination,
  onPageChange,
}: MembersTableProps) {
  const isMobile = useIsMobile();
  const currentPage = pagination?.page || 1;
  const totalPages = pagination?.totalPages || 1;

  // MOBILE VIEW
  if (isMobile) {
    return (
      <div className="rounded-lg border bg-white overflow-hidden">
        <div className="divide-y">
          <div className="flex items-center justify-between px-3 py-3">
            <div className="flex items-center gap-3">
              <Checkbox />
              <Text variant="default">All Members</Text>
            </div>

            {onAddMember && (
              <Button size="sm" className="h-8 px-4" onClick={onAddMember}>
                Add
              </Button>
            )}
          </div>

          {members.map((member) => (
            <div
              key={member.id}
              className="flex items-center justify-between px-3 py-3"
            >
              <div className="flex items-center gap-3 min-w-0">
                <Checkbox />
                <Text variant="default" className="truncate">
                  {member.fullName}
                </Text>
              </div>

              <Button
                size="sm"
                variant="outline"
                className="h-8"
                onClick={() => onRowClick(member.id)}
              >
                View Profile
              </Button>
            </div>
          ))}
        </div>

        {members.length === 0 && (
          <div className="p-6 text-center">
            <Text variant="muted">No members found</Text>
          </div>
        )}

        {pagination && members.length > 0 && (
          <div className="flex items-center justify-between px-4 py-3 border-t">
            <Span>
              Page {currentPage} of {totalPages}
            </Span>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                disabled={!pagination.hasPreviousPage}
                onClick={() => onPageChange(currentPage - 1)}
              >
                Previous
              </Button>
              <Button
                variant="outline"
                disabled={!pagination.hasNextPage}
                onClick={() => onPageChange(currentPage + 1)}
              >
                Next
              </Button>
            </div>
          </div>
        )}
      </div>
    );
  }

  // DESKTOP VIEW
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
            {members.map((member) => (
              <TableRow
                key={member.id}
                onClick={() => onRowClick(member.id)}
                className="cursor-pointer hover:bg-gray-50"
              >
                <TableCell onClick={(e) => e.stopPropagation()}>
                  <Checkbox />
                </TableCell>

                <TableCell>
                  <Text variant="default">{member.fullName}</Text>
                </TableCell>

                <TableCell>
                  <Text variant="default">{formatDate(member.birthday)}</Text>
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

      {pagination && members.length > 0 && (
        <div className="flex items-center justify-between px-4 py-3 border-t">
          <Span>
            Page {currentPage} of {totalPages}
          </Span>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              disabled={!pagination.hasPreviousPage}
              onClick={() => onPageChange(currentPage - 1)}
            >
              Previous
            </Button>
            <Button
              variant="outline"
              disabled={!pagination.hasNextPage}
              onClick={() => onPageChange(currentPage + 1)}
            >
              Next
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
