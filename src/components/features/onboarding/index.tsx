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
import { useToast } from "@/hooks/use-toast";

export default function ChurchOnboarding() {
  const [step, setStep] = useState(1);
  const [services, setServices] = useState<WeeklyServicesValues>([]);
  const [logoFile, setLogoFile] = useState<File | null>(null);

  const { toast } = useToast();

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

  const onIdentitySubmit = async (data: ChurchIdentityValues) => {
    if (!logoFile) {
      alert("Please upload a church logo");
      return;
    }
    try {
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
      setStep(2);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to create church",
        variant: "destructive",
      });
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
      toast({
        title: "Error",
        description: error.message || "Failed to create weekly services",
        variant: "destructive",
      });
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
      toast({
        title: "Error",
        description: error.message || "Members upload failed",
        variant: "destructive",
      });
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
            onSkip={handleSkip}
            step={step}
            totalSteps={3}
            onLogoSelect={setLogoFile}
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
