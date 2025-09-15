'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { useAuthStore } from '@/store/authStore';
import { 
  Rocket, 
  Globe, 
  BarChart3, 
  Users, 
  Plus,
  Activity,
  HardDrive
} from 'lucide-react';

export default function DashboardPage() {
  const { user } = useAuthStore();
  
  return (
    <div className="space-y-6">
      {/* <div className="border-b border-gray-700 pb-4">
        <h1 className="text-2xl font-bold text-white">
          Welcome back, {user?.firstName || 'there'}!
        </h1>
        <p className="mt-1 text-gray-300">
          Here's an overview of your projects and deployments.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="border-gray-700 bg-gray-800">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-200">Projects</CardTitle>
            <Rocket className="h-4 w-4 text-blue-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">3</div>
            <p className="text-xs text-gray-400">Active projects</p>
          </CardContent>
        </Card>

        <Card className="border-gray-700 bg-gray-800">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-200">Deployments</CardTitle>
            <Globe className="h-4 w-4 text-green-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">12</div>
            <p className="text-xs text-gray-400">Total deployments</p>
          </CardContent>
        </Card>

        <Card className="border-gray-700 bg-gray-800">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-200">Visitors</CardTitle>
            <Users className="h-4 w-4 text-purple-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">1.2K</div>
            <p className="text-xs text-gray-400">This month</p>
          </CardContent>
        </Card>

        <Card className="border-gray-700 bg-gray-800">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-200">Storage</CardTitle>
            <HardDrive className="h-4 w-4 text-orange-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">450 MB</div>
            <p className="text-xs text-gray-400">Used storage</p>
          </CardContent>
        </Card>
      </div>

      <Card className="border-gray-700 bg-gray-800">
        <CardHeader>
          <CardTitle className="text-white">Quick Actions</CardTitle>
          <CardDescription className="text-gray-300">
            Get started with your website builder
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            <Button asChild className="bg-blue-600 hover:bg-blue-700">
              <Link href="/dashboard/projects/new">
                <Plus className="w-4 h-4 mr-2" />
                New Project
              </Link>
            </Button>
            <Button variant="outline" asChild className="border-gray-600 text-gray-300 hover:text-white">
              <Link href="/dashboard/projects">
                <Rocket className="w-4 h-4 mr-2" />
                View Projects
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card> */}
      Hello
    </div>
  );
}
