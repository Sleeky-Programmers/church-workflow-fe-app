"use client";

import { format, startOfMonth } from "date-fns";
import { ArrowRight, Trash2 } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

import { AddExpenseDialog } from "@/components/features/dashboard/finance/add-expense-dialog";
import Table, { Column } from "@/components/features/dashboard/Table";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Heading from "@/components/ui/typography/Heading";
import { Span, Text } from "@/components/ui/typography/Text";
import { useToast } from "@/hooks/use-toast";
import { useHasAccess } from "@/lib/access-control";
import { getMyChurch } from "@/lib/api";
import { cn } from "@/lib/utils";
import {
  deleteExpense,
  ExpenseResponse,
  ExpenseSummaryResponse,
  fetchExpenses,
  fetchExpenseSummary,
} from "@/services/expenseService";
import {
  fetchGivingSummary,
  GivingSummaryResponse,
} from "@/services/givingService";
import { formatCurrency } from "@/utils/currency";

type FinanceTab = "giving" | "expenses";

export default function FinancePage() {
  const { toast } = useToast();
  const canManageGiving = useHasAccess("GIVING", "MANAGE");
  const canManageExpenses = useHasAccess("GIVING_AND_EXPENSES", "MANAGE");
  const canDeleteExpenses = useHasAccess("GIVING_AND_EXPENSES", "FULL_ACCESS");

  const [activeTab, setActiveTab] = useState<FinanceTab>("giving");
  const [currency, setCurrency] = useState("NGN");

  const [startDate, setStartDate] = useState(
    format(startOfMonth(new Date()), "yyyy-MM-dd"),
  );
  const [endDate, setEndDate] = useState(format(new Date(), "yyyy-MM-dd"));

  const [givingSummary, setGivingSummary] =
    useState<GivingSummaryResponse | null>(null);
  const [givingSummaryLoading, setGivingSummaryLoading] = useState(false);

  const [expenseSummary, setExpenseSummary] =
    useState<ExpenseSummaryResponse | null>(null);
  const [expenseSummaryLoading, setExpenseSummaryLoading] = useState(false);
  const [expenses, setExpenses] = useState<ExpenseResponse[]>([]);
  const [expensesLoading, setExpensesLoading] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<ExpenseResponse | null>(
    null,
  );

  useEffect(() => {
    getMyChurch()
      .then((church) => {
        if (church?.defaultCurrency) {
          setCurrency(church.defaultCurrency);
        }
      })
      .catch(() => {});
  }, []);

  const loadGivingData = async () => {
    setGivingSummaryLoading(true);

    try {
      const summaryData = await fetchGivingSummary({ startDate, endDate });
      setGivingSummary(summaryData);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to load giving data",
        variant: "destructive",
      });
    } finally {
      setGivingSummaryLoading(false);
    }
  };

  const loadExpenseData = async () => {
    setExpenseSummaryLoading(true);
    setExpensesLoading(true);

    try {
      const [summaryData, expensesData] = await Promise.all([
        fetchExpenseSummary({ startDate, endDate }),
        fetchExpenses({ startDate, endDate, limit: 50 }),
      ]);
      setExpenseSummary(summaryData);
      setExpenses(expensesData.data);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to load expense data",
        variant: "destructive",
      });
    } finally {
      setExpenseSummaryLoading(false);
      setExpensesLoading(false);
    }
  };

  const loadActiveTab = () => {
    if (activeTab === "giving") {
      loadGivingData();
    } else {
      loadExpenseData();
    }
  };

  useEffect(() => {
    loadActiveTab();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab]);

  const handleConfirmDeleteExpense = async () => {
    if (!deleteTarget) {
      return;
    }

    try {
      await deleteExpense(deleteTarget.id);
      await loadExpenseData();
      toast({ title: "Deleted", description: "Expense deleted" });
    } catch (error: any) {
      toast({
        title: "Delete failed",
        description: error.message || "Please try again",
        variant: "destructive",
      });
    } finally {
      setDeleteTarget(null);
    }
  };

  const expenseColumns: Column<ExpenseResponse>[] = [
    {
      key: "date",
      header: "Date",
      render: (row) => {
        return format(new Date(row.date), "MMM d, yyyy");
      },
      width: "w-32",
    },
    {
      key: "category",
      header: "Category",
      accessor: "category",
    },
    {
      key: "description",
      header: "Description",
      render: (row) => {
        return <span className="line-clamp-1">{row.description}</span>;
      },
    },
    {
      key: "department",
      header: "Department",
      render: (row) => {
        return row.departmentName || "-";
      },
    },
    {
      key: "amount",
      header: "Amount",
      render: (row) => {
        return (
          <span className="font-semibold">
            {formatCurrency(row.amount, row.currency || currency)}
          </span>
        );
      },
      align: "right",
    },
    ...(canDeleteExpenses
      ? [
          {
            key: "actions",
            header: "",
            render: (row: ExpenseResponse) => {
              return (
                <div className="flex justify-end w-full">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => {
                      return setDeleteTarget(row);
                    }}
                  >
                    <Trash2 className="w-4 h-4 text-red-500" />
                  </Button>
                </div>
              );
            },
            align: "right" as const,
          },
        ]
      : []),
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Heading level={2} text="Finance" />
        </div>

        {activeTab === "expenses" && canManageExpenses && (
          <AddExpenseDialog onSaved={loadExpenseData} />
        )}
      </div>

      <div className="flex items-center gap-2 border-b border-gray-200">
        {(["giving", "expenses"] as FinanceTab[]).map((tab) => {
          return (
            <button
              key={tab}
              onClick={() => {
                return setActiveTab(tab);
              }}
              className={cn(
                "px-4 py-2 text-sm font-medium border-b-2 -mb-px transition-colors",
                activeTab === tab
                  ? "border-primary-500 text-primary-600"
                  : "border-transparent text-gray-500 hover:text-gray-700",
              )}
            >
              {tab === "giving" ? "Giving" : "Expenses"}
            </button>
          );
        })}
      </div>

      <div className="flex flex-wrap items-end gap-3">
        <div className="space-y-1.5">
          <Label>From</Label>
          <Input
            type="date"
            value={startDate}
            onChange={(e) => {
              return setStartDate(e.target.value);
            }}
            className="w-40"
          />
        </div>
        <div className="space-y-1.5">
          <Label>To</Label>
          <Input
            type="date"
            value={endDate}
            onChange={(e) => {
              return setEndDate(e.target.value);
            }}
            className="w-40"
          />
        </div>
        <Button
          onClick={loadActiveTab}
          disabled={givingSummaryLoading || expenseSummaryLoading}
        >
          Apply
        </Button>
      </div>

      {activeTab === "giving" ? (
        <div className="space-y-6">
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            <div
              className="bg-white rounded-2xl border border-gray-300 p-4
                         shadow-[0_1px_4px_rgba(0,0,0,0.06)]"
            >
              <p className="text-[13px] font-bold text-black mb-1">
                Total Giving
              </p>
              <span className="text-xl font-bold text-black">
                {givingSummaryLoading || !givingSummary
                  ? "-"
                  : formatCurrency(givingSummary.totalAmount, currency)}
              </span>
            </div>

            <div
              className="bg-white rounded-2xl border border-gray-300 p-4
                         shadow-[0_1px_4px_rgba(0,0,0,0.06)]"
            >
              <p className="text-[13px] font-bold text-black mb-1">
                Batches Recorded
              </p>
              <span className="text-xl font-bold text-black">
                {givingSummaryLoading || !givingSummary
                  ? "-"
                  : givingSummary.recordCount}
              </span>
            </div>

            {!givingSummaryLoading &&
              givingSummary &&
              [...givingSummary.byOfferingType]
                .sort((a, b) => {
                  return b.amount - a.amount;
                })
                .slice(0, 1)
                .map((row) => {
                  return (
                    <div
                      key={row.name}
                      className="bg-white rounded-2xl border border-gray-300 p-4
                               shadow-[0_1px_4px_rgba(0,0,0,0.06)]"
                    >
                      <p className="text-[13px] font-bold text-black mb-1">
                        Top Offering Type
                      </p>
                      <span className="text-xl font-bold text-black">
                        {row.name}
                      </span>
                    </div>
                  );
                })}
          </div>

          <div className="bg-white rounded-2xl border border-gray-300 p-5 space-y-3">
            <Text className="font-bold text-black">By Offering Type</Text>

            {givingSummaryLoading || !givingSummary ? (
              <Text variant="muted" className="text-sm">
                Loading...
              </Text>
            ) : givingSummary.byOfferingType.length ? (
              <div className="space-y-2">
                {givingSummary.byOfferingType.map((row) => {
                  return (
                    <div
                      key={row.name}
                      className="flex items-center justify-between text-sm"
                    >
                      <Span>{row.name}</Span>
                      <Span className="font-semibold">
                        {formatCurrency(row.amount, currency)}
                      </Span>
                    </div>
                  );
                })}
              </div>
            ) : (
              <Text variant="muted" className="text-sm">
                No giving recorded for this date range yet
                {canManageGiving
                  ? " - record a batch from the Attendance page or the Giving section."
                  : "."}
              </Text>
            )}

            <Link
              href="/dashboard/finance/giving"
              className="inline-flex items-center gap-1 text-sm font-medium text-primary-600 hover:underline pt-2"
            >
              View all giving
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="grid grid-cols-4 gap-4">
            <div
              className="col-span-2 sm:col-span-1 bg-white rounded-2xl border border-gray-300 p-4
                         shadow-[0_1px_4px_rgba(0,0,0,0.06)]"
            >
              <p className="text-[13px] font-bold text-black mb-1">
                Total Expenses
              </p>
              <span className="text-xl font-bold text-black">
                {expenseSummaryLoading || !expenseSummary
                  ? "-"
                  : formatCurrency(expenseSummary.totalAmount, currency)}
              </span>
            </div>

            <div
              className="col-span-2 sm:col-span-1 bg-white rounded-2xl border border-gray-300 p-4
                         shadow-[0_1px_4px_rgba(0,0,0,0.06)]"
            >
              <p className="text-[13px] font-bold text-black mb-1">
                Top Category
              </p>
              <span className="text-xl font-bold text-black">
                {expenseSummaryLoading || !expenseSummary?.byCategory.length
                  ? "-"
                  : [...expenseSummary.byCategory].sort((a, b) => {
                      return b.amount - a.amount;
                    })[0]?.category}
              </span>
            </div>
          </div>

          <div className="max-h-[55vh] overflow-auto">
            <Table
              columns={expenseColumns}
              minWidth="min-w-[720px]"
              data={expenses}
              rowKey={(row) => {
                return row.id;
              }}
              isLoading={expensesLoading}
              emptyState={
                <div className="py-10 text-center">
                  <Text variant="muted">
                    No expenses for this date range yet
                    {canManageExpenses
                      ? " - use Add Expense to record one."
                      : "."}
                  </Text>
                </div>
              }
            />
          </div>
        </div>
      )}

      <AlertDialog
        open={!!deleteTarget}
        onOpenChange={(open) => {
          return !open && setDeleteTarget(null);
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete expense?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel
              onClick={() => {
                return setDeleteTarget(null);
              }}
            >
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmDeleteExpense}>
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
