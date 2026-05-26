'use client';

import { useEffect, useRef } from 'react';
import { useWorkspaceStore, Workspace } from '@/store/useWorkspaceStore';
import AddWorkspaceModal from './AddWorkspaceModal';

export function WorkspaceInitializer({ workspaces }: { workspaces: Workspace[] }) {
  const initialized = useRef(false);
  const isAddModalOpen = useWorkspaceStore((state) => state.isAddModalOpen);
  const setIsAddModalOpen = useWorkspaceStore((state) => state.setIsAddModalOpen);

  useEffect(() => {
    if (!initialized.current) {
      useWorkspaceStore.setState({
        workspaces,
        activeWorkspace: workspaces[0] || null,
        activeWorkspaceId: workspaces[0]?.id || null,
      });
      initialized.current = true;
    }
  }, [workspaces]);

  return (
    <AddWorkspaceModal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} />
  );
}

export default WorkspaceInitializer;
