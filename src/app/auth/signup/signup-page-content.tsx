"use client";
import { useState } from "react";
import SignupForm from "@/components/features/landing/auth/signup/signup-form";
import AdminSignupForm from "@/components/features/landing/auth/signup/admin-signup-form";
import VerifyOtpForm from "@/components/features/landing/auth/signup/verify-code";
import { useRouter } from "next/navigation";
import { useAdminInvite } from "@/hooks/use-admin-invite";
import { Loader } from "@/components/ui/loader";
import { Text } from "@/components/ui/typography/Text";
import { Button } from "@/components/ui/button";
import { RouteConfig } from "@/config/routes";
import { SignUpStep } from "@/lib/enums";
import AuthLayout from "@/components/features/landing/auth/signup/auth-layout";
import { resendOtp, verifyOtp } from "@/lib/api";

export function SignupPageContent() {
  const router = useRouter();
  const { isAdmin, inviteData, isLoading, error } = useAdminInvite();
  const [currentStep, setCurrentStep] = useState<SignUpStep>(SignUpStep.SIGNUP);
  const [email, setEmail] = useState("");
  const [signupData, setSignupData] = useState<any>(null);

  if (isLoading) {
    return (
      <AuthLayout variant="signup">
        <div className="flex flex-col items-center justify-center gap-4">
          <Loader />
          <Text variant="muted">Loading your invite...</Text>
        </div>
      </AuthLayout>
    );
  }

  if (error && isAdmin) {
    return (
      <AuthLayout variant="signup">
        <div className="flex flex-col items-center justify-center gap-4">
          <Text variant="error" className="text-center">
            {error}
          </Text>
          <Button
            onClick={() => router.push(RouteConfig.auth.signIn)}
            variant="link"
          >
            Go to login
          </Button>
        </div>
      </AuthLayout>
    );
  }

  const handleSignupSuccess = (submittedEmail: string, data?: any) => {
    setEmail(submittedEmail);
    if (data) {
      setSignupData(data);
      if (typeof window !== "undefined") {
        sessionStorage.setItem("signupData", JSON.stringify(data));
      }
    }

    if (isAdmin) {
      router.push(RouteConfig.dashboard.home);
    } else {
      setCurrentStep(SignUpStep.VERIFY_OTP);
    }
  };

  const handleOtpVerified = async (otp: string) => {
    try {
      const response = await verifyOtp({ email, otp });

      if (typeof window !== "undefined" && response.accessToken) {
        localStorage.setItem("accessToken", response.accessToken);
      }

      if (signupData && typeof window !== "undefined") {
        sessionStorage.setItem("signupData", JSON.stringify(signupData));
      }

      router.push(RouteConfig.onboarding);
      return true;
    } catch (error) {
      console.error("OTP verification failed:", error);
      return false;
    }
  };

  const handleResendOtp = async () => {
    try {
      await resendOtp(email);
    } catch (error) {
      console.error("Resend failed:", error);
      throw error;
    }
  };

  const layoutVariant = isAdmin ? "admin-signup" : "signup";

  return (
    <AuthLayout variant={layoutVariant}>
      <div className="relative">
        {currentStep === SignUpStep.SIGNUP && !isAdmin && (
          <SignupForm onSubmit={handleSignupSuccess} />
        )}
        {currentStep === SignUpStep.SIGNUP && isAdmin && inviteData && (
          <AdminSignupForm
            onSubmit={handleSignupSuccess}
            preFilledName={{
              firstName: inviteData.firstName,
              lastName: inviteData.lastName,
            }}
            preFilledEmail={inviteData.email}
            invitedRole={inviteData.role}
          />
        )}
        {currentStep === SignUpStep.VERIFY_OTP && (
          <VerifyOtpForm
            email={email}
            onVerify={handleOtpVerified}
            onResend={handleResendOtp}
          />
        )}
      </div>
    </AuthLayout>
  );
}
