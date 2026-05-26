'use client';

import React from 'react';
import CampaignCard, { Campaign } from './CampaignCard';

interface CampaignListProps {
  campaigns: Campaign[];
  searchQuery: string;
  onEdit: (campaign: Campaign) => void;
  onDelete: (campaign: Campaign) => void;
}

export function CampaignList({ campaigns, searchQuery, onEdit, onDelete }: CampaignListProps) {
  // Filter campaigns based on search query
  const filteredCampaigns = campaigns.filter((campaign) =>
    campaign.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (campaigns.length === 0) {
    return (
      <div className="w-full bg-glass rounded-xl border border-primary-container/10 amber-glow p-8 md:p-12 text-center flex flex-col items-center gap-6">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-xl bg-surface-container-lowest border border-primary-container/20 amber-glow">
          <span className="material-symbols-outlined text-[36px] text-primary select-none">campaign</span>
        </div>
        <div className="space-y-2">
          <h3 className="font-headline-md text-headline-md text-on-surface">No active campaigns</h3>
          <p className="font-body-md text-body-md text-on-surface-variant max-w-[400px] mx-auto">
            Create your first multi-channel campaign to start reaching your customer personas automatically.
          </p>
        </div>
      </div>
    );
  }

  if (filteredCampaigns.length === 0) {
    return (
      <div className="w-full bg-glass rounded-xl border border-primary-container/10 amber-glow p-8 md:p-12 text-center flex flex-col items-center gap-6">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-xl bg-surface-container-lowest border border-primary-container/20 amber-glow">
          <span className="material-symbols-outlined text-[36px] text-primary select-none">search_off</span>
        </div>
        <div className="space-y-2">
          <h3 className="font-headline-md text-headline-md text-on-surface">No campaigns match search</h3>
          <p className="font-body-md text-body-md text-on-surface-variant max-w-[400px] mx-auto">
            We couldn&apos;t find any campaigns matching &quot;{searchQuery}&quot;. Try editing your query.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {filteredCampaigns.map((campaign) => (
        <CampaignCard
          key={campaign.id}
          campaign={campaign}
          onEdit={onEdit}
          onDelete={onDelete}
        />
      ))}
      <div className="mt-8 text-center select-none">
        <p className="font-body-md text-body-md text-on-surface-variant/60">
          Showing {filteredCampaigns.length} of {campaigns.length} campaigns
        </p>
      </div>
    </div>
  );
}

export default CampaignList;
