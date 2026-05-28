'use client';

import React, { useState, useEffect } from 'react';

export interface Asset {
  id: string;
  platform: string;
  asset_type: string;
  media_url: string;
  caption: string | null;
  status: string;
  notes: string | null;
  created_at?: string;
}

interface AssetsSectionProps {
  assets: Asset[];
  channels: string[];
  onGenerateMore?: (platform: string) => void;
  onPreviewAsset?: (asset: Asset) => void;
}

const getPlatformDimensions = (platform: string) => {
  switch (platform.toLowerCase()) {
    case 'instagram':
      return '1080x1080 (Feed)';
    case 'tiktok':
      return '1080x1920 (Video)';
    case 'linkedin':
      return '1200x627 (Image)';
    default:
      return '1200x1200';
  }
};

const getDisplayName = (asset: Asset) => {
  if (asset.caption) {
    // truncate caption
    const clean = asset.caption.replace(/[\n\r]+/g, ' ');
    if (clean.length > 20) {
      return clean.slice(0, 18) + '...';
    }
    return clean;
  }
  return `${asset.asset_type.charAt(0).toUpperCase() + asset.asset_type.slice(1)} Asset`;
};

export function AssetsSection({
  assets = [],
  channels = [],
  onGenerateMore,
  onPreviewAsset,
}: AssetsSectionProps) {
  // Use campaigns targeted platform channels, default to a standard list if empty
  const tabs = channels.length > 0 ? channels : ['linkedin', 'tiktok', 'instagram'];
  const [activeTab, setActiveTab] = useState(tabs[0] || 'linkedin');

  // Sync active tab if channels change/load
  useEffect(() => {
    if (tabs.length > 0 && !tabs.includes(activeTab)) {
      setActiveTab(tabs[0]);
    }
  }, [channels]);

  // Filter assets by active platform tab
  const filteredAssets = assets.filter(
    (asset) => asset.platform.toLowerCase() === activeTab.toLowerCase()
  );

  const handleGenerateClick = () => {
    if (onGenerateMore) {
      onGenerateMore(activeTab);
    } else {
      alert(`Generating assets for ${activeTab.toUpperCase()}...`);
    }
  };

  const handleAssetClick = (asset: Asset) => {
    if (onPreviewAsset) {
      onPreviewAsset(asset);
    } else {
      // Fallback simple preview
      window.open(asset.media_url, '_blank');
    }
  };

  return (
    <section className="glass-card rounded-2xl p-8 h-full flex flex-col justify-between">
      <div>
        {/* Header */}
        <div className="flex items-center justify-between mb-8 border-b border-primary/10 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-surface-container-high flex items-center justify-center text-primary">
              <span className="material-symbols-outlined select-none">folder_zip</span>
            </div>
            <h3 className="font-headline-md text-xl md:text-headline-md font-semibold text-on-surface select-none">
              Generated Assets
            </h3>
          </div>
        </div>

        {/* Platform Tabs */}
        <div className="flex items-center gap-8 mb-6 border-b border-primary/10 select-none">
          {tabs.map((tab) => {
            const isActive = tab.toLowerCase() === activeTab.toLowerCase();
            return (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`pb-3 px-1 font-headline-md text-sm md:text-body-md transition-all cursor-pointer border-none outline-none relative ${
                  isActive
                    ? 'text-primary font-bold'
                    : 'text-on-surface-variant/70 font-medium hover:text-primary'
                }`}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
                {isActive && (
                  <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-primary rounded-full animate-fade-in" />
                )}
              </button>
            );
          })}
        </div>

        {/* Asset Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {/* Asset Cards */}
          {filteredAssets.map((asset) => (
            <div
              key={asset.id}
              onClick={() => handleAssetClick(asset)}
              className="group cursor-pointer transition-transform duration-200 active:scale-[0.98]"
            >
              <div className="aspect-square rounded-xl bg-surface-container overflow-hidden mb-3 relative border border-primary/10 group-hover:border-primary-container/50 transition-colors shadow-sm">
                <img
                  alt={asset.caption || 'Asset Thumbnail'}
                  className="w-full h-full object-cover opacity-90 group-hover:opacity-100 transition-opacity duration-300"
                  src={asset.media_url}
                  onError={(e) => {
                    // fallback if image fails to load
                    (e.target as HTMLImageElement).src =
                      'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=400&q=80';
                  }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-3">
                  <span className="material-symbols-outlined text-white select-none">visibility</span>
                </div>
              </div>
              <p className="font-body-md text-sm text-on-surface font-semibold truncate px-0.5">
                {getDisplayName(asset)}
              </p>
              <p className="font-label-sm text-[10px] text-on-surface-variant/75 mt-0.5 px-0.5">
                {getPlatformDimensions(activeTab)}
              </p>
            </div>
          ))}

          {/* Dotted Create/Generate More Card */}
          <div
            onClick={handleGenerateClick}
            className="group cursor-pointer transition-transform duration-200 active:scale-[0.98]"
          >
            <div className="aspect-square rounded-xl bg-primary/5 hover:bg-primary/10 border border-primary/10 border-dashed flex flex-col items-center justify-center text-primary/60 hover:text-primary hover:border-primary/30 transition-all duration-300 shadow-sm mb-3">
              <span className="material-symbols-outlined text-3xl mb-1.5 select-none transition-transform group-hover:scale-110">
                add_circle
              </span>
              <span className="font-label-sm text-xs font-semibold tracking-wide select-none">
                Generate More
              </span>
            </div>
            {filteredAssets.length === 0 && (
              <div className="text-center sm:text-left select-none">
                <p className="font-body-md text-sm text-on-surface font-semibold px-0.5">
                  No assets yet
                </p>
                <p className="font-label-sm text-[10px] text-on-surface-variant/75 mt-0.5 px-0.5">
                  Click to start generation
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

export default AssetsSection;
