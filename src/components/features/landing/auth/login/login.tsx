'use client';

import { useForm } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import Heading from '@/components/ui/typography/Heading';
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from '@/components/ui/form';
import { useRouter } from 'next/navigation';
import React, { useState } from 'react';
import { LoginFormValues } from '@/types/type';
import GoogleSignupButton from '../oauth/google-signup-button';
import { Eye, EyeOff } from 'lucide-react';
import { Text } from '@/components/ui/typography/Text';
import { Loader } from '@/components/ui/loader';

interface LoginFormProps {
  onForgotPassword: () => void;
}

export default function LoginForm({ onForgotPassword }: LoginFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();

  const form = useForm<LoginFormValues>({
    defaultValues: {
      email: '',
      password: '',
    },
  });

const onSubmit = async () => {
  setIsLoading(true);

  try {

    await new Promise((resolve) => setTimeout(resolve, 1000));

    router.push('/dashboard');
  } catch  {
    
    alert('Login failed. Please try again.');
  } finally {
    setIsLoading(false);
  }
};


  const onSignUp = () => router.push('/auth/signup');

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div className="text-left space-y-2 text-xl">
        <Heading level={1}>Welcome back</Heading>
        <Text variant="muted">
          Welcome back! It only takes a moment to access your account.
        </Text>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          {/* Email */}
          <FormField
            control={form.control}
            name="email"
            rules={{ required: 'Email is required' }}
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
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
            rules={{ required: 'Password is required' }}
            render={({ field }) => (
              <FormItem>
                <FormLabel>Password</FormLabel>
                <FormControl>
                  <div className="relative">
                    <Input
                      type={showPassword ? 'text' : 'password'}
                      placeholder="Enter your password"
                      {...field}
                    />
                    <Button
                     type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => setShowPassword((prev) => !prev)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 focus:ring-0 focus:ring-offset-0"
                    >
                      {showPassword ? (
                        <EyeOff className="h-5 w-5" />
                      ) : (
                        <Eye className="h-5 w-5" />
                      )}
                    </Button>
                  </div>
                </FormControl>

                <div className="flex justify-end">
                  <Button
                    variant="link"
                    onClick={onForgotPassword} className="focus:ring-0 focus:ring-offset-0"

                  >
                    Forgot password?
                  </Button>
                </div>

                <FormMessage />
              </FormItem>
            )}
          />

          {/* Submit */}
          <Button type="submit" disabled={isLoading} className="w-full py-6 focus:ring-0 focus:ring-offset-0">
  {isLoading ? (
    <span className="flex items-center gap-2">
      <Loader />
     Logging in...
    </span>
  ) : (
    'Login'
  )}
</Button>
        
          {/* Divider */}
          <div className="relative my-8 flex items-center">
            <div className="flex-grow border-t border-gray-200" />
            <span className="mx-4 rounded-full px-4 py-1 text-xs font-medium text-gray-500">
              OR
            </span>
            <div className="flex-grow border-t border-gray-200" />
          </div>

          {/* Google */}
          <GoogleSignupButton onClick={() => alert('Google Signup')} />

        
        </form>
      </Form>
        {/* Sign up */}
          <div className="text-center">
            <Text className="text-sm text-gray-600">
              Don&apos;t have an account yet?
              <Button onClick={onSignUp} variant="link" className='text-blue-700 hover:text-blue-800 focus:ring-0 focus:ring-offset-0'>
                Create Church Account
              </Button>
            </Text>
          </div>
    </div>
  );
}
