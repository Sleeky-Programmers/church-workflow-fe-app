"use client";

import { useEffect, useState } from "react";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import Heading from "@/components/ui/typography/Heading";
import { Span, Text } from "@/components/ui/typography/Text";
import { UseFormReturn } from "react-hook-form";
import { ChurchIdentityValues } from "@/types/type";
import { Info } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

type ChurchIdentityStepProps = {
  form: UseFormReturn<ChurchIdentityValues>;
  onSubmit: (data: ChurchIdentityValues) => void;
  onSaveAndExit: (data: ChurchIdentityValues) => void;
  step?: number;
  totalSteps?: number;
  onLogoSelect: (file: File | null) => void;
  isSubmitting?: boolean;
};

const COUNTRIES = [
  { code: "NG", name: "Nigeria", currency: "NGN", timeZone: "Africa/Lagos" },
  {
    code: "US",
    name: "United States",
    currency: "USD",
    timeZone: "America/New_York",
  },
  {
    code: "GB",
    name: "United Kingdom",
    currency: "GBP",
    timeZone: "Europe/London",
  },
  { code: "CA", name: "Canada", currency: "CAD", timeZone: "America/Toronto" },
  { code: "GH", name: "Ghana", currency: "GHS", timeZone: "Africa/Accra" },
  { code: "KE", name: "Kenya", currency: "KES", timeZone: "Africa/Nairobi" },
  {
    code: "ZA",
    name: "South Africa",
    currency: "ZAR",
    timeZone: "Africa/Johannesburg",
  },
  { code: "IN", name: "India", currency: "INR", timeZone: "Asia/Kolkata" },
  { code: "PH", name: "Philippines", currency: "PHP", timeZone: "Asia/Manila" },
  {
    code: "AU",
    name: "Australia",
    currency: "AUD",
    timeZone: "Australia/Sydney",
  },
  { code: "DE", name: "Germany", currency: "EUR", timeZone: "Europe/Berlin" },
  { code: "FR", name: "France", currency: "EUR", timeZone: "Europe/Paris" },
];

const CURRENCIES = [
  { code: "NGN", label: "Nigerian Naira (NGN)" },
  { code: "USD", label: "US Dollar (USD)" },
  { code: "EUR", label: "Euro (EUR)" },
  { code: "GBP", label: "British Pound (GBP)" },
  { code: "CAD", label: "Canadian Dollar (CAD)" },
  { code: "GHS", label: "Ghanaian Cedi (GHS)" },
  { code: "KES", label: "Kenyan Shilling (KES)" },
  { code: "ZAR", label: "South African Rand (ZAR)" },
  { code: "INR", label: "Indian Rupee (INR)" },
  { code: "PHP", label: "Philippine Peso (PHP)" },
  { code: "AUD", label: "Australian Dollar (AUD)" },
];

const TIME_ZONES = [
  "Africa/Lagos",
  "Africa/Accra",
  "Africa/Nairobi",
  "Africa/Johannesburg",
  "America/New_York",
  "America/Chicago",
  "America/Denver",
  "America/Los_Angeles",
  "America/Toronto",
  "Europe/London",
  "Europe/Berlin",
  "Europe/Paris",
  "Asia/Kolkata",
  "Asia/Manila",
  "Australia/Sydney",
  "UTC",
];

const COUNTRY_BY_CODE: Record<string, string> = COUNTRIES.reduce(
  (acc, country) => {
    acc[country.code] = country.name;
    return acc;
  },
  {} as Record<string, string>,
);

export function ChurchIdentityStep({
  form,
  onSubmit,
  onSaveAndExit,
  step = 1,
  totalSteps = 3,
  onLogoSelect,
  isSubmitting = false,
}: ChurchIdentityStepProps) {
  useEffect(() => {
    const currentCountry = form.getValues("country");
    const currentCurrency = form.getValues("defaultCurrency");
    const currentTimeZone = form.getValues("timeZone");

    if (currentCountry || currentCurrency || currentTimeZone) return;

    const browserTimeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    const locale = navigator.language || "";
    const localeRegion = locale.split("-")[1]?.toUpperCase();

    const matchedByTimeZone = COUNTRIES.find(
      (country) => country.timeZone === browserTimeZone,
    );
    const matchedCountryName =
      matchedByTimeZone?.name ||
      (localeRegion ? COUNTRY_BY_CODE[localeRegion] : undefined);

    if (matchedCountryName) {
      const matchedCountry = COUNTRIES.find(
        (country) => country.name === matchedCountryName,
      );
      if (matchedCountry) {
        form.setValue("country", matchedCountry.name);
        form.setValue("defaultCurrency", matchedCountry.currency);
      }
    }

    if (browserTimeZone && TIME_ZONES.includes(browserTimeZone)) {
      form.setValue("timeZone", browserTimeZone);
    }
  }, [form]);
  const [selectedLogoName, setSelectedLogoName] = useState<string | null>(null);
  const [logoPreviewUrl, setLogoPreviewUrl] = useState<string | null>(null);

  useEffect(() => {
    return () => {
      if (logoPreviewUrl) {
        URL.revokeObjectURL(logoPreviewUrl);
      }
    };
  }, [logoPreviewUrl]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    form.handleSubmit(onSubmit)(e);
  };

  const handleLogoChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    onChange: (value: any) => void,
  ) => {
    const file = e.target.files?.[0] || null;
    onChange(file);
    onLogoSelect(file);
    setSelectedLogoName(file?.name || null);
    setLogoPreviewUrl(file ? URL.createObjectURL(file) : null);
  };

  return (
    <div className="space-y-6">
      <div>
        <Heading level={1} className="mb-2">
          Church Identity
        </Heading>
        <Text variant="muted">Tell us a little about your church.</Text>
      </div>

      <Form {...form}>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="h-5 flex items-center">
                    Church Name <Span variant="error">*</Span>
                  </FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="Living Grace Ministries" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="alias"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="h-5 flex items-center gap-1">
                    Church Alias <Span variant="muted">(optional)</Span>
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="h-5 w-5"
                          >
                            <Info className="h-3.5 w-3.5 text-primary cursor-help" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent className="max-w-64 text-left">
                          A short or alternative name your church is commonly
                          known by.
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="Living Grace" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <FormField
            control={form.control}
            name="address"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-sm font-medium">
                  Church Address <Span variant="error">*</Span>
                </FormLabel>
                <FormControl>
                  <Input {...field} placeholder="Street address" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="country"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-medium">
                    Country <Span variant="error">*</Span>
                  </FormLabel>
                  <FormControl>
                    <Select
                      onValueChange={(value) => {
                        field.onChange(value);
                        const selectedCountry = COUNTRIES.find(
                          (country) => country.name === value,
                        );
                        if (selectedCountry) {
                          form.setValue(
                            "defaultCurrency",
                            selectedCountry.currency,
                          );
                          form.setValue("timeZone", selectedCountry.timeZone);
                        }
                      }}
                      value={field.value}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select country" />
                      </SelectTrigger>
                      <SelectContent>
                        {COUNTRIES.map((country) => (
                          <SelectItem key={country.code} value={country.name}>
                            {country.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="state"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    State / Province <Span variant="muted">(optional)</Span>
                  </FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="State / Province" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="defaultCurrency"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Default Currency <Span variant="error">*</Span>
                  </FormLabel>
                  <FormControl>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select currency" />
                      </SelectTrigger>
                      <SelectContent>
                        {CURRENCIES.map((currency) => (
                          <SelectItem key={currency.code} value={currency.code}>
                            {currency.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="timeZone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Time Zone <Span variant="error">*</Span>
                  </FormLabel>
                  <FormControl>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select time zone" />
                      </SelectTrigger>
                      <SelectContent>
                        {TIME_ZONES.map((timeZone) => (
                          <SelectItem key={timeZone} value={timeZone}>
                            {timeZone}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <FormField
            control={form.control}
            name="file"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  Church Logo <Span variant="muted">(optional)</Span>
                </FormLabel>
                <FormControl>
                  <div
                    className="border-2 border-dashed border-border rounded-lg p-8 bg-background hover:border-primary transition-colors cursor-pointer"
                    onClick={() =>
                      document.getElementById("logo-upload")?.click()
                    }
                  >
                    <div className="text-center">
                      <Text variant="muted">Click to upload logo</Text>
                      {selectedLogoName && (
                        <Text className="mt-2 text-sm text-green-700">
                          Selected: {selectedLogoName}
                        </Text>
                      )}
                      {logoPreviewUrl && (
                        <img
                          src={logoPreviewUrl}
                          alt="Church logo preview"
                          className="mx-auto mt-3 h-16 w-16 rounded object-cover"
                        />
                      )}
                    </div>
                  </div>
                </FormControl>
                <FormMessage />
                <Input
                  id="logo-upload"
                  type="file"
                  className="hidden"
                  accept="image/*"
                  onChange={(e) => handleLogoChange(e, field.onChange)}
                  disabled={isSubmitting}
                />
              </FormItem>
            )}
          />

          <div className="text-center mb-4">
            <Text variant="muted">
              Step <Span variant="default">{step}</Span> of {totalSteps}
            </Text>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Button
              type="button"
              variant="outline"
              onClick={form.handleSubmit(onSaveAndExit)}
              className="w-full order-2 md:order-1"
              disabled={isSubmitting}
            >
              Save & Go to Dashboard
            </Button>
            <Button
              type="submit"
              className="w-full order-1 md:order-2"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Saving..." : "Save & Continue"}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
