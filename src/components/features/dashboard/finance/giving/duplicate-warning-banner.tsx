import { AlertTriangle } from "lucide-react";
import Link from "next/link";

export function DuplicateWarningBanner({ batchId }: { batchId?: string }) {
  return (
    <div className="flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3">
      <AlertTriangle className="h-5 w-5 shrink-0 text-amber-600 mt-0.5" />
      <div className="text-sm text-amber-800">
        <p className="font-semibold">
          A giving batch already exists for this service and date.
        </p>
        <p className="mt-0.5">
          Saving will create a separate batch. Consider editing the existing one
          instead
          {batchId ? (
            <>
              {" - "}
              <Link
                href={`/dashboard/finance/giving/${batchId}`}
                className="underline font-medium"
              >
                view it here
              </Link>
              .
            </>
          ) : (
            "."
          )}
        </p>
      </div>
    </div>
  );
}
