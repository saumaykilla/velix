'use client';

import React, { useState } from 'react';

export interface Persona {
  id: string;
  name: string;
  role: string;
  demographics: Record<string, any> | string;
  pain_points: string[];
  motivations: string[];
}

interface PersonaSectionProps {
  personas: Persona[];
}

const STOCK_AVATARS = [
  'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=200&h=200&q=80', // Professional Woman
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&h=200&q=80', // Professional Man
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&h=200&q=80', // Professional Young Woman
];

export function PersonaSection({ personas = [] }: PersonaSectionProps) {
  const [activeIndex, setActiveIndex] = useState(0);

  if (personas.length === 0) {
    return (
      <aside className="glass-card rounded-2xl p-6 sticky top-8 text-center py-12">
        <div className="w-12 h-12 rounded-lg bg-surface-container-high flex items-center justify-center text-primary mx-auto mb-4">
          <span className="material-symbols-outlined select-none">person_search</span>
        </div>
        <h3 className="font-headline-md text-lg font-semibold text-on-surface mb-2">
          Target Personas
        </h3>
        <p className="font-body-md text-sm text-on-surface-variant/80">
          No personas generated for this campaign yet.
        </p>
      </aside>
    );
  }

  const activePersona = personas[activeIndex] || personas[0];
  const totalPersonas = personas.length;

  const handleNext = () => {
    setActiveIndex((prev) => (prev + 1) % totalPersonas);
  };

  const handlePrev = () => {
    setActiveIndex((prev) => (prev - 1 + totalPersonas) % totalPersonas);
  };

  const renderDemographics = (demographics: any) => {
    if (!demographics) return 'N/A';
    if (typeof demographics === 'string') return demographics;
    if (typeof demographics === 'object') {
      return Object.entries(demographics)
        .map(([key, val]) => {
          const formattedKey = key
            .split('_')
            .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
            .join(' ');
          return `${formattedKey}: ${val}`;
        })
        .join(' • ');
    }
    return JSON.stringify(demographics);
  };

  // List alternative personas
  const alternativePersonas = personas.filter((_, idx) => idx !== activeIndex);

  return (
    <aside className="glass-card rounded-2xl p-6 sticky top-8 select-none">
      {/* Card Header with pagination controls */}
      <div className="flex items-center justify-between mb-6 border-b border-primary/10 pb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-surface-container-high flex items-center justify-center text-primary">
            <span className="material-symbols-outlined select-none">person_search</span>
          </div>
          <h3 className="font-headline-md text-lg font-semibold text-on-surface">
            Target Persona
          </h3>
        </div>
        {totalPersonas > 1 && (
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrev}
              className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-primary/10 text-on-surface-variant transition-colors cursor-pointer border-none outline-none"
              title="Previous Persona"
            >
              <span className="material-symbols-outlined text-xl">chevron_left</span>
            </button>
            <button
              onClick={handleNext}
              className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-primary/10 text-on-surface-variant transition-colors cursor-pointer border-none outline-none"
              title="Next Persona"
            >
              <span className="material-symbols-outlined text-xl">chevron_right</span>
            </button>
          </div>
        )}
      </div>

      {/* Carousel Content */}
      <div className="animate-fade-in key={activeIndex}">
        {/* Profile Image & Header Info */}
        <div className="flex flex-col items-center text-center mb-6">
          <div className="w-24 h-24 rounded-full border-4 border-white shadow-[0_10px_20px_-5px_rgba(249,115,22,0.15)] overflow-hidden mb-4 relative bg-surface-container flex items-center justify-center">
            <img
              alt={activePersona.name}
              className="w-full h-full object-cover"
              src={STOCK_AVATARS[activeIndex % STOCK_AVATARS.length]}
              onError={(e) => {
                // hide broken images
                (e.target as HTMLImageElement).style.display = 'none';
              }}
            />
          </div>
          <h4 className="font-headline-md text-lg font-bold text-on-surface">
            {activePersona.name}
          </h4>
          <p className="font-body-md text-sm text-primary font-semibold mt-0.5">
            {activePersona.role}
          </p>
        </div>

        {/* Details Grid */}
        <div className="space-y-4">
          {/* Demographics */}
          <div className="bg-surface/50 p-3 rounded-lg border border-primary/5">
            <div className="font-label-sm text-[10px] text-on-surface-variant mb-1 uppercase tracking-wider font-semibold">
              Demographics
            </div>
            <div className="font-body-md text-on-surface text-sm leading-relaxed">
              {renderDemographics(activePersona.demographics)}
            </div>
          </div>

          {/* Pain Points */}
          {activePersona.pain_points && activePersona.pain_points.length > 0 && (
            <div className="bg-surface/50 p-3 rounded-lg border border-primary/5">
              <div className="font-label-sm text-[10px] text-on-surface-variant mb-2 uppercase tracking-wider font-semibold flex items-center gap-1">
                <span className="material-symbols-outlined text-xs text-error">warning</span>
                Pain Points
              </div>
              <ul className="font-body-md text-on-surface text-sm space-y-1.5">
                {activePersona.pain_points.map((point, index) => (
                  <li key={index} className="flex items-start gap-1.5">
                    <span className="text-primary-container shrink-0 mt-0.5">•</span>
                    <span>{point}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Motivations */}
          {activePersona.motivations && activePersona.motivations.length > 0 && (
            <div className="bg-surface/50 p-3 rounded-lg border border-primary/5">
              <div className="font-label-sm text-[10px] text-on-surface-variant mb-2 uppercase tracking-wider font-semibold flex items-center gap-1">
                <span className="material-symbols-outlined text-xs text-primary-container">bolt</span>
                Motivations
              </div>
              <ul className="font-body-md text-on-surface text-sm space-y-1.5">
                {activePersona.motivations.map((motivation, index) => (
                  <li key={index} className="flex items-start gap-1.5">
                    <span className="text-primary-container shrink-0 mt-0.5">•</span>
                    <span>{motivation}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>

      {/* Slide dot indicators */}
      {totalPersonas > 1 && (
        <div className="flex justify-center gap-2 mt-6">
          {personas.map((_, idx) => (
            <span
              key={idx}
              onClick={() => setActiveIndex(idx)}
              className={`w-2 h-2 rounded-full cursor-pointer transition-all duration-300 ${
                idx === activeIndex
                  ? 'bg-primary w-4'
                  : 'bg-primary/20 hover:bg-primary/45'
              }`}
            />
          ))}
        </div>
      )}

      {/* Direct navigation shortcuts for other personas */}
      {alternativePersonas.length > 0 && (
        <div className="mt-6 pt-6 border-t border-primary/5">
          <p className="font-label-sm text-[9px] text-on-surface-variant/70 uppercase tracking-wider text-center mb-3">
            Also target in this campaign:
          </p>
          <div className="flex justify-center gap-4 text-xs font-semibold text-on-surface-variant/80">
            {personas.map((p, idx) => {
              if (idx === activeIndex) return null;
              return (
                <span
                  key={p.id || idx}
                  onClick={() => setActiveIndex(idx)}
                  className="opacity-55 hover:opacity-100 cursor-pointer transition-opacity text-center flex-1 max-w-[120px] truncate"
                  title={p.name}
                >
                  {p.name.split(' ')[0]} {/* display first name to fit */}
                </span>
              );
            })}
          </div>
        </div>
      )}
    </aside>
  );
}

export default PersonaSection;
