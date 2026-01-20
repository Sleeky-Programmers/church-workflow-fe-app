'use client';
import { useState } from 'react';
import AuthLayout from '@/components/features/landing/auth/signup/auth-layout';
import SignupForm from '@/components/features/landing/auth/signup/signup-form';
import AdminSignupForm from '@/components/features/landing/auth/signup/admin-signup-form';
import VerifyOtpForm from '@/components/features/landing/auth/signup/verify-code';
import { useRouter } from 'next/navigation';
import { useAdminInvite } from '@/hooks/use-admin-invite';
import { Loader } from '@/components/ui/loader';
import { Text } from '@/components/ui/typography/Text';
import { Button } from '@/components/ui/button';

type SignupStep = 'signup' | 'verify-otp';

export default function SignupPage() {
  const router = useRouter();
  const { isAdmin, inviteData, isLoading, error } = useAdminInvite();
  const [currentStep, setCurrentStep] = useState<SignupStep>('signup');
  const [email, setEmail] = useState('');

  const testOtp = 123456;
  const testEnv = process.env.ENV === "local" || process.env.ENV === "development";

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
          <Text variant="error" className="text-center">{error}</Text>
          <Button
            onClick={() => router.push('/auth/login')}
            variant="link"
          >
            Go to login
          </Button>
        </div>
      </AuthLayout>
    );
  }

  const handleSignupSuccess = (submittedEmail: string) => {
    setEmail(submittedEmail);
  
    if (isAdmin) {
      router.push('/dashboard');
    } else {

      setCurrentStep('verify-otp');
    }
  };

  const handleOtpVerified = async (otp: string) => {
    if (otp === testOtp.toString() && testEnv) {
      router.push('/onboarding');
      return true;
    }
    return false;
  };

  const layoutVariant = isAdmin ? 'admin-signup' : 'signup';

  return (
    <AuthLayout variant={layoutVariant}>
      <div className="relative">
        {currentStep === 'signup' && !isAdmin && (
          <SignupForm onSubmit={handleSignupSuccess} />
        )}
        {currentStep === 'signup' && isAdmin && inviteData && (
          <AdminSignupForm 
            onSubmit={handleSignupSuccess}
            preFilledName={{
              firstName: inviteData.firstName,
              lastName: inviteData.lastName,
            }}
            preFilledEmail={inviteData.email}
          />
        )}
        {currentStep === 'verify-otp' && (
          <VerifyOtpForm
            email={email}
            onVerify={handleOtpVerified}
          />
        )}
      </div>
    </AuthLayout>
  );
}