'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { createClient } from '@/utils/supabase/client';
import { useWorkspaceStore } from '@/store/useWorkspaceStore';
import Input from '../ui/Input';
import Button from '../ui/Button';

const addWorkspaceSchema = z.object({
  workspaceName: z.string().min(2, 'Workspace name must be at least 2 characters'),
  productUrl: z
    .string()
    .min(1, 'Product URL is required')
    .url('Invalid URL. Make sure it starts with http:// or https://'),
  productDescription: z.string().optional(),
});

type AddWorkspaceFormInput = z.infer<typeof addWorkspaceSchema>;

interface AddWorkspaceModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function AddWorkspaceModal({ isOpen, onClose }: AddWorkspaceModalProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const supabase = createClient();
  const addWorkspace = useWorkspaceStore((state) => state.addWorkspace);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<AddWorkspaceFormInput>({
    resolver: zodResolver(addWorkspaceSchema),
    defaultValues: {
      workspaceName: '',
      productUrl: '',
      productDescription: '',
    },
  });

  // Reset form when modal opens/closes
  useEffect(() => {
    if (isOpen) {
      reset({
        workspaceName: '',
        productUrl: '',
        productDescription: '',
      });
      setError(null);
    }
  }, [isOpen, reset]);

  // Handle Escape key to close modal
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !isLoading) {
        onClose();
      }
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose, isLoading]);

  if (!isOpen) return null;

  const onSubmit = async (data: AddWorkspaceFormInput) => {
    setIsLoading(true);
    setError(null);

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        throw new Error('You must be logged in to create a workspace.');
      }

      const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8000';
      const response = await fetch(`${backendUrl}/api/onboard`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          profile_id: user.id,
          workspace_name: data.workspaceName,
          website_url: data.productUrl,
          product_description: data.productDescription,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail || 'Failed to create workspace.');
      }

      const responseData = await response.json();
      const workspaceId = responseData.workspace_id;

      // Add to store and select
      addWorkspace({
        id: workspaceId,
        name: data.workspaceName,
        website_url: data.productUrl,
      });

      onClose();
      router.push('/');
      router.refresh();
    } catch (err: any) {
      setError(err?.message || 'An unexpected error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      {/* Backdrop Overlay */}
      <div 
        onClick={isLoading ? undefined : onClose}
        className="fixed inset-0 bg-black/60 backdrop-blur-md z-[100] transition-opacity duration-300"
      />

      {/* Modal Container */}
      <div className="fixed inset-0 flex items-center justify-center p-4 z-[101] pointer-events-none">
        {/* Modal Card */}
        <div className="w-full max-w-[500px] bg-glass rounded-xl border border-primary-container/10 amber-glow p-6 sm:p-8 relative overflow-hidden pointer-events-auto transform transition-all duration-300 animate-fade-in flex flex-col gap-6">
          {/* Accent top line */}
          <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-secondary-container to-primary-container opacity-50" />

          {/* Header */}
          <div className="flex justify-between items-start">
            <div>
              <h2 className="font-headline-md text-headline-md text-on-surface">New Workspace</h2>
              <p className="font-body-md text-sm text-on-surface-variant mt-1">
                Create a new workspace and analyze your brand.
              </p>
            </div>
            <button
              onClick={onClose}
              disabled={isLoading}
              className="text-on-surface-variant/50 hover:text-on-background transition-colors p-1 rounded-full hover:bg-surface-container focus:outline-none cursor-pointer border-none bg-transparent flex items-center justify-center disabled:opacity-30 disabled:pointer-events-none"
            >
              <span className="material-symbols-outlined text-[20px]">close</span>
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5" noValidate>
            {error && (
              <div className="bg-error-container text-on-error-container text-body-md p-3 rounded-lg border border-error/10 flex items-center gap-2">
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
                Product Description (Optional)
              </label>
              <div className="relative input-focus-glow rounded-lg transition-shadow duration-200">
                <span className="material-symbols-outlined absolute left-3 top-3 text-on-surface-variant/50 pointer-events-none select-none">
                  description
                </span>
                <textarea
                  id="productDescription"
                  className={`w-full bg-surface-container-lowest border ${
                    errors.productDescription ? 'border-error' : 'border-primary-container/15'
                  } rounded-lg py-2.5 pl-10 pr-3 font-body-md text-body-md text-on-background placeholder:text-on-surface-variant/40 focus:border-primary-container focus:ring-4 focus:ring-primary-container/20 transition-all outline-none min-h-[100px] resize-none`}
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

            {/* Actions */}
            <div className="flex gap-3 mt-2">
              <Button
                type="button"
                variant="secondary"
                onClick={onClose}
                disabled={isLoading}
                className="mt-0 cursor-pointer"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                isLoading={isLoading}
                className="mt-0 cursor-pointer"
              >
                Create Workspace
              </Button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}

export default AddWorkspaceModal;
