"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import Heading from "@/components/ui/typography/Heading";
import { Span, Text } from "@/components/ui/typography/Text";
import { MembershipStatus } from "@/lib/enums";
import { AddMemberStep3Data } from "@/types";
import {
  memberChurchActivityStepSchema,
  MemberChurchActivityStepValues,
} from "@/types/schema";

type ChurchActivityStepProps = {
  onNext: (data: AddMemberStep3Data) => void;
  onBack: () => void;
  initialData?: Partial<AddMemberStep3Data>;
};

export function ChurchActivityStep({
  onNext,
  onBack,
  initialData = {},
}: ChurchActivityStepProps) {
  const form = useForm<MemberChurchActivityStepValues>({
    resolver: zodResolver(memberChurchActivityStepSchema),
    defaultValues: {
      membershipStatus: initialData.membershipStatus || MembershipStatus.MEMBER,
      dateJoined: initialData.dateJoined || "",
      previousChurchMembership: initialData.previousChurchMembership || "",
      baptized: initialData.baptized,
      ministriesInvolved: initialData.ministriesInvolved || "",
      volunteersPreference: initialData.volunteersPreference || "",
    },
  });

  const handleNext = (data: MemberChurchActivityStepValues) => {
    onNext(data as AddMemberStep3Data);
  };

  return (
    <div className="space-y-6">
      <div>
        <Heading variant="primary" level={2}>
          Church Involvement
        </Heading>
        <Text variant="muted">
          Share details about the member&apos;s participation and church journey
        </Text>
      </div>

      <Form {...form}>
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          <FormField
            control={form.control}
            name="membershipStatus"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="mb-2">
                  Membership Status <Span variant="error">*</Span>
                </FormLabel>
                <Select value={field.value} onValueChange={field.onChange}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value={MembershipStatus.MEMBER}>
                      Member
                    </SelectItem>
                    <SelectItem value={MembershipStatus.VISITOR}>
                      Visitor
                    </SelectItem>
                    <SelectItem value={MembershipStatus.VOLUNTEER}>
                      Volunteer
                    </SelectItem>
                    <SelectItem value={MembershipStatus.WORKER}>
                      Worker
                    </SelectItem>
                    <SelectItem value={MembershipStatus.LEADER}>
                      Leader
                    </SelectItem>
                    <SelectItem value={MembershipStatus.CONVERT}>
                      New Convert
                    </SelectItem>
                  </SelectContent>
                </Select>
                <p className="mt-1 text-xs text-gray-500">
                  Visitors count towards your separate guest limit and can&apos;t
                  join departments, small teams or cell groups.
                </p>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="dateJoined"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="mb-2">Date Joined the Church</FormLabel>
                <FormControl>
                  <Input type="date" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="previousChurchMembership"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="mb-2">
                  Previous Church Membership
                </FormLabel>
                <FormControl>
                  <Input
                    placeholder="Enter the previous church name"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="baptized"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="mb-2">
                  Are you baptized? (Optional)
                </FormLabel>
                <Select
                  value={field.value !== undefined ? String(field.value) : ""}
                  onValueChange={(value) => field.onChange(value === "true")}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="true">Yes</SelectItem>
                    <SelectItem value="false">No</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="ministriesInvolved"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="mb-2">Ministries Involved in</FormLabel>
                <FormControl>
                  <Input placeholder="e.g. Choir, Usher or none" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="volunteersPreference"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="mb-2">Volunteer Preferences</FormLabel>
                <Select value={field.value} onValueChange={field.onChange}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="Interested">Interested</SelectItem>
                    <SelectItem value="Not Interested">
                      Not Interested
                    </SelectItem>
                    <SelectItem value="Maybe Later">Maybe Later</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="flex justify-between">
          <Button variant="outline" onClick={onBack}>
            Back
          </Button>
          <Button onClick={form.handleSubmit(handleNext)}>Continue</Button>
        </div>
      </Form>
    </div>
  );
}
