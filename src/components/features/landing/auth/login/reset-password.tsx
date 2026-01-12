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
} from '@/components/ui/form';
import { Span, Text } from '@/components/ui/typography/Text';
import Heading from '@/components/ui/typography/Heading';
import { Loader } from '@/components/ui/loader';

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

    setTimeout(() => {
      setIsLoading(false)
      onSuccess()
    }, 1000)
  }

  return (
    <div className="bg-gray-50 rounded-2xl p-8 animate-slide-up">
      <div className="text-left mb-8">
        <Heading level={1} className="text-3xl mb-2">
          Reset Password
        </Heading>
        <Text variant="muted" className="text-xs">
          Kindly set a new password. Your new password <br/> 
          must be different from your previously <br/> 
          used password.
        </Text>
      </div>

      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="space-y-6"
        >
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
                    <Button
                       type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() =>
                        setShowNewPassword((prev) => !prev)
                      }
                      className="absolute right-4 top-1/2 -translate-y-1/2"
                    >
                      {showNewPassword ? (
                        <EyeOff className="w-5 h-5" />
                      ) : (
                        <Eye className="w-5 h-5" />
                      )}
                    </Button>
                  </div>
                </FormControl>
                <FormDescription>
                  Password must be at least 8 characters
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

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
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() =>
                        setShowConfirmPassword((prev) => !prev)
                      }
                      className="absolute right-4 top-1/2 -translate-y-1/2 "
                    >
                      {showConfirmPassword ? (
                        <EyeOff className="w-5 h-5" />
                      ) : (
                        <Eye className="w-5 h-5" />
                      )}
                    </Button>
                  </div>
                </FormControl>
                <FormDescription>
                  Must be the same characters
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <Button
            type="submit"
            disabled={isLoading}
            className="w-full"
          >
            {isLoading ? (
    <Span className="flex items-center gap-2">
      <Loader />
      Resetting...
    </Span>
  ) : (
    'Reset Password'
  )}
          </Button>
        </form>
      </Form>
    </div>
  )
}
