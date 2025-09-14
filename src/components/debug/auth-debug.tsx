'use client';

import { useState } from 'react';
import { useAuthStore } from '@/store/authStore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export function AuthDebug() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { login, user, isAuthenticated, isLoading } = useAuthStore();

  const handleTestLogin = async () => {
    try {
      console.log('Testing login with:', email);
      await login(email, password);
      console.log('Login successful');
    } catch (error) {
      console.error('Login failed:', error);
    }
  };

  const checkStorage = () => {
    console.log('=== Storage Check ===');
    console.log('localStorage token:', localStorage.getItem('auth_token'));
    console.log('cookies:', document.cookie);
    console.log('Auth state:', { isAuthenticated, user });
  };

  return (
    <Card className="max-w-md mx-auto mt-8 bg-gray-800 border-gray-700">
      <CardHeader>
        <CardTitle className="text-white">Auth Debug</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="bg-gray-700 border-gray-600 text-white"
        />
        <Input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="bg-gray-700 border-gray-600 text-white"
        />
        <Button 
          onClick={handleTestLogin} 
          disabled={isLoading}
          className="w-full bg-blue-600 hover:bg-blue-700"
        >
          {isLoading ? 'Testing...' : 'Test Login'}
        </Button>
        <Button 
          onClick={checkStorage} 
          variant="outline"
          className="w-full border-gray-600 text-gray-300"
        >
          Check Storage
        </Button>
        <div className="text-sm text-gray-300">
          <p>Authenticated: {isAuthenticated ? 'Yes' : 'No'}</p>
          <p>User: {user?.email || 'None'}</p>
        </div>
      </CardContent>
    </Card>
  );
}