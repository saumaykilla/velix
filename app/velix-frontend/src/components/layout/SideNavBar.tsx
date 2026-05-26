'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useWorkspaceStore } from '@/store/useWorkspaceStore';

interface SideNavBarProps {
  userEmail: string;
  signOutAction: () => void;
}

const getWorkspaceInitials = (name: string) => {
  return name ? name.slice(0, 2).toUpperCase() : '';
};

const getWorkspaceColorScheme = (name: string) => {
  if (!name) return { bg: 'bg-surface-container-highest', text: 'text-on-surface-variant' };
  const colorSchemes = [
    { bg: 'bg-primary-container', text: 'text-white' },
    { bg: 'bg-secondary-container', text: 'text-white' },
    { bg: 'bg-surface-container-highest', text: 'text-on-surface-variant' }
  ];
  const hash = name.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  return colorSchemes[hash % colorSchemes.length];
};

export function SideNavBar({ userEmail, signOutAction }: SideNavBarProps) {
  const pathname = usePathname();
  const { workspaces, activeWorkspace, setActiveWorkspace, setIsAddModalOpen } = useWorkspaceStore();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const activeInitials = getWorkspaceInitials(activeWorkspace?.name || '');
  const activeScheme = getWorkspaceColorScheme(activeWorkspace?.name || '');

  const navItems = [
    { name: 'Analytics', href: '/', icon: 'analytics' },
    { name: 'Campaigns', href: '/campaigns', icon: 'campaign' },
    { name: 'Brand', href: '/brand', icon: 'auto_awesome' },
  ];

  const isActive = (href: string) => {
    if (href === '/') {
      return pathname === '/';
    }
    return pathname.startsWith(href);
  };

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <aside className="fixed left-0 top-0 h-screen w-64 border-r border-primary/10 shadow-[0_20px_40px_-10px_rgba(249,115,22,0.08)] bg-surface/80 dark:bg-surface-dim/80 backdrop-blur-2xl backdrop-saturate-150 flex flex-col justify-between py-8 z-50 hidden md:flex">
      <div className="px-6 flex flex-col gap-8">
        {/* Brand */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-secondary-container to-primary-container flex items-center justify-center text-white shadow-[0_8px_16px_-4px_rgba(249,115,22,0.3)] select-none">
            <span className="font-display-lg text-[24px] font-bold leading-none">V</span>
          </div>
          <div>
            <h1 className="font-display-lg text-[24px] font-bold text-primary dark:text-primary-fixed leading-none">Velix</h1>
            <p className="font-label-sm text-label-sm text-tertiary-container mt-1">Marketing OS</p>
          </div>
        </div>

        {/* Primary CTA: Workspace Dropdown */}
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="w-full py-3 px-4 rounded-lg bg-glass border border-primary/20 flex items-center justify-between hover:bg-primary/5 transition-all duration-300 active:scale-[0.98] focus:outline-none cursor-pointer"
          >
            <div className="flex items-center gap-3 overflow-hidden">
              <div className={`w-6 h-6 rounded ${activeScheme.bg} ${activeScheme.text} flex-shrink-0 flex items-center justify-center text-[10px] font-bold`}>
                {activeInitials}
              </div>
              <span className="font-label-sm text-label-sm text-on-surface truncate font-semibold">
                {activeWorkspace?.name || 'Select Workspace'}
              </span>
            </div>
            <span className="material-symbols-outlined text-[18px] text-tertiary-container">
              unfold_more
            </span>
          </button>

          {/* Dropdown Menu */}
          {isOpen && (
            <div className="absolute left-0 right-0 mt-2 p-1 bg-glass border border-primary/10 rounded-xl shadow-[0_12px_24px_-8px_rgba(0,0,0,0.1)] z-[60] transition-all duration-200">
              <div className="py-1">
                {workspaces.map((ws) => {
                  const wsInitials = getWorkspaceInitials(ws.name);
                  const wsScheme = getWorkspaceColorScheme(ws.name);
                  const isSelected = ws.id === activeWorkspace?.id;
                  return (
                    <button
                      key={ws.id}
                      onClick={() => {
                        setActiveWorkspace(ws);
                        setIsOpen(false);
                      }}
                      className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-primary/5 transition-colors cursor-pointer border-none bg-transparent text-left"
                    >
                      <div className={`w-6 h-6 rounded ${isSelected ? wsScheme.bg : 'bg-surface-container-highest'} ${isSelected ? wsScheme.text : 'text-on-surface-variant'} flex-shrink-0 flex items-center justify-center text-[10px] font-bold`}>
                        {wsInitials}
                      </div>
                      <span className={`font-label-sm text-label-sm flex-1 ${isSelected ? 'text-on-surface font-semibold' : 'text-on-surface-variant hover:text-on-surface font-medium'}`}>
                        {ws.name}
                      </span>
                      {isSelected && (
                        <span className="material-symbols-outlined text-[16px] text-primary">check</span>
                      )}
                    </button>
                  );
                })}
              </div>
              <div className="mt-1 pt-1 border-t border-primary/5">
                <button
                  onClick={() => {
                    setIsOpen(false);
                    setIsAddModalOpen(true);
                  }}
                  className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-primary/5 transition-colors text-primary font-semibold cursor-pointer border-none bg-transparent"
                >
                  <span className="material-symbols-outlined text-[20px]">add</span>
                  <span className="font-label-sm text-label-sm">New Workspace</span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Navigation Tabs */}
        <nav className="flex flex-col gap-1 mt-4">
          {navItems.map((item) => {
            const active = isActive(item.href);
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-300 active:scale-[0.98] ${
                  active
                    ? 'text-primary dark:text-primary-fixed-dim font-bold border-r-4 border-primary dark:border-primary-fixed bg-primary/5'
                    : 'text-on-surface-variant dark:text-on-surface-variant font-medium hover:bg-secondary-container/10 dark:hover:bg-secondary-container/20'
                }`}
              >
                <span className="material-symbols-outlined text-[20px]">{item.icon}</span>
                <span>{item.name}</span>
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Footer Tabs */}
      <div className="px-6 flex flex-col gap-1">
        <Link
          href="/account"
          className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-300 active:scale-[0.98] ${
            isActive('/account')
              ? 'text-primary dark:text-primary-fixed-dim font-bold border-r-4 border-primary dark:border-primary-fixed bg-primary/5'
              : 'text-on-surface-variant dark:text-on-surface-variant font-medium hover:bg-secondary-container/10 dark:hover:bg-secondary-container/20'
          }`}
        >
          <span className="material-symbols-outlined text-[20px]">account_circle</span>
          <span>Account</span>
        </Link>
        <button
          onClick={signOutAction}
          className="flex items-center gap-3 text-on-surface-variant dark:text-on-surface-variant font-medium px-4 py-3 rounded-lg hover:bg-secondary-container/10 dark:hover:bg-secondary-container/20 transition-all duration-300 active:scale-[0.98] w-full text-left bg-transparent border-none cursor-pointer focus:outline-none"
        >
          <span className="material-symbols-outlined text-[20px]">logout</span>
          <span>Sign Out</span>
        </button>
      </div>
    </aside>
  );
}

export default SideNavBar;
