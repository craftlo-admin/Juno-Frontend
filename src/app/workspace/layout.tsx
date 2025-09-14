'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
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
  Upload,
  User,
  Settings,
  LogOut,
  CreditCard
} from 'lucide-react';

interface WorkspaceLayoutProps {
  children: React.ReactNode;
}

export default function WorkspaceLayout({ children }: WorkspaceLayoutProps) {
  const router = useRouter();
  const { user, logout, isAuthenticated, isLoading } = useAuthStore();
  const [mounted, setMounted] = useState(false);

  // Ensure component is mounted
  useEffect(() => {
    setMounted(true);
  }, []);

  // Handle auth redirect only after mounting and auth is loaded
  useEffect(() => {
    if (mounted && !isLoading && !isAuthenticated) {
      router.replace('/login?redirect=/workspace');
    }
  }, [mounted, isLoading, isAuthenticated, router]);

  const handleLogout = () => {
    logout();
    router.replace('/login');
  };

  // Don't render until mounted to prevent hydration mismatch
  if (!mounted) {
    return null;
  }

  // Show loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-900">
        <header className="sticky top-0 z-40 flex h-16 items-center gap-x-4 border-b border-gray-700 bg-gray-800 px-4 shadow-sm sm:gap-x-6 sm:px-6 lg:px-8">
          <div className="flex flex-1 items-center justify-between">
            <div className="flex items-center gap-x-3">
              <div className="h-8 w-8 rounded-lg bg-blue-600 flex items-center justify-center">
                <Upload className="h-5 w-5 text-white" />
              </div>
              <h1 className="text-lg font-semibold text-white">Workspace</h1>
            </div>
            <div className="h-8 w-8 rounded-full bg-gray-600 animate-pulse" />
          </div>
        </header>
        <main className="flex-1 p-6">
          <div className="text-gray-400 text-sm">Loading workspace...</div>
        </main>
      </div>
    );
  }

  // If not authenticated after loading, don't show content (middleware will redirect)
  if (!isAuthenticated || !user) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-white">Redirecting to login...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900">
      <header className="sticky top-0 z-40 flex h-16 items-center gap-x-4 border-b border-gray-700 bg-gray-800 px-4 shadow-sm sm:gap-x-6 sm:px-6 lg:px-8">
        <div className="flex flex-1 items-center justify-between">
          {/* Brand */}
          <div className="flex items-center gap-x-3">
            <div className="h-8 w-8 rounded-lg bg-blue-600 flex items-center justify-center">
              <Upload className="h-5 w-5 text-white" />
            </div>
            <h1 className="text-lg font-semibold text-white">Workspace</h1>
          </div>

          {/* Profile Dropdown */}
          <div className="flex items-center">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src="" alt={`${user?.firstName} ${user?.lastName}`} />
                    <AvatarFallback className="bg-blue-600 text-white">
                      {user?.firstName?.[0]}{user?.lastName?.[0]}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56 bg-gray-800 border-gray-700" align="end" forceMount>
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none text-white">
                      {user?.firstName} {user?.lastName}
                    </p>
                    <p className="text-xs leading-none text-gray-400">
                      {user?.email}
                    </p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator className="bg-gray-700" />
                <DropdownMenuItem asChild className="text-gray-300 hover:text-white hover:bg-gray-700">
                  <Link href="/dashboard/profile">
                    <User className="mr-2 h-4 w-4" />
                    Profile
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild className="text-gray-300 hover:text-white hover:bg-gray-700">
                  <Link href="/dashboard/settings">
                    <Settings className="mr-2 h-4 w-4" />
                    Settings
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild className="text-gray-300 hover:text-white hover:bg-gray-700">
                  <Link href="/dashboard/billing">
                    <CreditCard className="mr-2 h-4 w-4" />
                    Billing
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator className="bg-gray-700" />
                <DropdownMenuItem
                  onClick={handleLogout}
                  className="text-gray-300 hover:text-white hover:bg-gray-700 cursor-pointer"
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  Log out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </header>

      <main className="flex-1">
        <div className="py-6">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            {children}
          </div>
        </div>
      </main>
    </div>
  );
}