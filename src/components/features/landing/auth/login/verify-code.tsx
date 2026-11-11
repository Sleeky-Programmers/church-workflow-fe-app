"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSeparator,
  InputOTPSlot,
} from "@/components/ui/input-otp";
import { Loader } from "@/components/ui/loader";
import Heading from "@/components/ui/typography/Heading";
import { Span, Text } from "@/components/ui/typography/Text";
import { verifyCodeSchema, VerifyCodeFormValues } from "@/types/schema";

interface VerifyCodeFormProps {
  email: string;
  onVerify: (code: string) => Promise<boolean>;
  onResend: () => Promise<any>;
}

export default function VerifyCodeForm({
  email,
  onVerify,
  onResend,
}: VerifyCodeFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const form = useForm<VerifyCodeFormValues>({
    resolver: zodResolver(verifyCodeSchema),
    defaultValues: {
      code: "",
    },
  });

  useEffect(() => {
    setCountdown(60);
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => {
      return clearInterval(timer);
    };
  }, []);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const handleSubmit = async ({ code }: VerifyCodeFormValues) => {
    setIsLoading(true);

    try {
      const success = await onVerify(code);
      setIsLoading(false);

      if (!success) {
        form.setError("code", {
          type: "manual",
          message: "Invalid or expired code",
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleResend = async () => {
    await onResend();
    setCountdown(90);
  };

  return (
    <div className="bg-gray-50 rounded-xl sm:rounded-2xl p-4 sm:p-8 animate-slide-up">
      <div className="text-center mb-6 sm:mb-8">
        <Heading level={1}>Forgot Password</Heading>
        <Text variant="muted">
          Please check your email, we&apos;ve sent a code to{" "}
          <Span variant="default">{email}</Span>
        </Text>
      </div>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
          <FormField
            control={form.control}
            name="code"
            render={({ field }) => {
              return (
                <FormItem className="flex flex-col items-center">
                  <FormControl>
                    <div className="w-full overflow-x-visible">
                      <InputOTP
                        maxLength={6}
                        value={field.value}
                        onChange={field.onChange}
                        inputMode="numeric"
                        autoComplete="one-time-code"
                        containerClassName="justify-center mx-auto"
                      >
                        <InputOTPGroup className="space-x-2">
                          <InputOTPSlot
                            index={0}
                            className="h-12 w-10 text-lg sm:h-14 sm:w-12 sm:text-xl [&>input]:font-normal"
                          />
                          <InputOTPSlot
                            index={1}
                            className="h-12 w-10 text-lg sm:h-14 sm:w-12 sm:text-xl [&>input]:font-normal"
                          />
                          <InputOTPSlot
                            index={2}
                            className="h-12 w-10 text-lg sm:h-14 sm:w-12 sm:text-xl [&>input]:font-normal"
                          />
                        </InputOTPGroup>
                        <InputOTPSeparator className="[&>svg]:h-4 [&>svg]:w-4 text-muted-foreground" />
                        <InputOTPGroup className="space-x-2">
                          <InputOTPSlot
                            index={3}
                            className="h-12 w-10 text-lg sm:h-14 sm:w-12 sm:text-xl [&>input]:font-normal"
                          />
                          <InputOTPSlot
                            index={4}
                            className="h-12 w-10 text-lg sm:h-14 sm:w-12 sm:text-xl [&>input]:font-normal"
                          />
                          <InputOTPSlot
                            index={5}
                            className="h-12 w-10 text-lg sm:h-14 sm:w-12 sm:text-xl [&>input]:font-normal"
                          />
                        </InputOTPGroup>
                      </InputOTP>
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              );
            }}
          />
          <Button
            type="submit"
            disabled={isLoading || form.watch("code").length !== 6}
            className="w-full"
          >
            {isLoading ? (
              <Span className="flex items-center gap-2">
                <Loader size="w-5 h-5" showShadow={false} />
                Verifying...
              </Span>
            ) : (
              "Continue"
            )}
          </Button>
          <div className="text-center">
            <Text variant="muted">
              Didn&apos;t receive a code?{" "}
              {countdown > 0 ? (
                <Span variant="default" className="cursor-default">
                  Resend in {formatTime(countdown)}
                </Span>
              ) : (
                <Button
                  type="button"
                  onClick={handleResend}
                  disabled={isLoading}
                  variant="link"
                >
                  Resend
                </Button>
              )}
            </Text>
          </div>
        </form>
      </Form>
    </div>
  );
}
