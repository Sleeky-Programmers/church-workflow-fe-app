"use client";

import { MoreVertical } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { useHasAccess } from "@/lib/access-control";
import { DepartmentRow } from "@/types";

interface Props {
  row: DepartmentRow;
  onEdit: (row: DepartmentRow) => void;
  onExport: (row: DepartmentRow) => void;
  onDeleteRequest: (row: DepartmentRow) => void;
}

export default function RowActionsMenu({
  row,
  onEdit,
  onExport,
  onDeleteRequest,
}: Props) {
  // Deleting a department is an org-wide administrative action (matches the
  // Backend's FULL_ACCESS requirement) - not something a department head can
  // Do.
  const canDelete = useHasAccess("DEPARTMENTS", "FULL_ACCESS");

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="relative z-10"
          onClick={(e) => {
            return e.stopPropagation();
          }}
        >
          <MoreVertical className="h-4 w-4 text-gray-500" />
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        align="end"
        className="w-40"
        onClick={(e) => {
          return e.stopPropagation();
        }}
      >
        <DropdownMenuItem
          onClick={() => {
            return onEdit(row);
          }}
        >
          Edit
        </DropdownMenuItem>

        <DropdownMenuItem
          onClick={() => {
            return onExport(row);
          }}
        >
          Export
        </DropdownMenuItem>

        {canDelete && (
          <DropdownMenuItem
            onClick={() => {
              return onDeleteRequest(row);
            }}
            className="text-red-600"
          >
            Delete
          </DropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
