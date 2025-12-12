'use client';

import ForgotPasswordForm from '@/components/features/landing/auth/login/forgot-password';
import LoginForm from '@/components/features/landing/auth/login/login';
import ResetPasswordForm from '@/components/features/landing/auth/login/reset-password';
import VerifyCodeForm from '@/components/features/landing/auth/login/verify-code';
import { useState } from 'react';

type AuthStep = 'login' | 'forgot-password' | 'verify-code' | 'reset-password';

export default function AuthPage() {
  const [currentStep, setCurrentStep] = useState<AuthStep>('login');
  const [email, setEmail] = useState('');

  const handleForgotPassword = () => {
    setCurrentStep('forgot-password');
  };

  const handleForgotPasswordSubmit = (submittedEmail: string) => {
    setEmail(submittedEmail);
    setCurrentStep('verify-code');
  };

  const handleVerifyCode = () => {
    setCurrentStep('reset-password');
  };

  const handleResetPassword = () => {
    setCurrentStep('login');
  };

  const handleBackToLogin = () => {
    setCurrentStep('login');
  };

  return (
    <div className="min-h-screen mt-20 flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200 px-4 py-8">


      <div className="w-full max-w-md relative">

        {/* Forms */}
        <div className="relative">
          {currentStep === 'login' && (
            <LoginForm onForgotPassword={handleForgotPassword} />
          )}
          
          {currentStep === 'forgot-password' && (
            <ForgotPasswordForm 
              onSubmit={handleForgotPasswordSubmit}
              onBackToLogin={handleBackToLogin}
            />
          )}
          
          {currentStep === 'verify-code' && (
            <VerifyCodeForm 
              email={email}
              onVerify={handleVerifyCode}
            />
          )}
          
          {currentStep === 'reset-password' && (
            <ResetPasswordForm 
              onSuccess={handleResetPassword}
            />
          )}
        </div>

      </div>

    </div>
  );
}