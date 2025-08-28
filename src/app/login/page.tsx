'use client';

import { useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    // Redirect to unified auth page with appropriate mode
    const params = searchParams.toString();
    const authUrl = params ? `/auth?mode=signin&${params}` : '/auth?mode=signin';
    router.replace(authUrl);
  }, [router, searchParams]);

  // Show loading state while redirecting
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-900">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500 mx-auto mb-4"></div>
        <p className="text-slate-400">Redirecting to login...</p>
      </div>
    </div>
  );
}