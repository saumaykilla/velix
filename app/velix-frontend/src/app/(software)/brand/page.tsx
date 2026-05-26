import React from 'react';
import { BrandProfile } from '@/components/brand/BrandProfile';

export default function BrandPage() {
  return (
    <main className="flex-grow p-[16px] md:p-[40px] overflow-y-auto w-full relative">
      <div className="max-w-[1440px] mx-auto">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h2 className="font-display-lg-mobile md:font-display-lg text-display-lg-mobile md:text-display-lg text-on-surface">
              Brand Profile
            </h2>
            <p className="font-body-md text-body-md text-on-surface-variant mt-1">
              Configure your brand tone, value propositions, and competitor profile.
            </p>
          </div>
        </div>

        <BrandProfile />
      </div>
    </main>
  );
}

export const metadata = {
  title: 'Brand Profile - Velix Marketing OS',
};

