'use client';

import React from 'react';

interface KPI {
  metric: string;
  target: string | number;
  source?: string;
}

interface StrategySectionProps {
  objective?: string;
  kpis?: KPI[];
  channels?: string[];
}

const getPlatformLabel = (platform: string) => {
  switch (platform.toLowerCase()) {
    case 'instagram':
      return 'Instagram Campaigns';
    case 'tiktok':
      return 'TikTok Video Ads';
    case 'linkedin':
      return 'LinkedIn Sponsored Content';
    default:
      return `${platform.charAt(0).toUpperCase() + platform.slice(1)} Campaigns`;
  }
};

export function StrategySection({
  objective = 'No objective defined yet.',
  kpis = [],
  channels = [],
}: StrategySectionProps) {
  return (
    <section className="glass-card rounded-2xl p-8 relative overflow-hidden h-full">
      <div className="absolute top-0 right-0 w-64 h-64 bg-primary-container/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3 pointer-events-none"></div>
      
      {/* Header */}
      <div className="flex items-center gap-3 mb-6 border-b border-primary/10 pb-4 relative z-10">
        <div className="w-10 h-10 rounded-lg bg-surface-container-high flex items-center justify-center text-primary">
          <span className="material-symbols-outlined select-none" style={{ fontVariationSettings: "'FILL' 0" }}>
            route
          </span>
        </div>
        <h3 className="font-headline-md text-xl md:text-headline-md font-semibold text-on-surface select-none">
          Campaign Strategy
        </h3>
      </div>

      <div className="space-y-6 relative z-10">
        {/* Objective */}
        <div>
          <h4 className="font-label-sm text-label-sm text-primary mb-2 uppercase tracking-wider select-none">
            Objective
          </h4>
          <p className="font-body-lg text-body-md md:text-body-lg text-on-surface-variant leading-relaxed">
            {objective}
          </p>
        </div>

        {/* Channels & KPIs */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Channels */}
          <div className="bg-surface/50 p-5 rounded-xl border border-primary/5">
            <h4 className="font-label-sm text-label-sm text-primary mb-3 uppercase flex items-center gap-2 select-none">
              <span className="material-symbols-outlined text-sm">hub</span>
              Channels
            </h4>
            {channels.length > 0 ? (
              <ul className="space-y-2.5 font-body-md text-on-surface-variant">
                {channels.map((platform, index) => (
                  <li key={index} className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-primary-container shrink-0"></span>
                    <span>{getPlatformLabel(platform)}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="font-body-md text-sm text-on-surface-variant/60 italic">
                No targeted channels selected.
              </p>
            )}
          </div>

          {/* KPIs */}
          <div className="bg-surface/50 p-5 rounded-xl border border-primary/5">
            <h4 className="font-label-sm text-label-sm text-primary mb-3 uppercase flex items-center gap-2 select-none">
              <span className="material-symbols-outlined text-sm">monitoring</span>
              KPIs
            </h4>
            {kpis.length > 0 ? (
              <ul className="space-y-2.5 font-body-md text-on-surface-variant">
                {kpis.map((kpi, index) => (
                  <li key={index} className="flex items-center justify-between border-b border-primary/5 last:border-0 pb-1.5 last:pb-0">
                    <span className="text-sm" title={kpi.source ? `Source: ${kpi.source}` : undefined}>
                      {kpi.metric}
                    </span>
                    <span className="font-semibold text-on-surface">
                      {kpi.target}
                    </span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="font-body-md text-sm text-on-surface-variant/60 italic">
                No campaign performance targets defined.
              </p>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

export default StrategySection;
