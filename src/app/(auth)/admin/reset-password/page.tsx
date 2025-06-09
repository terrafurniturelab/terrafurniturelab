'use client';

import React, { Suspense } from 'react';
import LoadingScreen from '@/components/LoadingScreen';
import ResetPasswordForm from '@/app/(auth)/admin/reset-password/ResetPasswordForm';

export default function AdminResetPassword() {
  return (
    <Suspense fallback={<LoadingScreen isLoading={true} />}>
      <ResetPasswordForm />
    </Suspense>
  );
} 