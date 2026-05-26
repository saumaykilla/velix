'use client';

import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { createClient } from '@/utils/supabase/client';
import { useWorkspaceStore } from '@/store/useWorkspaceStore';

interface BrandColors {
  primary?: string;
  secondary?: string;
  background?: string;
  surface?: string;
}

interface Competitor {
  name?: string;
  website?: string;
  strength?: string;
  weakness?: string;
}

interface BrandData {
  id: string;
  workspace_id: string;
  core_mission: string | null;
  target_audience: string | null;
  personality_traits: string[] | null;
  brand_colors: BrandColors | null;
  competitor: Competitor | null;
}

export function BrandProfile() {
  const supabase = createClient();
  const activeWorkspace = useWorkspaceStore((state) => state.activeWorkspace);
  const activeWorkspaceId = useWorkspaceStore((state) => state.activeWorkspaceId);
  const [copiedColor, setCopiedColor] = useState<string | null>(null);

  const { data: brand, isLoading, error } = useQuery<BrandData | null>({
    queryKey: ['brand', activeWorkspaceId],
    queryFn: async () => {
      if (!activeWorkspaceId) return null;
      const { data, error } = await supabase
        .from('brand')
        .select('*')
        .eq('workspace_id', activeWorkspaceId)
        .maybeSingle();

      if (error) {
        console.error('Error fetching brand:', error);
        throw error;
      }
      return data as BrandData | null;
    },
    enabled: !!activeWorkspaceId,
  });

  const handleCopyColor = (colorHex: string, label: string) => {
    navigator.clipboard.writeText(colorHex);
    setCopiedColor(label);
    setTimeout(() => setCopiedColor(null), 2000);
  };

  if (!activeWorkspaceId) {
    return (
      <div className="w-full h-[50vh] flex items-center justify-center">
        <div className="text-center space-y-2">
          <p className="text-on-surface-variant font-body-md">No active workspace selected.</p>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="space-y-8 animate-pulse">
        {/* Skeleton Bento Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <div className="h-[180px] bg-glass border border-primary-container/10 rounded-xl" />
            <div className="h-[180px] bg-glass border border-primary-container/10 rounded-xl" />
            <div className="h-[220px] bg-glass border border-primary-container/10 rounded-xl" />
          </div>
          <div className="space-y-6">
            <div className="h-[320px] bg-glass border border-primary-container/10 rounded-xl" />
            <div className="h-[200px] bg-glass border border-primary-container/10 rounded-xl" />
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full bg-error-container/20 border border-error/15 rounded-xl p-8 text-center space-y-4">
        <div className="w-12 h-12 rounded-full bg-error/10 flex items-center justify-center mx-auto text-error">
          <span className="material-symbols-outlined text-[28px]">error</span>
        </div>
        <div className="space-y-1">
          <h3 className="font-headline-md text-headline-md text-on-surface">Failed to load brand memory</h3>
          <p className="text-on-surface-variant text-sm">
            {(error as any)?.message || 'An error occurred while fetching your brand profile.'}
          </p>
        </div>
      </div>
    );
  }

  if (!brand) {
    return (
      <div className="w-full bg-glass rounded-xl border border-primary-container/10 amber-glow p-12 text-center flex flex-col items-center gap-6">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-xl bg-surface-container-lowest border border-primary-container/20 amber-glow">
          <span className="material-symbols-outlined text-[36px] text-primary select-none">auto_awesome</span>
        </div>
        <div className="space-y-2">
          <h3 className="font-headline-md text-headline-md text-on-surface">Brand memory is empty</h3>
          <p className="font-body-md text-body-md text-on-surface-variant max-w-[420px] mx-auto">
            Please run the onboarding process for <strong>{activeWorkspace?.name}</strong> to generate your brand mission, color palette, and competitive analysis.
          </p>
        </div>
        <a
          href="/onboarding"
          className="py-3 px-6 rounded-lg bg-gradient-to-br from-secondary-container to-primary-container text-white font-label-md text-label-md shadow-[0_12px_24px_-8px_rgba(249,115,22,0.3)] hover:shadow-[0_12px_24px_-4px_rgba(249,115,22,0.4)] transition-all duration-200"
        >
          Begin Onboarding
        </a>
      </div>
    );
  }

  const { core_mission, target_audience, personality_traits, brand_colors, competitor } = brand;

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Bento Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Core Brand Data (Spans 2 columns) */}
        <div className="lg:col-span-2 space-y-6">
          {/* Core Mission */}
          {core_mission && (
            <div className="bg-glass border border-primary-container/10 rounded-xl p-6 md:p-8 shadow-[0_20px_40px_-15px_rgba(0,0,0,0.1)] relative group overflow-hidden">
              <div className="absolute -right-6 -bottom-6 w-24 h-24 bg-primary/5 rounded-full blur-xl group-hover:bg-primary/10 transition-all duration-300" />
              <div className="flex items-center gap-3 mb-4">
                <span className="material-symbols-outlined text-primary text-[24px]">explore</span>
                <h3 className="font-headline-md text-headline-md text-on-surface">Core Mission</h3>
              </div>
              <p className="font-body-lg text-body-lg text-on-background leading-relaxed whitespace-pre-wrap">
                {core_mission}
              </p>
            </div>
          )}

          {/* Target Audience */}
          {target_audience && (
            <div className="bg-glass border border-primary-container/10 rounded-xl p-6 md:p-8 shadow-[0_20px_40px_-15px_rgba(0,0,0,0.1)] relative group overflow-hidden">
              <div className="absolute -right-6 -bottom-6 w-24 h-24 bg-secondary/5 rounded-full blur-xl group-hover:bg-secondary/10 transition-all duration-300" />
              <div className="flex items-center gap-3 mb-4">
                <span className="material-symbols-outlined text-secondary text-[24px]">groups</span>
                <h3 className="font-headline-md text-headline-md text-on-surface">Target Audience</h3>
              </div>
              <p className="font-body-md text-body-md text-on-surface-variant leading-relaxed whitespace-pre-wrap">
                {target_audience}
              </p>
            </div>
          )}

          {/* Competitor Analysis */}
          {competitor && (competitor.name || competitor.website) && (
            <div className="bg-glass border border-primary-container/10 rounded-xl p-6 md:p-8 shadow-[0_20px_40px_-15px_rgba(0,0,0,0.1)]">
              <div className="flex items-center gap-3 mb-6">
                <span className="material-symbols-outlined text-primary text-[24px]">query_stats</span>
                <h3 className="font-headline-md text-headline-md text-on-surface">Competitor Analysis</h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Competitor Profile */}
                <div className="space-y-4">
                  <div>
                    <h4 className="text-xs font-bold uppercase tracking-wider text-on-surface-variant">Competitor</h4>
                    <p className="font-headline-sm text-headline-sm text-on-surface mt-1">{competitor.name || 'N/A'}</p>
                    {competitor.website && (
                      <a
                        href={competitor.website.startsWith('http') ? competitor.website : `https://${competitor.website}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 text-xs text-primary font-semibold hover:underline mt-1.5"
                      >
                        {competitor.website}
                        <span className="material-symbols-outlined text-[14px]">open_in_new</span>
                      </a>
                    )}
                  </div>
                </div>

                {/* Strengths & Weaknesses */}
                <div className="space-y-4">
                  {competitor.strength && (
                    <div className="p-4 rounded-lg bg-green-500/10 border border-green-500/20">
                      <div className="flex items-center gap-2 mb-1.5 text-green-400">
                        <span className="material-symbols-outlined text-[18px]">verified</span>
                        <span className="text-xs font-bold uppercase tracking-wider">Key Strength</span>
                      </div>
                      <p className="text-sm text-on-surface-variant leading-relaxed">{competitor.strength}</p>
                    </div>
                  )}
                  {competitor.weakness && (
                    <div className="p-4 rounded-lg bg-red-500/10 border border-red-500/20">
                      <div className="flex items-center gap-2 mb-1.5 text-red-400">
                        <span className="material-symbols-outlined text-[18px]">gpp_maybe</span>
                        <span className="text-xs font-bold uppercase tracking-wider">Key Weakness</span>
                      </div>
                      <p className="text-sm text-on-surface-variant leading-relaxed">{competitor.weakness}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Right Column: Visual and Brand Personality Details (Spans 1 column) */}
        <div className="space-y-6">
          {/* Brand Colors */}
          {brand_colors && (
            <div className="bg-glass border border-primary-container/10 rounded-xl p-6 shadow-[0_20px_40px_-15px_rgba(0,0,0,0.1)]">
              <div className="flex items-center gap-3 mb-6">
                <span className="material-symbols-outlined text-primary text-[24px]">palette</span>
                <h3 className="font-headline-md text-headline-md text-on-surface">Brand Colors</h3>
              </div>

              <div className="space-y-4">
                {Object.entries({
                  Primary: brand_colors.primary,
                  Secondary: brand_colors.secondary,
                  Background: brand_colors.background,
                  Surface: brand_colors.surface,
                }).map(([label, colorHex]) => {
                  if (!colorHex) return null;
                  const isCopied = copiedColor === label;
                  return (
                    <div
                      key={label}
                      onClick={() => handleCopyColor(colorHex, label)}
                      className="flex items-center justify-between p-3 rounded-lg border border-primary-container/5 bg-surface-container-lowest/30 hover:bg-surface-container-lowest/80 cursor-pointer transition-all duration-200 group"
                    >
                      <div className="flex items-center gap-3">
                        <div
                          style={{ backgroundColor: colorHex }}
                          className="w-10 h-10 rounded-lg border border-primary-container/15 shadow-inner animate-fade-in"
                        />
                        <div>
                          <p className="text-xs font-semibold uppercase tracking-wider text-on-surface-variant">
                            {label}
                          </p>
                          <p className="text-sm font-bold text-on-surface font-mono mt-0.5">
                            {colorHex}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-1">
                        <span className="text-[11px] font-semibold text-primary/70 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                          {isCopied ? 'Copied!' : 'Copy'}
                        </span>
                        <span className="material-symbols-outlined text-[16px] text-on-surface-variant/40 group-hover:text-primary transition-colors">
                          {isCopied ? 'check' : 'content_copy'}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Personality Traits */}
          {personality_traits && personality_traits.length > 0 && (
            <div className="bg-glass border border-primary-container/10 rounded-xl p-6 shadow-[0_20px_40px_-15px_rgba(0,0,0,0.1)]">
              <div className="flex items-center gap-3 mb-6">
                <span className="material-symbols-outlined text-primary text-[24px]">psychology</span>
                <h3 className="font-headline-md text-headline-md text-on-surface">Personality</h3>
              </div>

              <div className="flex flex-wrap gap-2.5">
                {personality_traits.map((trait, index) => (
                  <span
                    key={index}
                    className="py-1.5 px-3 rounded-full text-xs font-semibold bg-primary/10 text-primary border border-primary/20 capitalize tracking-wide shadow-sm hover:scale-[1.03] transition-transform duration-200 select-none"
                  >
                    {trait}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
