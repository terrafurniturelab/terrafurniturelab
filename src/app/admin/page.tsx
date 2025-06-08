'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import LoadingScreen from '@/components/LoadingScreen';

export default function AdminPage() {
 
  const router = useRouter();

  useEffect(() => {
    // Check admin session
    fetch('/api/admin/me')
      .then(res => {
        if (res.ok) {
          // If admin session exists, redirect to dashboard
          router.replace('/admin/dashboard');
        } else {
          // If no admin session, redirect to login
          router.replace('/admin/login');
        }
      })
      .catch(() => {
        // If error, redirect to login
        router.replace('/admin/login');
      });
  }, [router]);

  

  return (
    <div>
      <LoadingScreen isLoading={true} />
    </div>
  );
} 