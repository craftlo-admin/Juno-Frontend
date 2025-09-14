'use client';

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Globe, 
  Zap, 
  Shield, 
  BarChart3, 
  Rocket, 
  Code2, 
  Users, 
  Star,
  ArrowRight,
  Check
} from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800">
      {/* Navigation */}
      <nav className="border-b border-gray-700 bg-gray-900/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
                <Code2 className="w-5 h-5 text-white" />
              </div>
              <span className="font-bold text-xl text-white">WebsiteBuilder</span>
            </div>
            
            <div className="hidden md:block">
              <div className="ml-10 flex items-baseline space-x-4">
                <a href="#features" className="text-gray-300 hover:text-white px-3 py-2 text-sm font-medium">
                  Features
                </a>
                <a href="#pricing" className="text-gray-300 hover:text-white px-3 py-2 text-sm font-medium">
                  Pricing
                </a>
                <a href="#about" className="text-gray-300 hover:text-white px-3 py-2 text-sm font-medium">
                  About
                </a>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <Link href="/login">
                <Button variant="ghost" className="text-gray-300 hover:text-white hover:bg-gray-800">
                  Sign In
                </Button>
              </Link>
              <Link href="/register">
                <Button className="bg-blue-600 hover:bg-blue-700">
                  Get Started
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative py-20 lg:py-28">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center animate-fade-in">
            <Badge className="mb-6 bg-blue-900 text-blue-200 hover:bg-blue-800">
              🚀 Build & Deploy in Minutes
            </Badge>
            
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white leading-tight">
              Build Websites
              <span className="block text-blue-400">Lightning Fast</span>
            </h1>
            
            <p className="mt-6 text-xl text-gray-300 max-w-3xl mx-auto">
              Create, deploy, and manage your websites with our powerful platform. 
              From simple landing pages to complex applications - we've got you covered.
            </p>
            
            <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/register">
                <Button size="lg" className="bg-blue-600 hover:bg-blue-700 text-lg px-8 py-6">
                  Start Building Free
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
              </Link>
              <Link href="/login">
                <Button size="lg" variant="outline" className="text-lg px-8 py-6">
                  View Demo
                </Button>
              </Link>
            </div>

            <div className="mt-8 flex items-center justify-center space-x-6 text-sm text-gray-400">
              <div className="flex items-center">
                <Check className="w-4 h-4 text-green-400 mr-2" />
                Free SSL certificates
              </div>
              <div className="flex items-center">
                <Check className="w-4 h-4 text-green-400 mr-2" />
                Global CDN
              </div>
              <div className="flex items-center">
                <Check className="w-4 h-4 text-green-400 mr-2" />
                24/7 Support
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 bg-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-white mb-4">
              Everything you need to succeed
            </h2>
            <p className="text-xl text-gray-300 max-w-2xl mx-auto">
              Powerful features designed to help you build, deploy, and scale your websites effortlessly.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <Card className="border border-gray-700 bg-gray-900 shadow-lg hover:shadow-xl transition-shadow">
              <CardHeader>
                <div className="w-12 h-12 bg-blue-900 rounded-lg flex items-center justify-center mb-4">
                  <Zap className="w-6 h-6 text-blue-400" />
                </div>
                <CardTitle className="text-white">Lightning Fast Deployment</CardTitle>
                <CardDescription className="text-gray-300">
                  Deploy your websites in seconds with our optimized build pipeline and global CDN.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border border-gray-700 bg-gray-900 shadow-lg hover:shadow-xl transition-shadow">
              <CardHeader>
                <div className="w-12 h-12 bg-green-900 rounded-lg flex items-center justify-center mb-4">
                  <Shield className="w-6 h-6 text-green-400" />
                </div>
                <CardTitle className="text-white">Enterprise Security</CardTitle>
                <CardDescription className="text-gray-300">
                  Built-in SSL certificates, DDoS protection, and enterprise-grade security features.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border border-gray-700 bg-gray-900 shadow-lg hover:shadow-xl transition-shadow">
              <CardHeader>
                <div className="w-12 h-12 bg-purple-900 rounded-lg flex items-center justify-center mb-4">
                  <BarChart3 className="w-6 h-6 text-purple-400" />
                </div>
                <CardTitle className="text-white">Real-time Analytics</CardTitle>
                <CardDescription className="text-gray-300">
                  Monitor your website performance with detailed analytics and insights dashboard.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border border-gray-700 bg-gray-900 shadow-lg hover:shadow-xl transition-shadow">
              <CardHeader>
                <div className="w-12 h-12 bg-orange-900 rounded-lg flex items-center justify-center mb-4">
                  <Globe className="w-6 h-6 text-orange-400" />
                </div>
                <CardTitle className="text-white">Custom Domains</CardTitle>
                <CardDescription className="text-gray-300">
                  Connect your custom domains with automatic SSL and DNS management.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border border-gray-700 bg-gray-900 shadow-lg hover:shadow-xl transition-shadow">
              <CardHeader>
                <div className="w-12 h-12 bg-red-900 rounded-lg flex items-center justify-center mb-4">
                  <Rocket className="w-6 h-6 text-red-400" />
                </div>
                <CardTitle className="text-white">Auto Scaling</CardTitle>
                <CardDescription className="text-gray-300">
                  Automatically scale your applications based on traffic with zero configuration.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border border-gray-700 bg-gray-900 shadow-lg hover:shadow-xl transition-shadow">
              <CardHeader>
                <div className="w-12 h-12 bg-teal-900 rounded-lg flex items-center justify-center mb-4">
                  <Users className="w-6 h-6 text-teal-400" />
                </div>
                <CardTitle className="text-white">Team Collaboration</CardTitle>
                <CardDescription className="text-gray-300">
                  Work together with your team using built-in collaboration tools and permissions.
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-blue-600 to-purple-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl lg:text-4xl font-bold text-white mb-4">
            Ready to build something amazing?
          </h2>
          <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
            Join thousands of developers who trust WebsiteBuilder for their projects.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/register">
              <Button size="lg" className="bg-white text-blue-600 hover:bg-gray-100 text-lg px-8 py-6">
                Start Free Trial
              </Button>
            </Link>
            <Link href="/login">
              <Button size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-blue-600 text-lg px-8 py-6">
                Sign In
              </Button>
            </Link>
          </div>

          <div className="mt-8 flex items-center justify-center space-x-8">
            <div className="flex items-center text-blue-100">
              <Star className="w-5 h-5 text-yellow-300 fill-current mr-2" />
              <span>4.9/5 rating</span>
            </div>
            <div className="text-blue-100">
              <span>10,000+ websites deployed</span>
            </div>
            <div className="text-blue-100">
              <span>99.9% uptime</span>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="col-span-1 md:col-span-2">
              <div className="flex items-center space-x-2 mb-4">
                <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
                  <Code2 className="w-5 h-5 text-white" />
                </div>
                <span className="font-bold text-xl">WebsiteBuilder</span>
              </div>
              <p className="text-gray-400 mb-4 max-w-md">
                Build, deploy, and scale your websites with confidence. 
                The modern platform for developers and businesses.
              </p>
            </div>
            
            <div>
              <h3 className="font-semibold mb-4">Product</h3>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white">Features</a></li>
                <li><a href="#" className="hover:text-white">Pricing</a></li>
                <li><a href="#" className="hover:text-white">Documentation</a></li>
                <li><a href="#" className="hover:text-white">API</a></li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-semibold mb-4">Company</h3>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white">About</a></li>
                <li><a href="#" className="hover:text-white">Blog</a></li>
                <li><a href="#" className="hover:text-white">Contact</a></li>
                <li><a href="#" className="hover:text-white">Support</a></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2025 WebsiteBuilder. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
