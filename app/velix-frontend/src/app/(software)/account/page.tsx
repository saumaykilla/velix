import React from 'react';
import { createClient } from '@/utils/supabase/server';

export default async function AccountPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const email = user?.email || 'N/A';
  const id = user?.id || 'N/A';
  const name = user?.user_metadata?.full_name || 'Not provided';
  const lastSignIn = user?.last_sign_in_at ? new Date(user.last_sign_in_at).toLocaleString() : 'N/A';

  return (
    <main className="flex-grow p-[16px] md:p-[40px] overflow-y-auto w-full relative">
      <div className="max-w-[1440px] mx-auto">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h2 className="font-display-lg-mobile md:font-display-lg text-display-lg-mobile md:text-display-lg text-on-surface">
              Account Profile
            </h2>
            <p className="font-body-md text-body-md text-on-surface-variant mt-1">
              View your account details and current authentication state.
            </p>
          </div>
        </div>

        <div className="w-full max-w-[640px] bg-glass rounded-xl border border-primary-container/10 amber-glow p-8 md:p-12 relative overflow-hidden flex flex-col gap-6 text-center items-center">
          <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-secondary-container to-primary-container opacity-50" />

          <div className="inline-flex items-center justify-center w-16 h-16 rounded-xl bg-surface-container-lowest border border-primary-container/20 mb-2 amber-glow">
            <span className="material-symbols-outlined text-[36px] text-primary select-none">account_circle</span>
          </div>

          <div className="w-full text-left bg-surface-container/60 border border-primary-container/5 rounded-lg p-5 font-mono text-xs text-on-surface-variant/80 flex flex-col gap-2.5">
            <div className="flex items-center justify-between border-b border-primary-container/10 pb-2">
              <span className="font-semibold text-primary">Session Details</span>
              <span className="px-2 py-0.5 rounded bg-primary-container/15 text-primary-container font-sans text-[10px] font-bold uppercase tracking-wider">Active</span>
            </div>
            <div>
              <span className="text-primary-container font-semibold">User ID:</span> {id}
            </div>
            <div>
              <span className="text-primary-container font-semibold">Email:</span> {email}
            </div>
            <div>
              <span className="text-primary-container font-semibold">Full Name:</span> {name}
            </div>
            <div>
              <span className="text-primary-container font-semibold">Last Sign-in:</span> {lastSignIn}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}

export const metadata = {
  title: 'Account Settings - Velix Marketing OS',
};
