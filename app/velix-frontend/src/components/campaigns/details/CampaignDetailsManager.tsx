'use client';

import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { createClient } from '@/utils/supabase/client';
import CampaignDetailsHeader from './CampaignDetailsHeader';
import StrategySection from './StrategySection';
import AssetsSection, { Asset } from './AssetsSection';
import PersonaSection, { Persona } from './PersonaSection';
import Button from '../../ui/Button';
import { useWorkspaceStore } from '@/store/useWorkspaceStore';

interface CampaignDetailsManagerProps {
  campaignId: string;
}

export function CampaignDetailsManager({ campaignId }: CampaignDetailsManagerProps) {
  const supabase = createClient();
  const activeWorkspaceId = useWorkspaceStore((state) => state.activeWorkspaceId);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationError, setGenerationError] = useState<string | null>(null);

  // 1. Fetch Campaign Info
  const {
    data: campaign,
    isLoading: isCampaignLoading,
    error: campaignError,
    refetch: refetchCampaign,
  } = useQuery({
    queryKey: ['campaign-detail', campaignId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('campaign')
        .select('*')
        .eq('id', campaignId)
        .single();

      if (error) {
        console.error('Error fetching campaign detail:', error);
        throw error;
      }
      return data;
    },
  });

  // 2. Fetch Campaign Strategy
  const {
    data: strategy,
    isLoading: isStrategyLoading,
    refetch: refetchStrategy,
  } = useQuery({
    queryKey: ['campaign-strategy', campaignId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('strategy')
        .select('*')
        .eq('campaign_id', campaignId)
        .maybeSingle();

      if (error) {
        console.error('Error fetching campaign strategy:', error);
        throw error;
      }
      return data;
    },
    enabled: !!campaign,
  });

  // 3. Fetch Campaign Personas
  const {
    data: personas = [],
    isLoading: isPersonasLoading,
    refetch: refetchPersonas,
  } = useQuery<Persona[]>({
    queryKey: ['campaign-personas', campaignId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('persona')
        .select('*')
        .eq('campaign_id', campaignId);

      if (error) {
        console.error('Error fetching campaign personas:', error);
        throw error;
      }
      return data || [];
    },
    enabled: !!campaign,
  });

  // 4. Fetch Campaign Assets
  const {
    data: assets = [],
    isLoading: isAssetsLoading,
    refetch: refetchAssets,
  } = useQuery<Asset[]>({
    queryKey: ['campaign-assets', campaignId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('asset')
        .select('*')
        .eq('campaign_id', campaignId)
        .eq('is_deleted', false);

      if (error) {
        console.error('Error fetching campaign assets:', error);
        throw error;
      }
      return data || [];
    },
    enabled: !!campaign,
  });

  const handleAssetGenerate = async (platform: string) => {
    if (!activeWorkspaceId) {
      setGenerationError('No active workspace selected.');
      return;
    }

    setIsGenerating(true);
    setGenerationError(null);

    try {
      const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8000';
      const response = await fetch(`${backendUrl}/api/campaigns/${campaignId}/generate-asset`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          workspace_id: activeWorkspaceId,
          platform: platform.toLowerCase(),
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail || `Failed to generate image for ${platform}`);
      }

      // Refresh assets list
      refetchAssets();
    } catch (err: any) {
      console.error('Error generating asset:', err);
      setGenerationError(err.message || 'Failed to generate asset. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  const isLoading =
    isCampaignLoading || isStrategyLoading || isPersonasLoading || isAssetsLoading;

  if (isLoading) {
    return (
      <div className="max-w-[1200px] mx-auto space-y-12 select-none">
        {/* Header Skeleton */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 animate-pulse">
          <div className="flex items-center gap-6">
            <div className="w-12 h-12 rounded-full bg-surface-container-high" />
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-16 h-6 rounded bg-surface-container-high" />
                <div className="w-32 h-4 rounded bg-surface-container-high" />
              </div>
              <div className="w-56 h-8 rounded bg-surface-container-high" />
            </div>
          </div>
        </div>

        {/* Bento Grid Skeleton */}
        <div className="grid grid-cols-12 gap-8">
          {/* Left Column Skeleton */}
          <div className="col-span-12 lg:col-span-8 flex flex-col gap-8 animate-pulse">
            <div className="h-[280px] bg-surface-container-high/30 border border-primary/5 rounded-2xl" />
            <div className="h-[400px] bg-surface-container-high/30 border border-primary/5 rounded-2xl" />
          </div>
          {/* Right Column Skeleton */}
          <div className="col-span-12 lg:col-span-4 animate-pulse">
            <div className="h-[550px] bg-surface-container-high/30 border border-primary/5 rounded-2xl" />
          </div>
        </div>
      </div>
    );
  }

  if (campaignError || !campaign) {
    return (
      <div className="max-w-[600px] mx-auto bg-glass rounded-xl border border-error/15 p-12 text-center flex flex-col items-center gap-6 mt-12 shadow-lg">
        <span className="material-symbols-outlined text-[48px] text-error select-none">campaign_off</span>
        <div className="space-y-2">
          <h3 className="font-headline-md text-2xl font-bold text-on-surface">Campaign Not Found</h3>
          <p className="font-body-md text-on-surface-variant max-w-[400px] mx-auto leading-relaxed">
            The campaign you are trying to view does not exist or has been deleted.
          </p>
        </div>
        <Button onClick={() => window.location.assign('/campaigns')} className="mt-2">
          Back to Campaigns
        </Button>
      </div>
    );
  }

  return (
    <div className="max-w-[1200px] mx-auto">
      {/* Header */}
      <CampaignDetailsHeader
        campaignName={campaign.name}
        createdDate={campaign.created_at}
      />

      {/* Main Grid */}
      <div className="grid grid-cols-12 gap-8 items-start">
        {/* Left Column (Strategy and Assets) */}
        <div className="col-span-12 lg:col-span-8 flex flex-col gap-8">
          <StrategySection
            objective={strategy?.objective}
            kpis={strategy?.kpis}
            channels={campaign.targeted_platform}
          />
          <AssetsSection
            assets={assets}
            channels={campaign.targeted_platform}
            onGenerateMore={handleAssetGenerate}
          />
        </div>

        {/* Right Column (Target Persona Carousel) */}
        <div className="col-span-12 lg:col-span-4">
          <PersonaSection personas={personas} />
        </div>
      </div>

      {/* Generation Loader Overlay */}
      {isGenerating && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-md z-[150] flex items-center justify-center animate-fade-in">
          <div className="w-full max-w-[360px] bg-glass rounded-xl border border-primary-container/10 p-8 flex flex-col items-center gap-5 text-center shadow-lg">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            <div className="space-y-2">
              <h4 className="font-headline-md text-lg font-bold text-on-surface">Generating Image</h4>
              <p className="font-body-md text-sm text-on-surface-variant leading-relaxed">
                Our design agent is crafting a custom image using your brand colors, strategy, and audience personas...
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Generation Error Banner */}
      {generationError && (
        <div className="fixed bottom-4 right-4 bg-error-container text-on-error-container text-sm p-4 rounded-lg shadow-lg border border-error/10 flex items-center gap-2 max-w-sm z-[200]">
          <span className="material-symbols-outlined text-error">error</span>
          <span className="flex-grow">{generationError}</span>
          <button
            onClick={() => setGenerationError(null)}
            className="ml-auto text-on-error-container/60 hover:text-on-error-container p-0.5 rounded cursor-pointer border-none bg-transparent"
          >
            <span className="material-symbols-outlined text-[16px]">close</span>
          </button>
        </div>
      )}
    </div>
  );
}

export default CampaignDetailsManager;
