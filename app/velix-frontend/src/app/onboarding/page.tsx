import React from 'react';
import { redirect } from 'next/navigation';
import { createClient } from '@/utils/supabase/server';
import OnboardingForm from '@/components/onboarding/OnboardingForm';

export default async function OnboardingPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  // Double check if the user already has workspaces
  const { data: dbWorkspaces } = await supabase
    .from('workspace')
    .select('id')
    .eq('profile_id', user.id);

  if (dbWorkspaces && dbWorkspaces.length > 0) {
    redirect('/');
  }

  return (
    <div className="bg-background text-on-surface font-body-md min-h-screen flex flex-col selection:bg-primary-container selection:text-on-primary antialiased relative overflow-hidden ambient-bg">
      {/* Background Atmospheric Effect */}
      <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none flex justify-center items-center">
        <div className="w-[800px] h-[800px] bg-primary-container/5 rounded-full blur-[120px] absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
      </div>

      {/* Main Content Area */}
      <main className="flex-grow flex flex-col justify-center items-center relative z-10 px-6 py-16">
        <div className="w-full max-w-[600px] flex flex-col items-center">
          {/* Progress Indicator */}
          <div className="flex items-center gap-2 mb-12">
            <div className="h-1.5 w-12 bg-primary-container rounded-full shadow-[0_0_10px_rgba(249,115,22,0.3)]" />
            <div className="h-1.5 w-12 bg-surface-container-highest rounded-full" />
            <div className="h-1.5 w-12 bg-surface-container-highest rounded-full" />
          </div>

          {/* Header Section */}
          <div className="text-center mb-10">
            <h1 className="font-display-lg-mobile md:font-display-lg text-display-lg-mobile md:text-display-lg text-on-surface mb-4">
              Connect your workspace
            </h1>
            <p className="font-body-lg text-body-lg text-on-surface-variant max-w-md mx-auto">
              Enter your product details below. Velix will scan your site to align with your brand voice and mission.
            </p>
          </div>

          {/* Onboarding Form Card */}
          <OnboardingForm userId={user.id} />

          {/* Contextual Help */}
          <p className="font-label-sm text-label-sm text-on-surface-variant/60 mt-6 flex items-center gap-1.5">
            <span className="material-symbols-outlined text-[16px]">lock</span>
            Your data is processed securely and never shared.
          </p>
        </div>
      </main>
    </div>
  );
}

export const metadata = {
  title: 'Onboarding - Velix Marketing OS',
};
