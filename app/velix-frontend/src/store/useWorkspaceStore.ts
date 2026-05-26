import { create } from 'zustand';

export interface Workspace {
  id: string;
  name: string;
  website_url?: string | null;
}

interface WorkspaceState {
  workspaces: Workspace[];
  activeWorkspace: Workspace | null;
  activeWorkspaceId: string | null;
  isAddModalOpen: boolean;
  setActiveWorkspace: (workspace: Workspace | null) => void;
  addWorkspace: (workspace: Workspace) => void;
  setIsAddModalOpen: (open: boolean) => void;
}

const defaultWorkspaces: Workspace[] = [];

export const useWorkspaceStore = create<WorkspaceState>((set) => ({
  workspaces: defaultWorkspaces,
  activeWorkspace: null,
  activeWorkspaceId: null,
  isAddModalOpen: false,
  setActiveWorkspace: (workspace) => set({ 
    activeWorkspace: workspace,
    activeWorkspaceId: workspace ? workspace.id : null 
  }),
  addWorkspace: (workspace) => set((state) => {
    const updated = [workspace, ...state.workspaces];
    return {
      workspaces: updated,
      activeWorkspace: workspace,
      activeWorkspaceId: workspace.id,
    };
  }),
  setIsAddModalOpen: (open) => set({ isAddModalOpen: open }),
}));

export default useWorkspaceStore;
