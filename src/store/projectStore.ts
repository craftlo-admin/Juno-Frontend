import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import type { Project, CreateProjectRequest, UpdateProjectRequest } from '@/types/api';
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
          const projects = await apiClient.projects.getProjects();
          set({ projects, isLoading: false });
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
          const project = await apiClient.projects.getProject(id);
          set({ currentProject: project, isLoading: false });
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
          const project = await apiClient.projects.createProject(data);
          
          // Update projects list
          const { projects } = get();
          if (projects) {
            set({ projects: [project, ...projects] });
          }
          
          set({ currentProject: project, isLoading: false });
          return project;
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
          const project = await apiClient.projects.updateProject(id, data);
          
          // Update projects list
          const { projects, currentProject } = get();
          if (projects) {
            const updatedProjects = projects.map(p => 
              p.id === id ? project : p
            );
            set({ projects: updatedProjects });
          }
          
          // Update current project if it's the one being updated
          if (currentProject?.id === id) {
            set({ currentProject: project });
          }
          
          set({ isLoading: false });
          return project;
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
          await apiClient.projects.deleteProject(id);
          
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
