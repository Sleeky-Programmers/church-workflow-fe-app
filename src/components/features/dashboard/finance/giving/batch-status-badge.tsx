import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { GivingBatchStatus } from "@/services/givingService";

const STATUS_LABEL: Record<GivingBatchStatus, string> = {
  draft: "Draft",
  submitted: "Submitted",
  confirmed: "Confirmed",
  voided: "Voided",
};

const STATUS_CLASSES: Record<GivingBatchStatus, string> = {
  draft: "bg-slate-100 text-slate-700 border-slate-200",
  submitted: "bg-amber-100 text-amber-700 border-amber-200",
  confirmed: "bg-green-100 text-green-700 border-green-200",
  voided: "bg-red-100 text-red-700 border-red-200",
};

export function BatchStatusBadge({ status }: { status: GivingBatchStatus }) {
  return (
    <Badge shape="pill" className={cn("font-semibold", STATUS_CLASSES[status])}>
      {STATUS_LABEL[status]}
    </Badge>
  );
}
