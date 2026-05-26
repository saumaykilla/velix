'use client';

import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useQuery } from '@tanstack/react-query';
import { createClient } from '@/utils/supabase/client';
import { useWorkspaceStore } from '@/store/useWorkspaceStore';
import CampaignSearch from './CampaignSearch';
import CampaignList from './CampaignList';
import CreateCampaignModal from './CreateCampaignModal';
import EditCampaignModal from './EditCampaignModal';
import { Campaign } from './CampaignCard';
import Button from '../ui/Button';

interface DeleteConfirmModalProps {
  isOpen: boolean;
  campaignName: string;
  isDeleting: boolean;
  onConfirm: () => void;
  onClose: () => void;
}

export function DeleteConfirmModal({ isOpen, campaignName, isDeleting, onConfirm, onClose }: DeleteConfirmModalProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !isDeleting) {
        onClose();
      }
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose, isDeleting]);

  if (!isOpen || !mounted) return null;

  return createPortal(
    <>
      {/* Backdrop */}
      <div
        onClick={isDeleting ? undefined : onClose}
        className="fixed inset-0 bg-black/60 backdrop-blur-md z-[100] transition-opacity duration-300"
      />

      {/* Container */}
      <div className="fixed inset-0 flex items-center justify-center p-4 z-[101] pointer-events-none">
        {/* Modal Card */}
        <div className="w-full max-w-[400px] bg-glass rounded-xl border border-error/10 hover:border-error/20 p-6 relative overflow-hidden pointer-events-auto transform transition-all duration-300 animate-fade-in flex flex-col gap-5 text-center shadow-lg">
          {/* Accent top line */}
          <div className="absolute top-0 left-0 w-full h-[2px] bg-error opacity-50" />

          {/* Warning Icon */}
          <div className="mx-auto inline-flex items-center justify-center w-14 h-14 rounded-full bg-error-container/10 border border-error/20 text-error">
            <span className="material-symbols-outlined text-[32px] select-none">warning</span>
          </div>

          <div className="space-y-2">
            <h3 className="font-headline-md text-[18px] font-bold text-on-surface">Delete Campaign</h3>
            <p className="font-body-md text-sm text-on-surface-variant leading-relaxed">
              Are you sure you want to delete <span className="font-bold text-on-surface">&ldquo;{campaignName}&rdquo;</span>? This will permanently delete the campaign and all of its associated assets.
            </p>
          </div>

          {/* Actions */}
          <div className="flex gap-3 mt-1">
            <button
              onClick={onClose}
              disabled={isDeleting}
              className="flex-1 py-2.5 px-4 rounded-lg bg-surface-container hover:bg-surface-container-high border border-primary-container/10 text-on-surface font-semibold text-sm transition-all duration-300 cursor-pointer disabled:opacity-30 disabled:pointer-events-none border-none outline-none"
            >
              Cancel
            </button>
            <button
              onClick={onConfirm}
              disabled={isDeleting}
              className="flex-1 py-2.5 px-4 rounded-lg bg-error hover:bg-error/90 text-on-error font-semibold text-sm transition-all duration-300 cursor-pointer disabled:opacity-30 disabled:pointer-events-none flex items-center justify-center gap-1.5 border-none outline-none"
            >
              {isDeleting ? (
                <>
                  <span className="animate-spin inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full" />
                  Deleting...
                </>
              ) : (
                'Delete'
              )}
            </button>
          </div>
        </div>
      </div>
    </>,
    document.body
  );
}

export default function CampaignsManager() {
  const supabase = createClient();
  const activeWorkspaceId = useWorkspaceStore((state) => state.activeWorkspaceId);

  const [searchQuery, setSearchQuery] = useState('');
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [selectedCampaign, setSelectedCampaign] = useState<Campaign | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  // Fetch campaigns client-side with react-query
  const { data: campaigns = [], isLoading, error, refetch } = useQuery<Campaign[]>({
    queryKey: ['campaigns', activeWorkspaceId],
    queryFn: async () => {
      if (!activeWorkspaceId) return [];

      const { data, error: fetchError } = await supabase
        .from('campaign')
        .select('*, assets:asset(id, is_deleted)')
        .eq('workspace_id', activeWorkspaceId)
        .order('created_at', { ascending: false });

      if (fetchError) {
        console.error('Error fetching campaigns:', fetchError);
        throw fetchError;
      }

      return (data || []).map((campaign: any) => ({
        id: campaign.id,
        name: campaign.name,
        purpose: campaign.purpose,
        targeted_platform: campaign.targeted_platform,
        created_at: campaign.created_at,
        assetsCount: campaign.assets ? campaign.assets.filter((a: any) => !a.is_deleted).length : 0,
      }));
    },
    enabled: !!activeWorkspaceId,
  });

  const handleEditClick = (campaign: Campaign) => {
    setSelectedCampaign(campaign);
    setIsEditOpen(true);
  };

  const handleDeleteClick = (campaign: Campaign) => {
    setSelectedCampaign(campaign);
    setDeleteError(null);
    setIsDeleteOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!selectedCampaign) return;

    setIsDeleting(true);
    setDeleteError(null);

    try {
      const { error: deleteErrorResult } = await supabase
        .from('campaign')
        .delete()
        .eq('id', selectedCampaign.id);

      if (deleteErrorResult) {
        throw new Error(deleteErrorResult.message);
      }

      setIsDeleteOpen(false);
      setSelectedCampaign(null);
      refetch();
    } catch (err: any) {
      console.error('Error deleting campaign:', err);
      setDeleteError(err.message || 'Failed to delete campaign. Please try again.');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="max-w-[1440px] mx-auto space-y-6">
      {/* Header Panel */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h2 className="font-display-lg-mobile md:font-display-lg text-display-lg-mobile md:text-display-lg text-on-surface">
            Campaigns
          </h2>
          <p className="font-body-md text-body-md text-on-surface-variant mt-1">
            Manage, review, and schedule your marketing campaigns.
          </p>
        </div>
        <Button
          onClick={() => setIsCreateOpen(true)}
          className="mt-0 cursor-pointer flex items-center justify-center gap-2 sm:w-auto"
        >
          <span className="material-symbols-outlined text-[18px]">add</span>
          Create New Campaign
        </Button>
      </div>

      {/* Search and Filters panel */}
      {campaigns.length > 0 && (
        <div className="flex items-center justify-between gap-4 pb-4">
          <CampaignSearch value={searchQuery} onChange={setSearchQuery} />
        </div>
      )}

      {/* Main campaigns display */}
      {isLoading ? (
        <div className="w-full flex items-center justify-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      ) : error ? (
        <div className="w-full bg-glass rounded-xl border border-error/15 p-8 text-center flex flex-col items-center gap-4">
          <span className="material-symbols-outlined text-[36px] text-error">error</span>
          <div>
            <h3 className="font-headline-md text-headline-md text-on-surface">Failed to load campaigns</h3>
            <p className="font-body-md text-body-md text-on-surface-variant mt-1">
              {error instanceof Error ? error.message : 'An error occurred while fetching campaigns.'}
            </p>
          </div>
          <Button onClick={() => refetch()} variant="secondary" className="mt-2">
            Retry Connection
          </Button>
        </div>
      ) : (
        <CampaignList
          campaigns={campaigns}
          searchQuery={searchQuery}
          onEdit={handleEditClick}
          onDelete={handleDeleteClick}
        />
      )}

      {/* Modals */}
      <CreateCampaignModal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        onSuccess={refetch}
      />

      <EditCampaignModal
        isOpen={isEditOpen}
        campaign={selectedCampaign}
        onClose={() => {
          setIsEditOpen(false);
          setSelectedCampaign(null);
        }}
        onSuccess={refetch}
      />

      <DeleteConfirmModal
        isOpen={isDeleteOpen}
        campaignName={selectedCampaign?.name || ''}
        isDeleting={isDeleting}
        onConfirm={handleConfirmDelete}
        onClose={() => {
          if (!isDeleting) {
            setIsDeleteOpen(false);
            setSelectedCampaign(null);
          }
        }}
      />
      
      {deleteError && (
        <div className="fixed bottom-4 right-4 bg-error-container text-on-error-container text-sm p-4 rounded-lg shadow-lg border border-error/10 flex items-center gap-2 max-w-sm z-[200]">
          <span className="material-symbols-outlined text-error">error</span>
          <span>{deleteError}</span>
          <button
            onClick={() => setDeleteError(null)}
            className="ml-auto text-on-error-container/60 hover:text-on-error-container p-0.5 rounded cursor-pointer border-none bg-transparent"
          >
            <span className="material-symbols-outlined text-[16px]">close</span>
          </button>
        </div>
      )}
    </div>
  );
}
