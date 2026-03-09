"use client";

import { useState } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { User, Phone, CrossIcon } from "lucide-react";
import { AddMemberStep2Data, NewMemberData } from "@/types";
import { ProfileDetailsStep } from "./profile-details-step";
import { ContactDetailsStep } from "./contact-details-step";
import { ChurchActivityStep } from "./church-activity-step";
import { ReviewMemberStep } from "./review-member-step";
import { useToast } from "@/hooks/use-toast";
import { Text } from "@/components/ui/typography/Text";
import { createMember } from "@/services/memberService";

type AddMemberModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onMemberAdded?: (member: NewMemberData) => void;
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
    icon: CrossIcon,
  },
];

function MembershipStepIndicator({ step }: { step: 1 | 2 | 3 }) {
  return (
    <div className="flex-shrink-0">
      <div className="flex items-center rounded-xl sm:rounded-2xl border border-gray-300 px-2 sm:px-4 py-2 sm:py-3">
        {STEP_CONFIG.map((config, index) => {
          const Icon = config.icon;
          const isActive = step === config.number;
          const isCompleted = step > config.number;

          return (
            <div
              key={config.number}
              className={`flex items-center ${isActive ? "flex-[1.6]" : "flex-1"}`}
            >
              <div className="flex items-center gap-4">
                <div
                  className={`h-8 w-8 sm:h-14 sm:w-14 rounded-full flex items-center justify-center flex-shrink-0 ${
                    isActive
                      ? "bg-primary-600"
                      : isCompleted
                        ? "bg-primary-100"
                        : "bg-gray-100"
                  }`}
                >
                  <Icon
                    className={`h-4 w-4 sm:h-7 sm:w-7 ${
                      isActive
                        ? "text-white"
                        : isCompleted
                          ? "text-primary-600"
                          : "text-gray-400"
                    }`}
                  />
                </div>

                {isActive && (
                  <div className="block">
                    <Text variant="muted" className="text-xs sm:text-sm">
                      Step {config.number}/3
                    </Text>
                    <Text variant="menuActive" className="text-base sm:text-lg">
                      {config.label}
                    </Text>
                  </div>
                )}
              </div>

              {index < STEP_CONFIG.length - 1 && (
                <div className="mx-2 sm:mx-6 h-8 sm:h-12 w-px bg-gray-200" />
              )}
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

  const handleStep1Next = (data: any) => {
    setFormData((prev) => ({ ...prev, ...data }));
    setStep(2);
  };

  const handleStep2Next = (data: any) => {
    setFormData((prev) => ({ ...prev, ...data }));
    setStep(3);
  };

  const handleSaveImmediately = (data: AddMemberStep2Data) => {
    const finalData: NewMemberData = {
      ...(formData as Partial<NewMemberData>),
      ...data,
      membershipStatus: formData.membershipStatus || "MEMBER",
      dateJoined: formData.dateJoined || new Date().toISOString().slice(0, 10),
      baptized: formData.baptized ?? false,
      volunteersPreference: formData.volunteersPreference || "Not Interested",
    } as NewMemberData;

    onMemberAdded?.(finalData);
    toast({
      title: "Success",
      description: "Member added successfully",
    });

    handleClose();
  };

  const handleStep3Next = (data: any) => {
    setFormData((prev) => ({ ...prev, ...data }));
    setStep(4);
  };

  const handleSaveMember = async () => {
    try {
      await createMember(formData as NewMemberData);

      toast({
        title: "Success",
        description: "Member added successfully",
      });

      handleClose();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add member",
        variant: "destructive",
      });
    }
  };
  const handleBack = () => {
    if (step > 1) {
      setStep((prev) => (prev - 1) as 1 | 2 | 3 | 4);
    }
  };

  const handleClose = () => {
    setStep(1);
    setFormData({});
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        showClose={false}
        mobileSheet
        onPointerDownOutside={(e) => e.preventDefault()}
        className="w-full sm:max-w-3xl max-sm:max-h-[90vh] overflow-y-auto p-4 sm:p-6"
      >
        <MembershipStepIndicator step={step === 4 ? 3 : step} />

        <div className="flex-1 px-0 sm:px-6 py-3 sm:py-6">
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
          {step === 4 && (
            <ReviewMemberStep
              data={formData}
              onBack={handleBack}
              onSave={handleSaveMember}
            />
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
