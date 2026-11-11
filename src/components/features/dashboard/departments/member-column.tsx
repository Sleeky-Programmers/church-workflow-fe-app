"use client";

import { Column } from "@/components/features/dashboard/Table";
import { Button } from "@/components/ui/button";
import { Span } from "@/components/ui/typography/Text";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";

type MembersColumnProps = {
  selectedRows: string[];
  membersData: any[];
  onToggleRow: (id: string) => void;
  onToggleAll: () => void;
  onRemove: (id: string) => void;
};

export function getMembersColumns({
  selectedRows,
  membersData,
  onToggleRow,
  onToggleAll,
  onRemove,
}: MembersColumnProps): Column<any>[] {
  return [
    {
      key: "select",
      header: (
        <div className="flex justify-center">
          <Input
            type="checkbox"
            checked={
              membersData.length > 0 &&
              selectedRows.length === membersData.length
            }
            onChange={onToggleAll}
            className="w-4 h-4 rounded border-gray-300 accent-blue-600"
          />
        </div>
      ),
      render: (row) => {
        return (
          <div className="flex justify-center">
            <Input
              type="checkbox"
              checked={selectedRows.includes(row.id)}
              onChange={() => {
                return onToggleRow(row.id);
              }}
              className="w-4 h-4 rounded border-gray-300 accent-blue-600"
            />
          </div>
        );
      },
      width: "w-[50px]",
      align: "center",
    },
    {
      key: "name",
      header: "Name",
      render: (row) => {
        return <span className="font-medium text-gray-900">{row.name}</span>;
      },
    },
    {
      key: "joined",
      header: "Joined On",
      render: (row) => {
        return <span className="text-gray-600">{row.joined}</span>;
      },
    },
    {
      key: "contact",
      header: "Contact",
      render: (row) => {
        return <span className="text-gray-600">{row.contact}</span>;
      },
    },
    {
      key: "actions",
      header: <div className="flex justify-center w-full">Actions</div>,
      render: (row) => {
        return (
          <div className="flex justify-center w-full">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  className="flex items-center justify-center w-8 h-8 rounded-md"
                >
                  <Span className="text-lg leading-none">⋮</Span>
                </Button>
              </DropdownMenuTrigger>

              <DropdownMenuContent align="end" className="w-40">
                <DropdownMenuItem
                  onClick={() => {
                    return onRemove(row.id);
                  }}
                  className="text-red-600 cursor-pointer"
                >
                  Remove
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        );
      },
      align: "center",
      width: "w-[80px]",
    },
  ];
}
