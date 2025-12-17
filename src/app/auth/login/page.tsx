'use client';

import { useState } from 'react';
import LoginForm from '@/components/features/landing/auth/login/login';
import ForgotPasswordForm from '@/components/features/landing/auth/login/forgot-password';
import VerifyCodeForm from '@/components/features/landing/auth/login/verify-code';
import ResetPasswordForm from '@/components/features/landing/auth/login/reset-password';
import { AnimatePresence, motion } from 'framer-motion';
import AuthLayout from '@/components/features/landing/auth/signup/auth-layout';

type AuthStep =
  | 'login'
  | 'forgot-password'
  | 'verify-code'
  | 'reset-password';

export default function LoginPage() {
  const [step, setStep] = useState<AuthStep>('login');
  const [email, setEmail] = useState('');

  return (
    <AuthLayout variant="login">
      <AnimatePresence mode="wait">
        <motion.div
          key={step}
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -16 }}
          transition={{ duration: 0.25, ease: 'easeOut' }}
        >
          {step === 'login' && (
            <LoginForm
              onForgotPassword={() => setStep('forgot-password')}
            />
          )}

          {step === 'forgot-password' && (
            <ForgotPasswordForm
              onSubmit={(email) => {
                setEmail(email);
                setStep('verify-code');
              }}
              onBackToLogin={() => setStep('login')}
            />
          )}

          {step === 'verify-code' && (
            <VerifyCodeForm
              email={email}
              onVerify={async () => {
                setStep('reset-password');
                return true;
              }}
            />
          )}

          {step === 'reset-password' && (
            <ResetPasswordForm
              onSuccess={() => setStep('login')}
            />
          )}
        </motion.div>
      </AnimatePresence>
    </AuthLayout>
  );
}
