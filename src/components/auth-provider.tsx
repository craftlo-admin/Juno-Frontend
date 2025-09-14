'use client';

import { useEffect, useRef, useState } from 'react';
import { useAuthStore } from '@/store/authStore';

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const initRan = useRef(false);
  const [booting, setBooting] = useState(true);
  const { initializeAuth } = useAuthStore();

  useEffect(() => {
    if (initRan.current) return;
    initRan.current = true;
    
    const initialize = async () => {
      try {
        await initializeAuth();
      } catch (error) {
        console.error('Auth initialization failed:', error);
        // Don't block the app, just log the error
      } finally {
        setBooting(false);
      }
    };

    // Add a small delay to prevent hydration issues
    const timer = setTimeout(initialize, 100);
    return () => clearTimeout(timer);
  }, [initializeAuth]);

  if (booting) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900">
        <div className="text-sm text-gray-300">Starting...</div>
      </div>
    );
  }

  return <>{children}</>;
}