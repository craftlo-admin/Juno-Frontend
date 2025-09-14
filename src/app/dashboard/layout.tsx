'use client';

import { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { useAuthStore } from '@/store/authStore';
// import { useTenantStore } from '@/store/tenantStore'; // TODO: Create this store
// import { useNotificationStore } from '@/store/notificationStore'; // TODO: Create this store
import { cn } from '@/lib/utils';
import {
  LayoutDashboard,
  FolderOpen,
  Rocket,
  Globe,
  BarChart3,
  HardDrive,
  Users,
  Settings,
  Menu,
  Bell
} from 'lucide-react';

const navigation = [
  {
    name: 'Dashboard',
    href: '/dashboard',
    icon: LayoutDashboard,
  },
  // {
  //   name: 'Projects',
  //   href: '/dashboard/projects',
  //   icon: FolderOpen,
  // },
  // {
  //   name: 'Deployments',
  //   href: '/dashboard/deployments',
  //   icon: Rocket,
  // },
  // {
  //   name: 'Domains',
  //   href: '/dashboard/domains',
  //   icon: Globe,
  // },
  // {
  //   name: 'Analytics',
  //   href: '/dashboard/analytics',
  //   icon: BarChart3,
  // },
  // {
  //   name: 'Storage',
  //   href: '/dashboard/storage',
  //   icon: HardDrive,
  // },
  // {
  //   name: 'Team',
  //   href: '/dashboard/team',
  //   icon: Users,
  // },
  // {
  //   name: 'Settings',
  //   href: '/dashboard/settings',
  //   icon: Settings,
  // },
];

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, logout, isAuthenticated, isLoading } = useAuthStore();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isInitializing, setIsInitializing] = useState(true);

  useEffect(() => {
    // Give auth store time to initialize before making redirect decisions
    const timer = setTimeout(() => {
      setIsInitializing(false);
    }, 100);

    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    // Only redirect after initialization is complete
    if (!isInitializing && !isLoading && !isAuthenticated) {
      const currentPath = pathname;
      const loginUrl = `/login${currentPath !== '/dashboard' ? `?redirect=${encodeURIComponent(currentPath)}` : ''}`;
      router.push(loginUrl);
    }
  }, [isAuthenticated, isLoading, isInitializing, router, pathname]);

  // Show loading screen while initializing or loading
  if (isInitializing || isLoading || !isAuthenticated || !user) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-white">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto mb-4"></div>
          <div>Loading dashboard...</div>
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
      {/* Mobile sidebar */}
      <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
        <SheetContent side="left" className="p-0 w-64">
          <div className="flex flex-col h-full">
            <div className="flex items-center px-4 py-4 border-b">
              <h2 className="text-lg font-semibold">Website Builder</h2>
            </div>
            <nav className="flex-1 px-4 py-4 space-y-2">
              {navigation.map((item) => {
                const isActive = pathname === item.href;
                const Icon = item.icon;
                
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={cn(
                      'flex items-center px-3 py-2 text-sm font-medium rounded-md',
                      isActive
                        ? 'bg-blue-100 text-blue-700'
                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                    )}
                    onClick={() => setSidebarOpen(false)}
                  >
                    <Icon className="mr-3 h-5 w-5" />
                    {item.name}
                  </Link>
                );
              })}
            </nav>
          </div>
        </SheetContent>
      </Sheet>

      {/* Desktop sidebar */}
      <div className="hidden lg:flex lg:w-64 lg:flex-col lg:fixed lg:inset-y-0">
        <div className="flex flex-col flex-grow bg-gray-800 border-r border-gray-700">
          <div className="flex items-center flex-shrink-0 px-4 py-4 border-b">
            <h2 className="text-lg font-semibold text-white">Website Builder</h2>
          </div>
          
          {/* Tenant Selector - TODO: Implement tenant functionality */}
          {/* {tenants && tenants.length > 0 && (
            <div className="px-4 py-3 border-b">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="w-full justify-start">
                    <span className="truncate">
                      {currentTenant?.name || 'Select Tenant'}
                    </span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56">
                  <DropdownMenuLabel>Switch Tenant</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  {tenants.map((tenant) => (
                    <DropdownMenuItem
                      key={tenant.id}
                      onClick={() => switchTenant(tenant.id)}
                    >
                      <div className="flex items-center justify-between w-full">
                        <span>{tenant.name}</span>
                        {tenant.id === currentTenant?.id && (
                          <Badge variant="secondary">Current</Badge>
                        )}
                      </div>
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          )} */}

          <nav className="flex-1 px-4 py-4 space-y-1">
            {navigation.map((item) => {
              const isActive = pathname === item.href;
              const Icon = item.icon;
              
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={cn(
                    'group flex items-center px-3 py-2 text-sm font-medium rounded-md',
                    isActive
                      ? 'bg-blue-600 text-white'
                      : 'text-gray-300 hover:text-white hover:bg-gray-700'
                  )}
                >
                  <Icon className="mr-3 h-5 w-5" />
                  {item.name}
                </Link>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Main content */}
      <div className="lg:pl-64 flex flex-col flex-1">
        {/* Top navigation */}
        <div className="sticky top-0 z-40 flex h-16 flex-shrink-0 items-center gap-x-4 border-b border-gray-700 bg-gray-800 px-4 shadow-sm sm:gap-x-6 sm:px-6 lg:px-8">
          {/* Mobile menu button */}
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="sm" className="lg:hidden">
                <span className="sr-only">Open sidebar</span>
                <svg
                  className="h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth="1.5"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5"
                  />
                </svg>
              </Button>
            </SheetTrigger>
          </Sheet>

          {/* Breadcrumb */}
          <div className="flex flex-1 gap-x-4 self-stretch lg:gap-x-6">
            <div className="flex items-center gap-x-2 text-sm text-gray-300">
              <span>Dashboard</span>
            </div>
          </div>

          {/* Right side */}
          <div className="flex items-center gap-x-4 lg:gap-x-6">
            {/* Notifications */}
            <Button variant="ghost" size="sm" className="relative">
              <span className="sr-only">View notifications</span>
              <svg
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth="1.5"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0"
                />
              </svg>
              {/* {unreadCount > 0 && (
                <Badge
                  variant="destructive"
                  className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 text-xs"
                >
                  {unreadCount}
                </Badge>
              )} */}
            </Button>

            {/* Profile dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src="" alt={`${user.firstName} ${user.lastName}`} />
                    <AvatarFallback>
                      {user.firstName?.[0]}{user.lastName?.[0]}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end" forceMount>
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none text-white">{user.firstName} {user.lastName}</p>
                    <p className="text-xs leading-none text-gray-400">
                      {user.email}
                    </p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href="/dashboard/profile">Profile</Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/dashboard/settings">Settings</Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/dashboard/billing">Billing</Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout}>
                  Log out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* Page content */}
        <main className="flex-1">
          <div className="py-6">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              {children}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
