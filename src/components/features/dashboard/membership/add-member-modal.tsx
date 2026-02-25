"use client";

import { useState } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { User, Phone, PlusCircle } from "lucide-react";
import { NewMemberData } from "@/types";
import { ProfileDetailsStep } from "./profile-details-step";
import { ContactDetailsStep } from "./contact-details-step";
import { ChurchActivityStep } from "./church-activity-step";
import { useToast } from "@/hooks/use-toast";
import { Text } from "@/components/ui/typography/Text";

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
    icon: PlusCircle,
  },
];

export function AddMemberModal({
  open,
  onOpenChange,
  onMemberAdded,
}: AddMemberModalProps) {
  const { toast } = useToast();
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [formData, setFormData] = useState<Partial<NewMemberData>>({});

  const handleStep1Next = (data: any) => {
    setFormData((prev) => ({ ...prev, ...data }));
    setStep(2);
  };

  const handleStep2Next = (data: any) => {
    setFormData((prev) => ({ ...prev, ...data }));
    setStep(3);
  };

  const handleStep3Next = (data: any) => {
    const finalData = { ...formData, ...data } as NewMemberData;

    onMemberAdded?.(finalData);
    toast({
      title: "Success",
      description: "Member added successfully",
    });

    handleClose();
  };

  const handleBack = () => {
    if (step > 1) {
      setStep((prev) => (prev - 1) as 1 | 2 | 3);
    }
  };

  const handleClose = () => {
    setStep(1);
    setFormData({});
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent showClose={true}>
        <div className="flex-shrink-0 px-6 pt-6 pb-4">
          <div className="flex items-center gap-2 p-6 rounded-lg border ">
            {STEP_CONFIG.map((config, index) => {
              const Icon = config.icon;
              const isActive = step === config.number;
              const isCompleted = step > config.number;

              return (
                <div
                  key={config.number}
                  className="flex justify-between items-center flex-1"
                >
                  <div className="flex items-center justify-between gap-3 flex-1">
                    <div
                      className={`
                        h-6 w-6 rounded-full flex items-center justify-center flex-shrink-0
                        ${isActive ? "bg-primary-600" : isCompleted ? "bg-primary-100" : "bg-gray-100"}
                      `}
                    >
                      <Icon
                        className={`
                          h-6 w-6
                          ${isActive ? "text-white" : isCompleted ? "text-primary-600" : "text-gray-400"}
                        `}
                      />
                    </div>

                    {isActive && (
                      <div className="hidden md:block">
                        <Text variant="muted">Step {config.number}/3</Text>
                        <Text variant="menuActive">{config.label}</Text>
                      </div>
                    )}
                  </div>

                  {index < STEP_CONFIG.length - 1 && (
                    <div className="h-px flex-1 bg-gray-200 mx-2" />
                  )}
                </div>
              );
            })}
          </div>
        </div>

        <div className="flex-1 px-6 py-6">
          {step === 1 && (
            <ProfileDetailsStep
              onNext={handleStep1Next}
              initialData={formData}
            />
          )}
          {step === 2 && (
            <ContactDetailsStep
              onNext={handleStep2Next}
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
        </div>
      </DialogContent>
    </Dialog>
  );
}
