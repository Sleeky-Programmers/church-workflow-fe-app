'use client'
import * as React from 'react'
import Link from 'next/link'
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

interface LoginFormProps {
  onForgotPassword: () => void
}

type LoginFormValues = {
  email: string
  password: string
}

export default function LoginForm({ onForgotPassword }: LoginFormProps) {
  const [isLoading, setIsLoading] = React.useState(false)

  const form = useForm<LoginFormValues>({
    defaultValues: {
      email: '',
      password: '',
    },
  })

  const onSubmit = async () => {
    setIsLoading(true)

    setTimeout(() => setIsLoading(false), 1000)
  }

  return (
    <div className="bg-gray-50 rounded-2xl p-8 animate-slide-up">
      <div className="text-center mb-8">
        <Heading level={1}>Log in to Church on Cloud</Heading>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
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

          {/* Password */}
          <FormField
            control={form.control}
            name="password"
            rules={{
              required: 'Password is required',
            }}
            render={({ field }) => (
              <FormItem>
                <FormLabel>Password</FormLabel>
                <FormControl>
                  <Input
                    type="password"
                    placeholder="Enter your password"
                    {...field}
                  />
                </FormControl>
                <div className="flex justify-end">
                  <Button
                    type="button"
                    variant="link"
                    onClick={onForgotPassword}
                    className="px-0"
                  >
                    Forgot Password?
                  </Button>
                </div>
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
            {isLoading ? 'Logging in…' : 'Login'}
          </Button>

          {/* Sign up */}
          <div className="text-center">
            <p className="text-sm text-gray-600">
              Don&apos;t have an account yet?{' '}
              <Link
                href="/auth/signup"
                className="font-medium text-blue-500 hover:text-blue-600 transition-colors"
              >
                Create account
              </Link>
            </p>
          </div>
        </form>
      </Form>
    </div>
  )
}
