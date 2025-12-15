'use client'

import * as React from 'react'
import { useForm } from 'react-hook-form'
import { Eye, EyeOff } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
  FormDescription,
} from '@/components/ui/form'

interface ResetPasswordFormProps {
  onSuccess: () => void
}

type ResetPasswordFormValues = {
  newPassword: string
  confirmPassword: string
}

export default function ResetPasswordForm({
  onSuccess,
}: ResetPasswordFormProps) {
  const [isLoading, setIsLoading] = React.useState(false)
  const [showNewPassword, setShowNewPassword] = React.useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = React.useState(false)

  const form = useForm<ResetPasswordFormValues>({
    defaultValues: {
      newPassword: '',
      confirmPassword: '',
    },
  })

  const onSubmit = async () => {
    setIsLoading(true)

    // 👇 replace with real API call
    setTimeout(() => {
      setIsLoading(false)
      onSuccess()
    }, 1000)
  }

  return (
    <div className="bg-gray-50 rounded-2xl p-8 animate-slide-up">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Reset Password
        </h1>
        <p className="text-gray-600 text-xs">
          Kindly set a new password. It must be different from your previous one.
        </p>
      </div>

      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="space-y-6"
        >
          {/* New password */}
          <FormField
            control={form.control}
            name="newPassword"
            rules={{
              required: 'New password is required',
              minLength: {
                value: 8,
                message: 'Password must be at least 8 characters',
              },
            }}
            render={({ field }) => (
              <FormItem>
                <FormLabel>Enter New Password</FormLabel>
                <FormControl>
                  <div className="relative">
                    <Input
                      type={showNewPassword ? 'text' : 'password'}
                      placeholder="Enter new password"
                      {...field}
                      className="pr-12"
                    />
                    <button
                      type="button"
                      onClick={() =>
                        setShowNewPassword((prev) => !prev)
                      }
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                    >
                      {showNewPassword ? (
                        <EyeOff className="w-5 h-5" />
                      ) : (
                        <Eye className="w-5 h-5" />
                      )}
                    </button>
                  </div>
                </FormControl>
                <FormDescription>
                  Password must be at least 8 characters
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Confirm password */}
          <FormField
            control={form.control}
            name="confirmPassword"
            rules={{
              required: 'Please confirm your password',
              validate: (value) =>
                value === form.getValues('newPassword') ||
                'Passwords must match',
            }}
            render={({ field }) => (
              <FormItem>
                <FormLabel>Confirm New Password</FormLabel>
                <FormControl>
                  <div className="relative">
                    <Input
                      type={showConfirmPassword ? 'text' : 'password'}
                      placeholder="Confirm new password"
                      {...field}
                      className="pr-12"
                    />
                    <button
                      type="button"
                      onClick={() =>
                        setShowConfirmPassword((prev) => !prev)
                      }
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                    >
                      {showConfirmPassword ? (
                        <EyeOff className="w-5 h-5" />
                      ) : (
                        <Eye className="w-5 h-5" />
                      )}
                    </button>
                  </div>
                </FormControl>
                <FormDescription>
                  Must be the same characters
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Submit */}
          <Button
            type="submit"
            disabled={isLoading}
            className="w-full disabled:cursor-not-allowed"
          >
            {isLoading ? 'Resetting…' : 'Reset Password'}
          </Button>
        </form>
      </Form>
    </div>
  )
}
