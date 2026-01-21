'use client'

import * as React from 'react'
import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'

import { Button } from '@/components/ui/button'
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from '@/components/ui/input-otp'
import {
  Form,
  FormField,
  FormItem,
  FormControl,
  FormMessage,
} from '@/components/ui/form'

interface VerifyCodeFormProps {
  email: string
  onVerify: () => void
}

type VerifyCodeFormValues = {
  code: string
}

export default function VerifyCodeForm({
  email,
  onVerify,
}: VerifyCodeFormProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [countdown, setCountdown] = useState(0)

  const form = useForm<VerifyCodeFormValues>({
    defaultValues: {
      code: '',
    },
  })

  /* Countdown */
  useEffect(() => {
    setCountdown(202)

    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer)
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [])

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const handleSubmit = async ({ code }: VerifyCodeFormValues) => {
    if (code.length !== 6) return

    setIsLoading(true)

    // 👇 replace with real verification
    setTimeout(() => {
      setIsLoading(false)
      onVerify()
    }, 1000)
  }

  const handleResend = () => {
    setCountdown(202)
    // resend logic here
  }

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

      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(handleSubmit)}
          className="space-y-6"
        >
          {/* OTP */}
          <FormField
            control={form.control}
            name="code"
            rules={{
              required: 'Verification code is required',
              minLength: {
                value: 6,
                message: 'Enter the 6-digit code',
              },
            }}
            render={({ field }) => (
              <FormItem className="flex flex-col items-center">
                <FormControl>
                  <InputOTP
                    maxLength={6}
                    value={field.value}
                    onChange={field.onChange}
                  >
                    <InputOTPGroup className="gap-2">
                      {Array.from({ length: 6 }).map((_, index) => (
                        <InputOTPSlot
                          key={index}
                          index={index}
                          className="w-12 h-14 text-xl border-2 border-gray-300 rounded-lg focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500 transition-all"
                        />
                      ))}
                    </InputOTPGroup>
                  </InputOTP>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Resend */}
          <div className="text-center">
            <p className="text-sm text-gray-600">
              Didn&apos;t receive a code?{' '}
              {countdown > 0 ? (
                <span className="text-cyan-500 font-medium">
                  Resend in {formatTime(countdown)}
                </span>
              ) : (
                <button
                  type="button"
                  onClick={handleResend}
                  className="text-cyan-500 hover:text-cyan-600 font-medium transition-colors"
                >
                  Resend
                </button>
              )}
            </p>
          </div>

          {/* Continue */}
          <Button
            type="submit"
            disabled={isLoading || form.watch('code').length !== 6}
            className="w-full disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? 'Verifying…' : 'Continue'}
          </Button>
        </form>
      </Form>
    </div>
  )
}
