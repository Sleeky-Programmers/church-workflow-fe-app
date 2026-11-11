"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { AddMemberStep1Data } from "@/types";
import { Gender, MaritalStatus } from "@/lib/enums";
import {
  memberProfileStepSchema,
  MemberProfileStepValues,
} from "@/types/schema";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { TitleCombobox } from "@/components/ui/title-combobox";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Span, Text } from "@/components/ui/typography/Text";
import Heading from "@/components/ui/typography/Heading";

type ProfileDetailsStepProps = {
  onNext: (data: AddMemberStep1Data) => void;
  initialData?: Partial<AddMemberStep1Data>;
};

export function ProfileDetailsStep({
  onNext,
  initialData = {},
}: ProfileDetailsStepProps) {
  const form = useForm<MemberProfileStepValues>({
    resolver: zodResolver(memberProfileStepSchema),
    defaultValues: {
      title: initialData.title,
      fullName: initialData.fullName || "",
      gender: initialData.gender,
      birthday: initialData.birthday || "",
      maritalStatus: initialData.maritalStatus,
      dateOfMarriage: initialData.dateOfMarriage || "",
    },
  });

  const handleNext = (data: MemberProfileStepValues) => {
    onNext(data as AddMemberStep1Data);
  };

  return (
    <div className="flex justify-center">
      <div className=" max-w-2xl rounded-xl ">
        <div>
          <Heading level={2} variant="primary">
            Add a New Member Profile
          </Heading>
          <Text variant="default" className="mt-1">
            Provide the member&apos;s information to include them in the church
            community
          </Text>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleNext)} className="space-y-6">
            <div className="grid grid-cols-3 gap-4">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => {
                  return (
                    <FormItem>
                      <FormLabel>Title</FormLabel>
                      <FormControl>
                        <TitleCombobox
                          value={field.value}
                          onChange={field.onChange}
                        />
                      </FormControl>
                      {field.value && (
                        <Button
                          type="button"
                          variant="link"
                          className="h-auto p-0 text-xs"
                          onClick={() => {
                            return field.onChange(undefined);
                          }}
                        >
                          Clear selection
                        </Button>
                      )}
                      <FormMessage />
                    </FormItem>
                  );
                }}
              />

              <FormField
                control={form.control}
                name="fullName"
                render={({ field }) => {
                  return (
                    <FormItem className="col-span-2">
                      <FormLabel>
                        Full Name <Span variant="error">*</Span>
                      </FormLabel>
                      <FormControl>
                        <Input placeholder="Enter the full name" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  );
                }}
              />
            </div>

            <div className="grid grid-cols-3 gap-4">
              <FormField
                control={form.control}
                name="gender"
                render={({ field }) => {
                  return (
                    <FormItem>
                      <FormLabel>
                        Gender <Span variant="error">*</Span>
                      </FormLabel>
                      <RadioGroup
                        value={field.value || ""}
                        onValueChange={field.onChange}
                        className="mt-2 space-y-3"
                      >
                        <div className="flex items-center gap-3">
                          <RadioGroupItem value={Gender.MALE} id="male" />
                          <FormLabel
                            htmlFor="male"
                            className="font-normal cursor-pointer"
                          >
                            Male
                          </FormLabel>
                        </div>
                        <div className="flex items-center gap-3">
                          <RadioGroupItem value={Gender.FEMALE} id="female" />
                          <FormLabel
                            htmlFor="female"
                            className="font-normal cursor-pointer"
                          >
                            Female
                          </FormLabel>
                        </div>
                      </RadioGroup>
                      <FormMessage />
                    </FormItem>
                  );
                }}
              />

              <FormField
                control={form.control}
                name="birthday"
                render={({ field }) => {
                  return (
                    <FormItem className="col-span-2">
                      <FormLabel>Birthday</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  );
                }}
              />
            </div>
            <div className="grid grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="maritalStatus"
                render={({ field }) => {
                  return (
                    <FormItem>
                      <FormLabel>Marital Status</FormLabel>
                      <Select
                        value={field.value}
                        onValueChange={field.onChange}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value={MaritalStatus.SINGLE}>
                            Single
                          </SelectItem>
                          <SelectItem value={MaritalStatus.MARRIED}>
                            Married
                          </SelectItem>
                          <SelectItem value={MaritalStatus.DIVORCED}>
                            Divorced
                          </SelectItem>
                          <SelectItem value={MaritalStatus.WIDOWED}>
                            Widowed
                          </SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  );
                }}
              />

              {form.watch("maritalStatus") === MaritalStatus.MARRIED && (
                <FormField
                  control={form.control}
                  name="dateOfMarriage"
                  render={({ field }) => {
                    return (
                      <FormItem>
                        <FormLabel>Date of Marriage</FormLabel>
                        <FormControl>
                          <Input type="date" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    );
                  }}
                />
              )}
            </div>

            <div className="flex justify-end pt-4">
              <Button type="submit" className="px-6">
                Next step
              </Button>
            </div>
          </form>
        </Form>
      </div>
    </div>
  );
}
