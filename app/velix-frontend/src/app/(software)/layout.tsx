import React from 'react';
import { redirect } from 'next/navigation';
import { createClient } from '@/utils/supabase/server';
import SideNavBar from '@/components/layout/SideNavBar';
import WorkspaceInitializer from '@/components/layout/WorkspaceInitializer';

export default async function SoftwareLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  // Fetch workspaces for the authenticated user sorted by updated_at descending
  const { data: dbWorkspaces } = await supabase
    .from('workspace')
    .select('id, name, website_url')
    .eq('profile_id', user.id)
    .order('created_at', { ascending: false });

  if (!dbWorkspaces || dbWorkspaces.length === 0) {
    redirect('/onboarding');
  }

  // Map database workspaces to store schema
  const workspaces = dbWorkspaces.map((ws) => ({
    id: ws.id,
    name: ws.name,
    website_url: ws.website_url,
  }));

  const handleSignOut = async () => {
    'use server';
    const supabaseClient = await createClient();
    await supabaseClient.auth.signOut();
    redirect('/login');
  };

  return (
    <div className="min-h-screen bg-background flex flex-col md:flex-row relative">
      {/* Initialize Zustand store on the client side */}
      <WorkspaceInitializer workspaces={workspaces} />

      {/* Side Navigation for Desktop */}
      <SideNavBar userEmail={user.email || ''} signOutAction={handleSignOut} />

      {/* Top Header for Mobile */}
      <div className="md:hidden fixed top-0 left-0 w-full z-40 bg-surface/80 backdrop-blur-xl border-b border-primary-container/10 h-16 flex items-center justify-between px-6">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-secondary-container to-primary-container flex items-center justify-center text-white">
            <span className="font-bold text-sm">V</span>
          </div>
          <span className="font-headline-md text-base font-bold text-primary">Velix</span>
        </div>
        <div className="flex items-center gap-3">
          <form action={handleSignOut}>
            <button
              type="submit"
              className="text-primary font-semibold text-xs uppercase tracking-widest focus:outline-none bg-transparent border-none cursor-pointer"
            >
              Sign Out
            </button>
          </form>
        </div>
      </div>

      {/* Main Content layout */}
      <div className="flex-1 flex flex-col md:ml-64 w-full pt-16 md:pt-0 overflow-x-hidden min-h-screen">
        {children}
      </div>
    </div>
  );
}
