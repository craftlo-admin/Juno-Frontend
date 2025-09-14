// API Response Types
export interface ApiResponse<T = any> {
  status: 'success' | 'error';
  data?: T;
  message?: string;
  meta?: {
    version: string;
    timestamp: string;
    request_id: string;
  };
}

export interface ApiError {
  error: string;
  message: string;
  details?: any;
}

// User Types
export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: 'admin' | 'owner' | 'member' | 'user';
  createdAt: string;
  updatedAt?: string;
  lastLoginAt?: string;
  emailVerified?: boolean;
  fullName?: string;
}

// Auth State
export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

// Auth Request Types
export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
}

// Auth Response Types
export interface LoginResponse {
  message: string;
  user: User;
  token: string;
}

export interface RegisterResponse {
  message: string;
  user: User;
  token?: string; // Optional because some backends require email verification first
}

// OTP Types
export type OTPType = 'registration' | 'login' | 'password_reset';

export interface SendOTPRequest {
  email: string;
  type: OTPType;
}

export interface SendOTPResponse {
  message: string;
  otpSent: boolean;
  expiresAt?: string;
}

export interface VerifyOTPRequest {
  email: string;
  otp: string;
  type: OTPType;
}

export interface VerifyOTPResponse {
  message: string;
  verified: boolean;
  user?: User;
  token?: string;
}

export interface ResendOTPRequest {
  email: string;
  type: OTPType;
}

export interface ResendOTPResponse {
  message: string;
  otpSent: boolean;
  expiresAt?: string;
}

// Error Types
export interface AuthError {
  error: string;
  message: string;
  type?:
    | 'LOGIN_ERROR'
    | 'REGISTER_ERROR'
    | 'VERIFICATION_ERROR'
    | 'RESEND_ERROR'
    | 'RATE_LIMITED'
    | 'USER_EXISTS';
  userMessage?: string;
  retryAfter?: number;
  remainingAttempts?: number;
  status?: number;
}

// Project Types (for future use)
export interface Project {
  id: string;
  name: string;
  description?: string;
  url?: string;
  status: 'active' | 'inactive' | 'pending';
  createdAt: string;
  updatedAt: string;
  userId: string;
}

// Deployment Types (for future use)
export interface Deployment {
  id: string;
  projectId: string;
  status: 'pending' | 'running' | 'completed' | 'failed';
  environment: 'development' | 'staging' | 'production';
  createdAt: string;
  completedAt?: string;
  logs?: string[];
}
