import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import type { Deployment, CreateDeploymentRequest } from '@/types';
import { apiClient } from '@/lib/api';

interface DeploymentState {
  deployments: Deployment[] | null;
  currentDeployment: Deployment | null;
  isLoading: boolean;
  error: string | null;
  
  // Actions
  fetchDeployments: (projectId?: string) => Promise<void>;
  fetchDeployment: (id: string) => Promise<void>;
  createDeployment: (data: CreateDeploymentRequest) => Promise<Deployment>;
  cancelDeployment: (id: string) => Promise<void>;
  retryDeployment: (id: string) => Promise<Deployment>;
  setCurrentDeployment: (deployment: Deployment | null) => void;
  clearError: () => void;
}

export const useDeploymentStore = create<DeploymentState>()(
  devtools(
    (set, get) => ({
      deployments: null,
      currentDeployment: null,
      isLoading: false,
      error: null,

      fetchDeployments: async (projectId?: string) => {
        try {
          set({ isLoading: true, error: null });
          // TODO: Implement deployments API
          // Mock data for now
          const mockDeployments: Deployment[] = [];
          
          set({ deployments: mockDeployments, isLoading: false });
        } catch (error: any) {
          set({ 
            error: error.message || 'Failed to fetch deployments', 
            isLoading: false 
          });
        }
      },

      fetchDeployment: async (id: string) => {
        try {
          set({ isLoading: true, error: null });
          // TODO: Implement deployment API
          const mockDeployment: Deployment = {
            id: id,
            projectId: 'mock-project-id',
            status: 'pending',
            version: '1.0.0',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          };
          set({ currentDeployment: mockDeployment, isLoading: false });
        } catch (error: any) {
          set({ 
            error: error.message || 'Failed to fetch deployment', 
            isLoading: false 
          });
        }
      },

      createDeployment: async (data: CreateDeploymentRequest) => {
        try {
          set({ isLoading: true, error: null });
          // TODO: Implement deployment API
          const mockDeployment: Deployment = {
            id: Date.now().toString(),
            projectId: data.projectId,
            status: 'pending',
            version: data.version || '1.0.0',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          };
          
          // Update deployments list
          const { deployments } = get();
          if (deployments) {
            set({ deployments: [mockDeployment, ...deployments] });
          }
          
          set({ currentDeployment: mockDeployment, isLoading: false });
          return mockDeployment;
        } catch (error: any) {
          set({ 
            error: error.message || 'Failed to create deployment', 
            isLoading: false 
          });
          throw error;
        }
      },

      cancelDeployment: async (id: string) => {
        try {
          set({ isLoading: true, error: null });
          // TODO: Implement cancel deployment API
          
          // Update deployment status in the list
          const { deployments, currentDeployment } = get();
          if (deployments) {
            const updatedDeployments = deployments.map(d => 
              d.id === id ? { ...d, status: 'cancelled' as const } : d
            );
            set({ deployments: updatedDeployments });
          }
          
          // Update current deployment if it's the one being cancelled
          if (currentDeployment?.id === id) {
            set({ currentDeployment: { ...currentDeployment, status: 'cancelled' } });
          }
          
          set({ isLoading: false });
        } catch (error: any) {
          set({ 
            error: error.message || 'Failed to cancel deployment', 
            isLoading: false 
          });
          throw error;
        }
      },

      retryDeployment: async (id: string) => {
        try {
          set({ isLoading: true, error: null });
          // TODO: Implement retry deployment API
          const mockDeployment: Deployment = {
            id: id,
            projectId: 'mock-project-id',
            status: 'pending',
            version: '1.0.0',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          };
          
          // Update deployments list
          const { deployments } = get();
          if (deployments) {
            set({ deployments: [mockDeployment, ...deployments] });
          }
          
          set({ currentDeployment: mockDeployment, isLoading: false });
          return mockDeployment;
        } catch (error: any) {
          set({ 
            error: error.message || 'Failed to retry deployment', 
            isLoading: false 
          });
          throw error;
        }
      },

      setCurrentDeployment: (deployment: Deployment | null) => {
        set({ currentDeployment: deployment });
      },

      clearError: () => {
        set({ error: null });
      },
    }),
    { name: 'deployment-store' }
  )
);
