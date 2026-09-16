"use client";

import { useState } from "react";
import { createPortal } from "react-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { MemberProfile } from "@/types";
import { Gender, MembershipStatus } from "@/lib/enums";
import { editMemberSchema, EditMemberFormValues } from "@/types/schema";

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

import { Text, Span } from "@/components/ui/typography/Text";
import Heading from "@/components/ui/typography/Heading";
import { Card } from "@/components/ui/card";
import { TitleCombobox } from "@/components/ui/title-combobox";

type Props = {
  member: MemberProfile;
  onClose: () => void;
  onSave: (data: Partial<MemberProfile>) => Promise<void>;
};

const normalizeDate = (dateStr?: string) => {
  if (!dateStr) {
    return "";
  }
  const date = new Date(dateStr);
  return !isNaN(date.getTime()) ? date.toISOString().split("T")[0] : "";
};

export function EditMemberModal({ member, onClose, onSave }: Props) {
  const [isSaving, setIsSaving] = useState(false);

  const form = useForm<EditMemberFormValues>({
    resolver: zodResolver(editMemberSchema),
    defaultValues: {
      title: member.title || "",
      fullName: member.fullName || "",
      gender: member.gender,
      birthday: normalizeDate(member.birthday),
      email: member.email || "",
      phone: member.phone || "",
      address: member.address || "",
      membershipStatus: member.membershipStatus,
      dateJoined: normalizeDate(member.dateJoined),
      baptized: member.baptized,
      volunteersPreference: member.volunteersPreference || "",
    },
  });

  const handleSubmit = async (values: EditMemberFormValues) => {
    try {
      setIsSaving(true);
      await onSave({ ...member, ...values });
      onClose();
    } finally {
      setIsSaving(false);
    }
  };

  const modalContent = (
    <div
      className="fixed inset-0 bg-black/40 flex items-center justify-center z-50"
      onClick={onClose}
    >
      <div className="w-full max-w-3xl" onClick={(e) => e.stopPropagation()}>
        <Card className="p-6 space-y-6 max-h-[90vh] overflow-y-auto">
          <div>
            <Heading level={2}>Edit Member Profile</Heading>
            <Text className="mt-1">Update member information</Text>
          </div>

          <Form {...form}>
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Title</FormLabel>
                      <FormControl>
                        <TitleCombobox
                          value={field.value}
                          onChange={field.onChange}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="fullName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        Full Name <Span variant="error">*</Span>
                      </FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="gender"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        Gender <Span variant="error">*</Span>
                      </FormLabel>
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
                          <SelectItem value={Gender.MALE}>Male</SelectItem>
                          <SelectItem value={Gender.FEMALE}>Female</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="birthday"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Birthday</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div>
                <Heading level={4}>Contact</Heading>
                <div className="grid grid-cols-2 gap-4 mt-2">
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email</FormLabel>
                        <FormControl>
                          <Input {...field} />
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
                        <FormLabel>Phone</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="address"
                    render={({ field }) => (
                      <FormItem className="col-span-2">
                        <FormLabel>Address</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              <div>
                <Heading level={4}>Church Info</Heading>

                <div className="grid grid-cols-2 gap-4 mt-2">
                  <FormField
                    control={form.control}
                    name="membershipStatus"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Membership Status</FormLabel>
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
                            <SelectItem value={MembershipStatus.MEMBER}>
                              Member
                            </SelectItem>
                            <SelectItem value={MembershipStatus.VISITOR}>
                              Visitor
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
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="dateJoined"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Date Joined</FormLabel>
                        <FormControl>
                          <Input type="date" {...field} />
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
                        <FormLabel>Baptized</FormLabel>
                        <Select
                          value={
                            field.value === true
                              ? "true"
                              : field.value === false
                                ? "false"
                                : ""
                          }
                          onValueChange={(val) =>
                            field.onChange(val === "true")
                          }
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
                    name="volunteersPreference"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Volunteer Preference</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-2 mt-6">
              <Button variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button
                onClick={form.handleSubmit(handleSubmit)}
                disabled={isSaving}
              >
                {isSaving ? "Saving..." : "Save Changes"}
              </Button>
            </div>
          </Form>
        </Card>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
}
