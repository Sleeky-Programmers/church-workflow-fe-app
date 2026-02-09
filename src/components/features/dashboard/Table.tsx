"use client";

import React, { useMemo, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import {
  Table as TableComponent,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from "@/components/ui/table";
import { Span } from "@/components/ui/typography/Text";

type Align = "left" | "center" | "right";

export type Column<T> = {
  key: string;
  header?: React.ReactNode;
  accessor?: keyof T | ((row: T) => React.ReactNode);
  sortAccessor?: (row: T) => string | number;
  render?: (row: T) => React.ReactNode;
  sortable?: boolean;
  width?: string;
  align?: Align;
};

export interface CustomTableProps<T> {
  columns: Column<T>[];
  data: T[];
  rowKey?: keyof T | ((row: T) => string);
  enablePagination?: boolean;
  defaultPageSize?: number;
  pageSizeOptions?: number[];
  enableSorting?: boolean;
  isLoading?: boolean;
  emptyState?: React.ReactNode;
  onRowClick?: (row: T) => void;
  className?: string;
  showCheckbox?: boolean;
  selectedRowKeys?: string[];
  onSelectedRowKeysChange?: (keys: string[]) => void;
}

type SortState = {
  key: string | null;
  direction: "asc" | "desc" | null;
};

export default function Table<T extends Record<string, any>>({
  columns,
  data,
  rowKey,
  enableSorting = true,
  isLoading = false,
  emptyState,
  onRowClick,
  className = "",
  showCheckbox = false,
  selectedRowKeys,
  onSelectedRowKeysChange,
}: CustomTableProps<T>) {
  const [sort, setSort] = useState<SortState>({
    key: "timestamp",
    direction: "desc",
  });
  const [internalSelected, setInternalSelected] = useState<string[]>([]);

  const getRowKey = (row: T, idx: number) => {
    if (!rowKey) {
      return String(idx);
    }

    if (typeof rowKey === "function") {
      return rowKey(row);
    }

    return String(row[rowKey]);
  };

  const getCellValue = (col: Column<T>, row: T) => {
    if (col.render) {
      return col.render(row);
    }

    if (typeof col.accessor === "function") {
      return col.accessor(row);
    }

    if (typeof col.accessor === "string") {
      return row[col.accessor as string];
    }

    return null;
  };

  const sortedData = useMemo(() => {
    if (!enableSorting || !sort.key || !sort.direction) {
      return data.slice();
    }

    const col = columns.find((c) => c.key === sort.key);
    if (!col) {
      return data.slice();
    }

    if (typeof col.accessor !== "string") {
      return data.slice();
    }

    const key = col.accessor as string;

    const copy = data.slice();
    copy.sort((a, b) => {
      const va = col.sortAccessor ? col.sortAccessor(a) : a[key];
      const vb = col.sortAccessor ? col.sortAccessor(b) : b[key];

      if (va == null && vb == null) return 0;
      if (va == null) return sort.direction === "asc" ? -1 : 1;
      if (vb == null) return sort.direction === "asc" ? 1 : -1;

      if (typeof va === "number" && typeof vb === "number") {
        return sort.direction === "asc" ? va - vb : vb - va;
      }

      return sort.direction === "asc"
        ? String(va).localeCompare(String(vb))
        : String(vb).localeCompare(String(va));
    });

    return copy;
  }, [data, sort, enableSorting, columns]);

  const toggleSort = (col: Column<T>) => {
    if (!enableSorting || !col.sortable) return;
    setSort((prev) => {
      if (prev.key !== col.key) {
        return { key: col.key, direction: "asc" };
      }

      if (prev.direction === "asc") {
        return { key: col.key, direction: "desc" };
      }

      return { key: null, direction: null };
    });
  };

  const controlled = Array.isArray(selectedRowKeys);
  const selectedKeys = controlled ? selectedRowKeys! : internalSelected;

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const visibleRowKeys = useMemo(
    () => sortedData.map((r, i) => getRowKey(r, i)),
    [sortedData],
  );
  const allVisibleSelected =
    visibleRowKeys.length > 0 &&
    visibleRowKeys.every((k) => selectedKeys.includes(k));
  const someVisibleSelected = visibleRowKeys.some((k) =>
    selectedKeys.includes(k),
  );

  const updateSelection = (next: string[]) => {
    if (!controlled) {
      setInternalSelected(next);
    }
    onSelectedRowKeysChange?.(next);
  };

  const toggleAllVisible = () => {
    if (allVisibleSelected) {
      const next = selectedKeys.filter((k) => !visibleRowKeys.includes(k));
      updateSelection(next);
    } else {
      const nextKeys = Array.from(
        new Set([...selectedKeys, ...visibleRowKeys]),
      );
      updateSelection(nextKeys);
    }
  };

  const visibleColumnCount = columns.length + (showCheckbox ? 1 : 0);

  return (
    <Card className={className}>
      <CardContent className="p-0">
        {/* Horizontal scrolling should be confined to this container */}
        <div className="overflow-x-auto w-full max-w-full">
          <div className="min-w-max">
            <TableComponent>
              <TableHeader>
                <TableRow>
                  {columns.map((col) => (
                    <TableHead
                      key={col.key}
                      className={`${col.width ?? ""} ${col.align === "center" ? "text-center" : col.align === "right" ? "text-right" : "text-left"} cursor-pointer select-none text-black font-bold px-4`}
                      onClick={() => toggleSort(col)}
                    >
                      <div className="flex items-center gap-2">
                        <span className="truncate max-w-[18rem]">
                          {col.header}
                        </span>
                        {col.sortable && (
                          <Span
                            text={
                              sort.key === col.key
                                ? sort.direction === "asc"
                                  ? "▲"
                                  : sort.direction === "desc"
                                    ? "▼"
                                    : ""
                                : ""
                            }
                            className="opacity-60 text-xs"
                          />
                        )}
                      </div>
                    </TableHead>
                  ))}
                </TableRow>
              </TableHeader>

              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={Math.max(1, visibleColumnCount)}>
                      <div className="py-6 text-center">Loading...</div>
                    </TableCell>
                  </TableRow>
                ) : sortedData.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={Math.max(1, visibleColumnCount)}>
                      <div className="py-8 text-center text-sm text-muted-foreground">
                        {emptyState ?? "No records found."}
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  sortedData.map((row: T, rIdx: number) => {
                    const key = getRowKey(row, rIdx);
                    return (
                      <TableRow
                        key={key}
                        className={`${onRowClick ? "hover:bg-surface/60 cursor-pointer" : ""}`}
                        onClick={() => onRowClick?.(row)}
                      >
                        {columns.map((col) => (
                          <TableCell
                            key={col.key}
                            className={`${col.align === "center" ? "text-center" : col.align === "right" ? "text-right" : "text-left"} align-top ${col.width ?? ""} px-4`}
                          >
                            <div className="truncate sm:whitespace-normal">
                              {getCellValue(col, row)}
                            </div>
                          </TableCell>
                        ))}
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </TableComponent>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
