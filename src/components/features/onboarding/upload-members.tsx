"use client";

import { Form } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import Heading from "@/components/ui/typography/Heading";
import { Text, Span } from "@/components/ui/typography/Text";
import { UseFormReturn } from "react-hook-form";
import { UploadMembersValues } from "@/types/type";
import { useState } from "react";
import { CsvUploadModal } from "@/components/features/dashboard/membership/csv-upload-modal";

type UploadMembersStepProps = {
  form: UseFormReturn<UploadMembersValues>;
  onBack: () => void;
  onSkip: () => void;
  step?: number;
  totalSteps?: number;
};

export function UploadMembersStep({
  form,

  onBack,
  onSkip,
  step = 3,
  totalSteps = 3,
}: UploadMembersStepProps) {
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);

  return (
    <Form {...form}>
      <div className="space-y-6 w-full max-w-2xl">
        <div className="space-y-1">
          <Heading level={1}>Upload Church Members</Heading>
          <Text variant="muted">Upload your members in bulk using a CSV</Text>
        </div>

        <div className="space-y-3">
          <Text variant="default">Upload your members</Text>

          <Button
            type="button"
            className="w-full"
            onClick={() => setIsUploadModalOpen(true)}
          >
            Upload CSV
          </Button>
        </div>

        <div className="text-center pt-2">
          <Text variant="muted">
            Step{" "}
            <Span variant="blue">
              {step} of {totalSteps}
            </Span>
          </Text>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-4">
          <Button
            type="button"
            variant="outline"
            onClick={onBack}
            className="w-full"
          >
            <Text variant="blue">Back</Text>
          </Button>

          <Button
            type="button"
            variant="outline"
            onClick={onSkip}
            className="w-full"
          >
            <Text variant="blue">Skip for now</Text>
          </Button>

          <Button
            type="button"
            variant="default"
            onClick={() => setIsUploadModalOpen(true)}
            className="w-full"
          >
            Upload & Continue
          </Button>
        </div>

        <CsvUploadModal
          open={isUploadModalOpen}
          onOpenChange={setIsUploadModalOpen}
          onClose={() => setIsUploadModalOpen(false)}
          onSuccess={() => {
            setIsUploadModalOpen(false);
            onSkip();
          }}
        />
      </div>
    </Form>
  );
}
