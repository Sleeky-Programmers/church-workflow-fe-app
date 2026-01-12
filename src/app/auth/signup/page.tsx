'use client';

import { useState } from 'react';
import AuthLayout from '@/components/features/landing/auth/signup/auth-layout';
import SignupForm from '@/components/features/landing/auth/signup/signup-form';
import VerifyOtpForm from '@/components/features/landing/auth/signup/verify-code';

type SignupStep = 'signup' | 'verify-otp';

export default function SignupPage() {
  const [currentStep, setCurrentStep] = useState<SignupStep>('signup');
  const [email, setEmail] = useState('');
  const testOtp = 123456;
  const testEnv = process.env.ENV === "local" || process.env.ENV === "development"

  const handleSignupSuccess = (submittedEmail: string) => {
    setEmail(submittedEmail);
    setCurrentStep('verify-otp');
  };

  const handleOtpVerified = async (otp: string) => {


  if (otp === testOtp.toString() && testEnv) {
    return true;
  }

  return false;
};


  return (
    <AuthLayout variant="signup">
      <div className="relative">
        {currentStep === 'signup' && (
          <SignupForm onSubmit={handleSignupSuccess} />
        )}

        {currentStep === 'verify-otp' && (
          <VerifyOtpForm
            email={email} onVerify={handleOtpVerified}
                       
          />
        )}
      </div>
    </AuthLayout>
  );
}
