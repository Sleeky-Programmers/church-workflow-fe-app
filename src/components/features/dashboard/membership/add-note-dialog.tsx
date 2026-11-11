"use client";

import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

type AddNoteDialogProps = {
  open: boolean;
  memberName: string;
  /** When provided the dialog edits an existing note instead of creating one. */
  initialBody?: string;
  onClose: () => void;
  onSubmit: (body: string) => Promise<void>;
};

export function AddNoteDialog({
  open,
  memberName,
  initialBody,
  onClose,
  onSubmit,
}: AddNoteDialogProps) {
  const isEdit = Boolean(initialBody);
  const [body, setBody] = useState(initialBody ?? "");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Reset the draft each time the dialog opens for a new target
  useEffect(() => {
    if (open) {
      setBody(initialBody ?? "");
    }
  }, [open, initialBody]);

  const handleSubmit = async () => {
    if (!body.trim()) {
      return;
    }
    setIsSubmitting(true);
    try {
      await onSubmit(body.trim());
      setBody("");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        return !next && onClose();
      }}
    >
      <DialogContent className="sm:max-w-md">
        <div className="flex flex-col gap-6">
          <DialogHeader className="space-y-2">
            <DialogTitle className="text-lg font-bold text-gray-900">
              {isEdit
                ? `Edit note for ${memberName}`
                : `Add a note for ${memberName}`}
            </DialogTitle>
            <DialogDescription className="text-sm text-gray-500">
              {isEdit
                ? "Update the note - the edit is timestamped for the record."
                : "Record the outcome of your outreach - calls, visits, prayers, or next steps."}
            </DialogDescription>
          </DialogHeader>

          <textarea
            value={body}
            onChange={(e) => {
              return setBody(e.target.value);
            }}
            rows={5}
            placeholder="e.g. Called on Tuesday 4pm - she's travelling for work but plans to return next Sunday…"
            className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-100 resize-none"
            disabled={isSubmitting}
          />

          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={onClose} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={!body.trim() || isSubmitting}
            >
              {isSubmitting ? "Saving…" : isEdit ? "Save Changes" : "Save Note"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
