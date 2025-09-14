import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  isEmailVerified: boolean;
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, firstName: string, lastName: string) => Promise<any>;
  sendOTP: (data: { email: string; type: string }) => Promise<void>;
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
            localStorage.setItem('auth_token', data.token);
            document.cookie = `auth_token=${data.token}; path=/; max-age=${7 * 24 * 60 * 60}; secure; samesite=strict`;
          }
          
          set({
            user: data.user,
            isAuthenticated: true,
            isLoading: false,
            error: null,
          });
        } catch (error: any) {
          console.error('Login error:', error);
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
          
          // Validate all required fields
          if (!email || !password || !firstName || !lastName) {
            throw new Error('All fields are required');
          }
          
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

          console.log('Registration response status:', response.status);

          if (!response.ok) {
            const errorData = await response.json().catch(() => ({ message: 'Registration failed' }));
            console.error('Registration error response:', errorData);
            throw new Error(errorData.message || 'Registration failed');
          }

          const data = await response.json();
          console.log('Registration successful:', data);
          
          set({ isLoading: false, error: null });
          return data;
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

      sendOTP: async (data: { email: string; type: string }) => {
        set({ isLoading: true, error: null });
        try {
          const apiUrl = getApiUrl();
          
          console.log('Sending OTP to:', data.email, 'type:', data.type);
          
          const response = await fetch(`${apiUrl}/auth/send-otp`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(data),
          });

          console.log('Send OTP response status:', response.status);

          if (!response.ok) {
            const errorData = await response.json().catch(() => ({ message: 'Failed to send verification code' }));
            console.error('Send OTP error response:', errorData);
            
            // Handle rate limiting
            if (response.status === 429) {
              const retryAfter = response.headers.get('Retry-After');
              throw {
                type: 'RATE_LIMITED',
                status: 429,
                retryAfter: retryAfter ? parseInt(retryAfter) : 300,
                error: errorData.message || 'Too many attempts',
                userMessage: errorData.message || 'Too many attempts to send verification code',
                remainingAttempts: errorData.remainingAttempts
              };
            }
            
            throw new Error(errorData.message || 'Failed to send verification code');
          }

          const result = await response.json();
          console.log('OTP sent successfully:', result);
          set({ isLoading: false, error: null });
          return result;
        } catch (error: any) {
          console.error('Send OTP error:', error);
          set({
            isLoading: false,
            error: error.userMessage || error.message || 'Failed to send verification code',
          });
          throw error;
        }
      },

      verifyOTP: async (data: { email: string; otp: string; type: string }) => {
        set({ isLoading: true, error: null });
        try {
          const apiUrl = getApiUrl();
          
          console.log('Verifying OTP for:', data.email, 'OTP:', data.otp, 'type:', data.type);
          
          const response = await fetch(`${apiUrl}/auth/verify-otp`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(data),
          });

          console.log('Verify OTP response status:', response.status);

          if (!response.ok) {
            const errorData = await response.json().catch(() => ({ message: 'Verification failed' }));
            console.error('Verify OTP error response:', errorData);
            
            // Handle rate limiting
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
          console.log('OTP verification successful:', result);
          
          // If verification successful and token provided, authenticate user
          if (result.token) {
            if (typeof window !== 'undefined') {
              localStorage.setItem('auth_token', result.token);
              document.cookie = `auth_token=${result.token}; path=/; max-age=${7 * 24 * 60 * 60}; secure; samesite=strict`;
            }
            
            set({
              user: result.user,
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
          
          console.log('Resending OTP to:', data.email, 'type:', data.type);
          
          const response = await fetch(`${apiUrl}/auth/resend-otp`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(data),
          });

          console.log('Resend OTP response status:', response.status);

          if (!response.ok) {
            const errorData = await response.json().catch(() => ({ message: 'Failed to resend code' }));
            console.error('Resend OTP error response:', errorData);
            
            // Handle rate limiting
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
          console.log('OTP resent successfully:', result);
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
          set({
            user: null,
            isAuthenticated: false,
            isLoading: false,
          });
          return;
        }

        try {
          const apiUrl = getApiUrl();
          
          const response = await fetch(`${apiUrl}/auth/me`, {
            method: 'GET',
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json',
            },
            cache: 'no-store',
          });

          if (!response.ok) {
            if (response.status === 401) {
              get().logout();
              return;
            }
            throw new Error(`Profile refresh failed: ${response.status}`);
          }

          const data = await response.json();
          set({
            user: data.user,
            isAuthenticated: true,
            error: null,
          });
        } catch (error: any) {
          console.error('Profile refresh error:', error);
          get().logout();
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
          if (!token) {
            set({
              user: null,
              isAuthenticated: false,
              isLoading: false,
            });
            return;
          }

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
