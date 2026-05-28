'use client';

import React from 'react';
import { useRouter } from 'next/navigation';

interface CampaignDetailsHeaderProps {
  campaignName: string;
  createdDate: string;
}

export function CampaignDetailsHeader({
  campaignName,
  createdDate,
}: CampaignDetailsHeaderProps) {
  const router = useRouter();

  const handleBack = () => {
    router.push('/campaigns');
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

  return (
    <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
      <div className="flex items-center gap-6">
        <button
          onClick={handleBack}
          className="w-12 h-12 rounded-full glass-card flex items-center justify-center text-primary hover:bg-primary/5 transition-colors group cursor-pointer border-none outline-none"
          title="Back to Campaigns"
        >
          <span className="material-symbols-outlined group-hover:-translate-x-1 transition-transform select-none">
            arrow_back
          </span>
        </button>
        <div>

          <h2 className="font-display-lg text-3xl md:text-[40px] font-bold text-on-surface leading-tight">
            {campaignName}
          </h2>
        </div>
      </div>
    </header>
  );
}

export default CampaignDetailsHeader;
