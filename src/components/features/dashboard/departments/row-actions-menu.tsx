"use client";

import { MoreVertical } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
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
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="relative z-10"
          onClick={(e) => e.stopPropagation()}
        >
          <MoreVertical className="h-4 w-4 text-gray-500" />
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        align="end"
        className="w-40"
        onClick={(e) => e.stopPropagation()}
      >
        <DropdownMenuItem onClick={() => onEdit(row)}>Edit</DropdownMenuItem>

        <DropdownMenuItem onClick={() => onExport(row)}>
          Export
        </DropdownMenuItem>

        <DropdownMenuItem
          onClick={() => onDeleteRequest(row)}
          className="text-red-600"
        >
          Delete
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
