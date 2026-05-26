'use client';

import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { createClient } from '@/utils/supabase/client';
import { useWorkspaceStore } from '@/store/useWorkspaceStore';
import Input from '../ui/Input';
import Button from '../ui/Button';

const createCampaignSchema = z
  .object({
    name: z.string().min(2, 'Campaign name must be at least 2 characters'),
    targetedPlatforms: z
      .array(z.enum(['instagram', 'tiktok', 'linkedin']))
      .min(1, 'Select at least one targeted platform'),
    purpose: z.string().min(1, 'Select a campaign purpose'),
    customPurpose: z.string().optional(),
  })
  .refine(
    (data) => {
      if (data.purpose === 'Other') {
        return !!data.customPurpose && data.customPurpose.trim().length > 0;
      }
      return true;
    },
    {
      message: 'Custom purpose is required when "Other" is selected',
      path: ['customPurpose'],
    }
  );

type CreateCampaignFormInput = z.infer<typeof createCampaignSchema>;

interface CreateCampaignModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const PLATFORMS: { label: string; value: 'instagram' | 'tiktok' | 'linkedin'; icon: string }[] = [
  { label: 'Instagram', value: 'instagram', icon: 'photo_camera' },
  { label: 'TikTok', value: 'tiktok', icon: 'play_circle' },
  { label: 'LinkedIn', value: 'linkedin', icon: 'group' },
];

const PURPOSES = ['Performance', 'Conversion', 'Awareness', 'Engagement', 'Other'];

export function CreateCampaignModal({ isOpen, onClose, onSuccess }: CreateCampaignModalProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);
  const [error, setError] = useState<string | null>(null);
  const activeWorkspaceId = useWorkspaceStore((state) => state.activeWorkspaceId);
  const supabase = createClient();

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<CreateCampaignFormInput>({
    resolver: zodResolver(createCampaignSchema),
    defaultValues: {
      name: '',
      targetedPlatforms: [],
      purpose: '',
      customPurpose: '',
    },
  });

  const selectedPlatforms = watch('targetedPlatforms') || [];
  const selectedPurpose = watch('purpose') || '';

  // Reset form state on close/open
  useEffect(() => {
    if (isOpen) {
      reset({
        name: '',
        targetedPlatforms: [],
        purpose: '',
        customPurpose: '',
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

  if (!isOpen || !mounted) return null;

  const togglePlatform = (value: 'instagram' | 'tiktok' | 'linkedin') => {
    const current = [...selectedPlatforms];
    const index = current.indexOf(value);
    if (index > -1) {
      current.splice(index, 1);
    } else {
      current.push(value);
    }
    setValue('targetedPlatforms', current, { shouldValidate: true });
  };

  const selectPurpose = (value: string) => {
    setValue('purpose', value, { shouldValidate: true });
    if (value !== 'Other') {
      setValue('customPurpose', '');
    }
  };

  const onSubmit = async (data: CreateCampaignFormInput) => {
    if (!activeWorkspaceId) {
      setError('No active workspace selected.');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const finalPurpose = data.purpose === 'Other' ? data.customPurpose?.trim() : data.purpose;

      const { error: insertError } = await supabase.from('campaign').insert({
        workspace_id: activeWorkspaceId,
        name: data.name.trim(),
        targeted_platform: data.targetedPlatforms,
        purpose: finalPurpose || null,
      });

      if (insertError) {
        throw new Error(insertError.message);
      }

      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err?.message || 'Failed to create campaign. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return createPortal(
    <>
      {/* Backdrop */}
      <div
        onClick={isLoading ? undefined : onClose}
        className="fixed inset-0 bg-black/60 backdrop-blur-md z-[100] transition-opacity duration-300"
      />

      {/* Container */}
      <div className="fixed inset-0 flex items-center justify-center p-4 z-[101] pointer-events-none">
        {/* Modal Card */}
        <div className="w-full max-w-[500px] bg-glass rounded-xl border border-primary-container/10 amber-glow p-6 sm:p-8 relative overflow-hidden pointer-events-auto transform transition-all duration-300 animate-fade-in flex flex-col gap-6 max-h-screen overflow-y-auto">
          {/* Accent top line */}
          <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-secondary-container to-primary-container opacity-50" />

          {/* Header */}
          <div className="flex justify-between items-start">
            <div>
              <h2 className="font-headline-md text-headline-md text-on-surface">New Campaign</h2>
              <p className="font-body-md text-sm text-on-surface-variant mt-1">
                Configure a new multi-channel marketing campaign.
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

            {/* Campaign Name */}
            <Input
              label="Campaign Name"
              icon="campaign"
              id="name"
              type="text"
              placeholder="e.g. Q4 Alpha Launch"
              error={errors.name?.message}
              {...register('name')}
            />

            {/* Targeted Platforms (Pill checkboxes - multi select) */}
            <div className="flex flex-col gap-1.5">
              <label className="font-label-sm text-label-sm text-on-surface-variant uppercase">
                Targeted Platforms
              </label>
              <div className="flex flex-wrap gap-2">
                {PLATFORMS.map((platform) => {
                  const isSelected = selectedPlatforms.includes(platform.value);
                  return (
                    <button
                      key={platform.value}
                      type="button"
                      disabled={isLoading}
                      onClick={() => togglePlatform(platform.value)}
                      className={`px-3 py-2 rounded-lg font-body-md text-sm font-medium flex items-center gap-2 cursor-pointer transition-all duration-300 border active:scale-[0.98] ${
                        isSelected
                          ? 'bg-gradient-to-br from-secondary-container to-primary-container text-white border-transparent shadow-sm'
                          : 'bg-surface-container border-primary-container/10 text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface'
                      }`}
                    >
                      <span className="material-symbols-outlined text-[18px]">{platform.icon}</span>
                      {platform.label}
                    </button>
                  );
                })}
              </div>
              {errors.targetedPlatforms?.message && (
                <span className="text-xs font-semibold text-error mt-0.5 flex items-center gap-1 select-none">
                  <span className="material-symbols-outlined text-[14px]">error</span>
                  {errors.targetedPlatforms.message}
                </span>
              )}
            </div>

            {/* Campaign Purpose (Pill radio - single select) */}
            <div className="flex flex-col gap-1.5">
              <label className="font-label-sm text-label-sm text-on-surface-variant uppercase">
                Campaign Purpose
              </label>
              <div className="flex flex-wrap gap-2">
                {PURPOSES.map((purpose) => {
                  const isSelected = selectedPurpose === purpose;
                  return (
                    <button
                      key={purpose}
                      type="button"
                      disabled={isLoading}
                      onClick={() => selectPurpose(purpose)}
                      className={`px-3.5 py-1.5 rounded-full font-body-md text-xs font-semibold cursor-pointer transition-all duration-300 border active:scale-[0.98] ${
                        isSelected
                          ? 'bg-gradient-to-br from-secondary-container to-primary-container text-white border-transparent shadow-sm'
                          : 'bg-surface-container border-primary-container/10 text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface'
                      }`}
                    >
                      {purpose}
                    </button>
                  );
                })}
              </div>
              {errors.purpose?.message && (
                <span className="text-xs font-semibold text-error mt-0.5 flex items-center gap-1 select-none">
                  <span className="material-symbols-outlined text-[14px]">error</span>
                  {errors.purpose.message}
                </span>
              )}
            </div>

            {/* Custom Purpose Input (Appears only when 'Other' purpose is selected) */}
            {selectedPurpose === 'Other' && (
              <Input
                label="Specify Custom Purpose"
                icon="sell"
                id="customPurpose"
                type="text"
                placeholder="e.g. Brand Awareness"
                error={errors.customPurpose?.message}
                {...register('customPurpose')}
              />
            )}

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
                Create Campaign
              </Button>
            </div>
          </form>
        </div>
      </div>
    </>,
    document.body
  );
}

export default CreateCampaignModal;
