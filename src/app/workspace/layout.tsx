'use client';

import { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useAuthStore } from '@/store/authStore';
import {
  Bell,
  Upload
} from 'lucide-react';

interface WorkspaceLayoutProps {
  children: React.ReactNode;
}

export default function WorkspaceLayout({ children }: WorkspaceLayoutProps) {
  const router = useRouter();
  const { user, logout, isAuthenticated, isLoading, initializeAuth } = useAuthStore();
  const [authChecked, setAuthChecked] = useState(false);

  // Initialize auth immediately when component mounts
  useEffect(() => {
    console.log('Workspace layout mounted, initializing auth...');
    
    const initAuth = async () => {
      try {
        await initializeAuth();
        console.log('Auth initialization complete');
      } catch (error) {
        console.error('Failed to initialize auth:', error);
      } finally {
        setAuthChecked(true);
      }
    };

    initAuth();
  }, [initializeAuth]);

  // Handle redirect logic after auth is checked
  useEffect(() => {
    if (!authChecked || isLoading) {
      console.log('Waiting for auth check...', { authChecked, isLoading });
      return;
    }

    console.log('Auth state:', {
      isAuthenticated,
      hasUser: !!user,
      userEmail: user?.email,
      token: typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null
    });

    // Check if token exists in localStorage
    const token = localStorage.getItem('auth_token');
    console.log('Token check:', { hasToken: !!token, isAuthenticated });

    // Redirect to login if no token or not authenticated
    if (!token || !isAuthenticated || !user) {
      console.log('No valid auth found, redirecting to login...');
      // Force redirect to login page
      router.push('/login');
      return;
    }

    console.log('User is authenticated, showing workspace');
  }, [authChecked, isAuthenticated, isLoading, user]);

  // Show loading screen while auth is being checked or while loading
  if (!authChecked || isLoading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-white text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto mb-4"></div>
          <div>Loading workspace...</div>
        </div>
      </div>
    );
  }

  // Check token one more time before rendering
  const token = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null;
  
  // Show redirecting message if not authenticated or no token
  if (!token || !isAuthenticated || !user) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-white text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto mb-4"></div>
          <div>Redirecting to login...</div>
          <div className="mt-2 text-sm text-gray-400">
            No authentication token found
          </div>
          <div className="mt-4">
            <button 
              onClick={() => router.push('/login')} 
              className="text-blue-400 hover:underline bg-blue-600 px-4 py-2 rounded"
            >
              Go to Login
            </button>
          </div>
        </div>
      </div>
    );
  }

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  return (
    <div className="min-h-screen bg-gray-900">
      {/* Header */}
      <header className="sticky top-0 z-40 border-b border-gray-700 bg-gray-800 shadow-sm">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            {/* Logo */}
            <div className="flex items-center">
              <Upload className="h-8 w-8 text-blue-400 mr-3" />
              <h1 className="text-xl font-bold text-white">Website Builder</h1>
            </div>

            {/* Right side */}
            <div className="flex items-center gap-x-4">
              {/* Notifications */}
              <Button variant="ghost" size="sm" className="relative text-gray-300 hover:text-white">
                <span className="sr-only">View notifications</span>
                <Bell className="h-6 w-6" />
              </Button>

              {/* Profile dropdown */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src="" alt={`${user.firstName} ${user.lastName}`} />
                      <AvatarFallback className="bg-blue-600 text-white">
                        {user.firstName?.[0]}{user.lastName?.[0]}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56 bg-gray-800 border-gray-700" align="end" forceMount>
                  <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium leading-none text-white">{user.firstName} {user.lastName}</p>
                      <p className="text-xs leading-none text-gray-400">
                        {user.email}
                      </p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator className="bg-gray-700" />
                  <DropdownMenuItem onClick={handleLogout} className="text-gray-300 hover:text-white hover:bg-gray-700">
                    Log out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {children}
      </main>
    </div>
  );
}
