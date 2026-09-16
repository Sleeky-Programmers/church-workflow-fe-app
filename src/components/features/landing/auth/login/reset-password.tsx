"use client";
import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
  FormDescription,
} from "@/components/ui/form";
import Heading from "@/components/ui/typography/Heading";
import { Loader } from "@/components/ui/loader";
import { PasswordInput } from "@/components/ui/passport-input";
import { Text, Span } from "@/components/ui/typography/Text";
import { resetPassword } from "@/lib/api";
import { resetPasswordSchema, ResetPasswordFormValues } from "@/types/schema";

interface ResetPasswordFormProps {
  onSuccess: () => void;
}

export default function ResetPasswordForm({
  onSuccess,
}: ResetPasswordFormProps) {
  const [isLoading, setIsLoading] = React.useState(false);
  const form = useForm<ResetPasswordFormValues>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      newPassword: "",
      confirmPassword: "",
    },
  });
  const onSubmit = async (data: ResetPasswordFormValues) => {
    setIsLoading(true);
    try {
      resetPassword({
        newPassword: data.newPassword,
        confirmNewPassword: data.confirmPassword,
      });

      onSuccess();
    } catch (error: any) {
      form.setError("newPassword", {
        type: "manual",
        message: error.message || "Failed to reset password",
      });
    } finally {
      setIsLoading(false);
    }
  };
  return (
    <div className="bg-gray-50 rounded-xl sm:rounded-2xl p-4 sm:p-8 animate-slide-up">
      <div className="text-left mb-6 sm:mb-8">
        <Heading level={1}>Reset Password</Heading>
        <Text variant="muted">
          Kindly set a new password. Your new password must be different from
          your previously used password.
        </Text>
      </div>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <FormField
            control={form.control}
            name="newPassword"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Enter New Password</FormLabel>
                <FormControl>
                  <PasswordInput placeholder="Enter new password" {...field} />
                </FormControl>
                <FormDescription>
                  Password must be at least 8 characters
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="confirmPassword"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Confirm New Password</FormLabel>
                <FormControl>
                  <PasswordInput
                    placeholder="Confirm new password"
                    {...field}
                  />
                </FormControl>
                <FormDescription>Must be the same characters</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button type="submit" disabled={isLoading} className="w-full">
            {isLoading ? (
              <Span className="flex items-center gap-2">
                <Loader size="w-5 h-5" showShadow={false} />
                Resetting...
              </Span>
            ) : (
              "Reset Password"
            )}
          </Button>
        </form>
      </Form>
    </div>
  );
}
