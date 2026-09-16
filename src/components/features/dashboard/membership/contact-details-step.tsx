"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { AddMemberStep2Data } from "@/types";
import {
  memberContactStepSchema,
  MemberContactStepValues,
} from "@/types/schema";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import Heading from "@/components/ui/typography/Heading";
import { Text } from "@/components/ui/typography/Text";

type ContactDetailsStepProps = {
  onNext: (data: AddMemberStep2Data) => void;
  onSaveImmediately: (data: AddMemberStep2Data) => void;
  onBack: () => void;
  initialData?: Partial<AddMemberStep2Data>;
};

export function ContactDetailsStep({
  onNext,
  onSaveImmediately,
  onBack,
  initialData = {},
}: ContactDetailsStepProps) {
  const form = useForm<MemberContactStepValues>({
    resolver: zodResolver(memberContactStepSchema),
    defaultValues: {
      email: initialData.email || "",
      phone: initialData.phone || "",
      address: initialData.address || "",
      occupation: initialData.occupation || "",
      education: initialData.education || "",
    },
  });

  const handleNext = (data: MemberContactStepValues) => {
    onNext(data as AddMemberStep2Data);
  };

  const handleSaveImmediately = (data: MemberContactStepValues) => {
    onSaveImmediately(data as AddMemberStep2Data);
  };

  return (
    <Form {...form}>
      <div className="space-y-6">
        <div>
          <Heading level={2} variant="primary">
            Contact Details
          </Heading>
          <Text variant="default" className="mt-1">
            Enter the member's phone number, email, and address details
          </Text>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="mb-2">Email</FormLabel>
                <FormControl>
                  <Input
                    type="email"
                    placeholder="Enter email address"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="phone"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="mb-2">Phone Number</FormLabel>
                <FormControl>
                  <Input placeholder="Enter phone number" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="address"
            render={({ field }) => (
              <FormItem className="col-span-2">
                <FormLabel className="mb-2">Address</FormLabel>
                <FormControl>
                  <Input placeholder="Enter address" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="occupation"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="mb-2">Occupation</FormLabel>
                <FormControl>
                  <Input placeholder="Enter occupation" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="education"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="mb-2">Educational Background</FormLabel>
                <FormControl>
                  <Input
                    placeholder="Enter educational background"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <div className="flex justify-between">
          <Button variant="outline" onClick={onBack}>
            Back
          </Button>
          <Button
            variant="secondary"
            onClick={form.handleSubmit(handleSaveImmediately)}
          >
            Save Immediately
          </Button>
          <Button onClick={form.handleSubmit(handleNext)} variant="primary">
            Next step
          </Button>
        </div>
      </div>
    </Form>
  );
}
