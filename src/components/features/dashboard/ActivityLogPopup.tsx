import { Dialog, DialogClose, DialogContent } from "@/components/ui/dialog";
import { Check } from "lucide-react";
import { ActivityRow } from "@/types";

export default function ActivityLogPopup({
  selectedRow,
  setSelectedRow,
}: {
  selectedRow: ActivityRow | null;
  setSelectedRow: (row: ActivityRow | null) => void;
}) {
  return (
    <Dialog
      open={!!selectedRow}
      onOpenChange={(open) => {
        if (!open) {
          setSelectedRow(null);
        }
      }}
    >
      <DialogContent>
        {selectedRow && (
          <div>
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-md bg-emerald-600 text-white flex items-center justify-center">
                  <Check className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold">{`${selectedRow.action} by ${selectedRow.user.name}`}</h3>
                  <div className="text-sm text-gray-500 mt-1">{`${new Date(selectedRow.timestamp).toLocaleDateString()} • ${new Date(selectedRow.timestamp).toLocaleTimeString()} • Module: ${selectedRow.module}`}</div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button className="p-2 rounded-md hover:bg-muted">🗑️</button>
                <DialogClose asChild>
                  <button className="p-2 rounded-md hover:bg-muted">✕</button>
                </DialogClose>
              </div>
            </div>

            <div className="border-t my-4" />

            <h4 className="text-base font-semibold mb-3">Activity Details</h4>

            <div className="divide-y">
              <div className="flex items-center gap-4 py-3">
                <span className="w-2 h-2 rounded-full bg-sky-600 block mt-1" />
                <div className="w-40 font-medium">Action:</div>
                <div className="flex-1">{selectedRow.action}</div>
              </div>

              <div className="flex items-center gap-4 py-3">
                <span className="w-2 h-2 rounded-full bg-sky-600 block mt-1" />
                <div className="w-40 font-medium">By:</div>
                <div className="flex-1">{selectedRow.user.name}</div>
              </div>

              <div className="flex items-center gap-4 py-3">
                <span className="w-2 h-2 rounded-full bg-sky-600 block mt-1" />
                <div className="w-40 font-medium">Module:</div>
                <div className="flex-1">{selectedRow.module}</div>
              </div>

              <div className="flex items-center gap-4 py-3">
                <span className="w-2 h-2 rounded-full bg-sky-600 block mt-1" />
                <div className="w-40 font-medium">Affected Record:</div>
                <div className="flex-1">{selectedRow.details}</div>
              </div>

              <div className="flex items-center gap-4 py-3">
                <span className="w-2 h-2 rounded-full bg-sky-600 block mt-1" />
                <div className="w-40 font-medium">Status:</div>
                <div className="flex-1">Approved</div>
              </div>

              <div className="flex items-center gap-4 py-3">
                <span className="w-2 h-2 rounded-full bg-sky-600 block mt-1" />
                <div className="w-40 font-medium">Triggered From:</div>
                <div className="flex-1">Requisition Form &gt; Pending List</div>
              </div>

              <div className="flex items-start gap-4 py-3">
                <span className="w-2 h-2 rounded-full bg-sky-600 block mt-1" />
                <div className="w-40 font-medium">Details:</div>
                <div className="flex-1">“{selectedRow.details}”</div>
              </div>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
