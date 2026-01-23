"use client";

import { useCallback, useEffect, useState } from "react";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
  InputOTPSeparator,
} from "@/components/ui/input-otp";
import { maskEmail } from "@/lib/mask-email";
import { cn } from "@/lib/utils";
import { Text, Span } from "@/components/ui/typography/Text";
import { Loader } from "@/components/ui/loader";
import Heading from "@/components/ui/typography/Heading";
import { Button } from "@/components/ui/button";

interface Props {
  email: string;
  onVerify: (otp: string) => Promise<boolean>;
}

export default function VerifyOtpForm({ email, onVerify }: Props) {
  const [otp, setOtp] = useState("");
  const [isVerifying, setIsVerifying] = useState(false);
  const [error, setError] = useState(false);
  const [resendTimer, setResendTimer] = useState(82);

  const handleVerify = useCallback(
    async (code: string) => {
      if (isVerifying) return;

      setIsVerifying(true);
      setError(false);

      const success = await onVerify(code);

      if (!success) {
        setError(true);
        setOtp("");
        setIsVerifying(false);
        return;
      }
    },
    [isVerifying, onVerify],
  );

  useEffect(() => {
    if (resendTimer <= 0) return;
    const timer = setInterval(() => {
      setResendTimer((t) => t - 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [resendTimer]);

  const handleResend = () => {
    setResendTimer(82);
  };

  return (
    <div className="space-y-8">
      <div className="space-y-2">
        <Heading level={1}>Enter the code</Heading>
        <Text variant="muted">
          Enter the code that we sent to your email{" "}
          <Span variant="default">{maskEmail(email)}</Span> and be careful not
          to share the code with anyone.
        </Text>
      </div>

      <div className={cn("flex justify-center", error && "animate-shake")}>
        <InputOTP
          maxLength={6}
          value={otp}
          onChange={setOtp}
          autoFocus
          inputMode="numeric"
          autoComplete="one-time-code"
          containerClassName="justify-center"
        >
          <InputOTPGroup className="space-x-2">
            <InputOTPSlot index={0} />
            <InputOTPSlot index={1} />
            <InputOTPSlot index={2} />
          </InputOTPGroup>

          <InputOTPSeparator />

          <InputOTPGroup className="space-x-2">
            <InputOTPSlot index={3} />
            <InputOTPSlot index={4} />
            <InputOTPSlot index={5} />
          </InputOTPGroup>
        </InputOTP>
      </div>

      {error && (
        <Text variant="error" className="text-center">
          Incorrect code. Please try again.
        </Text>
      )}

      <Button
        className="w-full mt-4"
        disabled={otp.length !== 6 || isVerifying}
        onClick={() => handleVerify(otp)}
      >
        {isVerifying ? (
          <Span className="flex items-center gap-2">
            <Loader />
            Verifying…
          </Span>
        ) : (
          "Verify"
        )}
      </Button>

      <Text variant="muted" className="text-center">
        Didn&apos;t receive a code?{" "}
        {resendTimer > 0 ? (
          <Span className="font-medium">
            Resend in {Math.floor(resendTimer / 60)}:
            {(resendTimer % 60).toString().padStart(2, "0")}
          </Span>
        ) : (
          <Button onClick={handleResend} variant="link" className="p-0 h-auto">
            Resend
          </Button>
        )}
      </Text>
    </div>
  );
}
