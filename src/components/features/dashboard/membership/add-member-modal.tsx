"use client";

import { Cross, Phone, User } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
} from "@/components/ui/dialog";
import { Text } from "@/components/ui/typography/Text";
import { useToast } from "@/hooks/use-toast";
import { MembershipStatus } from "@/lib/enums";
import { createMember } from "@/services/memberService";
import { AddMemberStep2Data, MemberProfile, NewMemberData } from "@/types";

import { ChurchActivityStep } from "./church-activity-step";
import { ContactDetailsStep } from "./contact-details-step";
import { ProfileDetailsStep } from "./profile-details-step";
import { ReviewMemberStep } from "./review-member-step";

type AddMemberModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onMemberAdded?: (member: MemberProfile) => void;
  onClose?: () => void;
  onSave?: (member: NewMemberData) => void;
};

const STEP_CONFIG = [
  {
    number: 1,
    label: "Profile details",
    icon: User,
  },
  {
    number: 2,
    label: "Contact details",
    icon: Phone,
  },
  {
    number: 3,
    label: "Church activity",
    icon: Cross,
  },
];

function MembershipStepIndicator({ step }: { step: 1 | 2 | 3 }) {
  const active =
    STEP_CONFIG.find((c) => c.number === step) ?? STEP_CONFIG[0];
  const ActiveIcon = active.icon;

  // Per the design: a compact pill with the active step's icon chip on the
  // left, its "Step n/3" label, then the remaining step icons separated by
  // dividers on the right.
  return (
    <div className="flex-shrink-0">
      <div className="flex items-stretch rounded-lg border border-gray-300 overflow-hidden">
        <div className="flex items-center gap-3 px-3 py-2.5">
          <div className="h-9 w-9 rounded-full bg-primary-600 flex items-center justify-center flex-shrink-0">
            <ActiveIcon className="h-4.5 w-4.5 text-white" />
          </div>
          <div className="block text-left">
            <Text variant="muted" className="text-xs leading-tight">
              Step {active.number}/3
            </Text>
            <Text
              variant="menuActive"
              className="text-sm font-semibold leading-tight"
            >
              {active.label}
            </Text>
          </div>
        </div>

        {STEP_CONFIG.filter((c) => c.number !== active.number).map((config) => {
          const Icon = config.icon;

          return (
            <div
              key={config.number}
              className="flex items-center border-l border-gray-200 px-5"
            >
              <Icon className="h-5 w-5 text-gray-400" />
            </div>
          );
        })}
      </div>
    </div>
  );
}

export function AddMemberModal({
  open,
  onOpenChange,
  onMemberAdded,
}: AddMemberModalProps) {
  const { toast } = useToast();
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);
  const [formData, setFormData] = useState<Partial<NewMemberData>>({});
  const [isSaving, setIsSaving] = useState(false);

  const handleStep1Next = (data: any) => {
    setFormData((prev) => ({ ...prev, ...data }));
    setStep(2);
  };

  const handleStep2Next = (data: any) => {
    setFormData((prev) => ({ ...prev, ...data }));
    setStep(3);
  };

  const requireMemberData: (
    data: Partial<NewMemberData>,
  ) => asserts data is NewMemberData = (data) => {
    if (
      !data.fullName ||
      !data.gender ||
      !data.maritalStatus ||
      !data.membershipStatus
    ) {
      throw new Error("Member form is incomplete.");
    }
  };

  const buildFinalData = (
    extraData?: Partial<NewMemberData>,
  ): NewMemberData => {
    const merged: Partial<NewMemberData> = {
      ...formData,
      ...(extraData || {}),
    };

    const finalData: Partial<NewMemberData> = {
      ...merged,
      membershipStatus: merged.membershipStatus ?? MembershipStatus.MEMBER,
      dateJoined: merged.dateJoined || undefined,
      baptized: merged.baptized ?? false,
      volunteersPreference: merged.volunteersPreference ?? "",
    };

    requireMemberData(finalData);
    return finalData;
  };

  const handleSaveImmediately = async (data: AddMemberStep2Data) => {
    setIsSaving(true);
    try {
      const finalData = buildFinalData(data);
      const created = await createMember(finalData);
      onMemberAdded?.(created);
      toast({
        title: "Success",
        description: "Member added successfully",
      });
      handleClose();
    } catch (error) {
      toast({
        title: "Error",
        description:
          error instanceof Error ? error.message : "Failed to add member",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleStep3Next = (data: any) => {
    setFormData((prev) => ({ ...prev, ...data }));
    setStep(4);
  };

  const handleSaveMember = async () => {
    try {
      setIsSaving(true);
      const created = await createMember(buildFinalData());
      onMemberAdded?.(created);

      toast({
        title: "Success",
        description: "Member added successfully",
      });

      handleClose();
    } catch (error) {
      toast({
        title: "Error",
        description:
          error instanceof Error ? error.message : "Failed to add member",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };
  const handleBack = () => {
    if (step > 1) {
      setStep((prev) => (prev - 1) as 1 | 2 | 3 | 4);
    }
  };

  const handleOpenChange = (nextOpen: boolean) => {
    if (!nextOpen) {
      setStep(1);
      setFormData({});
    }
    onOpenChange(nextOpen);
  };

  const handleClose = () => {
    handleOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent
        showClose={false}
        mobileSheet
        className="w-full sm:max-w-2xl max-h-[85vh] overflow-hidden p-4 sm:p-6 flex flex-col"
      >
        <DialogDescription className="sr-only">
          Add a member by completing the profile, contact, and church activity
          steps.
        </DialogDescription>
        <MembershipStepIndicator step={step === 4 ? 3 : step} />

        <div className="flex-1 min-h-0 overflow-y-auto px-0 sm:px-6 py-3 sm:py-6">
          {step === 1 && (
            <ProfileDetailsStep
              onNext={handleStep1Next}
              initialData={formData}
            />
          )}
          {step === 2 && (
            <ContactDetailsStep
              onNext={handleStep2Next}
              onSaveImmediately={handleSaveImmediately}
              onBack={handleBack}
              initialData={formData}
            />
          )}
          {step === 3 && (
            <ChurchActivityStep
              onNext={handleStep3Next}
              onBack={handleBack}
              initialData={formData}
            />
          )}
          {step === 4 && <ReviewMemberStep data={formData} />}
        </div>

        {step === 4 && (
          <div className="border-t border-gray-200 pt-4">
            <div className="flex justify-between">
              <Button
                variant="outline"
                onClick={handleBack}
                disabled={isSaving}
              >
                Back
              </Button>
              <Button
                onClick={handleSaveMember}
                variant="secondary"
                disabled={isSaving}
              >
                {isSaving ? "Saving..." : "Save Member"}
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
