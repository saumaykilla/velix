'use client';

import React from 'react';

export interface Campaign {
  id: string;
  name: string;
  purpose: string | null;
  targeted_platform: string[];
  created_at: string;
  assetsCount?: number;
}

interface CampaignCardProps {
  campaign: Campaign;
  onEdit: (campaign: Campaign) => void;
  onDelete: (campaign: Campaign) => void;
}

const getPlatformIcon = (platform: string) => {
  switch (platform.toLowerCase()) {
    case 'instagram':
      return 'photo_camera';
    case 'tiktok':
      return 'play_circle';
    case 'linkedin':
      return 'group';
    default:
      return 'sell';
  }
};

const formatDate = (dateString: string) => {
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  } catch (e) {
    return 'N/A';
  }
};

export function CampaignCard({ campaign, onEdit, onDelete }: CampaignCardProps) {
  const assetsCount = campaign.assetsCount || 0;

  return (
    <div className="glass-panel border border-primary-container/10 rounded-xl p-6 glow-shadow table-row-hover transition-all duration-300 bg-white dark:bg-surface-container-lowest/30">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 md:gap-8">
        {/* Left Side: Icon, Name, Date, Purpose */}
        <div className="flex items-center gap-4 flex-1 min-w-0">
          <div className="w-12 h-12 rounded-lg bg-primary-container/10 flex items-center justify-center shrink-0">
            <span className="material-symbols-outlined text-primary-container text-2xl select-none">
              campaign
            </span>
          </div>
          <div className="min-w-0">
            <h3 className="font-headline-md text-headline-md text-on-background truncate">
              {campaign.name}
            </h3>
            <div className="flex flex-wrap items-center gap-2 mt-1.5">
              <span className="font-label-sm text-label-sm text-on-surface-variant flex items-center gap-1">
                <span className="material-symbols-outlined text-[14px]">calendar_today</span>
                Created {formatDate(campaign.created_at)}
              </span>
              {campaign.purpose && (
                <>
                  <span className="w-1 h-1 rounded-full bg-tertiary-container shrink-0"></span>
                  <span className="font-label-sm text-label-sm text-on-surface-variant flex items-center gap-1">
                    <span className="material-symbols-outlined text-[14px]">sell</span>
                    {campaign.purpose}
                  </span>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Right Side: Platform pills, Asset count, Actions */}
        <div className="flex flex-wrap items-center gap-6 md:gap-10 w-full md:w-auto justify-between md:justify-end border-t border-primary-container/5 md:border-t-0 pt-4 md:pt-0">
          {/* Platforms */}
          <div className="flex items-center gap-1.5">
            {campaign.targeted_platform.map((platform) => (
              <span
                key={platform}
                title={platform}
                className="px-2 py-0.5 rounded bg-primary/10 text-primary text-[10px] uppercase font-bold tracking-wider flex items-center gap-1 select-none border border-primary-container/5"
              >
                <span className="material-symbols-outlined text-[12px]">{getPlatformIcon(platform)}</span>
                {platform}
              </span>
            ))}
          </div>

          {/* Assets Count */}
          <div className="flex flex-col md:items-end">
            <span className="font-label-sm text-[10px] uppercase text-tertiary-container tracking-wider mb-1">
              Assets
            </span>
            <span className={`font-headline-md text-[16px] font-semibold ${assetsCount > 0 ? 'text-on-background' : 'text-on-surface-variant/40'}`}>
              {assetsCount}
            </span>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => onEdit(campaign)}
              className="p-2 rounded-lg hover:bg-primary-container/5 text-on-surface-variant hover:text-primary-container transition-colors group cursor-pointer border-none bg-transparent"
              title="Edit"
            >
              <span className="material-symbols-outlined text-xl group-hover:scale-110 transition-transform">
                edit
              </span>
            </button>
            <button
              onClick={() => onDelete(campaign)}
              className="p-2 rounded-lg hover:bg-error-container/50 text-on-surface-variant hover:text-error transition-colors group cursor-pointer border-none bg-transparent"
              title="Delete"
            >
              <span className="material-symbols-outlined text-xl group-hover:scale-110 transition-transform">
                delete
              </span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default CampaignCard;
