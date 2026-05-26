'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { createClient } from '@/utils/supabase/client';
import Input from '../ui/Input';
import Button from '../ui/Button';

const onboardingSchema = z.object({
  workspaceName: z.string().min(2, 'Workspace name must be at least 2 characters'),
  productUrl: z
    .string()
    .min(1, 'Product URL is required')
    .url('Invalid URL. Make sure it starts with http:// or https://'),
  productDescription: z.string().optional(),
});

type OnboardingFormInput = z.infer<typeof onboardingSchema>;

interface OnboardingFormProps {
  userId: string;
}

export function OnboardingForm({ userId }: OnboardingFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const supabase = createClient();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<OnboardingFormInput>({
    resolver: zodResolver(onboardingSchema),
    defaultValues: {
      workspaceName: '',
      productUrl: '',
      productDescription: '',
    },
  });

  const onSubmit = async (data: OnboardingFormInput) => {
    setIsLoading(true);
    setError(null);

    try {
      const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8000';
      const response = await fetch(`${backendUrl}/api/onboard`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          profile_id: userId,
          workspace_name: data.workspaceName,
          website_url: data.productUrl,
          product_description: data.productDescription,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail || 'Failed to complete onboarding on the backend.');
      }

      // Navigate back to dashboard (root route)
      router.push('/');
      router.refresh();
    } catch (err: any) {
      setError(err?.message || 'An unexpected error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full bg-surface-container-lowest/80 backdrop-blur-[20px] backdrop-saturate-[1.8] border border-primary-container/10 p-8 rounded-xl amber-glow animate-fade-in">
      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-6" noValidate>
        {error && (
          <div className="bg-error-container text-on-error-container text-body-md p-3.5 rounded-lg border border-error/10 flex items-center gap-2.5">
            <span className="material-symbols-outlined text-error text-[20px]">error</span>
            <span className="text-sm font-medium">{error}</span>
          </div>
        )}

        <Input
          label="Workspace Name"
          icon="business"
          id="workspaceName"
          type="text"
          placeholder="Acme Corp"
          error={errors.workspaceName?.message}
          {...register('workspaceName')}
        />

        <Input
          label="Product URL"
          icon="language"
          id="productUrl"
          type="url"
          placeholder="https://yourcompany.com"
          error={errors.productUrl?.message}
          {...register('productUrl')}
        />

        <div className="flex flex-col gap-1.5">
          <label className="font-label-sm text-label-sm text-on-surface-variant uppercase" htmlFor="productDescription">
            Tell us more about your product (Optional)
          </label>
          <div className="relative input-focus-glow rounded-lg transition-shadow duration-200">
            <span className="material-symbols-outlined absolute left-3 top-3 text-on-surface-variant/50 pointer-events-none select-none">
              description
            </span>
            <textarea
              id="productDescription"
              className={`w-full bg-surface-container-lowest border ${
                errors.productDescription ? 'border-error' : 'border-primary-container/15'
              } rounded-lg py-2.5 pl-10 pr-3 font-body-md text-body-md text-on-background placeholder:text-on-surface-variant/40 focus:border-primary-container focus:ring-4 focus:ring-primary-container/20 transition-all outline-none min-h-[120px] resize-none`}
              placeholder="Describe your target audience, core features, or brand voice..."
              {...register('productDescription')}
            />
          </div>
          {errors.productDescription?.message && (
            <span className="text-xs font-semibold text-error mt-0.5 flex items-center gap-1 select-none">
              <span className="material-symbols-outlined text-[14px]">error</span>
              {errors.productDescription.message}
            </span>
          )}
        </div>

        <Button
          type="submit"
          isLoading={isLoading}
          className="w-full bg-gradient-to-br from-secondary-container to-primary-container text-on-primary font-semibold py-4 rounded-lg transform hover:-translate-y-0.5 active:scale-[0.98] transition-all duration-200 flex items-center justify-center gap-2 group cursor-pointer border-none"
        >
          Continue
          {!isLoading && (
            <span className="material-symbols-outlined group-hover:translate-x-1 transition-transform">
              arrow_forward
            </span>
          )}
        </Button>
      </form>
    </div>
  );
}

export default OnboardingForm;
