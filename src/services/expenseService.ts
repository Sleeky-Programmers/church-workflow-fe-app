import { trackAction } from "@/lib/usage-tracker";
import { authenticatedFetch } from "@/lib/api";

export interface CreateExpensePayload {
  category: string;
  description: string;
  amount: number;
  date: string;
  departmentId?: string;
}

export interface UpdateExpensePayload {
  category?: string;
  description?: string;
  amount?: number;
  date?: string;
  departmentId?: string | null;
}

export interface ExpenseResponse {
  id: string;
  category: string;
  description: string;
  amount: number;
  currency: string;
  date: string;
  departmentId?: string | null;
  departmentName?: string;
  requisitionId: string | null;
  recordedBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface ExpenseQueryParams {
  page?: number;
  limit?: number;
  startDate?: string;
  endDate?: string;
  category?: string;
  departmentId?: string;
}

export interface ExpenseSummaryResponse {
  totalAmount: number;
  recordCount: number;
  byCategory: { category: string; amount: number }[];
}

export interface ExpenseMonthlyTrendPoint {
  month: string;
  totalAmount: number;
}

export async function createExpense(payload: CreateExpensePayload) {
  const expense = await authenticatedFetch<ExpenseResponse>("/expenses", {
    method: "POST",
    body: JSON.stringify(payload),
  });
  trackAction("expense.add");
  return expense;
}

export async function fetchExpenses(params: ExpenseQueryParams) {
  const query = new URLSearchParams();

  if (params.page) query.append("page", String(params.page));
  if (params.limit) query.append("limit", String(params.limit));
  if (params.startDate) query.append("startDate", params.startDate);
  if (params.endDate) query.append("endDate", params.endDate);
  if (params.category) query.append("category", params.category);
  if (params.departmentId) query.append("departmentId", params.departmentId);

  return authenticatedFetch<{
    data: ExpenseResponse[];
    pagination: any;
  }>(`/expenses?${query.toString()}`);
}

export async function fetchExpenseSummary(params?: {
  startDate?: string;
  endDate?: string;
}) {
  const query = new URLSearchParams();
  if (params?.startDate) query.append("startDate", params.startDate);
  if (params?.endDate) query.append("endDate", params.endDate);

  return authenticatedFetch<ExpenseSummaryResponse>(
    `/expenses/summary?${query.toString()}`,
  );
}

export async function fetchExpenseMonthlyTrend() {
  return authenticatedFetch<ExpenseMonthlyTrendPoint[]>(
    "/expenses/monthly-trend",
  );
}

export async function updateExpense(id: string, payload: UpdateExpensePayload) {
  return authenticatedFetch<ExpenseResponse>(`/expenses/${id}`, {
    method: "PUT",
    body: JSON.stringify(payload),
  });
}

export async function deleteExpense(id: string) {
  return authenticatedFetch<{ message: string }>(`/expenses/${id}`, {
    method: "DELETE",
  });
}
