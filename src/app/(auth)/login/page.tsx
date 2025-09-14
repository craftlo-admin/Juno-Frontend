'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuthStore } from '@/store/authStore';

// Login form schema
const loginSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(1, 'Password is required'),
});

type LoginFormData = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [serverError, setServerError] = useState<string>('');
  const router = useRouter();
  const { login } = useAuthStore();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormData) => {
    setIsLoading(true);
    setServerError('');
    
    try {
      await login(data.email, data.password);

      // Check for redirect parameter, default to workspace instead of dashboard
      const searchParams = new URLSearchParams(window.location.search);
      const redirectTo = searchParams.get('redirect') || '/workspace'; // Changed from '/dashboard'
      
      router.push(redirectTo);
    } catch (error: any) {
      setServerError(error.userMessage || error.message || 'Login failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-900">
      <div className="w-full max-w-md space-y-6 p-6">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-white">Website Builder</h1>
          <p className="mt-2 text-gray-300">Sign in to your account</p>
        </div>

        <Card className="border-gray-700 bg-gray-800">
          <CardHeader>
            <CardTitle className="text-white">Sign In</CardTitle>
            <CardDescription className="text-gray-300">
              Enter your credentials to access your dashboard
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              {serverError && (
                <div className="bg-red-900/50 border border-red-700 rounded-md p-3">
                  <p className="text-sm text-red-200">{serverError}</p>
                </div>
              )}
              
              <div className="space-y-2">
                <Label htmlFor="email" className="text-gray-200">Email</Label>
                <Input
                  id="email"
                  type="email"
                  {...register('email')}
                  placeholder="john@company.com"
                  className={`bg-gray-700 border-gray-600 text-white placeholder-gray-400 ${errors.email ? 'border-red-500' : ''}`}
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
                  placeholder="Enter your password"
                  className={`bg-gray-700 border-gray-600 text-white placeholder-gray-400 ${errors.password ? 'border-red-500' : ''}`}
                />
                {errors.password && (
                  <p className="text-sm text-red-400">{errors.password.message}</p>
                )}
              </div>

              <Button
                type="submit"
                className="w-full bg-blue-600 hover:bg-blue-700"
                disabled={isLoading}
              >
                {isLoading ? 'Signing in...' : 'Sign In'}
              </Button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-sm text-gray-300">
                Don't have an account?{' '}
                <Link
                  href="/register"
                  className="text-blue-400 hover:text-blue-300 hover:underline font-medium"
                >
                  Create an account
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
