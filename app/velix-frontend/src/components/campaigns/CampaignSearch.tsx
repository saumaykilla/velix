'use client';

import React from 'react';

interface CampaignSearchProps {
  value: string;
  onChange: (value: string) => void;
}

export function CampaignSearch({ value, onChange }: CampaignSearchProps) {
  return (
    <div className="relative w-full sm:w-96">
      <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant/50 text-xl pointer-events-none select-none">
        search
      </span>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full pl-10 pr-4 py-2.5 bg-surface-container-lowest border border-primary-container/15 rounded-lg font-body-md text-body-md text-on-background placeholder:text-on-surface-variant/40 focus:outline-none focus:border-primary-container focus:ring-4 focus:ring-primary-container/10 transition-all outline-none shadow-sm"
        placeholder="Search campaigns..."
        type="text"
      />
    </div>
  );
}

export default CampaignSearch;
