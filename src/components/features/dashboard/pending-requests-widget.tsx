"use client";

import { ClipboardList, CheckCircle2 } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

import { EmptyState } from "@/components/features/dashboard/empty-state";
import { Loader } from "@/components/ui/loader";
import Heading from "@/components/ui/typography/Heading";
import { Span, Text } from "@/components/ui/typography/Text";
import { RequisitionStatus } from "@/lib/enums";
import {
  fetchRequisitions,
  RequisitionResponse,
} from "@/services/requisitionService";
import { formatCurrency } from "@/utils/currency";

export function PendingRequestsWidget() {
  const [requisitions, setRequisitions] = useState<RequisitionResponse[]>([]);
  const [pendingCount, setPendingCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchRequisitions({ status: RequisitionStatus.PENDING, limit: 4 })
      .then((res) => {
        setRequisitions(res.data);
        setPendingCount(res.pagination?.itemCount ?? res.data.length);
      })
      .catch(() => {
        setRequisitions([]);
        setPendingCount(0);
      })
      .finally(() => setIsLoading(false));
  }, []);

  return (
    <div
      className="bg-white rounded-2xl border border-gray-300 p-5
                 shadow-[0_1px_4px_rgba(0,0,0,0.06)] flex flex-col h-full"
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Heading level={4}>Pending Requests</Heading>
          {pendingCount > 0 && (
            <span className="text-xs font-bold text-white bg-amber-500 rounded-full px-2 py-0.5">
              {pendingCount}
            </span>
          )}
        </div>
        <ClipboardList className="w-[18px] h-[18px] text-primary-400 shrink-0" />
      </div>

      <div className="flex-1">
        {isLoading ? (
          <div className="flex items-center justify-center py-6">
            <Loader size="w-6 h-6" showShadow={false} />
          </div>
        ) : requisitions.length === 0 ? (
          <EmptyState
            size="sm"
            icon={CheckCircle2}
            title="You're all caught up"
            description="No pending requests right now. New requisitions from departments will appear here for review."
          />
        ) : (
          <div className="space-y-3">
            {requisitions.map((req) => (
              <div
                key={req.id}
                className="flex items-center justify-between gap-3"
              >
                <div className="min-w-0">
                  <Text className="text-sm font-semibold truncate">
                    {req.title}
                  </Text>
                  <Span variant="muted" className="text-xs">
                    {req.departmentName || "-"}
                  </Span>
                </div>
                <span className="text-sm font-medium text-gray-900 shrink-0">
                  {formatCurrency(req.amount, req.currency)}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      <Link
        href="/dashboard/requests"
        className="text-sm text-primary-600 hover:underline mt-4"
      >
        View all
      </Link>
    </div>
  );
}
