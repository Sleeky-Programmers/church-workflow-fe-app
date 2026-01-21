'use client'

import * as React from 'react'
import { useForm } from 'react-hook-form'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import Heading from '@/components/ui/typography/Heading'
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from '@/components/ui/form'

interface ForgotPasswordFormProps {
  onSubmit: (email: string) => void
  onBackToLogin: () => void
}

type ForgotPasswordFormValues = {
  email: string
}

export default function ForgotPasswordForm({
  onSubmit,
  onBackToLogin,
}: ForgotPasswordFormProps) {
  const [isLoading, setIsLoading] = React.useState(false)

  const form = useForm<ForgotPasswordFormValues>({
    defaultValues: {
      email: '',
    },
  })

  const handleSubmit = async (data: ForgotPasswordFormValues) => {
    setIsLoading(true)

    // 👇 simulate API call
    setTimeout(() => {
      setIsLoading(false)
      onSubmit(data.email)
    }, 1000)
  }

  return (
    <div className="bg-gray-50 rounded-2xl p-8 animate-slide-up">
      <div className="text-center mb-8">
        <Heading level={1}>Forgot Password</Heading>
        <p className="text-gray-600 mt-2">
          Enter your email to reset password
        </p>
      </div>

      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(handleSubmit)}
          className="space-y-6"
        >
          {/* Email */}
          <FormField
            control={form.control}
            name="email"
            rules={{
              required: 'Email is required',
            }}
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email Address</FormLabel>
                <FormControl>
                  <Input
                    type="email"
                    placeholder="Enter your email address"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Continue */}
          <Button
            type="submit"
            disabled={isLoading}
            className="w-full disabled:cursor-not-allowed"
          >
            {isLoading ? 'Sending…' : 'Continue'}
          </Button>

          {/* Back to login */}
          <div className="text-center">
            <Button
              type="button"
              variant="link"
              onClick={onBackToLogin}
            >
              ← Back to login
            </Button>
          </div>
        </form>
      </Form>
    </div>
  )
}
