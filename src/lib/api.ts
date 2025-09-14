import axios, { AxiosError } from 'axios';
import {
  LoginRequest, RegisterRequest,
  LoginResponse, RegisterResponse,
  SendOTPRequest, SendOTPResponse,
  VerifyOTPRequest, VerifyOTPResponse,
  ResendOTPRequest, ResendOTPResponse,
  User
} from '@/types';

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';

// Create axios instance
const client = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // Enable cookies
});

// Request interceptor to add auth token
client.interceptors.request.use((config) => {
  if (typeof window !== "undefined") {
    const token = localStorage.getItem("auth_token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
      
      // Also set cookie for server-side access
      document.cookie = `auth_token=${token}; Path=/; Max-Age=${7 * 24 * 60 * 60}; SameSite=Strict${window.location.protocol === 'https:' ? '; Secure' : ''}`;
    }
  }
  return config;
});

// Response interceptor for error handling
client.interceptors.response.use(
  (res) => res,
  (err) => {
    if (!err.response) {
      return Promise.reject({
        status: 0,
        error: "NETWORK_ERROR",
        message: "Network unreachable. Check your connection.",
      });
    }
    const data = err.response.data || {};
    return Promise.reject({
      status: err.response.status,
      error: data.error || "REQUEST_ERROR",
      message: data.message || "Request failed",
      retryAfter: data.retryAfter,
      remainingAttempts: data.remainingAttempts,
    });
  }
);

// API client methods
export const apiClient = {
  // Authentication endpoints
  login: async (email: string, password: string): Promise<LoginResponse> => {
    const { data } = await client.post<LoginResponse>('/auth/login', {
      email,
      password
    } satisfies LoginRequest);
    
    // Set cookie immediately after successful login
    if (data.token && typeof window !== "undefined") {
      const secure = window.location.protocol === 'https:';
      const maxAge = 7 * 24 * 60 * 60; // 7 days
      document.cookie = `auth_token=${data.token}; Path=/; Max-Age=${maxAge}; SameSite=Strict${secure ? '; Secure' : ''}`;
    }
    
    return data;
  },

  register: async (payload: RegisterRequest): Promise<RegisterResponse> => {
    const { data } = await client.post<RegisterResponse>('/auth/register', payload);
    
    // Set cookie immediately after successful registration (if token provided)
    if (data.token && typeof window !== "undefined") {
      const secure = window.location.protocol === 'https:';
      const maxAge = 7 * 24 * 60 * 60; // 7 days
      document.cookie = `auth_token=${data.token}; Path=/; Max-Age=${maxAge}; SameSite=Strict${secure ? '; Secure' : ''}`;
    }
    
    return data;
  },

  getProfile: async (): Promise<{ user: User }> => {
    const { data } = await client.get<{ user: User }>('/auth/me');
    return data;
  },

  updateProfile: async (userData: Partial<User>): Promise<{ user: User }> => {
    const { data } = await client.patch<{ user: User }>('/auth/me', userData);
    return data;
  },

  // OTP endpoints
  sendOTP: async (payload: SendOTPRequest): Promise<SendOTPResponse> => {
    const { data } = await client.post<SendOTPResponse>('/auth/send-otp', payload);
    return data;
  },

  verifyOTP: async (payload: VerifyOTPRequest): Promise<VerifyOTPResponse> => {
    const { data } = await client.post<VerifyOTPResponse>('/auth/verify-otp', payload);
    
    // Set cookie if token is returned after verification
    if (data.token && typeof window !== "undefined") {
      const secure = window.location.protocol === 'https:';
      const maxAge = 7 * 24 * 60 * 60; // 7 days
      document.cookie = `auth_token=${data.token}; Path=/; Max-Age=${maxAge}; SameSite=Strict${secure ? '; Secure' : ''}`;
    }
    
    return data;
  },

  resendOTP: async (payload: ResendOTPRequest): Promise<ResendOTPResponse> => {
    const { data } = await client.post<ResendOTPResponse>('/auth/resend-otp', payload);
    return data;
  },

  // Logout method to clear cookies
  logout: async (): Promise<void> => {
    if (typeof window !== "undefined") {
      // Clear cookie
      document.cookie = 'auth_token=; Path=/; Expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Strict';
      // Clear localStorage
      localStorage.removeItem('auth_token');
    }
  },
};

// Export the axios instance as well for custom requests
export { client };
export default apiClient;
