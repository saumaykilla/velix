'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { createClient } from '@/utils/supabase/client';
import Input from '../ui/Input';
import Button from '../ui/Button';

const signupSchema = z.object({
  fullName: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().min(1, 'Email is required').email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  confirmPassword: z.string().min(6, 'Confirm password must be at least 6 characters'),
  terms: z.boolean().refine((val) => val === true, 'You must agree to the Terms of Service and Privacy Policy'),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ['confirmPassword'],
});

type SignupSchemaInput = z.infer<typeof signupSchema>;

export function SignupForm() {
  const [submittedEmail, setSubmittedEmail] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SignupSchemaInput>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      fullName: '',
      email: '',
      password: '',
      confirmPassword: '',
      terms: false,
    },
  });

  const onSubmit = async (data: SignupSchemaInput) => {
    setIsLoading(true);
    setError(null);
    setSuccess(false);

    try {
      const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
        email: data.email,
        password: data.password,
        options: {
          data: {
            full_name: data.fullName,
          },
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      });

      if (signUpError) {
        setError(signUpError.message);
      } else {
        if (signUpData.session) {
          router.push('/');
          router.refresh();
        } else {
          setSubmittedEmail(data.email);
          setSuccess(true);
        }
      }
    } catch (err) {
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  if (success) {
    return (
      <div className="bg-surface-container border border-primary-container/10 p-6 rounded-lg text-center flex flex-col items-center gap-4">
        <span className="material-symbols-outlined text-primary text-[48px] animate-pulse">mark_email_read</span>
        <h3 className="font-headline-md text-headline-md text-on-background">Check your email</h3>
        <p className="font-body-md text-body-md text-on-surface-variant text-sm">
          We have sent a verification link to <strong className="text-on-background">{submittedEmail}</strong>. Please check your inbox to activate your account.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-[24px]" noValidate>
      {error && (
        <div className="bg-error-container text-on-error-container text-body-md p-3.5 rounded-lg border border-error/10 flex items-center gap-2.5">
          <span className="material-symbols-outlined text-error text-[20px]">error</span>
          <span className="text-sm font-medium">{error}</span>
        </div>
      )}

      <Input
        label="Full Name"
        icon="person"
        id="fullName"
        type="text"
        placeholder="Alex Morgan"
        error={errors.fullName?.message}
        {...register('fullName')}
      />

      <Input
        label="Work Email"
        icon="mail"
        id="email"
        type="email"
        placeholder="alex@company.com"
        error={errors.email?.message}
        {...register('email')}
      />

      <Input
        label="Password"
        icon="lock"
        id="password"
        type={showPassword ? 'text' : 'password'}
        placeholder="••••••••"
        error={errors.password?.message}
        {...register('password')}
        rightElement={
          <button
            className="text-on-surface-variant/50 hover:text-primary transition-colors focus:outline-none"
            type="button"
            onClick={() => setShowPassword(!showPassword)}
          >
            <span className="material-symbols-outlined select-none">
              {showPassword ? 'visibility_off' : 'visibility'}
            </span>
          </button>
        }
      />

      <Input
        label="Confirm Password"
        icon="lock"
        id="confirmPassword"
        type="password"
        placeholder="••••••••"
        error={errors.confirmPassword?.message}
        {...register('confirmPassword')}
      />

      <div className="flex flex-col gap-1.5 mt-[16px]">
        <div className="flex items-start">
          <div className="flex items-center h-5">
            <input
              id="terms"
              type="checkbox"
              {...register('terms')}
              className="w-4 h-4 rounded border-primary-container/20 text-primary-container focus:ring-primary-container focus:ring-offset-surface-container-lowest bg-surface-container-lowest cursor-pointer"
            />
          </div>
          <div className="ml-3 text-sm">
            <label htmlFor="terms" className="font-body-md text-body-md text-on-surface-variant text-[14px]">
              I agree to the{' '}
              <a className="text-primary hover:underline" href="#">
                Terms of Service
              </a>{' '}
              and{' '}
              <a className="text-primary hover:underline" href="#">
                Privacy Policy
              </a>
              .
            </label>
          </div>
        </div>
        {errors.terms?.message && (
          <span className="text-xs font-semibold text-error mt-0.5 flex items-center gap-1 select-none">
            <span className="material-symbols-outlined text-[14px]">error</span>
            {errors.terms.message}
          </span>
        )}
      </div>

      <Button type="submit" isLoading={isLoading} className="w-full mt-[32px]">
        Create Account
        {!isLoading && <span className="material-symbols-outlined text-[20px]">arrow_forward</span>}
      </Button>
    </form>
  );
}

export default SignupForm;
