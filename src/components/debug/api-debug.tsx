'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export function ApiDebug() {
  const [status, setStatus] = useState<string>('');

  const testBackend = async () => {
    try {
      setStatus('Testing...');
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';
      console.log('Testing API at:', apiUrl);
      
      const response = await fetch(`${apiUrl}/health`, {
        method: 'GET',
      });
      
      console.log('API Response status:', response.status);
      
      if (response.ok) {
        const data = await response.text();
        setStatus(`✅ Backend is running: ${data}`);
      } else {
        setStatus(`❌ Backend error: ${response.status}`);
      }
    } catch (error) {
      console.error('Backend test failed:', error);
      setStatus(`❌ Backend not accessible: ${error}`);
    }
  };

  return (
    <Card className="max-w-md mx-auto mt-4 bg-gray-800 border-gray-700">
      <CardHeader>
        <CardTitle className="text-white">API Debug</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Button 
          onClick={testBackend}
          className="w-full bg-green-600 hover:bg-green-700"
        >
          Test Backend Connection
        </Button>
        <div className="text-sm text-gray-300">
          <p>{status}</p>
          <p>API URL: {process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api'}</p>
        </div>
      </CardContent>
    </Card>
  );
}