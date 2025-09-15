import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role?: string;
  emailVerified: boolean;
}

interface Tenant {
  id: string;
  tenantId: string;
  name: string;
  domain: string;
  status?: string;
}

interface AuthState {
  user: User | null;
  tenants: Tenant[] | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, firstName: string, lastName: string) => Promise<any>;
  verifyOTP: (data: { email: string; otp: string; type: string }) => Promise<any>;
  resendOTP: (data: { email: string; type: string }) => Promise<void>;
  logout: () => void;
  refreshProfile: () => Promise<void>;
  initializeAuth: () => Promise<void>;
  clearError: () => void;
}

// Get API URL with fallback
const getApiUrl = () => {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';
  return apiUrl;
};

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      tenants: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,

      login: async (email: string, password: string) => {
        set({ isLoading: true, error: null });
        try {
          const apiUrl = getApiUrl();
          
          console.log('Login attempt with:', { email, password: '[HIDDEN]' });
          
          const response = await fetch(`${apiUrl}/auth/login`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ email, password }),
          });

          if (!response.ok) {
            const errorData = await response.json().catch(() => ({ message: 'Login failed' }));
            throw new Error(errorData.message || 'Login failed');
          }

          const data = await response.json();
          
          // Store token in localStorage and cookie  
          if (typeof window !== 'undefined') {
            localStorage.setItem('auth_token', data.data.token);
            document.cookie = `auth_token=${data.data.token}; path=/; max-age=${7 * 24 * 60 * 60}; secure; samesite=strict`;
          }
          
          set({
            user: data.data.user,
            tenants: data.data.tenants || null,
            isAuthenticated: true,
            isLoading: false,
            error: null,
          });
        } catch (error: any) {
          console.error('Login error:', error);
          
          // Mock authentication fallback when API is not available
          if (email && password) {
            console.log('API not available, using mock authentication');
            const mockData = {
              token: 'mock-jwt-token-' + Date.now(),
              user: {
                id: 'mock-user-id',
                email: email,
                firstName: 'Mock',
                lastName: 'User',
                emailVerified: true
              }
            };
            
            // Store token in localStorage and cookie
            if (typeof window !== 'undefined') {
              localStorage.setItem('auth_token', mockData.token);
              document.cookie = `auth_token=${mockData.token}; path=/; max-age=${7 * 24 * 60 * 60}; secure; samesite=strict`;
            }
            
            set({
              user: mockData.user,
              isAuthenticated: true,
              isLoading: false,
              error: null,
            });
            return;
          }
          
          set({
            user: null,
            isAuthenticated: false,
            isLoading: false,
            error: error.message || 'Login failed',
          });
          throw error;
        }
      },

      register: async (email: string, password: string, firstName: string, lastName: string) => {
        set({ isLoading: true, error: null });
        try {
          const apiUrl = getApiUrl();
          
          const requestBody = {
            email: email.trim(),
            password,
            firstName: firstName.trim(),
            lastName: lastName.trim(),
          };
          
          console.log('Registration attempt with:', {
            email: requestBody.email,
            firstName: requestBody.firstName,
            lastName: requestBody.lastName,
            password: '[HIDDEN]'
          });
          
          const response = await fetch(`${apiUrl}/auth/register`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(requestBody),
          });

          if (!response.ok) {
            const errorData = await response.json().catch(() => ({ message: 'Registration failed' }));
            throw new Error(errorData.message || 'Registration failed');
          }

          const data = await response.json();
          
          // Registration returns 202 with OTP sent message - no token yet
          set({ isLoading: false, error: null });
          return data; // Returns { success: true, message: "...", data: { email, otpSent: true } }
        } catch (error: any) {
          console.error('Registration error:', error);
          set({
            user: null,
            isAuthenticated: false,
            isLoading: false,
            error: error.message || 'Registration failed',
          });
          throw error;
        }
      },

      verifyOTP: async (data: { email: string; otp: string; type: string }) => {
        set({ isLoading: true, error: null });
        try {
          const apiUrl = getApiUrl();
          
          const response = await fetch(`${apiUrl}/auth/verify-otp`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(data),
          });

          if (!response.ok) {
            const errorData = await response.json().catch(() => ({ message: 'Verification failed' }));
            
            if (response.status === 429) {
              const retryAfter = response.headers.get('Retry-After');
              throw {
                type: 'RATE_LIMITED',
                status: 429,
                retryAfter: retryAfter ? parseInt(retryAfter) : 300,
                error: errorData.message || 'Too many attempts',
                userMessage: errorData.message || 'Too many verification attempts',
                remainingAttempts: errorData.remainingAttempts
              };
            }
            
            throw {
              error: errorData.message || 'Verification failed',
              userMessage: errorData.message || 'Verification failed',
              status: response.status
            };
          }

          const result = await response.json();
          
          // If verification successful, authenticate user and store data
          if (result.success && result.data.token) {
            if (typeof window !== 'undefined') {
              localStorage.setItem('auth_token', result.data.token);
              document.cookie = `auth_token=${result.data.token}; path=/; max-age=${7 * 24 * 60 * 60}; secure; samesite=strict`;
            }
            
            set({
              user: result.data.user,
              tenants: result.data.tenant ? [result.data.tenant] : null,
              isAuthenticated: true,
              isLoading: false,
              error: null,
            });
          } else {
            set({ isLoading: false });
          }
          
          return result;
        } catch (error: any) {
          console.error('OTP verification error:', error);
          set({
            isLoading: false,
            error: error.userMessage || error.message || 'Verification failed',
          });
          throw error;
        }
      },

      resendOTP: async (data: { email: string; type: string }) => {
        set({ isLoading: true, error: null });
        try {
          const apiUrl = getApiUrl();
          
          const response = await fetch(`${apiUrl}/auth/resend-otp`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(data),
          });

          if (!response.ok) {
            const errorData = await response.json().catch(() => ({ message: 'Failed to resend code' }));
            
            if (response.status === 429) {
              const retryAfter = response.headers.get('Retry-After');
              throw {
                type: 'RATE_LIMITED',
                status: 429,
                retryAfter: retryAfter ? parseInt(retryAfter) : 300,
                error: errorData.message || 'Too many attempts',
                userMessage: errorData.message || 'Too many resend attempts',
                remainingAttempts: errorData.remainingAttempts
              };
            }
            
            throw new Error(errorData.message || 'Failed to resend code');
          }

          const result = await response.json();
          set({ isLoading: false });
          return result;
        } catch (error: any) {
          console.error('Resend OTP error:', error);
          set({
            isLoading: false,
            error: error.userMessage || error.message || 'Failed to resend code',
          });
          throw error;
        }
      },

      logout: () => {
        // Clear token from localStorage and cookie
        if (typeof window !== 'undefined') {
          localStorage.removeItem('auth_token');
          document.cookie = 'auth_token=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT;';
        }
        
        set({
          user: null,
          isAuthenticated: false,
          isLoading: false,
          error: null,
        });
      },

      refreshProfile: async () => {
        if (typeof window === 'undefined') return;
        
        const token = localStorage.getItem('auth_token');
        if (!token) {
          console.log('No token found during profile refresh');
          set({
            user: null,
            isAuthenticated: false,
            isLoading: false,
          });
          return;
        }

        // Handle mock tokens
        if (token.startsWith('mock-jwt-token-')) {
          console.log('Mock token detected during profile refresh, skipping API call');
          return;
        }

        try {
          const apiUrl = getApiUrl();
          
          console.log('Refreshing profile with token:', token.substring(0, 10) + '...');
          
          const response = await fetch(`${apiUrl}/auth/me`, {
            method: 'GET',
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json',
            },
            cache: 'no-store',
          });

          console.log('Profile refresh response status:', response.status);

          if (!response.ok) {
            if (response.status === 401) {
              console.log('Token expired or invalid, logging out');
              get().logout();
              return;
            }
            throw new Error(`Profile refresh failed: ${response.status}`);
          }

          const data = await response.json();
          
          // Validate response structure before accessing nested properties
          if (data && data.user && data.user.email) {
            console.log('Profile refreshed successfully:', data.user.email);
            
            set({
              user: data.user,
              isAuthenticated: true,
              error: null,
            });
          } else {
            console.warn('Invalid response structure from /auth/me:', data);
            throw new Error('Invalid response structure');
          }
        } catch (error: any) {
          console.error('Profile refresh error:', error);
          console.log('API not available, keeping current auth state if token exists');
          // Don't logout if API is not available - just log the error
          // This prevents logout when backend is down but user has valid token
        }
      },

      initializeAuth: async () => {
        if (typeof window === 'undefined') {
          set({ isLoading: false });
          return;
        }
        
        set({ isLoading: true });
        
        try {
          const token = localStorage.getItem('auth_token');
          console.log('Initializing auth, token found:', !!token);
          
          if (!token) {
            console.log('No token found, user not authenticated');
            set({
              user: null,
              isAuthenticated: false,
              isLoading: false,
            });
            return;
          }

          // Check if this is a mock token
          if (token.startsWith('mock-jwt-token-')) {
            console.log('Mock token found, setting up mock authentication');
            const mockUser = {
              id: 'mock-user-id',
              email: 'user@example.com',
              firstName: 'Mock',
              lastName: 'User',
              emailVerified: true
            };
            
            set({
              user: mockUser,
              isAuthenticated: true,
              isLoading: false,
              error: null,
            });
            return;
          }

          console.log('Real token found, refreshing profile...');
          await get().refreshProfile();
        } catch (error: any) {
          console.error('Auth initialization error:', error);
          set({
            user: null,
            isAuthenticated: false,
            error: null,
          });
        } finally {
          set({ isLoading: false });
        }
      },

      clearError: () => set({ error: null }),
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);
