"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Card } from "@/components/ui/card";
import { ChurchIdentityStep } from "./church-identity";
import { UploadMembersStep } from "./upload-members";
import { WeeklyServicesStep } from "./weekly-service";
import {
  WeeklyServicesValues,
  ChurchIdentityValues,
  churchIdentitySchema,
  UploadMembersValues,
  uploadMembersSchema,
} from "@/types/type";
import { useSignupData } from "@/hooks/use-signup-data";

export default function ChurchOnboarding() {
  const [step, setStep] = useState(1);
  const [services, setServices] = useState<WeeklyServicesValues>([]);
  const router = useRouter();
  const signupData = useSignupData();

  const identityForm = useForm<ChurchIdentityValues>({
    resolver: zodResolver(churchIdentitySchema),
    defaultValues: {
      churchName: "",
      churchAddress: "",
      country: "",
      stateProvince: "",
      defaultCurrency: "",
      timeZone: "",
    },
  });

  const uploadForm = useForm<UploadMembersValues>({
    resolver: zodResolver(uploadMembersSchema),
    defaultValues: { csvFile: undefined },
  });

  useEffect(() => {
    if (signupData && identityForm) {
      identityForm.reset({
        churchName: signupData.churchName || "",
        churchAddress: "",
        country: "",
        stateProvince: "",
        defaultCurrency: "",
        timeZone: "",
      });
    }
  }, [signupData, identityForm]);

  const onIdentitySubmit = (data: ChurchIdentityValues) => {
    void data;
    setStep(2);
  };

  const onServicesSubmit = (data: WeeklyServicesValues) => {
    void data;
    setStep(3);
  };

  const onUploadSubmit = (data: UploadMembersValues) => {
    void data;
    router.push("/dashboard");
  };

  const handleBack = () => {
    if (step > 1) setStep(step - 1);
  };

  const handleSkip = () => {
    setStep(step + 1);
  };

  const addService = (service: WeeklyServicesValues[number]) => {
    setServices((prev) => [...prev, service]);
  };

  const updateService = (
    index: number,
    field: keyof WeeklyServicesValues[0],
    value: any,
  ) => {
    const updated = [...services];
    updated[index][field] = value;
    setServices(updated);
  };

  const removeService = (index: number) => {
    setServices(services.filter((_, i) => i !== index));
  };

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <ChurchIdentityStep
            form={identityForm}
            onSubmit={onIdentitySubmit}
            onSkip={handleSkip}
            step={step}
            totalSteps={3}
          />
        );
      case 2:
        return (
          <WeeklyServicesStep
            services={services}
            onAddService={addService}
            onUpdateService={updateService}
            onRemoveService={removeService}
            onSubmit={() => onServicesSubmit(services)}
            onBack={handleBack}
            onSkip={handleSkip}
            step={step}
            totalSteps={3}
          />
        );
      case 3:
        return (
          <UploadMembersStep
            form={uploadForm}
            onSubmit={onUploadSubmit}
            onBack={handleBack}
            onSkip={handleSkip}
            step={step}
            totalSteps={3}
          />
        );
    }
  };

  return <Card className="max-w-2xl mx-auto p-8">{renderStep()}</Card>;
}
