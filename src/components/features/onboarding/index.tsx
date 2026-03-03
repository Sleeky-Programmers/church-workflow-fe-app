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
import { createChurch, createWeeklyService, uploadMembersCsv } from "@/lib/api";
import { RouteConfig } from "@/config/routes";
import { convertTo12Hour } from "@/lib/utils";

export default function ChurchOnboarding() {
  const [step, setStep] = useState(1);
  const [services, setServices] = useState<WeeklyServicesValues>([]);
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [isSubmittingIdentity, setIsSubmittingIdentity] = useState(false);

  const router = useRouter();

  const identityForm = useForm<ChurchIdentityValues>({
    resolver: zodResolver(churchIdentitySchema),
    defaultValues: {
      name: "",
      alias: "",
      address: "",
      country: "",
      state: "",
      defaultCurrency: "",
      timeZone: "",
    },
  });

  const uploadForm = useForm<UploadMembersValues>({
    resolver: zodResolver(uploadMembersSchema),
    defaultValues: { csvFile: undefined },
  });

  useEffect(() => {
    if (typeof window === "undefined") return;

    const savedDraft = window.localStorage.getItem(
      "onboarding:church-identity-draft",
    );

    if (!savedDraft) return;

    try {
      const parsed = JSON.parse(savedDraft) as Partial<ChurchIdentityValues>;
      identityForm.reset({
        name: parsed.name || "",
        alias: parsed.alias || "",
        address: parsed.address || "",
        country: parsed.country || "",
        state: parsed.state || "",
        defaultCurrency: parsed.defaultCurrency || "",
        timeZone: parsed.timeZone || "",
      });
    } catch (error) {
      console.error("Failed to parse saved onboarding draft:", error);
    }
  }, [identityForm]);

  const onIdentitySubmit = async (data: ChurchIdentityValues) => {
    if (!logoFile) {
      alert("Please upload a church logo");
      return;
    }
    try {
      if (logoFile) {
        await createChurch(
          {
            name: data.name,
            alias: data.alias || "",
            address: data.address,
            country: data.country,
            state: data.state || "",
            defaultCurrency: data.defaultCurrency,
            timeZone: data.timeZone,
          },
          logoFile,
        );
      }

      if (typeof window !== "undefined") {
        window.localStorage.setItem(
          "onboarding:church-identity-draft",
          JSON.stringify(data),
        );
      }

      setStep(2);
    } catch (error: any) {
      console.error("Church creation failed:", error);
      alert(error.message || "Failed to create church");
    } finally {
      setIsSubmittingIdentity(false);
    }
  };

  const onSaveIdentityAndExit = async (data: ChurchIdentityValues) => {
    setIsSubmittingIdentity(true);
    try {
      if (logoFile) {
        await createChurch(
          {
            name: data.name,
            alias: data.alias || "",
            address: data.address,
            country: data.country,
            state: data.state || "",
            defaultCurrency: data.defaultCurrency,
            timeZone: data.timeZone,
          },
          logoFile,
        );
      }

      if (typeof window !== "undefined") {
        window.localStorage.setItem(
          "onboarding:church-identity-draft",
          JSON.stringify(data),
        );
      }

      router.push(RouteConfig.dashboard.home);
    } catch (error: any) {
      console.error("Save and exit failed:", error);
      alert(error.message || "Failed to save church identity");
    } finally {
      setIsSubmittingIdentity(false);
    }
  };

  const onServiceSubmit = async () => {
    try {
      for (const service of services) {
        for (const day of service.days) {
          const normalizedDay = day.toUpperCase();
          await createWeeklyService({
            serviceName: service.serviceName,
            type: "REGULAR",
            day: normalizedDay,
            startTime: convertTo12Hour(service.startTime),
            endTime: convertTo12Hour(service.endTime || service.startTime),
            location: service.location,
          });
        }
      }
      setStep(3);
    } catch (error: any) {
      console.error("Failed to create weekly services", error);
      alert(error?.message || "Failed to create weekly services");
    }
  };

  const onUploadSubmit = async (data: UploadMembersValues) => {
    if (!data.csvFile) {
      alert("Please select a CSV file");
      return;
    }

    try {
      await uploadMembersCsv(data.csvFile);

      router.push(RouteConfig.dashboard.home);
    } catch (error: any) {
      console.error("Upload failed:", error.message);
      alert(error?.message || "Members upload failed");
    }
  };

  const handleBack = () => step > 1 && setStep(step - 1);
  const handleSkip = () => setStep(step + 1);

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
            onSaveAndExit={onSaveIdentityAndExit}
            step={step}
            totalSteps={3}
            onLogoSelect={setLogoFile}
            isSubmitting={isSubmittingIdentity}
          />
        );
      case 2:
        return (
          <WeeklyServicesStep
            services={services}
            onAddService={addService}
            onUpdateService={updateService}
            onRemoveService={removeService}
            onSubmit={onServiceSubmit}
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
