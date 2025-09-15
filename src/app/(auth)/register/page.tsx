'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useAuthStore } from '@/store/authStore';
import { OTPInput } from '@/components/forms/otp-input';
import { CheckCircle, AlertTriangle, Mail, Clock, ArrowLeft } from 'lucide-react';
import { formatTime } from '@/lib/utils';

// Registration form schema
const registerSchema = z.object({
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  email: z.string().email('Please enter a valid email address'),
  password: z.string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, 'Password must contain at least one uppercase letter, one lowercase letter, and one number'),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

type RegisterFormData = z.infer<typeof registerSchema>;

export default function RegisterPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [serverError, setServerError] = useState<string>('');
  const [successMessage, setSuccessMessage] = useState<string>('');
  const [showOTPVerification, setShowOTPVerification] = useState(false);
  const [registeredEmail, setRegisteredEmail] = useState<string>('');
  const [resendCooldown, setResendCooldown] = useState(0);
  const [isVerifying, setIsVerifying] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const requestInProgress = useRef(false);
  
  const router = useRouter();
  const { register: registerUser, verifyOTP, resendOTP } = useAuthStore();

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
  });

  // Watch all form values for debugging
  const formValues = watch();

  // Resend cooldown timer
  useEffect(() => {
    if (resendCooldown > 0) {
      const timer = setTimeout(() => setResendCooldown(prev => prev - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [resendCooldown]);

  const onSubmit = async (data: RegisterFormData) => {
    if (requestInProgress.current) return;
    
    requestInProgress.current = true;
    setIsLoading(true);
    setServerError('');
    setSuccessMessage('');
    
    // Debug: Log form data being sent
    console.log('Form data being sent:', {
      firstName: data.firstName,
      lastName: data.lastName,
      email: data.email,
      password: data.password ? '[PRESENT]' : '[MISSING]',
      confirmPassword: data.confirmPassword ? '[PRESENT]' : '[MISSING]'
    });
    
    try {
      // Validate all required fields are present
      if (!data.firstName || !data.lastName || !data.email || !data.password) {
        throw new Error('All fields are required');
      }

      // First register the user with all form data
      const registerResult = await registerUser(
        data.email, 
        data.password, 
        data.firstName, 
        data.lastName
      );
      
      console.log('Registration result:', registerResult);
      
      // Check if registration was successful and requires verification
      if (registerResult?.requiresVerification !== false) {
        // Registration API already sends OTP automatically
        setOtpSent(true);
        setSuccessMessage('Registration successful! Please check your email for the 6-digit verification code.');
        setRegisteredEmail(data.email);
        setShowOTPVerification(true);
        setResendCooldown(60);
      } else {
        // Direct login if no verification required
        setSuccessMessage('Registration successful! Redirecting to workspace...');
        setTimeout(() => {
          router.push('/workspace');
        }, 1500);
      }
    } catch (error: any) {
      console.error('Registration process failed:', error);
      setServerError(error.userMessage || error.message || 'Registration failed. Please try again.');
    } finally {
      setIsLoading(false);
      requestInProgress.current = false;
    }
  };

  const handleOTPComplete = async (otp: string) => {
    if (isVerifying || requestInProgress.current) return;

    requestInProgress.current = true;
    setIsVerifying(true);
    setServerError('');
    setSuccessMessage('');

    console.log('Verifying OTP:', otp, 'for email:', registeredEmail);

    try {
      const result = await verifyOTP({ 
        email: registeredEmail, 
        otp, 
        type: 'registration' 
      });
      
      console.log('Verification result:', result);
      
      if (result?.verified || result?.token) {
        setSuccessMessage('Email verified successfully! Redirecting to workspace...');
        setTimeout(() => {
          router.push('/workspace');
        }, 1500);
      } else {
        setSuccessMessage('Email verified successfully!');
        setTimeout(() => {
          router.push('/workspace');
        }, 1500);
      }
    } catch (error: any) {
      console.error('OTP verification failed:', error);
      
      if (error.status === 429 || error.type === 'RATE_LIMITED') {
        setServerError(`Too many verification attempts. Please wait ${Math.ceil((error.retryAfter || 300) / 60)} minute(s).`);
      } else if (error.error?.toLowerCase().includes('invalid') || error.error?.toLowerCase().includes('expired')) {
        setServerError('Invalid or expired code. Please try again.');
      } else {
        setServerError(error.userMessage || error.message || 'Verification failed. Please try again.');
      }

      // Clear OTP input
      if ((window as any).clearOTP) {
        (window as any).clearOTP();
      }
    } finally {
      setIsVerifying(false);
      requestInProgress.current = false;
    }
  };

  const handleResendOTP = async () => {
    if (resendCooldown > 0 || isLoading || requestInProgress.current) return;

    requestInProgress.current = true;
    setIsLoading(true);
    setServerError('');
    setSuccessMessage('');

    try {
      console.log('Resending OTP to:', registeredEmail);
      await resendOTP({ email: registeredEmail, type: 'registration' });
      setSuccessMessage('New verification code sent to your email.');
      setResendCooldown(60);
    } catch (error: any) {
      console.error('Failed to resend OTP:', error);
      
      if (error.status === 429 || error.type === 'RATE_LIMITED') {
        setServerError(`Too many resend attempts. Please wait ${Math.ceil((error.retryAfter || 300) / 60)} minute(s).`);
      } else {
        setServerError(error.userMessage || error.message || 'Failed to resend verification code.');
      }
    } finally {
      setIsLoading(false);
      requestInProgress.current = false;
    }
  };

  const handleBackToRegistration = () => {
    setShowOTPVerification(false);
    setRegisteredEmail('');
    setServerError('');
    setSuccessMessage('');
    setResendCooldown(0);
    setOtpSent(false);
    requestInProgress.current = false;
  };

  if (showOTPVerification) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900">
        <div className="w-full max-w-md space-y-6 p-6">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-white">Website Builder</h1>
            <p className="mt-2 text-gray-300">Verify your email</p>
          </div>

          <Card className="border-gray-700 bg-gray-800">
            <CardHeader className="text-center">
              <div className="flex justify-center mb-4">
                <span className="rounded-full bg-blue-600 p-3">
                  <Mail className="h-6 w-6 text-white" />
                </span>
              </div>
              <CardTitle className="text-white text-2xl font-bold">
                Verify Email
              </CardTitle>
              <CardDescription className="text-gray-300">
                Enter the 6-digit code sent to:
                <br />
                <span className="text-blue-400 font-medium">{registeredEmail}</span>
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {serverError && (
                <Alert variant="destructive">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>{serverError}</AlertDescription>
                </Alert>
              )}
              
              {successMessage && (
                <Alert variant="success">
                  <CheckCircle className="h-4 w-4" />
                  <AlertDescription>{successMessage}</AlertDescription>
                </Alert>
              )}

              <OTPInput
                length={6}
                onComplete={handleOTPComplete}
                disabled={isLoading || isVerifying}
                error={!!serverError}
              />

              <div className="text-center space-y-3">
                <Button
                  variant="outline"
                  disabled={resendCooldown > 0 || isLoading || requestInProgress.current}
                  onClick={handleResendOTP}
                  className="border-gray-600 text-gray-300 hover:text-white hover:bg-gray-700"
                >
                  {resendCooldown > 0 ? (
                    <>
                      <Clock className="h-4 w-4 mr-2" />
                      Resend in {formatTime(resendCooldown)}
                    </>
                  ) : (
                    'Resend Code'
                  )}
                </Button>
                
                <div>
                  <Button
                    variant="ghost"
                    onClick={handleBackToRegistration}
                    className="text-gray-400 hover:text-white"
                    disabled={requestInProgress.current}
                  >
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Back to Registration
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-900">
      <div className="w-full max-w-md space-y-6 p-6">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-white">Website Builder</h1>
          <p className="mt-2 text-gray-300">Create your account</p>
        </div>

        <Card className="border-gray-700 bg-gray-800">
          <CardHeader>
            <CardTitle className="text-white">Create Account</CardTitle>
            <CardDescription className="text-gray-300">
              Enter your details to get started
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              {serverError && (
                <Alert variant="destructive">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>{serverError}</AlertDescription>
                </Alert>
              )}
              
              {successMessage && (
                <Alert variant="success">
                  <CheckCircle className="h-4 w-4" />
                  <AlertDescription>{successMessage}</AlertDescription>
                </Alert>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="firstName" className="text-gray-200">First Name</Label>
                  <Input
                    id="firstName"
                    {...register('firstName')}
                    placeholder="John"
                    className={`bg-gray-700 border-gray-600 text-white placeholder-gray-400 ${errors.firstName ? 'border-red-500' : ''}`}
                    disabled={isLoading || requestInProgress.current}
                  />
                  {errors.firstName && (
                    <p className="text-sm text-red-400">{errors.firstName.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="lastName" className="text-gray-200">Last Name</Label>
                  <Input
                    id="lastName"
                    {...register('lastName')}
                    placeholder="Doe"
                    className={`bg-gray-700 border-gray-600 text-white placeholder-gray-400 ${errors.lastName ? 'border-red-500' : ''}`}
                    disabled={isLoading || requestInProgress.current}
                  />
                  {errors.lastName && (
                    <p className="text-sm text-red-400">{errors.lastName.message}</p>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="email" className="text-gray-200">Email</Label>
                <Input
                  id="email"
                  type="email"
                  {...register('email')}
                  placeholder="john@company.com"
                  className={`bg-gray-700 border-gray-600 text-white placeholder-gray-400 ${errors.email ? 'border-red-500' : ''}`}
                  disabled={isLoading || requestInProgress.current}
                />
                {errors.email && (
                  <p className="text-sm text-red-400">{errors.email.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="text-gray-200">Password</Label>
                <Input
                  id="password"
                  type="password"
                  {...register('password')}
                  placeholder="Create a strong password"
                  className={`bg-gray-700 border-gray-600 text-white placeholder-gray-400 ${errors.password ? 'border-red-500' : ''}`}
                  disabled={isLoading || requestInProgress.current}
                />
                {errors.password && (
                  <p className="text-sm text-red-400">{errors.password.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword" className="text-gray-200">Confirm Password</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  {...register('confirmPassword')}
                  placeholder="Confirm your password"
                  className={`bg-gray-700 border-gray-600 text-white placeholder-gray-400 ${errors.confirmPassword ? 'border-red-500' : ''}`}
                  disabled={isLoading || requestInProgress.current}
                />
                {errors.confirmPassword && (
                  <p className="text-sm text-red-400">{errors.confirmPassword.message}</p>
                )}
              </div>

              <Button
                type="submit"
                className="w-full bg-blue-600 hover:bg-blue-700"
                disabled={isLoading || requestInProgress.current}
              >
                {isLoading ? 'Creating Account...' : 'Create Account'}
              </Button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-sm text-gray-300">
                Already have an account?{' '}
                <Link
                  href="/login"
                  className="text-blue-400 hover:text-blue-300 hover:underline font-medium"
                >
                  Sign in
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
