"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Text } from "@/components/ui/typography/Text";
import { privacySections, termsSections } from "@/lib/legal-content";

export type LegalDocument = "terms" | "privacy";

const DOCUMENTS = {
  terms: { title: "Terms of Service", sections: termsSections },
  privacy: { title: "Privacy Policy", sections: privacySections },
} as const;

export function LegalDocumentModal({
  document,
  onClose,
}: {
  document: LegalDocument | null;
  onClose: () => void;
}) {
  const doc = document ? DOCUMENTS[document] : null;

  return (
    <Dialog open={!!doc} onOpenChange={(open) => !open && onClose()}>
      <DialogContent
        className="max-w-2xl max-h-[85vh] p-0 sm:rounded-xl"
        mobileSheet
        showClose={false}
      >
        {doc && (
          <div className="flex max-h-[85vh] flex-col">
            <DialogHeader className="border-b px-5 py-4">
              <DialogTitle>{doc.title}</DialogTitle>
              <DialogDescription>
                Please read through before agreeing.
              </DialogDescription>
            </DialogHeader>

            <div className="flex-1 space-y-5 overflow-y-auto px-5 py-4">
              {doc.sections.map((section) => (
                <section key={section.heading} className="space-y-1.5">
                  <Text className="font-semibold">{section.heading}</Text>
                  {section.body.map((paragraph) => (
                    <Text
                      key={paragraph}
                      variant="muted"
                      className="text-sm leading-relaxed"
                    >
                      {paragraph}
                    </Text>
                  ))}
                </section>
              ))}
            </div>

            <DialogFooter className="border-t px-5 py-3">
              <Button type="button" onClick={onClose}>
                Close
              </Button>
            </DialogFooter>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
