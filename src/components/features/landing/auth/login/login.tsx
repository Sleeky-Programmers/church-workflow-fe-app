'use client';
import { useForm } from 'react-hook-form';
import { Button } from '@/components/ui/button';
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
import {Text, Span } from '@/components/ui/typography/Text';
import { Loader } from '@/components/ui/loader';
import { PasswordInput } from '@/components/ui/passport-input';
import { Input } from '@/components/ui/input';


interface LoginFormProps {
  onForgotPassword: () => void;
}

export default function LoginForm({ onForgotPassword }: LoginFormProps) {
  const [isLoading, setIsLoading] = useState(false);
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
    } catch {
      alert('Login failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const onSignUp = () => router.push('/auth/signup');

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="text-left space-y-2">
        <Heading level={1}>Welcome back</Heading>
        <Text variant="muted">
          Welcome back! It only takes a moment to access your account.
        </Text>
      </div>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
         
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
       
          <FormField
            control={form.control}
            name="password"
            rules={{ required: 'Password is required' }}
            render={({ field }) => (
              <FormItem>
                <FormLabel>Password</FormLabel>
                <FormControl>
                  <PasswordInput
                    placeholder="Enter your password"
                    {...field}
                  />
                </FormControl>
                <div className="flex justify-end">
                  <Button
                    variant="link"
                    onClick={onForgotPassword}
                  >
                    Forgot password?
                  </Button>
                </div>
                <FormMessage />
              </FormItem>
            )}
          />
         
          <Button type="submit" disabled={isLoading} className="w-full py-6">
            {isLoading ? (
              <Span className="flex items-center gap-2">
                <Loader />
                Logging in...
              </Span>
            ) : (
              'Login'
            )}
          </Button>
       
          <div className="relative my-8 flex items-center">
            <div className="flex-grow border-t border-gray-200" />
            <Span variant="default" className="mx-4 px-4 py-1">
              OR
            </Span>
            <div className="flex-grow border-t border-gray-200" />
          </div>
          <GoogleSignupButton onClick={() => alert('Google Signup')} />
        </form>
      </Form>
      <div className="text-center">
        <Text variant="muted">
          Don&apos;t have an account yet?
          <Button onClick={onSignUp} variant="link">
            Create Church Account
          </Button>
        </Text>
      </div>
    </div>
  );
}