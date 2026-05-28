import React from 'react';
import CampaignDetailsManager from '@/components/campaigns/details/CampaignDetailsManager';

interface PageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function CampaignDetailPage({ params }: PageProps) {
  const resolvedParams = await params;
  
  return (
    <main className="flex-grow p-[16px] md:p-[40px] overflow-y-auto w-full relative">
      <CampaignDetailsManager campaignId={resolvedParams.id} />
    </main>
  );
}

export const metadata = {
  title: 'Campaign Details - Velix Marketing OS',
};
