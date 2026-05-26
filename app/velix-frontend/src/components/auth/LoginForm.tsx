'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { createClient } from '@/utils/supabase/client';
import Input from '../ui/Input';
import Button from '../ui/Button';

const loginSchema = z.object({
  email: z.string().min(1, 'Email is required').email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

type LoginSchemaInput = z.infer<typeof loginSchema>;

export function LoginForm() {
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const supabase = createClient();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginSchemaInput>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const onSubmit = async (data: LoginSchemaInput) => {
    setIsLoading(true);
    setError(null);

    try {
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: data.email,
        password: data.password,
      });

      if (signInError) {
        setError(signInError.message);
      } else {
        router.push('/');
        router.refresh();
      }
    } catch (err) {
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5" noValidate>
      {error && (
        <div className="bg-error-container text-on-error-container text-body-md p-3.5 rounded-lg border border-error/10 flex items-center gap-2.5">
          <span className="material-symbols-outlined text-error text-[20px]">error</span>
          <span className="text-sm font-medium">{error}</span>
        </div>
      )}

      <Input
        label="Email Address"
        icon="mail"
        id="email"
        type="email"
        placeholder="name@company.com"
        error={errors.email?.message}
        {...register('email')}
      />

      <div className="flex flex-col gap-1.5">
        <div className="flex justify-between items-center">
          <label className="font-label-sm text-label-sm text-on-surface-variant uppercase" htmlFor="password">
            Password
          </label>
          <a className="font-label-sm text-label-sm text-primary hover:text-primary-container transition-colors" href="#">
            Forgot password?
          </a>
        </div>
        <Input
          icon="lock"
          id="password"
          type={showPassword ? 'text' : 'password'}
          placeholder="••••••••"
          error={errors.password?.message}
          {...register('password')}
          containerClassName="w-full"
          rightElement={
            <button
              className="text-on-surface-variant/50 hover:text-on-background transition-colors focus:outline-none"
              type="button"
              onClick={() => setShowPassword(!showPassword)}
            >
              <span className="material-symbols-outlined select-none">
                {showPassword ? 'visibility_off' : 'visibility'}
              </span>
            </button>
          }
        />
      </div>

      <Button type="submit" isLoading={isLoading} className="mt-2">
        Sign In
        {!isLoading && <span className="material-symbols-outlined text-[18px]">arrow_forward</span>}
      </Button>
    </form>
  );
}

export default LoginForm;
