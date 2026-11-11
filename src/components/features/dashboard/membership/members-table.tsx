"use client";
import { Users } from "lucide-react";
import { MemberProfile } from "@/types";
import { EmptyState } from "@/components/features/dashboard/empty-state";
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
  selectedMemberIds?: string[];
  onSelectMember?: (id: string, checked: boolean) => void;
  onSelectAll?: (checked: boolean) => void;
  setIsDeleteModalOpen: any;
  setIsFormatModalOpen: any;
  isCsvUploading: boolean;
  /** True when a search/filter is active, so the empty state can be specific. */
  searchActive?: boolean;
};

export function MembersTable({
  members,
  onRowClick,
  onAddMember,
  pagination,
  onPageChange,
  selectedMemberIds = [],
  onSelectMember,
  onSelectAll,
  setIsDeleteModalOpen,
  setIsFormatModalOpen: _setIsFormatModalOpen,
  isCsvUploading: _isCsvUploading,
  searchActive,
}: MembersTableProps) {
  const isMobile = useIsMobile();
  const currentPage = pagination?.page || 1;
  const totalPages = pagination?.totalPages || 1;
  const allSelected =
    members.length > 0 && selectedMemberIds.length === members.length;
  const someSelected = selectedMemberIds.length > 0 && !allSelected;

  if (isMobile) {
    return (
      <div className="rounded-lg border bg-white overflow-hidden">
        <div className="divide-y">
          <div className="flex items-center justify-between px-3 py-3">
            <div className="flex items-center gap-3">
              <Checkbox
                checked={someSelected ? "indeterminate" : allSelected}
                onCheckedChange={(checked) => {
                  return onSelectAll?.(checked === true);
                }}
              />
              <Text text="All Members" variant="default" />
            </div>
            {selectedMemberIds.length > 0 ? (
              <Button
                variant="destructive"
                size="sm"
                className="h-8 px-4"
                onClick={() => {
                  return setIsDeleteModalOpen(true);
                }}
              >
                <Text text="Remove" variant="default" />
              </Button>
            ) : (
              <Button size="sm" className="h-8  px-4" onClick={onAddMember}>
                <Text text="Add" variant="default" />
              </Button>
            )}
          </div>{" "}
          {members.map((member) => {
            return (
              <div
                key={member.id}
                className="flex items-center justify-between px-3 py-3 hover:bg-primary-50/50 transition-colors cursor-pointer"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <Checkbox
                    checked={selectedMemberIds.includes(member.id)}
                    onCheckedChange={(checked) => {
                      return onSelectMember?.(member.id, !!checked);
                    }}
                  />
                  <Text
                    text={member.fullName}
                    variant="default"
                    className="truncate"
                  />
                </div>

                <Button
                  size="sm"
                  variant="outline"
                  className="h-8"
                  onClick={() => {
                    return onRowClick(member.id);
                  }}
                >
                  <Text text="View Profile" variant="default" />
                </Button>
              </div>
            );
          })}
        </div>

        {members.length === 0 && (
          <div className="p-4">
            <EmptyState
              icon={Users}
              title={
                searchActive
                  ? "No members match your search or filters"
                  : "No members yet"
              }
              description={
                searchActive
                  ? "Try a different search term or clear the filters to see everyone."
                  : "Add your first member or import a CSV to get started."
              }
              size="sm"
            />
          </div>
        )}

        {pagination && members.length > 0 && (
          <div className="flex items-center justify-between px-4 py-3 border-t">
            <Span
              text={`Page ${currentPage} of ${totalPages}`}
              variant="default"
            />
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                disabled={!pagination.hasPreviousPage}
                onClick={() => {
                  return onPageChange(currentPage - 1);
                }}
              >
                <Text text="Previous" variant="default" />
              </Button>
              <Button
                variant="outline"
                disabled={!pagination.hasNextPage}
                onClick={() => {
                  return onPageChange(currentPage + 1);
                }}
              >
                <Text text="Next" variant="default" />
              </Button>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="overflow-auto w-full max-w-full">
      <div className="min-w-max border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>
                <Checkbox
                  checked={someSelected ? "indeterminate" : allSelected}
                  onCheckedChange={(checked) => {
                    return onSelectAll?.(checked === true);
                  }}
                />
              </TableHead>
              <TableHead>
                <Text text="Name" variant="default" />
              </TableHead>
              <TableHead>
                <Text text="Birthday" variant="default" />
              </TableHead>
              <TableHead>
                <Text text="Gender" variant="default" />
              </TableHead>
              <TableHead>
                <Text text="Phone" variant="default" />
              </TableHead>
              <TableHead>
                <Text text="Email" variant="default" />
              </TableHead>
              <TableHead>
                <Text text="Action" variant="default" />
              </TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {members.map((member) => {
              return (
                <TableRow
                  key={member.id}
                  className="cursor-pointer transition-colors hover:bg-primary-50/50"
                >
                  <TableCell
                    onClick={(e) => {
                      return e.stopPropagation();
                    }}
                  >
                    <Checkbox
                      checked={selectedMemberIds.includes(member.id)}
                      onCheckedChange={(checked) => {
                        return onSelectMember?.(member.id, !!checked);
                      }}
                    />
                  </TableCell>
                  <TableCell>
                    <Text text={member.fullName} variant="default" />
                  </TableCell>
                  <TableCell>
                    <Text
                      text={formatDate(member.birthday)}
                      variant="default"
                    />
                  </TableCell>
                  <TableCell>
                    <Text text={member.gender} variant="default" />
                  </TableCell>
                  <TableCell>
                    <Text text={member.phone} variant="default" />
                  </TableCell>
                  <TableCell>
                    <Text
                      text={member.email}
                      variant="default"
                      className="truncate underline decoration-gray-300 underline-offset-2"
                    />
                  </TableCell>
                  <TableCell>
                    <Button
                      onClick={() => {
                        return onRowClick(member.id);
                      }}
                      variant="outline"
                      size="sm"
                      className="transition-colors hover:border-primary-400 hover:text-primary-400 hover:bg-primary-50/40"
                    >
                      <Text text="View Profile" variant="default" />
                    </Button>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>

      {members.length === 0 && (
        <EmptyState
          icon={Users}
          title={
            searchActive
              ? "No members match your search or filters"
              : "No members yet"
          }
          description={
            searchActive
              ? "Try a different search term or clear the filters to see everyone."
              : "Add your first member or import a CSV to get started."
          }
          action={
            searchActive
              ? undefined
              : { label: "Add a member", href: "/dashboard/membership/members" }
          }
          className="py-10"
        />
      )}

      {pagination && members.length > 0 && (
        <div className="flex items-center justify-between px-4 py-3 border-t">
          <Span
            text={`Page ${currentPage} of ${totalPages}`}
            variant="default"
          />
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              disabled={!pagination.hasPreviousPage}
              onClick={() => {
                return onPageChange(currentPage - 1);
              }}
            >
              <Text text="Previous" variant="default" />
            </Button>
            <Button
              variant="outline"
              disabled={!pagination.hasNextPage}
              onClick={() => {
                return onPageChange(currentPage + 1);
              }}
            >
              <Text text="Next" variant="default" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
