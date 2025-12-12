'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { InputOTP, InputOTPGroup, InputOTPSlot } from '@/components/ui/input-otp';

interface VerifyCodeFormProps {
  email: string;
  onVerify: () => void;
}

export default function VerifyCodeForm({ email, onVerify }: VerifyCodeFormProps) {
  const [code, setCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [countdown, setCountdown] = useState(0);

  useEffect(() => {
    // Start countdown on mount
    setCountdown(202); // 3:22 in seconds
    
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleComplete = async (value: string) => {
    setCode(value);
    if (value.length === 6) {
      setIsLoading(true);
      // Simulate verification
      setTimeout(() => {
        setIsLoading(false);
        onVerify();
      }, 1000);
    }
  };

  const handleResend = () => {
    setCountdown(202);
    // Add resend logic here
  };

  return (
    <div className="bg-gray-50 rounded-2xl p-8 animate-slide-up">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Forgot Password
        </h1>
        <p className="text-gray-600">
          Please check your email, we&apos;ve sent a code to{' '}
          <span className="font-medium text-gray-900">{email}</span>
        </p>
      </div>

      <div className="space-y-6">
        {/* OTP Input */}
        <div className="flex justify-center">
          <InputOTP
            maxLength={6}
            value={code}
            onChange={handleComplete}
          >
            <InputOTPGroup className="gap-2">
              <InputOTPSlot 
                index={0} 
                className="w-12 h-14 text-xl border-2 border-gray-300 rounded-lg focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500 transition-all"
              />
              <InputOTPSlot 
                index={1} 
                className="w-12 h-14 text-xl border-2 border-gray-300 rounded-lg focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500 transition-all"
              />
              <InputOTPSlot 
                index={2} 
                className="w-12 h-14 text-xl border-2 border-gray-300 rounded-lg focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500 transition-all"
              />
              <InputOTPSlot 
                index={3} 
                className="w-12 h-14 text-xl border-2 border-gray-300 rounded-lg focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500 transition-all"
              />
              <InputOTPSlot 
                index={4} 
                className="w-12 h-14 text-xl border-2 border-gray-300 rounded-lg focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500 transition-all"
              />
              <InputOTPSlot 
                index={5} 
                className="w-12 h-14 text-xl border-2 border-gray-300 rounded-lg focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500 transition-all"
              />
            </InputOTPGroup>
          </InputOTP>
        </div>

        {/* Resend Link */}
        <div className="text-center">
          <p className="text-sm text-gray-600">
            Didn&apos;t receive a code?{' '}
            {countdown > 0 ? (
              <span className="text-cyan-500 font-medium">
                Resend in {formatTime(countdown)}
              </span>
            ) : (
              <button
                onClick={handleResend}
                className="text-cyan-500 hover:text-cyan-600 font-medium transition-colors"
              >
                Resend
              </button>
            )}
          </p>
        </div>

        {/* Continue Button */}
        <Button
          onClick={() => handleComplete(code)}
          disabled={isLoading || code.length !== 6}
          className="w-full bg-cyan-500 hover:bg-cyan-600 text-white py-3 rounded-lg font-medium shadow-lg shadow-cyan-500/30 transition-all duration-300 hover:shadow-xl hover:shadow-cyan-500/40 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? (
            <span className="flex items-center justify-center">
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Verifying...
            </span>
          ) : (
            'Continue'
          )}
        </Button>
      </div>

    </div>
  );
}