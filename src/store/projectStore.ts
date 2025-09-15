import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import type { Project, CreateProjectRequest, UpdateProjectRequest } from '@/types';
import { apiClient } from '@/lib/api';

interface ProjectState {
  projects: Project[] | null;
  currentProject: Project | null;
  isLoading: boolean;
  error: string | null;
  
  // Actions
  fetchProjects: () => Promise<void>;
  fetchProject: (id: string) => Promise<void>;
  createProject: (data: CreateProjectRequest) => Promise<Project>;
  updateProject: (id: string, data: UpdateProjectRequest) => Promise<Project>;
  deleteProject: (id: string) => Promise<void>;
  setCurrentProject: (project: Project | null) => void;
  clearError: () => void;
}

export const useProjectStore = create<ProjectState>()(
  devtools(
    (set, get) => ({
      projects: null,
      currentProject: null,
      isLoading: false,
      error: null,

      fetchProjects: async () => {
        try {
          set({ isLoading: true, error: null });
          // TODO: Implement projects API
          const mockProjects: Project[] = [];
          set({ projects: mockProjects, isLoading: false });
        } catch (error: any) {
          set({ 
            error: error.message || 'Failed to fetch projects', 
            isLoading: false 
          });
        }
      },

      fetchProject: async (id: string) => {
        try {
          set({ isLoading: true, error: null });
          // TODO: Implement get project API
          const mockProject: Project = {
            id: id,
            name: 'Mock Project',
            description: 'Mock project description',
            status: 'active',
            userId: 'mock-user-id',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          };
          set({ currentProject: mockProject, isLoading: false });
        } catch (error: any) {
          set({ 
            error: error.message || 'Failed to fetch project', 
            isLoading: false 
          });
        }
      },

      createProject: async (data: CreateProjectRequest) => {
        try {
          set({ isLoading: true, error: null });
          // TODO: Implement create project API
          const mockProject: Project = {
            id: Date.now().toString(),
            name: data.name,
            description: data.description,
            status: 'active',
            userId: 'mock-user-id',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          };
          
          // Update projects list
          const { projects } = get();
          if (projects) {
            set({ projects: [mockProject, ...projects] });
          }
          
          set({ currentProject: mockProject, isLoading: false });
          return mockProject;
        } catch (error: any) {
          set({ 
            error: error.message || 'Failed to create project', 
            isLoading: false 
          });
          throw error;
        }
      },

      updateProject: async (id: string, data: UpdateProjectRequest) => {
        try {
          set({ isLoading: true, error: null });
          // TODO: Implement update project API
          const mockProject: Project = {
            id: id,
            name: data.name || 'Updated Project',
            description: data.description,
            status: 'active',
            userId: 'mock-user-id',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          };
          
          // Update projects list
          const { projects, currentProject } = get();
          if (projects) {
            const updatedProjects = projects.map(p => 
              p.id === id ? mockProject : p
            );
            set({ projects: updatedProjects });
          }
          
          // Update current project if it's the one being updated
          if (currentProject?.id === id) {
            set({ currentProject: mockProject });
          }
          
          set({ isLoading: false });
          return mockProject;
        } catch (error: any) {
          set({ 
            error: error.message || 'Failed to update project', 
            isLoading: false 
          });
          throw error;
        }
      },

      deleteProject: async (id: string) => {
        try {
          set({ isLoading: true, error: null });
          // TODO: Implement delete project API
          
          // Remove from projects list
          const { projects, currentProject } = get();
          if (projects) {
            const updatedProjects = projects.filter(p => p.id !== id);
            set({ projects: updatedProjects });
          }
          
          // Clear current project if it's the one being deleted
          if (currentProject?.id === id) {
            set({ currentProject: null });
          }
          
          set({ isLoading: false });
        } catch (error: any) {
          set({ 
            error: error.message || 'Failed to delete project', 
            isLoading: false 
          });
          throw error;
        }
      },

      setCurrentProject: (project: Project | null) => {
        set({ currentProject: project });
      },

      clearError: () => {
        set({ error: null });
      },
    }),
    { name: 'project-store' }
  )
);
