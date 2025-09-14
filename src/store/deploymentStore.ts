import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import type { Deployment, CreateDeploymentRequest } from '@/types/api';
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
          let deployments: Deployment[];
          
          if (projectId) {
            deployments = await apiClient.deployments.getProjectDeployments(projectId);
          } else {
            deployments = await apiClient.deployments.getDeployments();
          }
          
          set({ deployments, isLoading: false });
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
          const deployment = await apiClient.deployments.getDeployment(id);
          set({ currentDeployment: deployment, isLoading: false });
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
          const deployment = await apiClient.deployments.createDeployment(data);
          
          // Update deployments list
          const { deployments } = get();
          if (deployments) {
            set({ deployments: [deployment, ...deployments] });
          }
          
          set({ currentDeployment: deployment, isLoading: false });
          return deployment;
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
          await apiClient.deployments.cancelDeployment(id);
          
          // Update deployment status in the list
          const { deployments, currentDeployment } = get();
          if (deployments) {
            const updatedDeployments = deployments.map(d => 
              d.id === id ? { ...d, status: 'cancelled' } : d
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
          const deployment = await apiClient.deployments.retryDeployment(id);
          
          // Update deployments list
          const { deployments } = get();
          if (deployments) {
            set({ deployments: [deployment, ...deployments] });
          }
          
          set({ currentDeployment: deployment, isLoading: false });
          return deployment;
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
