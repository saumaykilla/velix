import React from 'react';
import CampaignsManager from '@/components/campaigns/CampaignsManager';

export default function CampaignsPage() {
  return (
    <main className="flex-grow p-[16px] md:p-[40px] overflow-y-auto w-full relative">
      <CampaignsManager />
    </main>
  );
}

export const metadata = {
  title: 'Campaigns - Velix Marketing OS',
};

