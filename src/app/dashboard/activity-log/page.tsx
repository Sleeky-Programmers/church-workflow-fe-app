"use client";

import React, { useMemo, useState, useEffect } from "react";
import Table, { Column } from "@/components/features/dashboard/Table";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  ChevronDown,
  Download,
  Search,
  User2,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Text } from "@/components/ui/typography/Text";
import ActivityLogPopup from "@/components/features/dashboard/ActivityLogPopup";
import { ActivityRow, ActivityLogApiResponse } from "@/types";
import { Span } from "@/components/ui/typography/Text";
import { fetchActivityLogs } from "@/lib/api";
import { Loader } from "@/components/ui/loader";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
} from "@/components/ui/pagination";
import { useToast } from "@/hooks/use-toast";
import {
  ACTIVITY_MODULES,
  formatDateTime12h,
  formatModuleLabel,
} from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { useLatest } from "@/hooks/use-latest";

export default function ActivityLogPage() {
  const [query, setQuery] = useState("");
  const [showFilter, setShowFilter] = useState(false);
  const [moduleFilter, setModuleFilter] = useState<string | null>(null);
  const [selectedRow, setSelectedRow] = useState<ActivityRow | null>(null);
  const [activityLogs, setActivityLogs] = useState<ActivityRow[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [pagination, setPagination] = useState<
    ActivityLogApiResponse["pagination"] | null
  >(null);

  const { toast } = useToast();

  const avatarColors = ["#E7EFF7", "#FFF1E6", "#E6F2E6"];
  const avatarTextColors = [
    "rgba(11,59,97,1)",
    "rgba(102,51,0,1)",
    "rgba(6,95,36,1)",
  ];

  const getActivityLogs = async (
    page: number = 1,
    limit: number = pageSize,
  ) => {
    setIsLoading(true);
    try {
      const response = await fetchActivityLogs(page, limit);
      if (!response.data) {
        setIsLoading(false);
        return;
      }
      setActivityLogs(response.data);
      setPagination(response.pagination);
      setCurrentPage(page);
    } catch (error: any) {
      toast({
        title: "Error",
        description:
          error.message || "An error occurred while fetching activity logs",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getActivityLogsRef = useLatest(getActivityLogs);

  useEffect(() => {
    getActivityLogsRef.current();
  }, [getActivityLogsRef]);

  const filtered = useMemo(() => {
    const q = query.toLowerCase();

    return activityLogs
      .filter((row) => {
        if (moduleFilter && row.module !== moduleFilter) {
          return false;
        }
        if (!q) {
          return true;
        }

        const userName =
          `${row.adminId.firstName} ${row.adminId.lastName}`.toLowerCase();
        return userName.includes(q) || row.action.toLowerCase().includes(q);
      })
      .sort((a, b) => {
        return Date.parse(b.createdAt) - Date.parse(a.createdAt);
      });
  }, [query, moduleFilter, activityLogs]);

  const exportToCSV = () => {
    const headers = ["Timestamp", "User", "Action", "Module", "Details"];

    const rows = filtered.map((r) => {
      return [
        formatDateTime12h(r.createdAt),
        `${r.adminId.firstName} ${r.adminId.lastName}`,
        r.action,
        r.module,
        r.details,
      ];
    });

    const csv = [headers, ...rows]
      .map((row) => {
        return row
          .map((v) => {
            return `"${v}"`;
          })
          .join(",");
      })
      .join("\n");

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = url;
    link.download = "activity-log.csv";
    link.click();
  };

  const columns: Column<ActivityRow>[] = [
    {
      key: "createdAt",
      header: "Timestamp",
      sortable: true,
      accessor: "createdAt",
      sortAccessor: (row) => {
        return Date.parse(row.createdAt);
      },
      render: (row) => {
        return formatDateTime12h(row.createdAt).toUpperCase();
      },
    },
    {
      key: "user",
      header: "User",
      width: "w-48",
      render: (row: ActivityRow & { avatarColor?: string }) => {
        return (
          <div className="flex items-center gap-3">
            <Avatar>
              <AvatarFallback
                style={{
                  backgroundColor: row.avatarColor,
                  color: (row as any).avatarTextColor ?? avatarTextColors[0],
                }}
              >
                <User2 className="w-4 h-4" />
              </AvatarFallback>
            </Avatar>
            <Span variant="default">
              {row.adminId.firstName} {row.adminId.lastName}
            </Span>
          </div>
        );
      },
    },
    {
      key: "action",
      header: "Action",
      accessor: "action",
    },
    {
      key: "module",
      header: "Module",
      accessor: "module",
      width: "w-40",
      render: (row) => {
        return formatModuleLabel(row.module);
      },
    },
    {
      key: "details",
      header: "Details",
      accessor: "details",
    },
  ];

  const rowsWithColor = filtered.map((row, index) => {
    return {
      ...row,
      avatarColor: avatarColors[index % avatarColors.length],
      avatarTextColor: avatarTextColors[index % avatarTextColors.length],
    };
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-4 w-full">
          <Text text="Activity Log" />

          <div className="w-full sm:max-w-xs">
            <Input
              placeholder="Search by user or action"
              leftIcon={<Search className="w-4 h-4" />}
              value={query}
              onChange={(e) => {
                return setQuery(e.target.value);
              }}
            />
          </div>
        </div>

        <div className="relative flex items-center gap-3">
          <Button
            variant="ghost"
            className="hidden sm:flex items-center gap-2"
            onClick={() => {
              return setShowFilter((p) => {
                return !p;
              });
            }}
          >
            Filter
            <ChevronDown className="w-4 h-4" />
          </Button>

          {showFilter && (
            <div className="absolute right-0 top-10 w-56 rounded-xl border bg-background shadow-lg p-3 z-20">
              <Text text="Filter by module" className=" mb-2" />
              {ACTIVITY_MODULES.map((m) => {
                return (
                  <Button
                    key={m}
                    variant={moduleFilter === m ? "secondary" : "ghost"}
                    className="w-full justify-start "
                    onClick={() => {
                      setModuleFilter(m);
                      setShowFilter(false);
                    }}
                  >
                    {formatModuleLabel(m)}
                  </Button>
                );
              })}
              <Button
                variant="ghost"
                className="mt-2"
                onClick={() => {
                  setModuleFilter(null);
                  setShowFilter(false);
                }}
              >
                Clear filter
              </Button>
            </div>
          )}

          <Button onClick={exportToCSV} className="flex items-center gap-2">
            <Download className="w-4 h-4" />
            Export CSV
          </Button>
        </div>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader />
        </div>
      ) : (
        <>
          <Table
            columns={columns}
            data={rowsWithColor}
            rowKey={(r) => {
              return r._id;
            }}
            showCheckbox={false}
            enablePagination={false}
            minWidth="min-w-[880px]"
            onRowClick={(r) => {
              return setSelectedRow(r as ActivityRow);
            }}
            emptyState={
              <Text
                text="No activity logs found."
                variant="muted"
                className="text-center py-10 "
              />
            }
          />

          <div className="mt-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
              <Text variant="muted" className="text-sm whitespace-nowrap">
                Rows per page
              </Text>
              <Select
                value={String(pageSize)}
                onValueChange={(value) => {
                  const nextLimit = Number(value);
                  setPageSize(nextLimit);
                  getActivityLogs(1, nextLimit);
                }}
              >
                <SelectTrigger className="w-[80px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {[5, 10, 25].map((size) => {
                    return (
                      <SelectItem key={size} value={String(size)}>
                        {size}
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>
            </div>

            {pagination && (
              <Text variant="muted" className="text-sm">
                Showing {activityLogs.length} of {pagination.itemCount} records
                • Page {currentPage} of {pagination.totalPages}
              </Text>
            )}
          </div>

          {pagination && pagination.totalPages > 1 && (
            <div className="mt-4 flex justify-end">
              <Pagination className="justify-end m-0">
                <PaginationContent>
                  <PaginationItem>
                    <Button
                      variant="outline"
                      size="icon"
                      disabled={!pagination.hasPreviousPage}
                      onClick={() => {
                        return getActivityLogs(currentPage - 1);
                      }}
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </Button>
                  </PaginationItem>

                  {Array.from({ length: pagination.totalPages }, (_, i) => {
                    return i + 1;
                  }).map((page) => {
                    return (
                      <PaginationItem key={page}>
                        <Button
                          variant={currentPage === page ? "default" : "outline"}
                          size="sm"
                          onClick={() => {
                            return getActivityLogs(page);
                          }}
                          className="w-10"
                        >
                          {page}
                        </Button>
                      </PaginationItem>
                    );
                  })}

                  <PaginationItem>
                    <Button
                      variant="outline"
                      size="icon"
                      disabled={!pagination.hasNextPage}
                      onClick={() => {
                        return getActivityLogs(currentPage + 1);
                      }}
                    >
                      <ChevronRight className="w-4 h-4" />
                    </Button>
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            </div>
          )}
        </>
      )}

      <ActivityLogPopup
        selectedRow={selectedRow}
        setSelectedRow={setSelectedRow}
      />
    </div>
  );
}
